from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_api_endpoints():
    print("Testing / ...")
    res = client.get("/")
    assert res.status_code == 200
    print("  -> / status 200 OK")

    print("Testing /api/moderation/analyze ...")
    res = client.post("/api/moderation/analyze", json={
        "text": "FREE BITCOIN GIVEAWAY! Claim now at http://192.168.1.1/login-verify"
    })
    assert res.status_code == 200
    data = res.json()
    print(f"  -> Risk Score: {data['overall_risk_score']}, Level: {data['risk_level']}, Decision: {data['ai_decision']}")
    assert data["overall_risk_score"] > 50.0
    assert "Spam" in data["detected_categories"]
    assert "Suspicious Links" in data["detected_categories"]

    print("Testing /api/dashboard/stats ...")
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    stats = res.json()
    print(f"  -> Total processed: {stats['kpis']['total_processed']}, Avg Risk: {stats['kpis']['avg_risk_score']}")
    assert stats["kpis"]["total_processed"] >= 10

    print("Testing /api/moderation queue ...")
    res = client.get("/api/moderation")
    assert res.status_code == 200
    mod_queue = res.json()
    print(f"  -> Queue items: {len(mod_queue['items'])}")
    assert len(mod_queue["items"]) > 0

    print("Testing /api/users ...")
    res = client.get("/api/users")
    assert res.status_code == 200
    users = res.json()
    print(f"  -> Users count: {len(users['items'])}")

    print("Testing /api/reports ...")
    res = client.get("/api/reports")
    assert res.status_code == 200

    print("Testing /api/appeals ...")
    res = client.get("/api/appeals")
    assert res.status_code == 200

    print("Testing /api/audit-logs ...")
    res = client.get("/api/audit-logs")
    assert res.status_code == 200

    print("\nALL API ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api_endpoints()
