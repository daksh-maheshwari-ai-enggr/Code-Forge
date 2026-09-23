import json
import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Content, ModerationResult, User, AuditLog, Notification
from app.schemas import (
    AnalyzeRequest, AnalyzeResponse,
    ContentSubmitRequest, ModerationActionRequest
)
from app.ai_engine import engine
from app.auth import get_current_admin

router = APIRouter(prefix="/api/moderation", tags=["Moderation & AI Engine"])

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_text(req: AnalyzeRequest):
    """
    Direct endpoint to run the AI Moderation Engine on any text.
    Returns scores for Spam, Toxicity, Hate Speech, Inappropriate, Suspicious Links, PII,
    plus overall Risk Score (0-100), Risk Level, and AI Recommendation.
    """
    return engine.analyze(req.text)

@router.post("/submit")
def submit_content(req: ContentSubmitRequest, db: Session = Depends(get_db)):
    """
    Submits user content, executes the AI analysis pipeline, persists results,
    records an immutable audit entry, and adjusts user reputation if severe violations occur.
    """
    analysis = engine.analyze(req.body)

    # Ensure user exists or create dummy
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        user = User(
            id=req.user_id or f"USR-{uuid.uuid4().hex[:6].upper()}",
            username=f"user_{uuid.uuid4().hex[:4]}",
            email=f"user_{uuid.uuid4().hex[:4]}@example.com",
            trust_score=75,
            trust_category="Normal"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Determine initial status from AI decision
    if analysis["ai_decision"] == "AUTO_APPROVE":
        initial_status = "Approved"
        user.positive_contributions += 1
    elif analysis["ai_decision"] == "AUTO_BLOCK":
        initial_status = "Blocked"
        user.violations += 1
        user.trust_score = max(0, user.trust_score - 20)
        if user.trust_score < 20:
            user.trust_category = "Restricted"
        elif user.trust_score < 50:
            user.trust_category = "Low Trust"
    else:
        initial_status = "Pending_Review"

    content_id = f"CNT-{uuid.uuid4().hex[:8].upper()}"
    new_content = Content(
        id=content_id,
        user_id=user.id,
        content_type=req.content_type or "post",
        title=req.title or "Submitted Content",
        body=req.body,
        status=initial_status
    )
    db.add(new_content)
    db.flush()

    # Save ModerationResult
    mod_result = ModerationResult(
        content_id=content_id,
        spam_score=analysis["spam_score"],
        toxicity_score=analysis["toxicity_score"],
        hate_speech_score=analysis["hate_speech_score"],
        inappropriate_score=analysis["inappropriate_score"],
        suspicious_link_score=analysis["suspicious_link_score"],
        pii_score=analysis["pii_score"],
        overall_risk_score=analysis["overall_risk_score"],
        risk_level=analysis["risk_level"],
        detected_categories=json.dumps(analysis["detected_categories"]),
        flagged_snippets=json.dumps(analysis["flagged_snippets"]),
        ai_decision=analysis["ai_decision"],
        action_timestamp=datetime.datetime.utcnow()
    )
    db.add(mod_result)

    # Record immutable audit log
    audit = AuditLog(
        id=f"LOG-{uuid.uuid4().hex[:8].upper()}",
        actor_type="AI",
        actor_name="AI Sentinel Engine",
        action=analysis["ai_decision"],
        target_type="Content",
        target_id=content_id,
        previous_status="Submitted",
        new_status=initial_status,
        reason=analysis["explanation"],
        metadata_json=json.dumps({
            "overall_risk_score": analysis["overall_risk_score"],
            "risk_level": analysis["risk_level"],
            "categories": analysis["detected_categories"]
        }),
        timestamp=datetime.datetime.utcnow()
    )
    db.add(audit)

    # Create notification if blocked or flagged
    if initial_status in ["Blocked", "Pending_Review"]:
        notif = Notification(
            title=f"High Risk Content Flagged ({content_id})",
            message=f"Content from {user.username} scored {analysis['overall_risk_score']}/100. Status: {initial_status}",
            type="danger" if initial_status == "Blocked" else "warning",
            link=f"/moderation?search={content_id}"
        )
        db.add(notif)

    db.commit()

    return {
        "content_id": content_id,
        "status": initial_status,
        "analysis": analysis
    }

@router.get("")
def get_moderation_queue(
    status: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Content).join(ModerationResult).join(User)

    if status and status != "All":
        query = query.filter(Content.status == status)

    if risk_level and risk_level != "All":
        query = query.filter(ModerationResult.risk_level == risk_level)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Content.id.ilike(search_fmt)) |
            (Content.body.ilike(search_fmt)) |
            (Content.title.ilike(search_fmt)) |
            (User.username.ilike(search_fmt))
        )

    total = query.count()
    items = query.order_by(ModerationResult.overall_risk_score.desc(), Content.created_at.desc()).offset(skip).limit(limit).all()

    results = []
    for c in items:
        m = c.moderation_result
        cat_list = json.loads(m.detected_categories) if m and m.detected_categories else []
        if category and category != "All" and category not in cat_list:
            continue

        results.append({
            "id": c.id,
            "title": c.title,
            "body": c.body,
            "content_type": c.content_type,
            "status": c.status,
            "created_at": c.created_at,
            "user": {
                "id": c.user.id,
                "username": c.user.username,
                "trust_score": c.user.trust_score,
                "trust_category": c.user.trust_category
            },
            "moderation": {
                "overall_risk_score": m.overall_risk_score if m else 0,
                "risk_level": m.risk_level if m else "LOW",
                "spam_score": m.spam_score if m else 0,
                "toxicity_score": m.toxicity_score if m else 0,
                "hate_speech_score": m.hate_speech_score if m else 0,
                "inappropriate_score": m.inappropriate_score if m else 0,
                "suspicious_link_score": m.suspicious_link_score if m else 0,
                "pii_score": m.pii_score if m else 0,
                "detected_categories": cat_list,
                "flagged_snippets": json.loads(m.flagged_snippets) if m and m.flagged_snippets else [],
                "ai_decision": m.ai_decision if m else "AUTO_APPROVE",
                "admin_decision": m.admin_decision if m else None,
                "admin_reason": m.admin_reason if m else None
            }
        })

    return {"total": total, "items": results}

