from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.seed_data import seed_database

router = APIRouter(prefix="/api/system", tags=["System"])

@router.post("/reset-demo-data")
def reset_demo_data(db: Session = Depends(get_db)):
    """Reseeds the database with clean, realistic sample data."""
    seed_database()
    return {"message": "Database reset and re-seeded with demo records successfully."}

@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "Sentinel AI Content Moderation Platform"}
