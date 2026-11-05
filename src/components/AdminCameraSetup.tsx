import React, { useState } from 'react';
import { Wifi, Cable, Bluetooth, QrCode, Radio, Scan, Settings2 } from 'lucide-react';

const CONNECTION_MODES = [
  { id: 'scan', label: 'Scan code binding', icon: QrCode, desc: 'Bind camera by scanning QR code' },
  { id: 'wifi', label: 'WiFi connection', icon: Wifi, desc: 'Connect through WiFi' },
  { id: 'hotspot_direct', label: 'Hotspot direct connect', icon: Radio, desc: 'Use AP hot spot to live view' },
  { id: 'hotspot_config', label: 'Hotspot config to WiFi', icon: Wifi, desc: 'Use AP hot spot to connect to WiFi' },
  { id: 'cable', label: 'Network cable connect', icon: Cable, desc: 'Connect through network cable' },
  { id: 'bluetooth', label: 'Bluetooth + WiFi', icon: Bluetooth, desc: 'Connect via Bluetooth or WiFi' },
];

export default function AdminCameraSetup() {
  const [selectedMode, setSelectedMode] = useState('scan');
  const [ipAddress, setIpAddress] = useState('192.168.1.115');
  const [onvifUrl, setOnvifUrl] = useState('http://192.168.1.100:8080/onvif');
  const [status, setStatus] = useState('');

  const handleConnect = () => {
    setStatus('Connecting...');
    setTimeout(() => {
      setStatus('Camera connected via ' + CONNECTION_MODES.find(m => m.id === selectedMode)?.label);
    }, 1500);
  };

  return (
    <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 max-w-xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Settings2 className="w-6 h-6 text-blue-400" />
        <h2 className="text-lg font-bold text-white tracking-wide">Admin Camera Setup</h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {CONNECTION_MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => setSelectedMode(mode.id)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
              selectedMode === mode.id
                ? 'bg-blue-600/20 border-blue-500 text-white'
                : 'bg-black/40 border-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            <mode.icon className="w-6 h-6" />
            <span className="text-[10px] font-bold leading-tight text-center">{mode.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Camera IP / Endpoint</label>
          <input
            type="text"
            value={ipAddress}
            onChange={e => setIpAddress(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="192.168.1.115"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">ONVIF Target URL</label>
          <input
            type="text"
            value={onvifUrl}
            onChange={e => setOnvifUrl(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="http://192.168.1.100:8080/onvif"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleConnect}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Scan className="w-4 h-4" /> Connect Camera
        </button>
      </div>

      {status && (
        <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${
          status.includes('Connected') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
        }`}>
          {status}
        </div>
      )}

      <p className="text-[10px] text-gray-500 mt-4">Connection mode: {CONNECTION_MODES.find(m => m.id === selectedMode)?.label}</p>
    </div>
  );
}
