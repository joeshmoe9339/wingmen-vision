import React, { useEffect, useState } from 'react';
import { authApi, DeviceRequest } from '../lib/auth';
import { ShieldCheck, KeyRound, MonitorSmartphone, Trash2, RefreshCw, Users } from 'lucide-react';

export default function AccessControl() {
  const [requests, setRequests] = useState<DeviceRequest[]>([]);
  const [devices, setDevices] = useState<any[]>([]);

  const loadData = () => {
    setRequests(authApi.getPendingRequests());
    setDevices(authApi.getApprovedDevices());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateCode = (id: string) => {
    authApi.generateCodeForRequest(id);
    loadData();
  };

  const handleRevoke = (username: string, deviceId: string) => {
    if (confirm('REVOKE TERMINAL ACCESS?')) {
      authApi.revokeDevice(username, deviceId);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-red-900/30 pb-4">
        <div>
          <h2 className="text-xl font-bold text-red-600 tracking-[0.2em] flex items-center gap-3">
            <Users className="w-6 h-6" />
            ACCESS CONTROL
          </h2>
          <p className="text-xs text-red-800 tracking-widest mt-1">2FA CIPHER MANAGEMENT & DEVICE OVERRIDE</p>
        </div>
        <button onClick={loadData} className="p-2 border border-red-900/50 hover:bg-red-950/50 text-red-600 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <div className="bg-black border border-red-900/50 flex flex-col relative">
          <div className="p-3 border-b border-red-900/50 bg-red-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-red-500" />
              <h3 className="font-bold text-red-500 tracking-widest text-sm">PENDING UPLINKS</h3>
            </div>
            <span className="bg-red-600 text-black py-0.5 px-2 text-[10px] font-bold tracking-widest">
              {requests.length} REQ
            </span>
          </div>
          <div className="divide-y divide-red-900/30 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
            {requests.length === 0 ? (
              <div className="p-6 text-center text-red-900 text-xs tracking-widest">NO PENDING REQUESTS</div>
            ) : (
              requests.map(req => (
                <div key={req.id} className="p-4 hover:bg-red-950/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-red-500 uppercase tracking-widest text-sm">{req.username}</div>
                    <div className="text-[9px] text-red-800 tracking-widest">{new Date(req.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="text-[10px] text-red-700 font-mono mb-4">TERM_ID: {req.deviceId}</div>
                  
                  {req.status === 'pending' ? (
                    <button 
                      onClick={() => handleGenerateCode(req.id)}
                      className="w-full bg-red-950/50 hover:bg-red-900 border border-red-600 text-red-500 py-2 text-xs font-bold tracking-[0.2em] transition-colors"
                    >
                      GENERATE CIPHER
                    </button>
                  ) : (
                    <div className="text-center bg-black border border-red-600 py-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-red-600/5" />
                      <div className="text-[9px] text-red-500 uppercase tracking-[0.2em] mb-1">TRANSMIT CIPHER TO USER:</div>
                      <div className="font-mono text-2xl text-red-500 tracking-[0.3em] font-bold relative z-10">
                        {req.code}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Devices */}
        <div className="bg-black border border-red-900/50 flex flex-col relative">
          <div className="p-3 border-b border-red-900/50 bg-red-950/20 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-red-500 tracking-widest text-sm">AUTHORIZED TERMINALS</h3>
          </div>
          <div className="divide-y divide-red-900/30 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
            {devices.length === 0 ? (
              <div className="p-6 text-center text-red-900 text-xs tracking-widest">NO AUTHORIZED TERMINALS</div>
            ) : (
              devices.map((dev, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-red-950/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-950/30 border border-red-900/50 flex items-center justify-center">
                      <MonitorSmartphone className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-bold text-red-500 uppercase tracking-widest text-sm">{dev.username}</div>
                      <div className="text-[10px] text-red-700 font-mono mt-1">TERM_ID: {dev.deviceId}</div>
                      <div className="text-[9px] text-red-900 mt-0.5 tracking-widest">AUTH: {new Date(dev.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRevoke(dev.username, dev.deviceId)}
                    className="p-2 border border-transparent hover:border-red-600 hover:bg-red-950/50 text-red-800 hover:text-red-500 transition-colors"
                    title="SEVER CONNECTION"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
