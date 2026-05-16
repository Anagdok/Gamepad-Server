# Gamepad-server 🎮📱

Turn any smartphone into a low-latency virtual digital gamepad for Linux local multiplayer games. No app downloads required—just a Wi-Fi connection and a web browser! 

## ✨ Features
* **Up to 16 Players:** Perfect for massive local multiplayer chaos.
* **Digital D-Pad Layout:** Replaced fluid analog controls with a classic arcade D-Pad (Up, Down, Left, Right), along with A, B, START, and SELECT buttons.
* **Ultra-Low Latency:** Sends delta input updates over WebSockets capped at 30 FPS.
* **Custom Player Names:** Nicknames are injected directly into Linux as the hardware device name (e.g., `Gamepad_PlayerOne`).

## 📋 Prerequisites
* A **Linux** host machine with the `/dev/uinput` module enabled.
* **Docker** and **Docker Compose plugin** installed.

## 🚀 Quick Start

1. Enable the uinput kernel module:
   ```bash
   sudo modprobe uinput