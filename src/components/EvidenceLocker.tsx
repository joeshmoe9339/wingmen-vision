import React, { useEffect, useState } from 'react';
import { Evidence } from '../types';
import { api } from '../lib/live_api';
import { FileVideo, Image as ImageIcon, FileText, Download, FileCheck2, Loader2 } from 'lucide-react';
import { User } from '../lib/auth';

export default function EvidenceLocker({ user }: { user?: User }) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    api.getEvidenceList().then(setEvidence);
  }, []);

  const handleGenerateReport = async (id: string) => {
    setGenerating(id);
    await new Promise(r => setTimeout(r, 1500));
    const res = await api.generateReport(id);
    alert(`REPORT GENERATED SUCCESSFULLY\nURL: ${res.report_url}`);
    setGenerating(null);
  };

  const handleDownload = async (id: string) => {
    const res = await api.getEvidenceDownloadUrl(id);
    alert(`SECURE DOWNLOAD LINK ACQUIRED\n${res.url}\n(EXPIRES: ${res.expires_in}s)`);
  };

  const getIcon = (type: string) => {
    if (type === 'video_clip') return <FileVideo className="w-8 h-8 text-red-500" />;
    if (type === 'snapshot') return <ImageIcon className="w-8 h-8 text-red-600" />;
    return <FileText className="w-8 h-8 text-red-800" />;
  };

  const canDownload = ['admin', 'president', 'saa'].includes(user?.role || '');
  const canGenerateReport = ['admin'].includes(user?.role || '');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-red-900/30 pb-4">
        <div>
          <h2 className="text-xl font-bold text-red-600 tracking-widest">EVIDENCE LOCKER</h2>
          <p className="text-xs text-red-800 tracking-widest mt-1">COURT-ADMISSIBLE EXPORT SYSTEM</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evidence.map(item => (
          <div key={item.id} className="bg-black border border-red-900/50 p-5 flex flex-col relative shadow-[0_0_15px_rgba(220,38,38,0.05)]">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-900/30" />
            
            <div className="flex gap-4 mb-5 pl-2">
              <div className="w-16 h-16 bg-[#050505] flex items-center justify-center border border-red-900/50">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[10px] font-bold tracking-widest text-red-600 mb-1">{item.id}</div>
                <div className="text-xs font-bold text-red-500 tracking-widest uppercase">{item.type.replace('_', ' ')}</div>
                <div className="text-[10px] text-red-800 tracking-widest mt-1">EVT: {item.event_id}</div>
                <div className="text-[9px] text-red-900 tracking-widest mt-1">{new Date(item.timestamp).toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5 text-[10px] bg-[#050505] p-3 border border-red-900/30 pl-2 ml-2">
              <div>
                <span className="text-red-800 block tracking-widest mb-1">SIZE</span>
                <span className="text-red-500 font-bold tracking-widest">{item.metadata.file_size}</span>
              </div>
              <div>
                <span className="text-red-800 block tracking-widest mb-1">QUALITY</span>
                <span className="text-red-500 font-bold tracking-widest">{item.metadata.resolution || 'N/A'}</span>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-red-900/30 pl-2">
              <button 
                onClick={() => handleDownload(item.id)}
                disabled={!canDownload}
                className="flex items-center justify-center gap-2 bg-red-950/30 hover:bg-red-900/50 disabled:opacity-30 disabled:cursor-not-allowed text-red-500 border border-red-900/50 py-3 text-[10px] font-bold tracking-[0.2em] transition-colors"
                title={!canDownload ? "PERMISSION DENIED" : ""}
              >
                <Download className="w-4 h-4" /> DOWNLOAD
              </button>
              <button 
                onClick={() => handleGenerateReport(item.id)}
                disabled={generating === item.id || !canGenerateReport}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-black py-3 text-[10px] font-bold tracking-[0.2em] transition-colors shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                title={!canGenerateReport ? "ADMIN ONLY" : ""}
              >
                {generating === item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileCheck2 className="w-4 h-4" />
                )}
                POLICE REPORT
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}