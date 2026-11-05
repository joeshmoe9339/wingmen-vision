import React, { useState } from 'react';
import { Users, FileText, Activity, AlertTriangle, ShieldAlert, Target, Crosshair, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface Profile {
  id: string;
  alias: string;
  status: 'active' | 'incarcerated' | 'unknown';
  threatLevel: 'extreme' | 'high' | 'moderate';
  lastSeen: string;
  affiliations: string[];
  notes: string;
}

const SYNDICATE_DATA: Profile[] = [
  {
    id: 'syn_001',
    alias: 'THE ARCHITECT',
    status: 'active',
    threatLevel: 'extreme',
    lastSeen: 'EAGLE GRID SECTOR 4',
    affiliations: ['GHOST CARTEL', 'SHADOW NET'],
    notes: 'Known for coordinating coordinated network jamming and physical breaches. Highly dangerous.'
  },
  {
    id: 'syn_002',
    alias: 'VIPER',
    status: 'unknown',
    threatLevel: 'high',
    lastSeen: 'OFF-GRID',
    affiliations: ['GHOST CARTEL'],
    notes: 'Specialist in bypassing biometric security and wireless deauth attacks.'
  },
  {
    id: 'syn_003',
    alias: 'BRICK',
    status: 'incarcerated',
    threatLevel: 'moderate',
    lastSeen: 'CELL BLOCK C',
    affiliations: ['STREET KINGS'],
    notes: 'Enforcer. Currently serving 10 years, but suspected of directing operations from inside.'
  }
];

export default function SyndicateProfiling() {
  const [activeProfile, setActiveProfile] = useState<Profile>(SYNDICATE_DATA[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-red-900/30 pb-4">
        <div>
          <h2 className="text-xl font-bold text-red-600 tracking-[0.2em] flex items-center gap-2">
            <Users className="w-6 h-6" />
            SYNDICATE PROFILING
          </h2>
          <p className="text-sm text-red-800 tracking-widest mt-1">Known threat actors and organizational mapping.</p>
        </div>
        <div className="bg-red-950/30 border border-red-900/50 px-4 py-2 rounded-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="text-xs font-bold text-red-500 tracking-[0.2em]">DATABASE: ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        {/* Profile List */}
        <div className="bg-[#0a0a0a] border border-red-900/30 rounded-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-red-900/30 bg-black/50">
            <h3 className="text-xs font-bold text-red-600 tracking-[0.2em] flex items-center gap-2">
              <FileText className="w-4 h-4" />
              KNOWN TARGETS
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {SYNDICATE_DATA.map(profile => (
              <button
                key={profile.id}
                onClick={() => setActiveProfile(profile)}
                className={`w-full text-left p-3 border rounded-sm transition-all ${
                  activeProfile.id === profile.id
                    ? 'bg-red-900/20 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.1)]'
                    : 'bg-black border-red-900/30 hover:border-red-700/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-red-100 tracking-wider text-sm">{profile.alias}</span>
                  <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 border ${
                    profile.threatLevel === 'extreme' ? 'border-red-500 text-red-500 bg-red-500/10 animate-pulse' :
                    profile.threatLevel === 'high' ? 'border-orange-500 text-orange-500 bg-orange-500/10' :
                    'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                  }`}>
                    {profile.threatLevel}
                  </span>
                </div>
                <div className="text-[10px] text-red-800 font-mono">ID: {profile.id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-red-900/30 rounded-sm relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-900/30">
            <div className="h-full bg-red-600 w-1/3 animate-[scan_3s_ease-in-out_infinite]" />
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-32 h-32 bg-black border border-red-900/50 flex items-center justify-center relative group">
                <User className="w-16 h-16 text-red-900/50" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none mix-blend-screen" />
                <Crosshair className="absolute w-full h-full text-red-500/20 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-red-500 tracking-[0.3em] mb-2">{activeProfile.alias}</h2>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-black/50 border border-red-900/30 p-3">
                    <div className="text-[10px] text-red-800 uppercase tracking-widest mb-1">STATUS</div>
                    <div className="text-sm font-bold text-red-400 tracking-wider flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${activeProfile.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                      {activeProfile.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="bg-black/50 border border-red-900/30 p-3">
                    <div className="text-[10px] text-red-800 uppercase tracking-widest mb-1">LAST SEEN</div>
                    <div className="text-sm font-bold text-red-400 tracking-wider font-mono">{activeProfile.lastSeen}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-red-600 tracking-[0.2em] mb-3 flex items-center gap-2 border-b border-red-900/30 pb-2">
                  <Activity className="w-4 h-4" />
                  AFFILIATIONS
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeProfile.affiliations.map(affil => (
                    <span key={affil} className="bg-red-950/30 border border-red-900/50 text-red-300 px-3 py-1 text-xs font-bold tracking-widest">
                      {affil}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-red-600 tracking-[0.2em] mb-3 flex items-center gap-2 border-b border-red-900/30 pb-2">
                  <ShieldAlert className="w-4 h-4" />
                  OPERATIONAL NOTES
                </h4>
                <div className="bg-black/50 border border-red-900/30 p-4 text-sm text-red-400/80 leading-relaxed tracking-wide font-mono">
                  {activeProfile.notes}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-red-900/30 bg-black/80 flex gap-4">
            <button className="flex-1 bg-red-950/50 hover:bg-red-900/80 text-red-400 py-3 border border-red-900/50 text-xs font-bold tracking-[0.2em] transition-colors">
              UPDATE DOSSIER
            </button>
            <button className="flex-1 bg-red-600 hover:bg-red-500 text-black font-bold py-3 text-xs tracking-[0.2em] transition-colors shadow-[0_0_10px_rgba(220,38,38,0.4)]">
              FLAG FOR INTERCEPT
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { margin-left: -33%; }
          50% { margin-left: 100%; }
          100% { margin-left: -33%; }
        }
      `}} />
    </div>
  );
}
