import React, { useEffect, useState } from 'react';
import { SecurityEvent } from '../types';
import { api } from '../lib/live_api';
import { AlertTriangle, Activity, ShieldAlert, Radio, Crosshair, Terminal } from 'lucide-react';
import { User } from '../lib/auth';

const SEVERITY_COLORS = {
  critical: 'text-red-500',
  high: 'text-orange-500',
  medium: 'text-yellow-500',
  low: 'text-blue-500',
};

const TYPE_ICONS = {
  motion: <Activity className="w-4 h-4" />,
  tamper: <ShieldAlert className="w-4 h-4" />,
  intrusion: <AlertTriangle className="w-4 h-4" />,
  wireless_anomaly: <Radio className="w-4 h-4" />,
  weapon_detected: <Crosshair className="w-4 h-4 text-red-500 animate-[spin_3s_linear_infinite]" />
};

export default function EventsList({ user }: { user?: User }) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        const isWeapon = Math.random() > 0.7;
        api.createEvent({
          device_id: ['cam_01', 'cam_02', 'cam_03'][Math.floor(Math.random() * 3)],
          type: isWeapon ? 'weapon_detected' : ['motion', 'intrusion'][Math.floor(Math.random() * 2)] as any,
          severity: isWeapon ? 'critical' : ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          timestamp: new Date().toISOString(),
          ai_labels: isWeapon 
            ? [['tactical_gear', 'long_rifle'], ['pistol_hip'], ['firearm_hands']][Math.floor(Math.random() * 3)]
            : ['person'],
          evidence_ids: []
        }).then(() => fetchEvents());
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = () => {
    api.getEvents().then(setEvents);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-red-900/30 pb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-red-600 tracking-[0.2em] flex items-center gap-3">
            <Terminal className="w-6 h-6" />
            THREAT LOG
          </h2>
          <p className="text-xs text-red-800 tracking-widest mt-1">SYSTEM EVENTS & AI DETECTIONS</p>
        </div>
        <div className="text-xs text-red-800 font-bold tracking-widest bg-red-950/30 border border-red-900/50 px-3 py-1.5">
          {events.length} ENTRIES
        </div>
      </div>

      <div className="flex-1 bg-black border border-red-900/50 relative overflow-hidden flex flex-col">
        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-red-600" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-600" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-red-600" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-red-600" />

        <div className="p-3 border-b border-red-900/50 bg-red-950/20 flex items-center gap-2 shrink-0">
          <Activity className="w-4 h-4 text-red-600 animate-pulse" />
          <span className="text-[10px] font-bold text-red-500 tracking-[0.2em]">MONITORING ALL SECTORS</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {events.map(evt => (
            <div key={evt.id} className={`border p-3 relative group ${evt.type === 'weapon_detected' ? 'border-red-600 bg-red-950/20' : 'border-red-900/30 bg-black'}`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${evt.type === 'weapon_detected' ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'bg-red-900/50'}`} />
              
              <div className="flex justify-between items-start mb-2 pl-3">
                <div className="flex items-center gap-3">
                  {TYPE_ICONS[evt.type]}
                  <span className={`font-bold text-xs tracking-widest uppercase ${SEVERITY_COLORS[evt.severity]}`}>
                    {evt.severity} // {evt.type.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-[10px] text-red-800 tracking-widest">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="pl-3 mt-2 grid grid-cols-2 gap-2 text-[10px] tracking-widest">
                <div>
                  <span className="text-red-900">SOURCE: </span>
                  <span className="text-red-500">{evt.device_id}</span>
                </div>
                <div>
                  <span className="text-red-900">AI TAGS: </span>
                  <span className="text-red-400 font-bold">{evt.ai_labels.join(', ').replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}