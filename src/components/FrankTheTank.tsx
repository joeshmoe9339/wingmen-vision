import React, { useState, useEffect, useRef } from 'react';
import { Bot, Terminal as TerminalIcon, X, Activity, Cpu, Database } from 'lucide-react';

export default function FrankTheTank() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const operations = [
    "Analyzing camera feed patterns...",
    "Optimizing threat detection weights...",
    "Cross-referencing OSINT databases...",
    "Running Roboflow Supervision tracker...",
    "Updating bounding box confidence intervals...",
    "Scanning for wireless anomalies (Deauth/Rogue AP)...",
    "Compressing evidence logs...",
    "Re-calibrating facial recognition matrix...",
    "Frank the Tank is hungry for data...",
    "Syncing with remote ONVIF bridge..."
  ];

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = `[${new Date().toLocaleTimeString()}] ${operations[Math.floor(Math.random() * operations.length)]}`;
        return [...prev, newLog].slice(-20); // Keep last 20 logs
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-gray-900 border border-blue-500/30 rounded-xl w-80 shadow-2xl shadow-blue-900/20 mb-4 overflow-hidden flex flex-col h-96 animate-in slide-in-from-bottom-5">
          <div className="bg-gray-800/80 p-3 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">Frank the Tank</h3>
                <p className="text-[10px] text-blue-400 font-mono">Hermes-Class Autonomous Agent</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 p-3 font-mono text-xs overflow-y-auto custom-scrollbar bg-[#050505] text-green-400 space-y-2">
            <div className="text-blue-400 mb-4">
              System initialized. Roboflow Supervision core active. Ready to process RTSP streams.
            </div>
            {logs.map((log, i) => (
              <div key={i} className="opacity-80 hover:opacity-100 transition-opacity">
                <span className="text-gray-500 mr-2">&gt;</span>
                {log}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-2 border-t border-gray-800 bg-gray-900 flex justify-between items-center text-[10px] text-gray-500">
            <div className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU: 42%</div>
            <div className="flex items-center gap-1"><Database className="w-3 h-3" /> MEM: 1.2GB</div>
            <div className="flex items-center gap-1 text-green-400"><Activity className="w-3 h-3" /> ACTIVE</div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          isOpen 
            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
            : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 shadow-blue-500/30'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0A0A0A] rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}
