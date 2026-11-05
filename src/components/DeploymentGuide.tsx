import React, { useState } from 'react';
import { Terminal, Server, Cpu, Wifi, FileCode2, Copy, CheckCircle2, Eye } from 'lucide-react';

export default function DeploymentGuide() {
  const [activeSection, setActiveSection] = useState<'architecture' | 'backend' | 'ingestion' | 'wireless' | 'supervision'>('architecture');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const codeSnippets = {
    compose: `version: '3.9'
services:
  # 1. API Gateway & Backend
  wingmen-api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/wingmen
    depends_on:
      - db

  # 2. AI & NVR (Frigate)
  frigate:
    image: ghcr.io/blakeblackshear/frigate:stable
    shm_size: "64m"
    devices:
      - /dev/bus/usb:/dev/bus/usb # For Coral TPU
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - ./frigate/config.yml:/config/config.yml
      - ./storage/frigate:/media/frigate
    ports:
      - "5000:5000"
      - "8554:8554" # RTSP feeds

  # 3. Database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=wingmen`,
    
    backend: `from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import datetime

app = FastAPI(title="Wingmen Vision API Gateway")

class SecurityEvent(BaseModel):
    device_id: str
    type: str  # motion, tamper, intrusion
    severity: str
    timestamp: str
    ai_labels: List[str]
    evidence_ids: List[str] = []

class ThreatEvent(BaseModel):
    device_id: str
    type: str # deauth_attack, rogue_ap
    details: str
    signal_info: dict

@app.post("/events")
async def receive_event(event: SecurityEvent):
    # 1. Save to database
    # db.save(event)
    
    # 2. Broadcast to frontend via WebSockets
    # await websocket_manager.broadcast(event.json())
    
    # 3. Trigger alerts if critical
    if event.severity == "critical":
        # send_sms_or_email()
        pass
        
    return {"status": "success", "event_id": "evt_generated_id"}

@app.post("/threats")
async def receive_threat(threat: ThreatEvent):
    # Log wireless anomalies from Kismet/nzyme
    return {"status": "logged"}`,

    frigate: `mqtt:
  enabled: False

cameras:
  # Camera 1: EseeCloud (Assuming you extracted RTSP)
  driveway_cam:
    ffmpeg:
      inputs:
        - path: rtsp://admin:password@192.168.1.105:554/stream1
          roles:
            - detect
            - record
    detect:
      width: 1280
      height: 720
      fps: 5
    objects:
      track:
        - person
        - car

# Webhook to our API Gateway
# Frigate will POST to this URL when an object is detected
notification:
  endpoints:
    - url: http://wingmen-api:8000/events
      format: json`,

    wireless: `#!/usr/bin/env python3
import requests
from scapy.all import *

API_URL = "http://localhost:8000/threats"
TARGET_BSSID = "AA:BB:CC:DD:EE:FF" # Your WiFi Network

def packet_handler(pkt):
    # Detect Deauthentication Packets (Type 0, Subtype 12)
    if pkt.haslayer(Dot11Deauth):
        threat_data = {
            "device_id": "wids_sensor_01",
            "type": "deauth_attack",
            "details": f"Deauth detected targeting {pkt.addr1}",
            "signal_info": {
                "target_mac": pkt.addr1,
                "source_mac": pkt.addr2,
                "rssi": pkt.dBm_AntSignal if hasattr(pkt, 'dBm_AntSignal') else 0
            }
        }
        try:
            requests.post(API_URL, json=threat_data)
            print("Threat reported to Wingmen Vision API")
        except Exception as e:
            print(f"Failed to report threat: {e}")

print("Starting Wingmen Vision Wireless IDS on wlan0mon...")
sniff(iface="wlan0mon", prn=packet_handler, store=0)`,

    supervision: `import cv2
import supervision as sv
import requests
from ultralytics import YOLO
from datetime import datetime
import numpy as np

# Configuration
RTSP_URL = "rtsp://admin:password@192.168.1.105:554/stream1"
API_URL = "http://localhost:8000/events"
DEVICE_ID = "cam_02"

def main():
    # Load YOLOv8 model (use a custom trained model for weapons)
    # e.g., model = YOLO("best_weapons.pt")
    model = YOLO("yolov8n.pt") 
    
    # Initialize Roboflow Supervision tracker
    tracker = sv.ByteTrack()

    # Open video stream using Supervision
    generator = sv.get_video_frames_generator(RTSP_URL)

    print("Starting AI Vision processing with Roboflow Supervision...")

    for frame in generator:
        # 1. Run YOLO inference
        results = model(frame)[0]
        
        # 2. Convert to Supervision Detections
        detections = sv.Detections.from_ultralytics(results)
        detections = tracker.update_with_detections(detections)

        # 3. Filter for specific classes (e.g., custom model where 1=rifle, 2=pistol)
        # Using np.isin to check if any detected class matches our threat list
        threat_detections = detections[np.isin(detections.class_id, [1, 2])]

        # 4. Trigger Webhook to Wingmen API
        if len(threat_detections) > 0:
            labels = [model.model.names[class_id] for class_id in threat_detections.class_id]
            
            payload = {
                "device_id": DEVICE_ID,
                "type": "weapon_detected",
                "severity": "critical",
                "timestamp": datetime.now().isoformat(),
                "ai_labels": labels,
                "evidence_ids": []
            }
            
            try:
                requests.post(API_URL, json=payload)
                print(f"CRITICAL: Weapon detected! Webhook sent. Labels: {labels}")
            except Exception as e:
                print(f"Webhook failed: {e}")

if __name__ == "__main__":
    main()`
  };

  const tabs = [
    { id: 'architecture', label: '1. Architecture (Docker)', icon: Server },
    { id: 'backend', label: '2. API Backend (Python)', icon: FileCode2 },
    { id: 'ingestion', label: '3. AI & NVR (Frigate)', icon: Cpu },
    { id: 'wireless', label: '4. Wireless IDS (Scapy)', icon: Wifi },
    { id: 'supervision', label: '5. AI Vision (Supervision)', icon: Eye },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Production Deployment Guide</h2>
        <p className="text-gray-400">The actual code and configurations needed to build the Wingmen Vision middleman server and connect your proprietary cameras.</p>
      </div>

      <div className="flex gap-2 border-b border-gray-800 pb-4 overflow-x-auto custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeSection === tab.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {/* Architecture Section */}
        {activeSection === 'architecture' && (
          <div>
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white mb-2">The Middleman Server</h3>
              <p className="text-sm text-gray-400">
                You need a local server (Raspberry Pi 4, Intel NUC, or old PC) running Docker. This server will run Frigate (for AI and stream ingestion) and your custom API Gateway.
              </p>
            </div>
            <div className="relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => handleCopy(codeSnippets.compose, 'compose')}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                >
                  {copied === 'compose' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-4 bg-[#0d1117] text-gray-300 font-mono text-sm overflow-x-auto">
                <div className="text-gray-500 mb-2"># docker-compose.yml</div>
                <pre><code>{codeSnippets.compose}</code></pre>
              </div>
            </div>
          </div>
        )}

        {/* Backend Section */}
        {activeSection === 'backend' && (
          <div>
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white mb-2">The API Gateway (FastAPI)</h3>
              <p className="text-sm text-gray-400">
                This Python backend receives the webhooks from your AI and Wireless sensors, saves them to a database, and feeds this React dashboard.
              </p>
            </div>
            <div className="relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => handleCopy(codeSnippets.backend, 'backend')}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                >
                  {copied === 'backend' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-4 bg-[#0d1117] text-gray-300 font-mono text-sm overflow-x-auto">
                <div className="text-gray-500 mb-2"># backend/main.py</div>
                <pre><code>{codeSnippets.backend}</code></pre>
              </div>
            </div>
          </div>
        )}

        {/* Ingestion Section */}
        {activeSection === 'ingestion' && (
          <div>
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white mb-2">Stream Ingestion & AI (Frigate)</h3>
              <p className="text-sm text-gray-400 mb-4">
                Extract the RTSP URL from your EseeCloud/AJCloud cameras. If they don't provide one, use <code className="bg-gray-800 px-1 py-0.5 rounded text-blue-400">nmap</code> to scan their open ports (usually 554). Once you have the RTSP link, feed it into Frigate.
              </p>
            </div>
            <div className="relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => handleCopy(codeSnippets.frigate, 'frigate')}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                >
                  {copied === 'frigate' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-4 bg-[#0d1117] text-gray-300 font-mono text-sm overflow-x-auto">
                <div className="text-gray-500 mb-2"># frigate/config.yml</div>
                <pre><code>{codeSnippets.frigate}</code></pre>
              </div>
            </div>
          </div>
        )}

        {/* Wireless Section */}
        {activeSection === 'wireless' && (
          <div>
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white mb-2">Wireless Threat Detection</h3>
              <p className="text-sm text-gray-400">
                To detect jammers and deauth attacks, use a USB WiFi adapter supporting "Monitor Mode". Run this Python script using Scapy to sniff for attacks and POST them to your API.
              </p>
            </div>
            <div className="relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => handleCopy(codeSnippets.wireless, 'wireless')}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                >
                  {copied === 'wireless' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-4 bg-[#0d1117] text-gray-300 font-mono text-sm overflow-x-auto">
                <div className="text-gray-500 mb-2"># wireless_ids.py</div>
                <pre><code>{codeSnippets.wireless}</code></pre>
              </div>
            </div>
          </div>
        )}

        {/* Supervision Section */}
        {activeSection === 'supervision' && (
          <div>
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white mb-2">AI Vision with Roboflow Supervision</h3>
              <p className="text-sm text-gray-400">
                To implement the actual weapon detection, you can use the <a href="https://github.com/roboflow/supervision" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">roboflow/supervision</a> library alongside Ultralytics YOLOv8. This script pulls the RTSP stream, runs object detection, tracks the objects, and fires webhooks to the API when a weapon is spotted.
              </p>
            </div>
            <div className="relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => handleCopy(codeSnippets.supervision, 'supervision')}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                >
                  {copied === 'supervision' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-4 bg-[#0d1117] text-gray-300 font-mono text-sm overflow-x-auto">
                <div className="text-gray-500 mb-2"># ai_vision.py (pip install supervision ultralytics opencv-python)</div>
                <pre><code>{codeSnippets.supervision}</code></pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}