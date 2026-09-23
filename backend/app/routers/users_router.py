import json
import uuid
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ReputationHistory, AuditLog
from app.schemas import AdjustReputationRequest
from app.auth import get_current_admin

router = APIRouter(prefix="/api/users", tags=["Users & Reputation"])

@router.get("")
def get_users(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if category and category != "All":
        query = query.filter(User.trust_category == category)
    if status and status != "All":
        query = query.filter(User.account_status == status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (User.id.ilike(s)) |
            (User.username.ilike(s)) |
            (User.email.ilike(s))
        )

    total = query.count()
    users = query.order_by(User.trust_score.desc()).offset(skip).limit(limit).all()

    return {"total": total, "items": users}

@router.get("/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    history = db.query(ReputationHistory).filter(ReputationHistory.user_id == user_id).order_by(ReputationHistory.created_at.desc()).all()
    return {
        "user": u,
        "history": history
    }

@router.post("/{user_id}/adjust-reputation")
def adjust_reputation(
    user_id: str,
    req: AdjustReputationRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    prev_score = u.trust_score
    new_score = max(0, min(100, prev_score + req.delta))
    u.trust_score = new_score

    # Re-calculate category
    if new_score >= 80:
        u.trust_category = "High Trust"
    elif new_score >= 50:
        u.trust_category = "Normal"
    elif new_score >= 20:
        u.trust_category = "Low Trust"
    else:
        u.trust_category = "Restricted"

    # Save reputation history
    history = ReputationHistory(
        user_id=user_id,
        delta=req.delta,
        previous_score=prev_score,
        new_score=new_score,
        reason=req.reason,
        created_at=datetime.datetime.utcnow()
    )
    db.add(history)

    # Immutable Audit Log
    audit = AuditLog(
        id=f"LOG-{uuid.uuid4().hex[:8].upper()}",
        actor_type="Admin",
        actor_name=admin.get("username", "admin"),
        action="REPUTATION_CHANGED",
        target_type="User",
        target_id=user_id,
        previous_status=f"Score: {prev_score}",
        new_status=f"Score: {new_score}",
        reason=req.reason,
        metadata_json=json.dumps({"delta": req.delta, "category": u.trust_category}),
        timestamp=datetime.datetime.utcnow()
    )
    db.add(audit)
    db.commit()

    return {
        "message": "User reputation updated successfully",
        "previous_score": prev_score,
        "new_score": new_score,
        "trust_category": u.trust_category
    }