@router.get("/{content_id}")
def get_moderation_item(content_id: str, db: Session = Depends(get_db)):
    c = db.query(Content).filter(Content.id == content_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Content not found")

    m = c.moderation_result
    return {
        "id": c.id,
        "title": c.title,
        "body": c.body,
        "content_type": c.content_type,
        "status": c.status,
        "created_at": c.created_at,
        "user": {
            "id": c.user.id,
            "username": c.user.username,
            "email": c.user.email,
            "trust_score": c.user.trust_score,
            "trust_category": c.user.trust_category,
            "violations": c.user.violations,
            "positive_contributions": c.user.positive_contributions
        },
        "moderation": {
            "overall_risk_score": m.overall_risk_score if m else 0,
            "risk_level": m.risk_level if m else "LOW",
            "spam_score": m.spam_score if m else 0,
            "toxicity_score": m.toxicity_score if m else 0,
            "hate_speech_score": m.hate_speech_score if m else 0,
            "inappropriate_score": m.inappropriate_score if m else 0,
            "suspicious_link_score": m.suspicious_link_score if m else 0,
            "pii_score": m.pii_score if m else 0,
            "detected_categories": json.loads(m.detected_categories) if m and m.detected_categories else [],
            "flagged_snippets": json.loads(m.flagged_snippets) if m and m.flagged_snippets else [],
            "ai_decision": m.ai_decision if m else "AUTO_APPROVE",
            "admin_decision": m.admin_decision if m else None,
            "admin_reason": m.admin_reason if m else None
        }
    }

@router.post("/{content_id}/approve")
def approve_content(
    content_id: str,
    req: ModerationActionRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    c = db.query(Content).filter(Content.id == content_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Content not found")

    prev_status = c.status
    c.status = "Approved"

    if c.moderation_result:
        c.moderation_result.admin_decision = "Approved"
        c.moderation_result.admin_id = admin.get("username", "admin")
        c.moderation_result.admin_reason = req.reason
        c.moderation_result.action_timestamp = datetime.datetime.utcnow()

    # Increase user trust slightly
    c.user.positive_contributions += 1
    c.user.trust_score = min(100, c.user.trust_score + 5)
    if c.user.trust_score >= 80:
        c.user.trust_category = "High Trust"

    # Immutable Audit log
    audit = AuditLog(
        id=f"LOG-{uuid.uuid4().hex[:8].upper()}",
        actor_type="Admin",
        actor_name=admin.get("username", "admin"),
        action="ADMIN_APPROVE",
        target_type="Content",
        target_id=c.id,
        previous_status=prev_status,
        new_status="Approved",
        reason=req.reason,
        metadata_json=json.dumps({"override": prev_status != "Approved"}),
        timestamp=datetime.datetime.utcnow()
    )
    db.add(audit)
    db.commit()

    return {"message": "Content successfully approved", "id": content_id, "status": "Approved"}

@router.post("/{content_id}/block")
def block_content(
    content_id: str,
    req: ModerationActionRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    c = db.query(Content).filter(Content.id == content_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Content not found")

    prev_status = c.status
    c.status = "Blocked"

    if c.moderation_result:
        c.moderation_result.admin_decision = "Blocked"
        c.moderation_result.admin_id = admin.get("username", "admin")
        c.moderation_result.admin_reason = req.reason
        c.moderation_result.action_timestamp = datetime.datetime.utcnow()

    # Penalize user trust
    c.user.violations += 1
    c.user.trust_score = max(0, c.user.trust_score - 15)
    if c.user.trust_score < 20:
        c.user.trust_category = "Restricted"
    elif c.user.trust_score < 50:
        c.user.trust_category = "Low Trust"

    audit = AuditLog(
        id=f"LOG-{uuid.uuid4().hex[:8].upper()}",
        actor_type="Admin",
        actor_name=admin.get("username", "admin"),
        action="ADMIN_BLOCK",
        target_type="Content",
        target_id=c.id,
        previous_status=prev_status,
        new_status="Blocked",
        reason=req.reason,
        metadata_json=json.dumps({"override": prev_status != "Blocked"}),
        timestamp=datetime.datetime.utcnow()
    )
    db.add(audit)
    db.commit()

    return {"message": "Content successfully blocked", "id": content_id, "status": "Blocked"}
