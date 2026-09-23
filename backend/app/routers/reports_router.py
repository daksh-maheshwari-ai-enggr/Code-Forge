import json
import uuid
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Report, Content, AuditLog
from app.schemas import ReportActionRequest
from app.auth import get_current_admin

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("")
def get_reports(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Report).join(Content)
    if status and status != "All":
        query = query.filter(Report.status == status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Report.id.ilike(s)) |
            (Report.reason.ilike(s)) |
            (Report.details.ilike(s)) |
            (Content.title.ilike(s))
        )

    total = query.count()
    reports = query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()

    items = []
    for r in reports:
        items.append({
            "id": r.id,
            "content_id": r.content_id,
            "reporter_user_id": r.reporter_user_id,
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "admin_notes": r.admin_notes,
            "created_at": r.created_at,
            "resolved_at": r.resolved_at,
            "content": {
                "id": r.content.id,
                "title": r.content.title,
                "body": r.content.body,
                "status": r.content.status,
                "risk_score": r.content.moderation_result.overall_risk_score if r.content.moderation_result else 0
            } if r.content else None
        })

    return {"total": total, "items": items}

@router.post("/{report_id}/resolve")
def resolve_report(
    report_id: str,
    req: ReportActionRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    rep = db.query(Report).filter(Report.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")

    rep.status = "Resolved"
    rep.admin_notes = req.notes
    rep.resolved_at = datetime.datetime.utcnow()

    # Block content if requested
    if rep.content and rep.content.status != "Blocked":
        rep.content.status = "Blocked"

    audit = AuditLog(
        id=f"LOG-{uuid.uuid4().hex[:8].upper()}",
        actor_type="Admin",
        actor_name=admin.get("username", "admin"),
        action="REPORT_RESOLVED",
        target_type="Report",
        target_id=rep.id,
        previous_status="Pending",
        new_status="Resolved",
        reason=req.notes or "Report verified and resolved",
        metadata_json=json.dumps({"content_id": rep.content_id}),
        timestamp=datetime.datetime.utcnow()
    )
    db.add(audit)
    db.commit()

    return {"message": "Report marked as resolved", "id": report_id}

@router.post("/{report_id}/reject")
def reject_report(
    report_id: str,
    req: ReportActionRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    rep = db.query(Report).filter(Report.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")

    rep.status = "Rejected"
    rep.admin_notes = req.notes
    rep.resolved_at = datetime.datetime.utcnow()

    audit = AuditLog(
        id=f"LOG-{uuid.uuid4().hex[:8].upper()}",
        actor_type="Admin",
        actor_name=admin.get("username", "admin"),
        action="REPORT_REJECTED",
        target_type="Report",
        target_id=rep.id,
        previous_status="Pending",
        new_status="Rejected",
        reason=req.notes or "Report investigated and rejected (false positive)",
        metadata_json=json.dumps({"content_id": rep.content_id}),
        timestamp=datetime.datetime.utcnow()
    )
    db.add(audit)
    db.commit()

    return {"message": "Report rejected as unsubstantiated", "id": report_id}
