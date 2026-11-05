import React, { useState } from 'react';
import { Users, UserCheck, ShieldAlert, UserX, Search, Filter } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  group: 'employee' | 'vip' | 'watchlist' | 'unknown';
  lastSeen: string;
  appearances: number;
  imageUrl: string;
}

const MOCK_PROFILES: Profile[] = [
  { id: 'p1', name: 'John Doe', group: 'employee', lastSeen: '10 mins ago (Front Gate)', appearances: 142, imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces' },
  { id: 'p2', name: 'Jane Smith', group: 'vip', lastSeen: '2 hours ago (Lobby)', appearances: 12, imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces' },
  { id: 'p3', name: 'Unknown Subject #892', group: 'unknown', lastSeen: 'Just now (Driveway)', appearances: 1, imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces' },
  { id: 'p4', name: 'REDACTED - Watchlist Match', group: 'watchlist', lastSeen: 'Yesterday (Backyard)', appearances: 3, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces' },
  { id: 'p5', name: 'Michael Chen', group: 'employee', lastSeen: '5 mins ago (Garage)', appearances: 89, imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces' },
];

const GROUP_CONFIG = {
  employee: { label: 'Employees', icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  vip: { label: 'VIPs', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  watchlist: { label: 'Watchlist', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  unknown: { label: 'Unknown', icon: UserX, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
};

export default function ProfileManager() {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredProfiles = MOCK_PROFILES.filter(p => {
    if (filter !== 'all' && p.group !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Profile & Group Management</h2>
          <p className="text-sm text-gray-400">Facial recognition clustering and identity management.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search profiles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Add Profile
          </button>
        </div>
      </div>

      {/* Group Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
        >
          All Profiles
        </button>
        {Object.entries(GROUP_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button 
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${filter === key ? config.bg + ' ' + config.color : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProfiles.map(profile => {
          const config = GROUP_CONFIG[profile.group];
          const Icon = config.icon;
          
          return (
            <div key={profile.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col group hover:border-gray-700 transition-colors">
              <div className="p-4 flex items-start gap-4">
                <div className="relative">
                  <img src={profile.imageUrl} alt={profile.name} className="w-16 h-16 rounded-xl object-cover border border-gray-800" />
                  <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-900 ${config.bg}`}>
                    <Icon className={`w-3 h-3 ${config.color}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold truncate">{profile.name}</h3>
                  <span className={`inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-800/30 border-t border-gray-800 mt-auto grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-gray-500 mb-0.5">Last Seen</div>
                  <div className="text-gray-300 truncate" title={profile.lastSeen}>{profile.lastSeen}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-0.5">Appearances</div>
                  <div className="text-gray-300 font-mono">{profile.appearances}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
