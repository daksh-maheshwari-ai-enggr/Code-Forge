import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import datetime
from app.database import SessionLocal, engine, Base
from app.models import Admin, User, Content, ModerationResult, Report, Appeal, AuditLog, Notification, ReputationHistory
from app.auth import get_password_hash
from app.ai_engine import engine as ai_engine

def seed_database():
    # Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding Admin accounts...")
        admin1 = Admin(
            username="admin",
            email="admin@sentinel.ai",
            hashed_password=get_password_hash("admin123"),
            full_name="Rishi K. (Chief Security Lead)",
            role="Security Lead",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
        )
        admin2 = Admin(
            username="security_lead",
            email="security@sentinel.ai",
            hashed_password=get_password_hash("admin123"),
            full_name="Sarah Chen (Compliance Officer)",
            role="Compliance Lead",
            avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80"
        )
        db.add_all([admin1, admin2])
        db.commit()

        print("Seeding Users...")
        users_data = [
            ("USR-1001", "alex_dev", "alex.dev@gmail.com", 92, "High Trust", 45, 0, 0, "Active"),
            ("USR-1002", "crypto_king", "investor99@crypto-gem.xyz", 18, "Restricted", 2, 8, 14, "Flagged"),
            ("USR-1003", "elena_writer", "elena.writer@substack.com", 88, "High Trust", 38, 1, 0, "Active"),
            ("USR-1004", "toxic_troll99", "shadow_user@proton.me", 12, "Restricted", 0, 11, 23, "Suspended"),
            ("USR-1005", "marcus_phd", "m.vance@stanford.edu", 95, "High Trust", 62, 0, 0, "Active"),
            ("USR-1006", "anon_spammer", "anon7712@tempmail.com", 32, "Low Trust", 1, 5, 9, "Flagged"),
            ("USR-1007", "sophia_tech", "sophia.t@cybernet.io", 78, "Normal", 19, 1, 2, "Active"),
            ("USR-1008", "dark_trader", "vendor_leak@torbox.onion", 5, "Restricted", 0, 15, 30, "Banned"),
            ("USR-1009", "david_k", "david.k@enterprise.com", 74, "Normal", 14, 2, 1, "Active"),
            ("USR-1010", "clara_design", "clara@studiodesign.co", 85, "High Trust", 27, 0, 0, "Active"),
        ]

        user_objs = []
        user_map = {}
        for uid, uname, email, score, cat, pos, viol, rep, status in users_data:
            u = User(
                id=uid, username=uname, email=email, trust_score=score,
                trust_category=cat, positive_contributions=pos,
                violations=viol, reports_count=rep, account_status=status
            )
            user_objs.append(u)
            user_map[uname] = uid
        db.add_all(user_objs)
        db.commit()

        print("Seeding Content and executing AI Moderation Engine...")
        sample_contents = [
            # 1. Clean developer post
            ("alex_dev", "Architecture Review: Microservices vs Monolith", 
             "We migrated our backend from an orchestration of 40 microservices back to a modular monolith with FastAPI and SQLite. Throughput increased by 300% and latency dropped significantly.", "post"),
            
            # 2. Crypto Giveaway Spam
            ("crypto_king", "100x GEM PRESALE AIRDROP CLAIM NOW!!", 
             "CONGRATULATIONS YOU WON FREE CRYPTO AIRDROP!!! CLAIM YOUR PRIZE NOW AT EXCLUSIVE DISCOUNT!!! 100% risk free guaranteed profit telegram me @crypto_king now!", "post"),
            
            # 3. Toxic Harassment Comment
            ("toxic_troll99", "Re: Coding Guidelines", 
             "You are a complete pathetic loser and an idiot. Shut the fuck up before I find your office and beat the shit out of you.", "comment"),
            
            # 4. Phishing Link with IP & verification
            ("anon_spammer", "Urgent Security Notification: Account Suspended", 
             "Your banking session has expired. Click here immediately to verify credentials: http://192.168.1.105/login-verify/secure-auth or visit https://account-update.xyz to claim prize.", "message"),
            
            # 5. Customer PII Exposure (Credit Card & SSN)
            ("david_k", "Billing issue with refund request", 
             "Please issue a refund to my credit card 4532-8921-7890-1234. If you need tax identity verification, my SSN is 012-34-5678 and phone number is (415) 555-8921.", "message"),
            
            # 6. Hate speech attack
            ("dark_trader", "Manifesto on social segregation", 
             "These subhuman immigrants are genetic trash, we need ethnic cleansing to eradicate these people from our land.", "post"),
            
            # 7. Clean educational tutorial
            ("elena_writer", "Understanding Luhn Algorithm for Input Validation", 
             "Input validation is a foundational defense-in-depth practice. Always sanitize user payload and enforce length constraints before passing to downstream parsers.", "post"),
            
            # 8. Mild uncivil comment (borderline review)
            ("sophia_tech", "Re: Deployment failure", 
             "This release process is complete garbage and annoying. Who approved this stupid patch without running unit tests?", "comment"),
            
            # 9. Shortened URL spam
            ("anon_spammer", "Exclusive gift card deal", 
             "Grab your $500 gift voucher right now by clicking bit.ly/free-reward-2026 limited time offer act now!", "post"),
            
            # 10. Clean research notes
            ("marcus_phd", "Statistical Anomaly Detection in High-Dimensional Spaces", 
             "Our empirical findings demonstrate that isolation forests combined with cosine similarity kernels achieve 99.4% F1-score on adversarial evasion benchmarks.", "article"),
            
            # 11. Inappropriate / Illicit Goods
            ("dark_trader", "Special dump files available", 
             "Buy stolen cc carding dump and darknet market vendor accounts. Instant delivery via encrypted chat.", "post"),
             
            # 12. PII leak (email & phone in forum)
            ("clara_design", "Contact me directly for freelance UI work", 
             "Reach out anytime via clara.freelance@gmail.com or call me on mobile +1-206-555-0199 for contract inquiries.", "post")
        ]

        c_idx = 1001
        for u_name, title, body, c_type in sample_contents:
            c_id = f"CNT-{c_idx}"
            c_idx += 1
            real_user_id = user_map.get(u_name, "USR-1001")

            # Run AI Engine
            analysis = ai_engine.analyze(body)

            # Determine content status from AI decision
            if analysis["ai_decision"] == "AUTO_APPROVE":
                c_status = "Approved"
            elif analysis["ai_decision"] == "AUTO_BLOCK":
                c_status = "Blocked"
            else:
                c_status = "Pending_Review"

            content = Content(
                id=c_id,
                user_id=real_user_id,
                content_type=c_type,
                title=title,
                body=body,
                status=c_status
            )
            db.add(content)
            db.flush()

            # Create ModerationResult
            mod_res = ModerationResult(
                content_id=c_id,
                spam_score=analysis["spam_score"],
                toxicity_score=analysis["toxicity_score"],
                hate_speech_score=analysis["hate_speech_score"],
                inappropriate_score=analysis["inappropriate_score"],
                suspicious_link_score=analysis["suspicious_link_score"],
                pii_score=analysis["pii_score"],
                overall_risk_score=analysis["overall_risk_score"],
                risk_level=analysis["risk_level"],
                detected_categories=json.dumps(analysis["detected_categories"]),
                flagged_snippets=json.dumps(analysis["flagged_snippets"]),
                ai_decision=analysis["ai_decision"],
                action_timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=c_idx % 12)
            )
            db.add(mod_res)

            # Create AuditLog
            audit = AuditLog(
                id=f"LOG-{1000 + c_idx}",
                actor_type="AI",
                actor_name="AI Sentinel Engine",
                action=analysis["ai_decision"],
                target_type="Content",
                target_id=c_id,
                previous_status="Submitted",
                new_status=c_status,
                reason=analysis["explanation"],
                metadata_json=json.dumps({
                    "risk_score": analysis["overall_risk_score"],
                    "risk_level": analysis["risk_level"],
                    "categories": analysis["detected_categories"]
                }),
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=c_idx % 12)
            )
            db.add(audit)

        db.commit()

        print("Seeding Reports...")
        r1 = Report(
            id="REP-2001",
            content_id="CNT-1002",
            reporter_user_id="USR-1001",
            reason="Unsolicited Crypto Scam & Spam",
            details="User is spamming multiple public channels with fake cryptocurrency airdrop links.",
            status="Resolved",
            admin_notes="Content automatically blocked by AI. Verified and confirmed by admin.",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=5),
            resolved_at=datetime.datetime.utcnow() - datetime.timedelta(hours=4)
        )
        r2 = Report(
            id="REP-2002",
            content_id="CNT-1003",
            reporter_user_id="USR-1003",
            reason="Severe Harassment & Threat",
            details="Threatening physical violence against a team member in public comments.",
            status="Pending",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
        )
        r3 = Report(
            id="REP-2003",
            content_id="CNT-1004",
            reporter_user_id="USR-1007",
            reason="Malicious Phishing Links",
            details="Direct IP URL posing as internal banking login.",
            status="Under_Review",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=1)
        )
        db.add_all([r1, r2, r3])
        db.commit()

        print("Seeding Appeals...")
        a1 = Appeal(
            id="APP-3001",
            content_id="CNT-1008",
            user_id="USR-1007",
            original_action="Pending_Review",
            original_risk_score=45.0,
            appeal_reason="I was criticizing the deployment system architecture out of frustration, not attacking individuals. Please re-evaluate.",
            status="Pending",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=3)
        )
        db.add(a1)

        print("Seeding Notifications...")
        n1 = Notification(
            title="Severe Hate Speech Blocked",
            message="Content CNT-1006 was automatically blocked with risk score 92.0/100.",
            type="danger",
            link="/moderation?search=CNT-1006"
        )
        n2 = Notification(
            title="Credential Phishing Attempt Intercepted",
            message="Direct IP phishing link intercepted in CNT-1004.",
            type="warning",
            link="/moderation?search=CNT-1004"
        )
        n3 = Notification(
            title="System Seed Completed",
            message="AI Moderation Engine successfully initialized with 12 multi-category test cases.",
            type="info",
            link="/dashboard"
        )
        db.add_all([n1, n2, n3])
        db.commit()

        print("Database successfully seeded with enterprise demo dataset!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
