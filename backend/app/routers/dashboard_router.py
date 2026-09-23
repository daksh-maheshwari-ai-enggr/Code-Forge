import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Content, ModerationResult, Report, Appeal, User, AuditLog

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_content = db.query(Content).count()
    approved_count = db.query(Content).filter(Content.status == "Approved").count()
    blocked_count = db.query(Content).filter(Content.status == "Blocked").count()
    pending_count = db.query(Content).filter(Content.status == "Pending_Review").count()

    open_reports = db.query(Report).filter(Report.status.in_(["Pending", "Under_Review"])).count()
    open_appeals = db.query(Appeal).filter(Appeal.status.in_(["Pending", "Under_Review"])).count()

    avg_risk = db.query(func.avg(ModerationResult.overall_risk_score)).scalar() or 0.0

    # Risk Distribution
    low_risk = db.query(ModerationResult).filter(ModerationResult.risk_level == "LOW").count()
    medium_risk = db.query(ModerationResult).filter(ModerationResult.risk_level == "MEDIUM").count()
    high_risk = db.query(ModerationResult).filter(ModerationResult.risk_level == "HIGH").count()

    # Category counts
    all_results = db.query(ModerationResult.detected_categories).all()
    category_counts = {
        "Spam": 0,
        "Toxicity": 0,
        "Hate Speech": 0,
        "Inappropriate Content": 0,
        "Suspicious Links": 0,
        "PII Exposure": 0
    }
    for res in all_results:
        if res[0]:
            try:
                cats = json.loads(res[0])
                for c in cats:
                    if c in category_counts:
                        category_counts[c] += 1
            except Exception:
                pass

    # Recent 6 audit logs
    recent_audits = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(6).all()
    audit_feed = []
    for a in recent_audits:
        audit_feed.append({
            "id": a.id,
            "actor": a.actor_name,
            "actor_type": a.actor_type,
            "action": a.action,
            "target": f"{a.target_type} ({a.target_id})",
            "new_status": a.new_status,
            "reason": a.reason,
            "timestamp": a.timestamp
        })

    # User trust category breakdown
    high_trust_users = db.query(User).filter(User.trust_category == "High Trust").count()
    normal_users = db.query(User).filter(User.trust_category == "Normal").count()
    low_trust_users = db.query(User).filter(User.trust_category == "Low Trust").count()
    restricted_users = db.query(User).filter(User.trust_category == "Restricted").count()

    return {
        "kpis": {
            "total_processed": total_content,
            "approved": approved_count,
            "blocked": blocked_count,
            "pending_review": pending_count,
            "open_reports": open_reports,
            "open_appeals": open_appeals,
            "avg_risk_score": round(avg_risk, 1),
            "approval_rate": round((approved_count / total_content * 100) if total_content > 0 else 0, 1),
            "auto_block_rate": round((blocked_count / total_content * 100) if total_content > 0 else 0, 1)
        },
        "risk_distribution": [
            {"name": "Low Risk (0-34)", "value": low_risk, "color": "#10b981"},
            {"name": "Medium Risk (35-74)", "value": medium_risk, "color": "#f59e0b"},
            {"name": "High Risk (75-100)", "value": high_risk, "color": "#ef4444"}
        ],
        "category_counts": [
            {"category": k, "count": v} for k, v in category_counts.items()
        ],
        "user_trust_distribution": [
            {"category": "High Trust", "count": high_trust_users},
            {"category": "Normal", "count": normal_users},
            {"category": "Low Trust", "count": low_trust_users},
            {"category": "Restricted", "count": restricted_users}
        ],
        "recent_audit_feed": audit_feed
    }
