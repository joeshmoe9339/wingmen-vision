import React, { useState } from 'react';
import { LayoutDashboard, Camera, ShieldAlert, FileSearch, Settings, Server, Terminal, Menu, X, Users, LogOut, Database, Lock, TerminalSquare, Wifi } from 'lucide-react';
import CameraGrid from './components/CameraGrid';
import EventsList from './components/EventsList';
import EvidenceLocker from './components/EvidenceLocker';
import ThreatMonitor from './components/ThreatMonitor';
import DeploymentGuide from './components/DeploymentGuide';
import Login from './components/Login';
import AccessControl from './components/AccessControl';
import OsintShield from './components/OsintShield';
import ProfileManager from './components/ProfileManager';
import ImprovementTerminal from './components/ImprovementTerminal';
import FrankTheTank from './components/FrankTheTank';
import AdminCameraSetup from './components/AdminCameraSetup';
import GroupIntelligence from './components/GroupIntelligence';
import { User } from './lib/auth';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'cameras' | 'osint' | 'events' | 'evidence' | 'threats' | 'profiles' | 'syndicate' | 'deployment' | 'access' | 'terminal' | 'camera_setup'>('cameras');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If not logged in, show login screen
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const tabs = [
    { id: 'cameras', label: 'Unified Cameras', icon: Camera, roles: ['admin', 'president', 'vp', 'saa', 'monitoring'] },
    { id: 'osint', label: 'OSINT Shield', icon: Database, roles: ['admin', 'president', 'vp', 'saa', 'monitoring'] },
    { id: 'events', label: 'Events API', icon: LayoutDashboard, roles: ['admin', 'president', 'vp', 'saa', 'monitoring'] },
    { id: 'evidence', label: 'Evidence & Reports', icon: FileSearch, roles: ['admin', 'president', 'vp', 'saa', 'monitoring'] },
    { id: 'threats', label: 'Wireless Threats', icon: ShieldAlert, roles: ['admin', 'president', 'vp', 'saa', 'monitoring'] },
    { id: 'syndicate', label: 'Group Intelligence', icon: Users, roles: ['admin', 'president', 'vp', 'saa', 'monitoring'] },
    { id: 'profiles', label: 'Profiles & Groups', icon: Users, roles: ['admin', 'president', 'vp', 'saa', 'monitoring'] },
    { id: 'access', label: 'Access Control', icon: Lock, roles: ['admin'] },
    { id: 'terminal', label: 'Improvement Terminal', icon: TerminalSquare, roles: ['admin'] },
    { id: 'deployment', label: 'Deployment Guide', icon: Terminal, roles: ['admin'] },
    { id: 'camera_setup', label: 'Camera Config', icon: Wifi, roles: ['admin'] },
  ] as const;

  const visibleTabs = tabs.filter(t => t.roles.includes(user.role as any));

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 flex font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#111] border-r border-gray-800 flex flex-col z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-800 flex items-start justify-between">
          <div>
            <div className="flex flex-col items-start gap-2 mb-2">
              <img 
                src="/uploads/Wingmen_Vision.png" 
                alt="Wingmen Vision Logo" 
                className="w-36 h-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" 
              />
            </div>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-white p-1"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 shrink-0">
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">{user.name}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">{user.role}</div>
              </div>
              <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-gray-500 transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              <Server className="w-3.5 h-3.5" /> System Status
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">API Gateway</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">ONVIF Bridge</span>
                <span className="text-green-400">Active</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top Header */}
        <header className="h-16 bg-[#111] border-b border-gray-800 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-gray-400 hover:text-white p-2 -ml-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-white">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.open('#settings', '_self') || alert('Settings endpoint not configured.')}
              className="text-gray-400 hover:text-white transition-colors"
              title="System Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border-2 border-gray-800" />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar relative">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'cameras' && <CameraGrid user={user} />}
            {activeTab === 'osint' && <OsintShield />}
            {activeTab === 'events' && <EventsList user={user} />}
            {activeTab === 'evidence' && <EvidenceLocker user={user} />}
            {activeTab === 'threats' && <ThreatMonitor user={user} />}
            {activeTab === 'syndicate' && <GroupIntelligence user={user} />}
            {activeTab === 'profiles' && <ProfileManager />}
            {activeTab === 'access' && <AccessControl />}
            {activeTab === 'terminal' && <ImprovementTerminal />}
            {activeTab === 'deployment' && <DeploymentGuide />}
            {activeTab === 'camera_setup' && <AdminCameraSetup />}
          </div>
        </div>
      </main>

      {/* Frank The Tank Global AI Widget */}
      <FrankTheTank />

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}} />
    </div>
  );
}

export default App;
