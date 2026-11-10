import http from 'node:http';
import url from 'node:url';
import { scanNetwork } from './services/network_scanner.ts';
import { ingestEvent } from './services/event_ingestion.ts';
import { detectThreat } from './services/threat_detection.ts';
import { generateReport } from './services/report_generator.ts';
import { getDeviceId } from './services/device_id.ts';

const PORT = Number(process.env.PORT) || 8080;
const BASE = url.pathToFileURL(`${process.cwd()}/`);

// In-memory store (falls back to Supabase for writes when configured).
let cameras = [
  { id: 'cam_01', device_id: 'cam_01', name: 'Front Gate', brand: 'eseecloud', status: 'online', ip_address: '192.168.1.101', stream_url: 'rtsp://192.168.1.101:554/stream1', created_at: new Date().toISOString() },
  { id: 'cam_02', device_id: 'cam_02', name: 'Driveway', brand: 'huntervision', status: 'online', ip_address: '192.168.1.105', stream_url: 'rtsp://192.168.1.105:554/stream1', created_at: new Date().toISOString() },
  { id: 'cam_03', device_id: 'cam_03', name: 'Backyard', brand: 'ajcloud', status: 'online', ip_address: '192.168.1.110', stream_url: 'rtsp://192.168.1.110:554/stream1', created_at: new Date().toISOString() },
  { id: 'cam_04', device_id: 'cam_04', name: 'Garage', brand: 'onvif', status: 'offline', ip_address: '192.168.1.112', stream_url: 'rtsp://192.168.1.112:554/stream1', created_at: new Date().toISOString() },
];
let events: any[] = [];
let evidence: any[] = [];
let threats: any[] = [];

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const parsed = url.parse(req.url || '/', true);
  const path = parsed.pathname;
  const method = req.method || 'GET';
  const isApi = path.startsWith('/api/');

  // Set CORS headers so the Vite dev server can call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (method === 'OPTIONS') { res.writeHead(204).end(); return; }

  try {
    // --- Health / status ---
    if (path === '/api/status' && method === 'GET') {
      const { scanNetwork } = await import('./services/network_scanner.ts');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString(), cameras: cameras.length, events: events.length, threats: threats.length, network: await scanNetwork() }));
      return;
    }

    // --- CAMERAS ---
    if (path === '/api/cameras' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: cameras, count: cameras.length }));
      return;
    }
    if (path === '/api/cameras' && method === 'POST') {
      const body = await readBody(req);
      const cam = { id: `cam_${Date.now()}`, device_id: body.device_id || `cam_${Date.now()}`, name: body.name, brand: body.brand || 'onvif', status: 'online', ip_address: body.ip_address || '', stream_url: body.stream_url || '', created_at: new Date().toISOString() };
      cameras.push(cam);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(cam));
      return;
    }

    // --- EVENTS ---
    if (path === '/api/events' && method === 'GET') {
      const q = parsed.query;
      let list = [...events].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      if (q.device_id) list = list.filter(e => e.device_id === q.device_id);
      if (q.severity) list = list.filter(e => e.severity === q.severity);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: list, count: list.length }));
      return;
    }
    if (path === '/api/events' && method === 'POST') {
      const body = await readBody(req);
      const evt = { id: `evt_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, device_id: body.device_id, type: body.type, severity: body.severity, timestamp: body.timestamp || new Date().toISOString(), ai_labels: body.ai_labels || [], evidence_ids: body.evidence_ids || [] };
      events.unshift(evt);
      // Also push to Supabase if a service key is configured
      try {
        const { supabase } = await import('../lib/supabase_client.ts');
        if (supabase) {
          const { error } = await supabase.from('security_events').insert([ evt ]);
          if (error) console.error('[API] Supabase insert error:', error.message);
        }
      } catch (e) { console.error('[API] Supabase not configured:', e.message); }
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(evt));
      return;
    }

    // --- EVIDENCE ---
    if (path === '/api/evidence' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: evidence, count: evidence.length }));
      return;
    }
    if (path === '/api/evidence' && method === 'POST') {
      const body = await readBody(req);
      const ev = { id: `evid_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, event_id: body.event_id, timestamp: body.timestamp || new Date().toISOString(), type: body.type || 'video_clip', metadata: body.metadata || {}, status: 'ready' };
      evidence.unshift(ev);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(ev));
      return;
    }
    const evidenceMatch = path.match(/^\/api\/evidence\/([^/]+)\/download-url$/);
    if (evidenceMatch && method === 'GET') {
      const id = evidenceMatch[1];
      const ev = evidence.find(e => e.id === id);
      if (!ev) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Not found' })); return; }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: `https://vault.wingmen.example/api/download/${id}`, expires_in: 3600 }));
      return;
    }
    const reportMatch = path.match(/^\/api\/evidence\/([^/]+)\/generate-report$/);
    if (reportMatch && method === 'POST') {
      const id = reportMatch[1];
      const ev = evidence.find(e => e.id === id);
      if (!ev) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Not found' })); return; }
      const report = await generateReport(id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(report));
      return;
    }

    // --- THREATS ---
    if (path === '/api/threats' && method === 'GET') {
      const q = parsed.query;
      let list = [...threats].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      if (q.device_id) list = list.filter(t => t.device_id === q.device_id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: list, count: list.length }));
      return;
    }
    if (path === '/api/threats' && method === 'POST') {
      const body = await readBody(req);
      const threat = { id: `thr_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, device_id: body.device_id, type: body.type, details: body.details, signal_info: body.signal_info || {}, timestamp: body.timestamp || new Date().toISOString() };
      threats.unshift(threat);
      // Push to Supabase
      try {
        const { supabase } = await import('../lib/supabase_client.ts');
        if (supabase) {
          const { error } = await supabase.from('threats').insert([ threat ]);
          if (error) console.error('[API] Supabase insert error:', error.message);
        }
      } catch (e) { console.error('[API] Supabase not configured:', e.message); }
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(threat));
      return;
    }

    // --- OSINT Shield (browser-use, superpowers, langchain, langgraph) ---
    if (path === '/api/osint/scan' && method === 'POST') {
      const body = await readBody(req);
      const { osintShield } = await import('./services/osint_shield.ts');
      try {
        const result = await osintShield.browserUseScrape(body.target, body.depth || 'shallow');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message || 'OSINT scan failed' }));
        return;
      }
    }
    if (path === '/api/osint/prompt' && method === 'POST') {
      const body = await readBody(req);
      const { osintShield } = await import('./services/osint_shield.ts');
      const result = await osintShield.superpowersPrompt(body.category, body.query);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }
    if (path === '/api/osint/research' && method === 'POST') {
      const body = await readBody(req);
      const { osintShield } = await import('./services/osint_shield.ts');
      try {
        const result = await osintShield.langchainResearch(body.query, body.sources || []);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message || 'OSINT research failed' }));
        return;
      }
    }
    if (path === '/api/osint/flow' && method === 'POST') {
      const body = await readBody(req);
      const { osintShield } = await import('./services/osint_shield.ts');
      try {
        const result = await osintShield.langgraphFlow(body.name, body.context || {});
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message || 'LangGraph flow failed' }));
        return;
      }
    }

    // --- Wireless Threats (nuclei, mitmproxy) ---
    if (path === '/api/wireless/scan' && method === 'POST') {
      const body = await readBody(req);
      const { wirelessThreats } = await import('./services/wireless_threats.ts');
      try {
        const result = await wirelessThreats.runNucleiScan(body.target, body.template || 'default');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message || 'Nuclei scan failed' }));
        return;
      }
    }
    if (path === '/api/wireless/mitmproxy' && method === 'POST') {
      const body = await readBody(req);
      const { wirelessThreats } = await import('./services/wireless_threats.ts');
      try {
        const result = await wirelessThreats.startMitmproxy(body.interface || 'wlan0mon', body.filter || 'deauth');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message || 'Mitmproxy start failed' }));
        return;
      }
    }
    if (path === '/api/wireless/hashcat' && method === 'POST') {
      const body = await readBody(req);
      const { wirelessThreats } = await import('./services/wireless_threats.ts');
      try {
        const result = await wirelessThreats.runHashcat(body.hashtype || 'sha256', body.attempt || '');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message || 'Hashcat failed' }));
        return;
      }
    }

    // --- Evidence & Reports (ragflow, trufflehog) ---
    if (path === '/api/evidence/report' && method === 'POST') {
      const body = await readBody(req);
      const { evidenceReport } = await import('./services/evidence_report.ts');
      try {
        const result = await evidenceReport.generateReport(body.event_id, body.evidence || []);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message || 'Report generation failed' }));
        return;
      }
    }
    if (path === '/api/evidence/knowledge' && method === 'POST') {
      const body = await readBody(req);
      const { evidenceReport } = await import('./services/evidence_report.ts');
      try {
        const result = await evidenceReport.queryKnowledgeBase(body.query, body.event_type || 'unknown');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message || 'Knowledge base query failed' }));
        return;
      }
    }
    if (path === '/api/evidence/scan-leaks' && method === 'POST') {
      const body = await readBody(req);
      const { evidenceReport } = await import('./services/evidence_report.ts');
      try {
        const result = await evidenceReport.scanForLeaks(body.files, body.repo_paths || []);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message || 'Leak scan failed' }));
        return;
      }
    }

    // --- Access Control (hashcat, gophish) ---
    if (path === '/api/access/hashcat-audit' && method === 'POST') {
      const body = await readBody(req);
      const { accessControl } = await import('./services/access_control.ts');
      try {
        const result = await accessControl.runHashcatAudit(body.hash_file, body.wordlist, body.hash_type || 'sha256');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Hashcat audit failed' }));
        return;
      }
    }
    if (path === '/api/access/phishing-campaign' && method === 'POST') {
      const body = await readBody(req);
      const { accessControl } = await import('./services/access_control.ts');
      try {
        const result = await accessControl.createPhishingCampaign(body.target_list || '', body.template_id || 'default-security', body.smtp || 'smtp.yourdomain.com', body.sender || 'no-reply@yourdomain.com');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message || 'Phishing campaign failed' }));
        return;
      }
    }
    if (path === '/api/access/phishing-sim' && method === 'POST') {
      const body = await readBody(req);
      const { accessControl } = await import('./services/access_control.ts');
      try {
        const result = await accessControl.runPhishingSimulation(body.scenario || 'credential-harvesting', body.domain || 'example.com');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message || 'Phishing simulation failed' }));
        return;
      }
    }
    if (path === '/api/access/analyze-hash' && method === 'POST') {
      const body = await readBody(req);
      const { accessControl } = await import('./services/access_control.ts');
      try {
        const result = await accessControl.analyzeHash(body.hash);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message || 'Hash analysis failed' }));
        return;
      }
    }

    // --- Group Intelligence (crewAI, paperclip) ---
    if (path === '/api/group-intel/analysis' && method === 'POST') {
      const body = await readBody(req);
      const { groupIntelligence } = await import('./services/group_intelligence.ts');
      // Convert buffer to base64 for JSON serialization
      const frame = Buffer.isBuffer(body.frame) ? body.frame.toString('base64') : (typeof body.frame === 'string' ? body.frame : '');
      try {
        const result = await groupIntelligence.crewAIThreatAnalysis(body.camera_id, frame, body.context || {});
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Group intelligence analysis failed' }));
        return;
      }
    }
    if (path === '/api/group-intel/roster' && method === 'POST') {
      const body = await readBody(req);
      const { groupIntelligence } = await import('./services/group_intelligence.ts');
      try {
        const result = await groupIntelligence.generateRoster(body.syndicate, body.image_urls || []);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message || 'Roster generation failed' }));
        return;
      }
    }
    if (path === '/api/group-intel/benchmark' && method === 'POST') {
      const body = await readBody(req);
      const { groupIntelligence } = await import('./services/group_intelligence.ts');
      try {
        const result = await groupIntelligence.paperclipBenchmark(body.queries, body.tools || []);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message || 'Paperclip benchmark failed' }));
        return;
      }
    }

    // --- ONVIF / RTSPS ---
    if (path === '/api/onvif/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    // Not found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (err: any) {
    console.error('[API] Server error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message || 'Internal error' }));
  }
});

function readBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
  });
}

server.listen(PORT, () => {
  console.log(`[API] Wingmen Vision backend listening on http://0.0.0.0:${PORT}`);
  // Seed the network scanner on startup so cameras show up immediately
  scanNetwork().then(found => { if (found.length) console.log(`[API] Pre-seeded ${found.length} cameras from network scan.`); });
});
