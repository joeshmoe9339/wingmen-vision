import React, { useState, useEffect } from 'react';
import { Users, Folder, FolderOpen, MapPin, Scan, Activity, Crosshair, ChevronRight, User as UserIcon, Camera, X } from 'lucide-react';
import { User } from '../lib/auth';

interface Member {
  id: string;
  timestamp: string;
  camera: string;
  confidence: string;
}

interface Branch {
  location: string;
  members: Member[];
}

interface Syndicate {
  id: string;
  name: string;
  emblem: string;
  branches: Record<string, Branch>;
}

const NAMES = ['IRON SKULLS', 'REAPERS', 'GHOST RIDERS', 'NIGHT CRAWLERS'];
const EMBLEMS = ['Flaming Skull', 'Scythe', 'Phantom', 'Cobra'];
const LOCATIONS = ['NEVADA', 'TEXAS', 'CALIFORNIA', 'ARIZONA', 'NEW YORK'];
const CAMERAS = ['CCTV-01 (Front Gate)', 'CCTV-02 (Driveway)', 'CCTV-04 (Alley)', 'PTZ-North'];

export default function GroupIntelligence({ user }: { user?: User }) {
  const [syndicates, setSyndicates] = useState<Syndicate[]>([]);
  const [liveScan, setLiveScan] = useState<{ name: string; emblem: string; location: string; member: Member } | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<{ syndicateName: string; branch: Branch } | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Simulate AI parsing
  useEffect(() => {
    const triggerScan = () => {
      const nameIdx = Math.floor(Math.random() * NAMES.length);
      const name = NAMES[nameIdx];
      const emblem = EMBLEMS[nameIdx]; // Keep emblem consistent with the name
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const confidence = (Math.random() * 10 + 89).toFixed(1); // 89.0 - 99.0

      const newMember: Member = {
        id: 'SUBJ_' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        timestamp: new Date().toISOString(),
        camera: CAMERAS[Math.floor(Math.random() * CAMERAS.length)],
        confidence
      };

      setLiveScan({ name, emblem, location, member: newMember });

      setSyndicates(prev => {
        const next = [...prev];
        let syn = next.find(s => s.name === name);
        
        if (!syn) {
          syn = { id: name, name, emblem, branches: {} };
          next.push(syn);
        }
        
        if (!syn.branches[location]) {
          syn.branches[location] = { location, members: [] };
        }
        
        // Add member to the beginning of the branch roster
        syn.branches[location].members.unshift(newMember);
        return next;
      });

      // Clear the live scan visual after 2.5 seconds
      setTimeout(() => {
        setLiveScan(null);
      }, 2500);
    };

    // Initial seed
    triggerScan();
    setTimeout(triggerScan, 1000);

    const interval = setInterval(triggerScan, 4500);
    return () => clearInterval(interval);
  }, []);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Group Intelligence & Syndicate Profiling
          </h2>
          <p className="text-sm text-gray-400">Automated apparel parsing and hierarchical roster generation.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
          <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
          <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">AI Parser Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
        
        {/* Left Panel: Automated Filing System */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 border-b border-gray-800 bg-gray-800/50 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-white">Automated Filing System</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {syndicates.length === 0 ? (
              <div className="text-center text-sm text-gray-500 mt-10">Awaiting AI detections...</div>
            ) : (
              syndicates.map(syn => {
                const isExpanded = expandedFolders[syn.id];
                const totalMembers = Object.values(syn.branches).reduce((acc, b) => acc + b.members.length, 0);
                
                return (
                  <div key={syn.id} className="space-y-1">
                    {/* Main Folder */}
                    <button 
                      onClick={() => toggleFolder(syn.id)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-800/50 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        <Folder className={`w-5 h-5 ${isExpanded ? 'text-blue-400' : 'text-gray-500'}`} />
                        <div className="text-left">
                          <div className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                            {syn.name}
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                            Emblem: {syn.emblem}
                          </div>
                        </div>
                      </div>
                      <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full font-mono">
                        {totalMembers}
                      </span>
                    </button>

                    {/* Subfolders (Branches) */}
                    {isExpanded && (
                      <div className="ml-8 space-y-1 border-l border-gray-800 pl-2">
                        {Object.values(syn.branches).map(branch => (
                          <button
                            key={branch.location}
                            onClick={() => setSelectedBranch({ syndicateName: syn.name, branch })}
                            className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                              selectedBranch?.branch.location === branch.location && selectedBranch?.syndicateName === syn.name
                                ? 'bg-blue-500/10 border border-blue-500/20'
                                : 'hover:bg-gray-800/50 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className={`w-4 h-4 ${
                                selectedBranch?.branch.location === branch.location && selectedBranch?.syndicateName === syn.name
                                  ? 'text-blue-400' 
                                  : 'text-gray-500'
                              }`} />
                              <span className={`text-sm font-medium ${
                                selectedBranch?.branch.location === branch.location && selectedBranch?.syndicateName === syn.name
                                  ? 'text-blue-400' 
                                  : 'text-gray-400'
                              }`}>
                                {branch.location}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 font-mono">{branch.members.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Live Parsing or Roster */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl flex flex-col overflow-hidden shadow-xl relative">
          
          {selectedBranch ? (
            /* --- MEMBER ROSTER VIEW --- */
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-800 bg-gray-800/50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    {selectedBranch.syndicateName} - {selectedBranch.branch.location} Roster
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Showing all identified members for this specific branch.
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedBranch(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Close Roster"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="pb-3 font-medium">Subject ID</th>
                      <th className="pb-3 font-medium">Detection Time</th>
                      <th className="pb-3 font-medium">Camera Source</th>
                      <th className="pb-3 font-medium text-right">AI Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {selectedBranch.branch.members.map(member => (
                      <tr key={member.id} className="hover:bg-gray-800/20 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center border border-gray-700">
                              <UserIcon className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="font-mono text-white">{member.id}</span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-400 font-mono text-xs">
                          {new Date(member.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 text-gray-400 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" />
                          {member.camera}
                        </td>
                        <td className="py-3 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-xs">
                            {member.confidence}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* --- LIVE PARSING SIMULATION VIEW --- */
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-800 bg-gray-800/50 flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Scan className="w-5 h-5 text-blue-400" />
                  Live AI Patch Parsing
                </h3>
                <span className="text-xs text-gray-400">Detecting black leather vests...</span>
              </div>

              <div className="flex-1 p-6 flex items-center justify-center relative bg-black overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                {liveScan ? (
                  <div className="relative w-full max-w-md aspect-[3/4] border border-gray-800 bg-gray-900 rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
                    {/* Simulated Camera Feed Background */}
                    <div className="absolute inset-0 opacity-30 grayscale mix-blend-screen bg-gradient-to-b from-gray-800 to-black" />
                    
                    {/* Scanning Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite] z-10" />

                    {/* Bounding Box representing the Vest */}
                    <div className="absolute w-[60%] h-[70%] border-2 border-blue-500 bg-blue-500/10 flex flex-col items-center justify-between py-8 z-20">
                      <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 uppercase flex items-center gap-1">
                        <Crosshair className="w-3 h-3" /> Target Acquired
                      </div>

                      {/* Top Patch */}
                      <div className="w-[80%] bg-black/80 border border-green-500/50 p-2 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-green-500/10 animate-pulse" />
                        <div className="text-[10px] text-green-400 uppercase tracking-wider mb-1">Top Patch (Name)</div>
                        <div className="text-lg font-bold text-white tracking-widest">{liveScan.name}</div>
                      </div>

                      {/* Middle Patch */}
                      <div className="w-[60%] aspect-square bg-black/80 border border-yellow-500/50 p-2 text-center flex flex-col items-center justify-center relative overflow-hidden rounded-full">
                        <div className="absolute inset-0 bg-yellow-500/10 animate-pulse" />
                        <div className="text-[9px] text-yellow-400 uppercase tracking-wider mb-1">Center (Emblem)</div>
                        <div className="text-sm font-bold text-white uppercase text-center leading-tight">{liveScan.emblem}</div>
                      </div>

                      {/* Bottom Patch */}
                      <div className="w-[80%] bg-black/80 border border-purple-500/50 p-2 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-purple-500/10 animate-pulse" />
                        <div className="text-[10px] text-purple-400 uppercase tracking-wider mb-1">Bottom Patch (Location)</div>
                        <div className="text-lg font-bold text-white tracking-widest">{liveScan.location}</div>
                      </div>

                      {/* Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-500" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-500" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500" />
                    </div>

                    {/* Overlay Stats */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] font-mono text-blue-400 bg-black/60 px-3 py-2 rounded border border-gray-800 z-30">
                      <span>ID: {liveScan.member.id}</span>
                      <span>CONF: {liveScan.member.confidence}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-700 animate-[spin_4s_linear_infinite] mx-auto flex items-center justify-center">
                      <Scan className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                      Scanning incoming feeds...
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
