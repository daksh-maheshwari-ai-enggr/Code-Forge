from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    admin: Dict[str, Any]

class LoginRequest(BaseModel):
    username: str
    password: str

# Moderation & AI Analysis
class AnalyzeRequest(BaseModel):
    text: str

class FlaggedSnippet(BaseModel):
    category: str
    term: str
    severity: str
    reason: str

class AnalyzeResponse(BaseModel):
    spam_score: float
    toxicity_score: float
    hate_speech_score: float
    inappropriate_score: float
    suspicious_link_score: float
    pii_score: float
    overall_risk_score: float
    risk_level: str
    detected_categories: List[str]
    flagged_snippets: List[Dict[str, Any]]
    ai_decision: str
    explanation: str

# Content Submission
class ContentSubmitRequest(BaseModel):
    user_id: Optional[str] = "USR-1001"
    content_type: Optional[str] = "post"
    title: Optional[str] = ""
    body: str

class ModerationActionRequest(BaseModel):
    action: str # Approve, Block, Escalate, Review
    reason: str

# Moderation Queue Item Schema
class ModerationItemResponse(BaseModel):
    id: str # content_id
    title: Optional[str]
    body: str
    content_type: str
    status: str
    created_at: datetime
    user: Dict[str, Any]
    moderation: Optional[Dict[str, Any]]

# User Reputation Schema
class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    trust_score: int
    trust_category: str
    positive_contributions: int
    violations: int
    reports_count: int
    account_status: str
    created_at: datetime

class AdjustReputationRequest(BaseModel):
    delta: int
    reason: str

# Report Schemas
class ReportResponse(BaseModel):
    id: str
    content_id: str
    reporter_user_id: str
    reason: str
    details: Optional[str]
    status: str
    admin_notes: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]
    content: Optional[Dict[str, Any]]

class ReportActionRequest(BaseModel):
    action: str # Resolve, Reject, Escalate
    notes: Optional[str] = ""

# Appeal Schemas
class AppealResponse(BaseModel):
    id: str
    content_id: str
    user_id: str
    original_action: str
    original_risk_score: float
    appeal_reason: str
    status: str
    admin_response: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]
    content: Optional[Dict[str, Any]]

class AppealActionRequest(BaseModel):
    action: str # Approve, Reject
    response: str

# Audit Log Schema
class AuditLogResponse(BaseModel):
    id: str
    actor_type: str
    actor_name: str
    action: str
    target_type: str
    target_id: str
    previous_status: Optional[str]
    new_status: Optional[str]
    reason: Optional[str]
    metadata_json: Optional[str]
    timestamp: datetime
