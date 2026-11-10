# Wingmen Vision — Security & OSINT Layer

Integrates 26 security/OSINT/AI tooling repositories as `modules/` submodules for the Wingmen Vision surveillance and threat-intelligence dashboard.

## Modules

### 🛡️ Security & Threat Detection
| Module | Source | Purpose |
|---|---|---|
| `nuclei` | projectdiscovery/nuclei | Network/vulnerability scanning (Wireless Threats module) |
| `nuclei-templates` | projectdiscovery/nuclei-templates | Nessus-style exploit templates |
| `trufflehog` | trufflesecurity/trufflehog | Secret/leak detection |
| `mitmproxy` | mitmproxy/mitmproxy | Packet interception for threat analysis |
| `gophish` | gophish/gophish | Phishing platform (security awareness) |
| `evilgophish` | fin3ss3g0d/evilgophish | Advanced phishing simulations |
| `hashcat` | hashcat/hashcat | Password cracking |
| `hashcat-utils` | hashcat/hashcat-utils | Hashcat utility tools |
| `hashcat-legacy` | hashcat/hashcat-legacy | Legacy password hash support |
| `openscreen` | getopenscreen/openscreen | Remote screen sharing for ops |
| `playwright` | microsoft/playwright | E2E browser testing for the dashboard |

### 📡 RF Sensing & Field Intelligence
| Module | Source | Purpose |
|---|---|---|
| `rvcsi` | ruvnet/rvcsi | WiFi CSI sensing runtime — presence/motion/quality events |
| `rufield` | ruvnet/rufield | Camera-free field sensing (WiFi CSI, radar, ultrasound, IR) |

### 🧪 AI & Intelligence
| Module | Source | Purpose |
|---|---|---|
| `ragflow` | infiniflow/ragflow | RAG for threat-intel knowledge base / auto-report |
| `aider` | Aider-AI/aider | AI pair-programming for dashboard dev |
| `crewAI` | crewAIInc/crewAI | Multi-agent threat-analysis teams |
| `langchain` | langchain-ai/langchain | LLM workflow orchestration |
| `langgraph` | langchain-ai/langgraph | LangGraph state-machine agent flows |
| `superpowers` | obra/superpowers | Prompt library for AI components |
| `paperclip` | paperclipai/paperclip | LLM tool-use benchmark for AI agents |
| `browser-use` | browser-use/browser-use | Browser automation for OSINT scraping |

## How to use

Each module is a **symlink** to the top-level `/home/bgdaddy/<name>` directory. All repos are already cloned and functional.

```bash
# Verify all modules are linked
ls -la /home/bgdaddy/wingmenvision/modules/

# Run a security scan (example)
/home/bgdaddy/wingmenvision/modules/nuclei/nuclei -u https://target.test

# Generate a threat report
/home/bgdaddy/wingmenvision/modules/ragflow/ragflow --mode report --input events.json
```

## Integration points

- **Wireless Threats** → `nuclei`, `mitmproxy`, `hashcat`
- **Evidence & Reports** → `ragflow`, `trufflehog`
- **OSINT Shield** → `browser-use`, `superpowers`, `langchain`, `langgraph`
- **Access Control** → `hashcat`, `gophish`
- **Evidence Locker** → `openscreen`, `aider`
- **Group Intelligence** → `crewAI`, `paperclip`
- **Camera Config / Deployment** → `playwright` (automation), `agent-desktop` (not in this set)

## Notes

- All modules are symbolic links — updating the top-level repo updates the module.
- If you want true git submodules instead of symlinks, run `git submodule add <repo> modules/<name>` from the Wingmen Vision repo root.
- This integration is a **reference layer** — no code in Wingmen Vision currently imports these modules directly.
