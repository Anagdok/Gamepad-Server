import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import evdev
from evdev import UInput, ecodes as e

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    return RedirectResponse(url="/static/index.html")

aktywne_pady = {}

def stworz_pada(nick):
    mozliwosci = {
        e.EV_KEY: [e.BTN_SOUTH, e.BTN_EAST], # BTN_SOUTH to A, BTN_EAST to B
        e.EV_ABS: [
            (e.ABS_X, evdev.AbsInfo(value=128, min=0, max=255, fuzz=0, flat=0, resolution=0)),
            (e.ABS_Y, evdev.AbsInfo(value=128, min=0, max=255, fuzz=0, flat=0, resolution=0))
        ]
    }
    return UInput(mozliwosci, name=f"Gamepad_{nick}", version=0x3)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    pad = None
    nick = "Nieznany"
    try:
        while True:
            data = await websocket.receive_text()
            wiadomosc = json.loads(data)
            akcja = wiadomosc.get("akcja")

            if akcja == "DOLACZ":
                nick = wiadomosc.get("nick", "Gracz")
                pad = stworz_pada(nick)
                aktywne_pady[websocket] = pad
                print(f"Gracz '{nick}' dołączył!")

            elif akcja == "STAN" and pad:
                stan = wiadomosc.get("stan", {})
                if "x" in stan:
                    pad.write(e.EV_ABS, e.ABS_X, stan["x"])
                if "y" in stan:
                    pad.write(e.EV_ABS, e.ABS_Y, stan["y"])
                if "a" in stan:
                    pad.write(e.EV_KEY, e.BTN_SOUTH, stan["a"])
                if "b" in stan:
                    pad.write(e.EV_KEY, e.BTN_EAST, stan["b"])
                
                pad.syn()

    except WebSocketDisconnect:
        print(f"Gracz '{nick}' się rozłączył.")
        if pad:
            pad.close()
            del aktywne_pady[websocket]
