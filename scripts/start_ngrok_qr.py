#!/usr/bin/env python3
"""
Start ngrok for NutriChef frontend and display public URL as QR code in terminal.
"""
import subprocess
import time
import requests
import qrcode
import sys

FRONTEND_PORT = 3000
NGROK_API = "http://127.0.0.1:4040/api/tunnels"


def start_ngrok(port):
    print(f"Starting ngrok tunnel for port {port}...")
    ngrok_proc = subprocess.Popen(["ngrok", "http", str(port)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return ngrok_proc


def get_ngrok_url():
    for _ in range(30):  # Try for up to 30 seconds
        try:
            resp = requests.get(NGROK_API)
            tunnels = resp.json().get("tunnels", [])
            for tunnel in tunnels:
                public_url = tunnel.get("public_url")
                if public_url and public_url.startswith("http"):
                    return public_url
        except Exception:
            pass
        time.sleep(1)
    return None


def display_qr(url):
    print(f"\nScan this QR code to open the app on your device:")
    qr = qrcode.QRCode()
    qr.add_data(url)
    qr.make()
    qr.print_ascii(invert=True)
    print(f"\nPublic URL: {url}\n")


def main():
    ngrok_proc = start_ngrok(FRONTEND_PORT)
    print("Waiting for ngrok public URL...")
    url = get_ngrok_url()
    if url:
        print(f"ngrok public URL: {url}")
        display_qr(url)
    else:
        print("Could not retrieve ngrok public URL. Is ngrok running?")
    try:
        input("Press Enter to stop ngrok and exit...")
    except KeyboardInterrupt:
        pass
    ngrok_proc.terminate()
    print("ngrok stopped.")

if __name__ == "__main__":
    main()
