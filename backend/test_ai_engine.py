import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.ai_engine import engine

def test_engine():
    print("=== RUNNING AI CONTENT MODERATION ENGINE TESTS ===\n")

    # 1. Clean Content Test
    clean_text = "Welcome to our open source developer conference! Looking forward to sharing great insights on machine learning and scalable architectures."
    res1 = engine.analyze(clean_text)
    print(f"[TEST 1: Clean Content]")
    print(f"Overall Risk: {res1['overall_risk_score']} | Level: {res1['risk_level']} | Decision: {res1['ai_decision']}")
    assert res1['risk_level'] == "LOW", f"Expected LOW but got {res1['risk_level']}"
    assert res1['ai_decision'] == "AUTO_APPROVE"
    print("  -> PASSED\n")

    # 2. Spam Test
    spam_text = "CONGRATULATIONS YOU WON FREE CRYPTO AIRDROP!!! CLAIM YOUR PRIZE NOW AT EXCLUSIVE DISCOUNT!!! BUY CHEAP MEDS GUARANTEED RETURN"
    res2 = engine.analyze(spam_text)
    print(f"[TEST 2: Spam Content]")
    print(f"Spam Score: {res2['spam_score']} | Overall Risk: {res2['overall_risk_score']} | Decision: {res2['ai_decision']}")
    assert res2['spam_score'] > 60.0
    assert "Spam" in res2['detected_categories']
    print("  -> PASSED\n")

    # 3. Toxicity Test
    toxic_text = "You are a complete pathetic loser and an idiot, shut the fuck up before I get angry."
    res3 = engine.analyze(toxic_text)
    print(f"[TEST 3: Toxicity Content]")
    print(f"Toxicity Score: {res3['toxicity_score']} | Overall Risk: {res3['overall_risk_score']} | Decision: {res3['ai_decision']}")
    assert res3['toxicity_score'] >= 50.0
    assert "Toxicity" in res3['detected_categories']
    print("  -> PASSED\n")

    # 4. Hate Speech Test
    hate_text = "These subhuman immigrants are genetic trash, we need ethnic cleansing to eradicate these people."
    res4 = engine.analyze(hate_text)
    print(f"[TEST 4: Hate Speech Content]")
    print(f"Hate Speech Score: {res4['hate_speech_score']} | Overall Risk: {res4['overall_risk_score']} | Decision: {res4['ai_decision']}")
    assert res4['hate_speech_score'] >= 80.0
    assert res4['risk_level'] == "HIGH"
    assert res4['ai_decision'] == "AUTO_BLOCK"
    print("  -> PASSED\n")

    # 5. Inappropriate / NSFW Test
    inapp_text = "Here is the suicide instruction manual on how to hang yourself easily."
    res5 = engine.analyze(inapp_text)
    print(f"[TEST 5: Inappropriate Content]")
    print(f"Inappropriate Score: {res5['inappropriate_score']} | Risk: {res5['overall_risk_score']} | Decision: {res5['ai_decision']}")
    assert res5['inappropriate_score'] >= 80.0
    assert res5['risk_level'] == "HIGH"
    print("  -> PASSED\n")

    # 6. Suspicious Links Test
    phish_text = "Urgent: Your account is locked! Please verify identity immediately: http://192.168.1.100/login-verify/secure or visit https://free-bonus.xyz"
    res6 = engine.analyze(phish_text)
    print(f"[TEST 6: Suspicious Links / Phishing]")
    print(f"Link Score: {res6['suspicious_link_score']} | Risk: {res6['overall_risk_score']} | Decision: {res6['ai_decision']}")
    assert res6['suspicious_link_score'] >= 70.0
    assert "Suspicious Links" in res6['detected_categories']
    print("  -> PASSED\n")

    # 7. PII Test (SSN + Email + Phone)
    pii_text = "Hello support, my SSN is 123-45-6789, reach me at john.doe@securebank.com or call +1-415-555-2671."
    res7 = engine.analyze(pii_text)
    print(f"[TEST 7: PII Exposure]")
    print(f"PII Score: {res7['pii_score']} | Risk: {res7['overall_risk_score']} | Decision: {res7['ai_decision']}")
    assert res7['pii_score'] >= 80.0
    assert "PII Exposure" in res7['detected_categories']
    print("  -> PASSED\n")

    print("ALL 7 AI ENGINE TEST CASES PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_engine()
