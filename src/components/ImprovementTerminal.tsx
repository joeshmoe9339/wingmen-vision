import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, ChevronRight } from 'lucide-react';

export default function ImprovementTerminal() {
  const [history, setHistory] = useState<{ command: string; output: React.ReactNode }[]>([
    {
      command: 'systemctl status frank-the-tank',
      output: (
        <div className="text-blue-400">
          ● frank-the-tank.service - Hermes-Class Autonomous Learning Agent<br/>
          &nbsp;&nbsp;Loaded: loaded (/etc/systemd/system/frank-the-tank.service)<br/>
          &nbsp;&nbsp;Active: active (running) since {new Date().toLocaleDateString()}<br/>
          &nbsp;&nbsp;Memory: 4.2G<br/>
          &nbsp;&nbsp;CGroup: /system.slice/frank-the-tank.service
        </div>
      )
    }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    let output: React.ReactNode = '';

    if (cmd === 'help') {
      output = (
        <div className="space-y-1">
          <div><span className="text-yellow-400">train [skill]</span> - Queues a new skill for Frank the Tank to learn</div>
          <div><span className="text-yellow-400">deploy [feature]</span> - Stages a new dashboard feature</div>
          <div><span className="text-yellow-400">status</span> - Checks the active learning rate and memory usage</div>
          <div><span className="text-yellow-400">supervision</span> - Check Roboflow Supervision integration status</div>
          <div><span className="text-yellow-400">clear</span> - Clears the terminal</div>
        </div>
      );
    } else if (cmd.startsWith('train ')) {
      const skill = cmd.split(' ')[1];
      output = <span className="text-green-400">Initializing neural network weights for skill: '{skill}'... Training queued. ETA: 4 hours.</span>;
    } else if (cmd.startsWith('deploy ')) {
      const feature = cmd.split(' ')[1];
      output = <span className="text-blue-400">Staging feature '{feature}' to staging environment. Running integration tests...</span>;
    } else if (cmd === 'status') {
      output = (
        <div className="text-gray-300">
          Learning Rate: <span className="text-green-400">0.0014</span><br/>
          Epochs Completed: <span className="text-green-400">14,203</span><br/>
          GPU Utilization: <span className="text-yellow-400">84%</span><br/>
          Memory Usage: <span className="text-yellow-400">14.2 GB / 16.0 GB</span>
        </div>
      );
    } else if (cmd === 'supervision') {
      output = (
        <div className="text-purple-400">
          Roboflow Supervision Core: ONLINE<br/>
          Version: 0.18.0<br/>
          ByteTrack: Enabled<br/>
          Active Models: YOLOv8 (Weapons), CLIP (Faces)<br/>
          Note: Supervision is actively parsing RTSP frames into the /events pipeline.
        </div>
      );
    } else if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else {
      output = <span className="text-red-400">Command not found: {cmd}. Type 'help' for available commands.</span>;
    }

    setHistory(prev => [...prev, { command: input, output }]);
    setInput('');
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TerminalIcon className="w-6 h-6 text-blue-500" />
            Improvement Terminal
          </h2>
          <p className="text-sm text-gray-400">Admin command-line interface for system upgrades and AI training.</p>
        </div>
      </div>

      <div className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden flex flex-col font-mono text-sm shadow-inner shadow-black/50">
        <div className="bg-gray-900 border-b border-gray-800 p-2 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
          {history.map((entry, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-green-500">admin@omnisight</span>:<span className="text-blue-400">~</span>$ 
                <span className="text-white">{entry.command}</span>
              </div>
              <div className="pl-2">
                {entry.output}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleCommand} className="p-4 border-t border-gray-800 bg-gray-900/50 flex items-center gap-2">
          <span className="text-green-500">admin@omnisight</span>:<span className="text-blue-400">~</span>$ 
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white font-mono focus:ring-0 p-0"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
}
