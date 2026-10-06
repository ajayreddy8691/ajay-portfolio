from tests.conftest import KEY

MSG = {"name": "Ada Lovelace", "email": "ada@example.com", "subject": "Data Analyst role", "message": "Hello Ajay!"}


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_public_read_is_empty_list(client):
    r = client.get("/api/content/projects")
    assert r.status_code == 200 and r.json() == []


def test_unknown_collection_is_404(client):
    assert client.get("/api/content/nope").status_code == 404


def test_write_without_key_is_401(client):
    assert client.put("/api/content/projects/p1", json={"title": "x"}).status_code == 401
    assert client.put("/api/content/projects/p1", json={"title": "x"}, headers={"X-Admin-Key": "wrong-key-123"}).status_code == 401


def test_upsert_list_order_and_delete(client):
    for i in ("a", "b", "c"):
        assert client.put(f"/api/content/skills/{i}", json={"head": i.upper(), "items": [i]}, headers=KEY).status_code == 204
    assert [x["id"] for x in client.get("/api/content/skills").json()] == ["a", "b", "c"]
    client.put("/api/content/skills/a", json={"head": "A2", "items": []}, headers=KEY)  # edit keeps its position
    got = client.get("/api/content/skills").json()
    assert [x["id"] for x in got] == ["a", "b", "c"] and got[0]["head"] == "A2"
    assert client.delete("/api/content/skills/b", headers=KEY).status_code == 204
    assert [x["id"] for x in client.get("/api/content/skills").json()] == ["a", "c"]


def test_invalid_id_is_400(client):
    assert client.put("/api/content/skills/bad id!", json={"x": 1}, headers=KEY).status_code == 400


def test_auth_endpoint(client):
    assert client.get("/api/auth").status_code == 401
    assert client.get("/api/auth", headers=KEY).status_code == 204


def test_contact_validation(client):
    assert client.post("/api/contact", json={**MSG, "email": "not-an-email"}).status_code == 422
    assert client.post("/api/contact", json={**MSG, "name": "  "}).status_code == 422


def test_contact_inbox_flow(client):
    assert client.post("/api/contact", json=MSG).status_code == 201
    assert client.get("/api/messages").status_code == 401
    rows = client.get("/api/messages", headers=KEY).json()
    assert len(rows) == 1 and rows[0]["seen"] is False and rows[0]["createdAt"].endswith("Z")
    mid = rows[0]["id"]
    assert client.put(f"/api/messages/{mid}/seen", json={"seen": True}, headers=KEY).status_code == 204
    assert client.get("/api/messages", headers=KEY).json()[0]["seen"] is True
    client.post("/api/contact", json=MSG)
    assert client.post("/api/messages/seen-all", headers=KEY).json() == {"updated": 1}
    assert client.delete(f"/api/messages/{mid}", headers=KEY).status_code == 204
    assert client.delete("/api/messages/9999", headers=KEY).status_code == 404
