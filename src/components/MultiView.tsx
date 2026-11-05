import React, { useEffect, useState } from 'react';
import { Camera } from '../types';
import { api } from '../lib/live_api';
import { Maximize2, WifiOff } from 'lucide-react';

export default function MultiView() {
  const [cameras, setCameras] = useState<Camera[]>([]);

  useEffect(() => {
    api.getCameras().then(setCameras);
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] w-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white">Multi-View Grid</h2>
          <p className="text-sm text-gray-400">Zero-latency raw streams for stationary monitoring.</p>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 bg-black p-2 rounded-xl border border-gray-800">
        {cameras.map(cam => (
          <div key={cam.id} className="relative bg-gray-900 border border-gray-800 rounded-lg overflow-hidden group">
            {cam.status === 'online' ? (
              <>
                <video 
                  src={cam.stream_url} 
                  autoPlay loop muted playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white">
                  {cam.name}
                </div>
                <button className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                <WifiOff className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">OFFLINE</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
