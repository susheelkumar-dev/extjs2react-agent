import json

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_list_trades_pages_and_envelope():
    res = client.get("/api/trades", params={"page": 1, "start": 0, "limit": 25})
    body = res.json()
    assert res.status_code == 200
    assert body["success"] is True
    assert body["total"] == 200
    assert len(body["data"]) == 25


def test_sort_and_filter_use_ext_js_json_params():
    sort = json.dumps([{"property": "price", "direction": "DESC"}])
    flt = json.dumps([{"property": "status", "value": "Confirmed"}])
    body = client.get("/api/trades", params={"sort": sort, "filter": flt, "limit": 500}).json()
    prices = [t["price"] for t in body["data"]]
    assert prices == sorted(prices, reverse=True)
    assert all(t["status"] == "Confirmed" for t in body["data"])


def test_search_filter():
    flt = json.dumps([{"property": "q", "value": "solar"}])
    body = client.get("/api/trades", params={"filter": flt, "limit": 500}).json()
    assert body["total"] > 0
    assert all(t["product"] == "Solar PPA" for t in body["data"])


def test_create_update_delete_roundtrip():
    new = {
        "tradeDate": "2026-10-20", "counterparty": "Geneco", "product": "SG Peak",
        "side": "Buy", "quantityMWh": 50, "price": 210.5, "status": "Draft",
        "trader": "S. Kumar", "notes": "test",
    }
    created = client.post("/api/trades", json=new).json()["data"]
    assert created["id"] > 200

    updated = client.put(f"/api/trades/{created['id']}", json={**new, "status": "Confirmed"}).json()["data"]
    assert updated["status"] == "Confirmed"

    assert client.delete(f"/api/trades/{created['id']}").json()["success"] is True
    assert client.get(f"/api/trades/{created['id']}").status_code == 404


def test_validation_rejects_bad_trade():
    bad = {"tradeDate": "2026-10-20", "counterparty": "", "product": "SG Peak",
           "side": "Hold", "quantityMWh": 0, "price": -1}
    assert client.post("/api/trades", json=bad).status_code == 422


def test_dashboard_and_counterparties():
    dash = client.get("/api/dashboard").json()
    assert dash["kpis"]["tradeCount"] > 0
    assert len(dash["byProduct"]) == 5
    assert max(p["pct"] for p in dash["byProduct"]) == 100
    cps = client.get("/api/counterparties").json()["data"]
    assert len(cps) == 8
    assert all("exposureSGD" in c for c in cps)
