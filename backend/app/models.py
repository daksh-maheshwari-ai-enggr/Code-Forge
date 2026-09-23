import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), default="Administrator")
    role = Column(String(50), default="Security Lead")
    avatar_url = Column(String(255), default="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True) # e.g. USR-1001
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    trust_score = Column(Integer, default=75) # 0 to 100
    trust_category = Column(String(50), default="Normal") # High Trust, Normal, Low Trust, Restricted
    positive_contributions = Column(Integer, default=0)
    violations = Column(Integer, default=0)
    reports_count = Column(Integer, default=0)
    account_status = Column(String(50), default="Active") # Active, Flagged, Suspended, Banned
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    contents = relationship("Content", back_populates="user")
    reputation_history = relationship("ReputationHistory", back_populates="user")

class Content(Base):
    __tablename__ = "contents"

    id = Column(String(50), primary_key=True, index=True) # e.g. CNT-1001
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    content_type = Column(String(50), default="post") # post, comment, message, profile
    title = Column(String(255), nullable=True)
    body = Column(Text, nullable=False)
    status = Column(String(50), default="Pending_Review") # Approved, Blocked, Pending_Review
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="contents")
    moderation_result = relationship("ModerationResult", back_populates="content", uselist=False, cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="content", cascade="all, delete-orphan")
    appeals = relationship("Appeal", back_populates="content", cascade="all, delete-orphan")

class ModerationResult(Base):
    __tablename__ = "moderation_results"

    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(String(50), ForeignKey("contents.id"), unique=True, nullable=False)
    
    # 6 Core AI Risk Categories (0-100)
    spam_score = Column(Float, default=0.0)
    toxicity_score = Column(Float, default=0.0)
    hate_speech_score = Column(Float, default=0.0)
    inappropriate_score = Column(Float, default=0.0)
    suspicious_link_score = Column(Float, default=0.0)
    pii_score = Column(Float, default=0.0)

    # Composite metrics
    overall_risk_score = Column(Float, default=0.0)
    risk_level = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH
    detected_categories = Column(Text, default="[]") # JSON list of detected strings
    flagged_snippets = Column(Text, default="[]") # JSON list of matched snippet details
    
    # Automated & manual decisions
    ai_decision = Column(String(50), default="AUTO_APPROVE") # AUTO_APPROVE, SEND_TO_REVIEW, AUTO_BLOCK
    admin_decision = Column(String(50), nullable=True) # Approved, Blocked, Sent_To_Review
    admin_id = Column(String(50), nullable=True)
    admin_reason = Column(Text, nullable=True)
    action_timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    content = relationship("Content", back_populates="moderation_result")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(50), primary_key=True, index=True) # e.g. REP-2001
    content_id = Column(String(50), ForeignKey("contents.id"), nullable=False)
    reporter_user_id = Column(String(50), nullable=False)
    reason = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    status = Column(String(50), default="Pending") # Pending, Under_Review, Resolved, Rejected, Escalated
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    content = relationship("Content", back_populates="reports")

class Appeal(Base):
    __tablename__ = "appeals"

    id = Column(String(50), primary_key=True, index=True) # e.g. APP-3001
    content_id = Column(String(50), ForeignKey("contents.id"), nullable=False)
    user_id = Column(String(50), nullable=False)
    original_action = Column(String(50), default="Blocked")
    original_risk_score = Column(Float, default=0.0)
    appeal_reason = Column(Text, nullable=False)
    status = Column(String(50), default="Pending") # Pending, Under_Review, Approved, Rejected
    admin_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    content = relationship("Content", back_populates="appeals")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True, index=True) # e.g. LOG-5001
    actor_type = Column(String(50), default="AI") # AI, Admin, System
    actor_name = Column(String(100), default="AI Sentinel Engine")
    action = Column(String(50), nullable=False) # AUTO_APPROVE, AUTO_BLOCK, SEND_TO_REVIEW, ADMIN_APPROVE, ADMIN_BLOCK, etc.
    target_type = Column(String(50), default="Content") # Content, User, Report, Appeal, System
    target_id = Column(String(50), nullable=False)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    reason = Column(Text, nullable=True)
    metadata_json = Column(Text, default="{}") # JSON metadata for full contextual audit trail
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class ReputationHistory(Base):
    __tablename__ = "reputation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    delta = Column(Integer, nullable=False)
    previous_score = Column(Integer, nullable=False)
    new_score = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reputation_history")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info") # info, warning, danger, success
    is_read = Column(Boolean, default=False)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
