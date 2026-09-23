from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Notification

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("")
def get_notifications(db: Session = Depends(get_db)):
    notifs = db.query(Notification).order_by(Notification.created_at.desc()).limit(20).all()
    unread_count = db.query(Notification).filter(Notification.is_read == False).count()
    return {
        "unread_count": unread_count,
        "items": notifs
    }

@router.post("/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notif_id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"message": "Notification marked read"}

@router.post("/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).update({Notification.is_read: True})
    db.commit()
    return {"message": "All notifications marked read"}
