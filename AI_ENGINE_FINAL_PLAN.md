# Qhord AI Engine — Complete Implementation Plan

## Sources
- **PDF**: Qhord AI Engine Technical Implementation Plan v1.0
- **CEO Request**: Persistent memory, HITL, learning capabilities (Yashwant Daniel)

---

## Phase 1 — Foundation (Week 1)
**Goal**: Claude works live, can enrich leads, tools are registered.

### Already Built ✅
- Anthropic SDK integration (`mcp-host.service.ts`)
- Claude enrichment node (`claude-enrichment.node.ts`)
- Tool definitions — 18 tools (`mcp-tool-definitions.ts`)
- Tool translator — maps MCP tool names to services (`mcp-tool-translator.ts`)
- Brand Brain — per-client brand knowledge (`BrandBrain` model + routes)
- custom_variables on Lead model
- MCP chat + execute routes

### Need to Build ❌
| Item | Description |
|------|-------------|
| Provider abstraction | Interface to swap Claude/GPT/Gemini without changing workflow engine |
| AIProviderConfig model | Store API keys, model selection, rate limits per provider |
| AI credit wallet | Track token usage and costs per client/workspace |
| Prompt templates library | Reusable prompt templates stored in DB |

---

## Phase 2 — Workflow Intelligence (Week 2)
**Goal**: AI node works in campaign workflows with HITL gates.

### Already Built ✅
- Claude enrichment node wired into campaign-workflow.engine.ts
- Prompt compilation with lead variables
- custom_variables write-back
- Campaign approval model (`CampaignApproval`)
- Approval routes (submit/review/pending/history)

### Need to Build ❌
| Item | Description |
|------|-------------|
| HITL approval gates | Pause workflow before AI actions, notify operator for approval |
| Approval node type | New node type in campaign-workflow.engine.ts |
| Configurable autonomy | Per-client setting: which actions need approval vs auto-execute |
| AI execution logs | Track every AI call — input, output, tokens, latency, cost |
| WorkspaceAISettings | Per-workspace AI config (model, tone, max tokens, cost limits) |

---

## Phase 3 — Conversational Builder (Week 3)
**Goal**: Users describe objectives in natural language, AI builds workflows.

### Already Built ✅
- Campaign builder with block library
- Dynamic tool routing (mcp-tool-translator.ts)
- Smart tool matcher (regex-based)

### Need to Build ❌
| Item | Description |
|------|-------------|
| Natural language interface | Chat input that interprets user intent |
| Workflow generation | AI generates workflow nodes + edges from NL prompt |
| Visual workflow preview | Show generated workflow before approval |
| NL-driven tool selection | Claude picks tools based on connected integrations |
| Context management | Inject workspace brand, tone, ICP into every AI call |

---

## Phase 4 — Production Readiness (Week 4)
**Goal**: Enterprise-grade reliability, security, monitoring.

### Need to Build ❌
| Item | Description |
|------|-------------|
| Audit logging | Track all AI operations for compliance |
| Monitoring dashboards | Real-time AI health, latency, error rates |
| Rate limiting | Per-workspace API rate limits |
| Error recovery | Retry logic, fallback providers, graceful degradation |
| Security validation | Input sanitization, output validation, injection prevention |
| Performance optimization | Caching, batching, async processing |
| End-to-end testing | Full pipeline tests with mock + live modes |

---

## Phase 5 — Memory & Learning (CEO Request)
**Goal**: AI behaves as a persistent copilot, not instant-response.

### Persistent Memory ❌
| Item | Description |
|------|-------------|
| ConversationMemory model | Store chat history with Claude across sessions |
| Session context | Current session state, active leads, in-progress workflows |
| Memory retrieval | Fetch relevant past context for current request |
| Memory consolidation | Periodically summarize/compress old memories |
| Workspace isolation | Each workspace's memory is fully isolated |

### Learning System ❌
| Item | Description |
|------|-------------|
| Feedback model | Store operator feedback on AI outputs (approve/reject/edit) |
| Pattern analysis | Analyze which AI outputs get approved vs rejected |
| Prompt refinement | Improve prompts based on approval rates |
| Tool recommendation | Learn which tools work best for each client/industry |
| Performance scoring | Track campaign outcomes tied to AI-generated content |
| Workspace preferences | Learn writing style, tone, approach per workspace |

### Autonomous Execution (Future) ❌
| Item | Description |
|------|-------------|
| Configurable autonomy levels | Per-action: auto / approval-required / manual |
| Confidence-based routing | Low confidence → human review, high confidence → auto-execute |
| Auto-optimization | AI adjusts send times, subject lines, sequences based on performance |
| Predictive lead scoring | ML-based scoring using historical data |

---

## Database Schema Changes Required

### New Models
```
AIProviderConfig       — API keys, models, rate limits per provider
WorkspaceAISettings    — per-workspace AI config
AIExecutionLogs        — every AI call logged
PromptTemplates        — reusable prompt library
AIContextStore          — workspace context for Claude
ConversationMemory     — persistent chat history
AgentMemory            — learned preferences per workspace
FeedbackLog            — operator feedback on AI outputs
```

### Modified Models
```
Lead                   — + custom_variables (already done)
Client                 — + approval_mode, autonomy_level
Workflow               — + execution_mode (already done)
```

---

## Timeline Summary

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| Phase 1 — Foundation | Week 1 | Provider abstraction, credit wallet, prompt templates |
| Phase 2 — Workflow Intelligence | Week 2 | HITL gates, execution logs, workspace AI settings |
| Phase 3 — Conversational Builder | Week 3 | NL interface, workflow generation, context management |
| Phase 4 — Production Readiness | Week 4 | Audit, monitoring, security, testing |
| Phase 5 — Memory & Learning | Week 5 | Persistent memory, feedback loops, learning system |
| Phase 6 — Optimization (Future) | Ongoing | A/B testing, auto-optimization, predictive scoring |

---

## What's Built vs What's Needed

| Category | Built | Remaining |
|----------|-------|-----------|
| Core AI (Claude integration) | 80% | Provider abstraction, credit tracking |
| Workflow Engine | 70% | HITL gates, approval node type |
| Conversational Builder | 30% | NL interface, workflow generation |
| Production Readiness | 10% | Audit, monitoring, security, testing |
| Memory & Learning | 0% | Everything |
| **Overall** | **~35%** | **~65%** |
