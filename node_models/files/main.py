"""
JARVIS — Main Server Entry Point
─────────────────────────────────
Run with:
    uvicorn main:app --reload --port 8000

WebSocket endpoint: ws://localhost:8000/ws
REST endpoints:     http://localhost:8000/browser/...
"""

from __future__ import annotations
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from browser_module import router as browser_router, handle_browser_ws_message

app = FastAPI(title="JARVIS", version="2.4.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the browser REST routes
app.include_router(browser_router)

# ── Active WebSocket connections ──────────────────────────────────────────────
connections: list[WebSocket] = []

async def broadcast(data: dict):
    for ws in list(connections):
        try:
            await ws.send_json(data)
        except Exception:
            connections.remove(ws)

# ── Main WebSocket ─────────────────────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    connections.append(ws)
    await ws.send_json({"type": "connected", "message": "JARVIS online."})

    try:
        while True:
            raw = await ws.receive_text()
            msg = json.loads(raw)

            module = msg.get("module", "chat")

            if module == "browser":
                await handle_browser_ws_message(ws, msg)

            # Add other modules here:
            # elif module == "calendar": ...
            # elif module == "mail":     ...
            # elif module == "memory":   ...
            else:
                await ws.send_json({
                    "type": "echo",
                    "message": f"Module '{module}' not yet connected.",
                })

    except WebSocketDisconnect:
        connections.remove(ws)

@app.get("/")
async def root():
    return {"status": "JARVIS online", "version": "2.4.1"}
