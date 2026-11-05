import React, { useEffect, useState } from 'react';
import { Camera, SecurityEvent } from '../types';
import { ingestEvent } from '../lib/event_ingestion';
import { api } from '../lib/live_api';
import { Video, WifiOff, ShieldAlert, Crosshair } from 'lucide-react';
import { User } from '../lib/auth';

export default function CameraGrid({ user }: { user?: User }) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Record<string, SecurityEvent>>({});

  useEffect(() => {
    api.getCameras().then((cams: any) => {
      setCameras(cams);
      cams.forEach((cam: any) => {
        if (cam.status === 'online') {
          import('../lib/onvif_client').then(({ ingestStream }) => ingestStream(cam.id, cam.stream_url));
        }
      });
    });
    
    const interval = setInterval(() => {
      api.getEvents().then(events => {
        const recentWeapons = events.filter(e => 
          e.type === 'weapon_detected' && 
          new Date(e.timestamp).getTime() > Date.now() - 6000
        );
        
        const alertsByCam: Record<string, SecurityEvent> = {};
        recentWeapons.forEach(w => {
          if (!alertsByCam[w.device_id]) {
            alertsByCam[w.device_id] = w;
          }
        });
        setActiveAlerts(alertsByCam);
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-red-900/30 pb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-red-600 tracking-[0.2em] flex items-center gap-3">
            <Video className="w-6 h-6" />
            MULTI-VIEW OVERWATCH
          </h2>
          <p className="text-xs text-red-800 tracking-widest mt-1">LIVE FEED AGGREGATION // ALL SECTORS</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-red-950/30 border border-red-900/50 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[10px] font-bold text-red-500 tracking-widest">EAGLE GRID</span>
          </div>
        </div>
      </div>

      {/* TIGHT GRID FOR MULTI-VIEW */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 auto-rows-fr">
        {cameras.map(cam => (
          <div key={cam.id} className="bg-black border border-red-900/50 flex flex-col relative group overflow-hidden shadow-[0_0_15px_rgba(220,38,38,0.05)]">
            
            {/* Video Feed */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
              {cam.status === 'online' ? (
                <>
                  <video 
                    src={cam.stream_url} 
                    autoPlay loop muted playsInline 
                    className={`w-full h-full object-cover transition-all duration-300 ${activeAlerts[cam.id] ? 'opacity-70 grayscale contrast-125 brightness-75' : 'opacity-60 grayscale contrast-125 group-hover:opacity-80'}`}
                  />
                  
                  {/* Scanline Effect */}
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />

                  {/* Weapon Detection Overlay */}
                  {activeAlerts[cam.id] && (
                    <div className="absolute inset-0 border-4 border-red-600 pointer-events-none flex flex-col items-center justify-center bg-red-600/10">
                       <div className="absolute top-4 bg-red-600 text-black px-4 py-1.5 font-bold flex items-center gap-2 animate-pulse uppercase tracking-[0.2em] text-xs shadow-[0_0_30px_rgba(220,38,38,0.8)]">
                         <ShieldAlert className="w-4 h-4" />
                         LETHAL THREAT: {activeAlerts[cam.id].ai_labels.join(' + ').replace(/_/g, ' ')}
                       </div>
                       
                       {/* Targeting Box */}
                       <div className="absolute w-40 h-56 border border-red-500 bg-red-950/20" style={{ left: `${Math.random() * 20 + 40}%`, top: `${Math.random() * 20 + 40}%`, transform: 'translate(-50%, -50%)' }}>
                         <div className="absolute -top-6 left-[-1px] bg-red-600 text-black text-[10px] font-bold px-2 py-1 whitespace-nowrap flex items-center gap-1 tracking-widest">
                           <Crosshair className="w-3 h-3" /> TARGET LOCK
                         </div>
                         <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-red-600" />
                         <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-red-600" />
                         <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-red-600" />
                         <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-red-600" />
                       </div>
                    </div>
                  )}

                  <div className="absolute top-2 right-2 bg-black/80 border border-red-900/50 px-2 py-1 text-[10px] font-mono text-red-500 flex items-center gap-2 tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> REC
                  </div>
                </>
              ) : (
                <div className="text-red-900/50 flex flex-col items-center gap-2">
                  <WifiOff className="w-8 h-8" />
                  <span className="text-xs font-bold tracking-widest">NO SIGNAL</span>
                </div>
              )}
            </div>
            
            {/* Meta Bar */}
            <div className={`px-3 py-2 flex items-center justify-between border-t border-red-900/50 ${activeAlerts[cam.id] ? 'bg-red-950' : 'bg-black'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold tracking-widest ${activeAlerts[cam.id] ? 'text-red-500' : 'text-red-700'}`}>
                  {cam.name.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[9px] tracking-widest">
                <span className="text-red-800">{cam.ip_address}</span>
                <span className="text-red-600 bg-red-950/50 border border-red-900/50 px-1.5 py-0.5">
                  {cam.brand}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}