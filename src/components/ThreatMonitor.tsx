import React, { useEffect, useState } from 'react';
import { Threat } from '../types';
import { api } from '../lib/live_api';
import { ShieldAlert, Wifi, Target, Activity } from 'lucide-react';
import { User } from '../lib/auth';

export default function ThreatMonitor({ user }: { user?: User }) {
  const [threats, setThreats] = useState<Threat[]>([]);

  useEffect(() => {
    api.getThreats().then(setThreats);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-red-900/30 pb-4">
        <div>
          <h2 className="text-xl font-bold text-red-600 tracking-widest">WIRELESS WIDS</h2>
          <p className="text-xs text-red-800 tracking-widest mt-1">DETECTING DEAUTH ATTACKS & ROGUE APS</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-950/30 border border-red-900/50">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
          <span className="text-xs font-bold text-red-500 tracking-widest">SCANNING</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {threats.map(threat => (
          <div key={threat.id} className="bg-black border border-red-600/50 p-6 relative overflow-hidden shadow-[0_0_20px_rgba(220,38,38,0.1)]">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
            
            <div className="flex items-start justify-between mb-6 pl-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-950/50 border border-red-600/50">
                  <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-red-500 font-bold tracking-[0.2em] text-lg">{threat.type.replace('_', ' ')}</h3>
                  <div className="text-xs font-bold text-red-800 tracking-widest mt-1">{threat.details}</div>
                </div>
              </div>
              <div className="text-[10px] font-bold tracking-widest text-red-900 border border-red-900/30 px-3 py-1">
                {new Date(threat.timestamp).toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#050505] p-5 border border-red-900/30 pl-4 ml-2">
              <div className="flex items-center gap-4 border-r border-red-900/30 pr-4">
                <Target className="w-5 h-5 text-red-800" />
                <div>
                  <div className="text-[9px] text-red-800 tracking-widest mb-1">TARGET MAC</div>
                  <div className="text-sm font-bold tracking-widest text-red-500">{threat.signal_info.target_mac}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 border-r border-red-900/30 pr-4">
                <Activity className="w-5 h-5 text-red-800" />
                <div>
                  <div className="text-[9px] text-red-800 tracking-widest mb-1">SIGNAL (RSSI)</div>
                  <div className="text-sm font-bold tracking-widest text-red-500">{threat.signal_info.rssi} dBm</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Wifi className="w-5 h-5 text-red-800" />
                <div>
                  <div className="text-[9px] text-red-800 tracking-widest mb-1">FREQUENCY</div>
                  <div className="text-sm font-bold tracking-widest text-red-500">{threat.signal_info.frequency}</div>
                </div>
              </div>
            </div>
            
            {isAdmin && (
              <div className="mt-6 flex gap-4 pl-2">
                <button className="px-6 py-3 bg-red-600 hover:bg-red-500 text-black text-xs font-bold tracking-[0.2em] transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                  BLOCK MAC ADDRESS
                </button>
                <button className="px-6 py-3 bg-red-950/30 hover:bg-red-900/50 text-red-500 border border-red-900/50 text-xs font-bold tracking-[0.2em] transition-colors">
                  ACKNOWLEDGE
                </button>
              </div>
            )}
          </div>
        ))}
        {threats.length === 0 && (
          <div className="p-12 text-center border border-dashed border-red-900/50 bg-[#0a0a0a] text-red-900 text-sm font-bold tracking-[0.3em]">
            NO ACTIVE WIRELESS THREATS
          </div>
        )}
      </div>
    </div>
  );
}