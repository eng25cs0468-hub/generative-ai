
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.email_reports import send_email_report
from backend.db import users_collection

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Expecting JSON: {"action": "send_email", "username": "..."}
            import json
            try:
                msg = json.loads(data)
            except Exception:
                await websocket.send_text("Invalid message format. Send JSON.")
                continue

            if msg.get("action") == "send_email":
                email = msg.get("email")
                if email:
                    try:
                        send_email_report(email)
                        await websocket.send_text(f"Email sent to {email}")
                    except Exception as e:
                        await websocket.send_text(f"Failed to send email: {e}")
                else:
                    await websocket.send_text("No email provided.")
            else:
                await websocket.send_text(f"Received: {data}")
    except WebSocketDisconnect:
        pass
