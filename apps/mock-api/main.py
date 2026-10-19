"""Mock ETRM API for the TradeBlotter sample app.

Speaks the Ext JS REST proxy dialect (page/start/limit, JSON `sort` and
`filter` params, {success, total, data} envelopes) so both the legacy
Ext JS app and the future React app can call the same backend.

Run:  uv run uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from __future__ import annotations

import json
import random
from datetime import date, timedelta
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="TradeBlotter Mock API", version="1.0.0")

# The Ext JS dev server proxies /api to this port, so CORS is only needed
# when calling the API directly from another origin (e.g. the React app).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Side = Literal["Buy", "Sell"]
Status = Literal["Draft", "Confirmed", "Settled", "Cancelled"]

PRODUCTS = ["SG Peak", "SG Off-Peak", "SG Baseload", "Solar PPA", "LNG Swap"]
TRADERS = ["A. Tan", "R. Kumar", "M. Lim", "S. Wong", "J. Lee"]
STATUSES: list[str] = ["Draft", "Confirmed", "Settled", "Cancelled"]


class TradeIn(BaseModel):
    tradeDate: date
    counterparty: str = Field(min_length=1)
    product: str = Field(min_length=1)
    side: Side
    quantityMWh: float = Field(gt=0)
    price: float = Field(ge=0)
    status: Status = "Draft"
    trader: str = ""
    notes: Optional[str] = ""


class Trade(TradeIn):
    id: int


class Counterparty(BaseModel):
    id: int
    name: str
    country: str
    rating: str
    creditLimitSGD: float


# ---------------------------------------------------------------- seed data

COUNTERPARTIES: list[Counterparty] = [
    Counterparty(id=1, name="Keppel Electric", country="SG", rating="A", creditLimitSGD=5_000_000),
    Counterparty(id=2, name="Senoko Energy", country="SG", rating="A-", creditLimitSGD=4_000_000),
    Counterparty(id=3, name="Tuas Power", country="SG", rating="BBB+", creditLimitSGD=3_000_000),
    Counterparty(id=4, name="Sembcorp Power", country="SG", rating="A", creditLimitSGD=6_000_000),
    Counterparty(id=5, name="PacificLight", country="SG", rating="BBB", creditLimitSGD=2_500_000),
    Counterparty(id=6, name="YTL PowerSeraya", country="SG", rating="BBB+", creditLimitSGD=3_500_000),
    Counterparty(id=7, name="Geneco", country="SG", rating="BBB-", creditLimitSGD=1_500_000),
    Counterparty(id=8, name="Malaysia Grid Co", country="MY", rating="A-", creditLimitSGD=4_500_000),
]

PRICE_BANDS = {
    "SG Peak": (180, 260),
    "SG Off-Peak": (110, 170),
    "SG Baseload": (140, 210),
    "Solar PPA": (95, 140),
    "LNG Swap": (60, 110),
}


def _seed_trades(count: int = 200) -> dict[int, Trade]:
    rng = random.Random(42)  # fixed seed: same data on every start
    today = date.today()
    trades: dict[int, Trade] = {}
    for i in range(1, count + 1):
        product = rng.choice(PRODUCTS)
        low, high = PRICE_BANDS[product]
        trades[i] = Trade(
            id=i,
            tradeDate=today - timedelta(days=rng.randint(0, 90)),
            counterparty=rng.choice(COUNTERPARTIES).name,
            product=product,
            side=rng.choice(["Buy", "Sell"]),
            quantityMWh=float(rng.choice([25, 50, 75, 100, 150, 200, 250, 500])),
            price=round(rng.uniform(low, high), 2),
            status=rng.choices(STATUSES, weights=[2, 5, 4, 1])[0],
            trader=rng.choice(TRADERS),
            notes="",
        )
    return trades


TRADES: dict[int, Trade] = _seed_trades()


def _next_id() -> int:
    return max(TRADES, default=0) + 1


# ---------------------------------------------------------------- helpers

def _parse_json_param(raw: Optional[str]) -> list[dict]:
    """Ext JS sends sort/filter as JSON arrays in the query string."""
    if not raw:
        return []
    try:
        value = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail=f"Invalid JSON parameter: {raw}")
    return value if isinstance(value, list) else [value]


def _matches(trade: Trade, flt: dict) -> bool:
    prop, value = flt.get("property"), flt.get("value")
    if value in (None, ""):
        return True
    if prop == "q":  # free-text search box
        needle = str(value).lower()
        haystack = f"{trade.id} {trade.counterparty} {trade.product} {trade.trader}".lower()
        return needle in haystack
    actual = getattr(trade, prop, None)
    if actual is None:
        return True  # unknown filters are ignored, like most real APIs
    return str(actual).lower() == str(value).lower()


def _active(trades):
    return [t for t in trades if t.status != "Cancelled"]


# ---------------------------------------------------------------- trades

@app.get("/api/trades")
def list_trades(
    page: int = 1,
    start: Optional[int] = None,
    limit: int = Query(50, ge=1, le=500),
    sort: Optional[str] = None,
    filter: Optional[str] = None,
):
    rows = list(TRADES.values())

    for flt in _parse_json_param(filter):
        rows = [t for t in rows if _matches(t, flt)]

    sorters = _parse_json_param(sort) or [{"property": "tradeDate", "direction": "DESC"}]
    # Apply sorters last-to-first so the first sorter wins (stable sort).
    for sorter in reversed(sorters):
        prop = sorter.get("property", "id")
        if prop not in Trade.model_fields:
            continue
        reverse = str(sorter.get("direction", "ASC")).upper() == "DESC"
        rows.sort(key=lambda t: getattr(t, prop), reverse=reverse)

    total = len(rows)
    offset = start if start is not None else (page - 1) * limit
    return {"success": True, "total": total, "data": rows[offset: offset + limit]}


@app.get("/api/trades/{trade_id}")
def get_trade(trade_id: int):
    if trade_id not in TRADES:
        raise HTTPException(status_code=404, detail="Trade not found")
    return {"success": True, "data": TRADES[trade_id]}


@app.post("/api/trades", status_code=201)
def create_trade(body: TradeIn):
    trade = Trade(id=_next_id(), **body.model_dump())
    TRADES[trade.id] = trade
    return {"success": True, "data": trade}


@app.put("/api/trades/{trade_id}")
def update_trade(trade_id: int, body: TradeIn):
    if trade_id not in TRADES:
        raise HTTPException(status_code=404, detail="Trade not found")
    trade = Trade(id=trade_id, **body.model_dump())
    TRADES[trade_id] = trade
    return {"success": True, "data": trade}


@app.delete("/api/trades/{trade_id}")
def delete_trade(trade_id: int):
    if TRADES.pop(trade_id, None) is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    return {"success": True}


# ---------------------------------------------------------------- counterparties

@app.get("/api/counterparties")
def list_counterparties():
    active = _active(TRADES.values())
    data = []
    for cp in COUNTERPARTIES:
        mine = [t for t in active if t.counterparty == cp.name]
        exposure = sum(t.quantityMWh * t.price for t in mine if t.status != "Settled")
        data.append({
            **cp.model_dump(),
            "tradeCount": len(mine),
            "exposureSGD": round(exposure, 2),
        })
    return {"success": True, "total": len(data), "data": data}


# ---------------------------------------------------------------- dashboard

@app.get("/api/dashboard")
def dashboard():
    active = _active(TRADES.values())
    buys = sum(t.quantityMWh for t in active if t.side == "Buy")
    sells = sum(t.quantityMWh for t in active if t.side == "Sell")

    by_product: dict[str, float] = {p: 0.0 for p in PRODUCTS}
    for t in active:
        by_product[t.product] = by_product.get(t.product, 0.0) + t.quantityMWh
    top = max(by_product.values(), default=0) or 1

    by_cp: dict[str, dict] = {}
    for t in active:
        row = by_cp.setdefault(t.counterparty, {"name": t.counterparty, "tradeCount": 0, "notionalSGD": 0.0})
        row["tradeCount"] += 1
        row["notionalSGD"] += t.quantityMWh * t.price
    top_cps = sorted(by_cp.values(), key=lambda r: r["notionalSGD"], reverse=True)[:5]
    for row in top_cps:
        row["notionalSGD"] = round(row["notionalSGD"], 2)

    return {
        "success": True,
        "kpis": {
            "tradeCount": len(active),
            "totalVolumeMWh": buys + sells,
            "netPositionMWh": buys - sells,
            "totalNotionalSGD": round(sum(t.quantityMWh * t.price for t in active), 2),
            "draftCount": sum(1 for t in active if t.status == "Draft"),
            "confirmedCount": sum(1 for t in active if t.status == "Confirmed"),
        },
        "byProduct": [
            {"product": p, "volumeMWh": v, "pct": round(v / top * 100, 1)}
            for p, v in sorted(by_product.items(), key=lambda kv: kv[1], reverse=True)
        ],
        "byCounterparty": top_cps,
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "trades": len(TRADES)}
