import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import (
    auth_router,
    moderation_router,
    dashboard_router,
    reports_router,
    appeals_router,
    users_router,
    audit_router,
    notifications_router,
    system_router
)
from app.seed_data import seed_database

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sentinel AI - Enterprise Content Moderation Platform",
    description="Automated multi-vector AI moderation API (Spam, Toxicity, Hate Speech, Inappropriate, Suspicious Links, PII) and Risk Scoring.",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router.router)
app.include_router(moderation_router.router)
app.include_router(dashboard_router.router)
app.include_router(reports_router.router)
app.include_router(appeals_router.router)
app.include_router(users_router.router)
app.include_router(audit_router.router)
app.include_router(notifications_router.router)
app.include_router(system_router.router)

@app.on_event("startup")
def on_startup():
    # If database is fresh or unseeded, run seed
    from app.models import Content
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        count = db.query(Content).count()
        if count == 0:
            print("[STARTUP] No existing records found. Initializing seed data...")
            seed_database()
    except Exception as e:
        print(f"[STARTUP] Error verifying database seed: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "service": "Sentinel AI Content Moderation Platform",
        "status": "operational",
        "docs": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
