import io
import csv
import json
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AuditLog

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])

@router.get("")
def get_audit_logs(
    actor_type: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if actor_type and actor_type != "All":
        query = query.filter(AuditLog.actor_type == actor_type)
    if action and action != "All":
        query = query.filter(AuditLog.action == action)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (AuditLog.id.ilike(s)) |
            (AuditLog.actor_name.ilike(s)) |
            (AuditLog.target_id.ilike(s)) |
            (AuditLog.reason.ilike(s))
        )

    total = query.count()
    logs = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

    items = []
    for l in logs:
        items.append({
            "id": l.id,
            "actor_type": l.actor_type,
            "actor_name": l.actor_name,
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "previous_status": l.previous_status,
            "new_status": l.new_status,
            "reason": l.reason,
            "metadata": json.loads(l.metadata_json) if l.metadata_json else {},
            "timestamp": l.timestamp
        })

    return {"total": total, "items": items}

@router.get("/export")
def export_audit_logs(format: str = "csv", db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()

    if format == "json":
        items = [{
            "id": l.id,
            "actor_type": l.actor_type,
            "actor_name": l.actor_name,
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "previous_status": l.previous_status,
            "new_status": l.new_status,
            "reason": l.reason,
            "timestamp": l.timestamp.isoformat()
        } for l in logs]
        return Response(
            content=json.dumps(items, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=audit_ledger.json"}
        )

    # Default CSV export
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Log ID", "Actor Type", "Actor Name", "Action", "Target Type", "Target ID", "Previous Status", "New Status", "Reason", "Timestamp"])
    for l in logs:
        writer.writerow([
            l.id, l.actor_type, l.actor_name, l.action, l.target_type,
            l.target_id, l.previous_status or "", l.new_status or "", l.reason or "", l.timestamp.isoformat()
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit_ledger.csv"}
    )
