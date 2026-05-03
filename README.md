# Gamepad-server 🎮📱

Turn any smartphone into a low-latency virtual gamepad for Linux local multiplayer games. No app downloads required—just a Wi-Fi connection and a web browser! 

Designed specifically for indie game developers and local multiplayer enthusiasts, Gamepad-server can simulate up to 16 independent controllers simultaneously on a single Linux host.

## ✨ Features
* **Up to 16 Players:** Perfect for massive local multiplayer chaos.
* **Ultra-Low Latency:** Uses WebSockets to transmit inputs. The client is strictly optimized to send data *only* on state changes (capped at 30 FPS) to prevent network bottlenecks.
* **Zero-Install Client:** Players just type the server's IP address into their mobile browser (Chrome/Safari). 
* **Native OS Integration:** Uses the Linux `uinput` subsystem via `evdev`. The host OS and your game engine see the phones as physical, plugged-in USB gamepads.
* **Custom Player Names:** Players enter a nickname in the web lobby, which is injected directly into the Linux OS as the controller's hardware name (e.g., `Gamepad_PlayerOne`).

## 🛠 Tech Stack
* **Backend:** Python 3.10, FastAPI, WebSockets, `evdev`
* **Frontend:** HTML5, Vanilla JS, `nipplejs` (for virtual analog sticks)
* **Deployment:** Docker & Docker Compose (V2)

## 📋 Prerequisites
* A **Linux** host machine (required for the `/dev/uinput` module).
* **Docker** and the modern **Docker Compose plugin** installed.
* A local Wi-Fi Access Point for devices to connect to.

## 🚀 Quick Start

**Step 1:** Enable the virtual input driver on your Linux host. (Ensure your user or Docker group has write permissions to `/dev/uinput`):
`sudo modprobe uinput`

**Step 2:** Start the server in the background using Docker:
`docker compose up --build -d`

**Step 3:** Connect your players!
* Find your Linux machine's local IP address (run `ip a` in the terminal).
* Have players open their mobile browsers and navigate to: `http://<YOUR_LINUX_IP>:8000`
* Enter a nickname, rotate the phone horizontally, and start gaming!