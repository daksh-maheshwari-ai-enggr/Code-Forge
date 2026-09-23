import json
import uuid
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Appeal, Content, AuditLog
from app.schemas import AppealActionRequest
from app.auth import get_current_admin

router = APIRouter(prefix="/api/appeals", tags=["Appeals"])

@router.get("")
def get_appeals(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Appeal).join(Content)
    if status and status != "All":
        query = query.filter(Appeal.status == status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Appeal.id.ilike(s)) |
            (Appeal.appeal_reason.ilike(s)) |
            (Content.title.ilike(s))
        )

    total = query.count()
    appeals = query.order_by(Appeal.created_at.desc()).offset(skip).limit(limit).all()

    items = []
    for a in appeals:
        items.append({
            "id": a.id,
            "content_id": a.content_id,
            "user_id": a.user_id,
            "original_action": a.original_action,
            "original_risk_score": a.original_risk_score,
            "appeal_reason": a.appeal_reason,
            "status": a.status,
            "admin_response": a.admin_response,
            "created_at": a.created_at,
            "resolved_at": a.resolved_at,
            "content": {
                "id": a.content.id,
                "title": a.content.title,
                "body": a.content.body,
                "status": a.content.status,
                "risk_score": a.content.moderation_result.overall_risk_score if a.content.moderation_result else 0
            } if a.content else None
        })

    return {"total": total, "items": items}

@router.post("/{appeal_id}/approve")
def approve_appeal(
    appeal_id: str,
    req: AppealActionRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    appeal = db.query(Appeal).filter(Appeal.id == appeal_id).first()
    if not appeal:
        raise HTTPException(status_code=404, detail="Appeal not found")

    appeal.status = "Approved"
    appeal.admin_response = req.response
    appeal.resolved_at = datetime.datetime.utcnow()

    # Restore content to Approved
    if appeal.content:
        appeal.content.status = "Approved"

    audit = AuditLog(
        id=f"LOG-{uuid.uuid4().hex[:8].upper()}",
        actor_type="Admin",
        actor_name=admin.get("username", "admin"),
        action="APPEAL_APPROVED",
        target_type="Appeal",
        target_id=appeal.id,
        previous_status="Blocked",
        new_status="Approved",
        reason=req.response,
        metadata_json=json.dumps({"content_id": appeal.content_id}),
        timestamp=datetime.datetime.utcnow()
    )
    db.add(audit)
    db.commit()

    return {"message": "Appeal approved, content restored", "id": appeal_id}

@router.post("/{appeal_id}/reject")
def reject_appeal(
    appeal_id: str,
    req: AppealActionRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    appeal = db.query(Appeal).filter(Appeal.id == appeal_id).first()
    if not appeal:
        raise HTTPException(status_code=404, detail="Appeal not found")

    appeal.status = "Rejected"
    appeal.admin_response = req.response
    appeal.resolved_at = datetime.datetime.utcnow()

    audit = AuditLog(
        id=f"LOG-{uuid.uuid4().hex[:8].upper()}",
        actor_type="Admin",
        actor_name=admin.get("username", "admin"),
        action="APPEAL_REJECTED",
        target_type="Appeal",
        target_id=appeal.id,
        previous_status="Pending",
        new_status="Rejected",
        reason=req.response,
        metadata_json=json.dumps({"content_id": appeal.content_id}),
        timestamp=datetime.datetime.utcnow()
    )
    db.add(audit)
    db.commit()

    return {"message": "Appeal rejected, content remains blocked", "id": appeal_id}
