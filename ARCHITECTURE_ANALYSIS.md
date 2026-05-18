# 🏗️ QHORD GTM Orchestration Platform - Architecture Analysis

**Date**: May 6, 2026 | **Status**: Foundation Built, Features Missing

---

## ✅ SUPABASE CONNECTION STATUS
**✅ VERIFIED & CONNECTED** - Supabase PostgreSQL active and working

---

## 📊 CURRENT STATE AUDIT

### ✅ WHAT WE HAVE (Foundation Layer)

#### Database Schema (7 Models)
```
✅ operators          - Internal users (email, password_hash, role)
✅ clients            - End clients managed by operator
✅ client_tool_accounts - API credentials per client per tool
✅ execution_contexts - Reusable configuration/state
✅ executions         - Log of every operation sent to external tools
✅ tools              - Tool registry (14 tools seeded: Apollo, Clay, HeyReach, Smartlead, etc.)
✅ plans              - Pricing tiers (Starter, Growth, Pro, Enterprise)
```

#### Core Infrastructure
```
✅ Express.js REST API (Node.js/TypeScript)
✅ Prisma ORM with Supabase PostgreSQL
✅ Authentication middleware (JWT-based)
✅ Basic encryption for API keys
✅ CORS enabled
✅ Health check endpoint
✅ 5 Route modules: auth, clients, tools, executions, plans
✅ 5 Service modules: apollo.service, clay.service, heyreach.service, smartlead.service, execution.engine
✅ Frontend: Next.js (React) with dashboard, auth, multiple pages
```

#### API Endpoints (Basic)
```
GET  /api/health                    - Server health
GET  /api/auth/me                   - Current user
POST /api/auth/login                - Login
POST /api/auth/register             - Register
GET  /api/tools                     - List available tools
GET  /api/clients                   - List clients
POST /api/clients                   - Create client
GET  /api/executions                - List executions
POST /api/executions                - Create execution
```

---

## ❌ WHAT'S MISSING (Critical Gaps)

### 1. **AI COMPILER ARCHITECTURE** ❌ NOT IMPLEMENTED
| Requirement | Status | Gap |
|---|---|---|
| Parser (natural language → intent) | ❌ | No NLP/LLM integration |
| Abstract Plan generator | ❌ | No plan generation logic |
| Tool Mapping logic | ❌ | No AI-driven tool selection |
| Campaign Manifest JSON generator | ❌ | No DAG/manifest output |
| Plan Validator | ❌ | No validation rules |

**What's needed:**
- LLM integration (OpenAI/Claude API)
- LangChain/LangGraph for agent orchestration
- Parser to convert natural language → structured campaign
- Manifest builder for DAG

---

### 2. **STATE MACHINE / WORKFLOW ENGINE** ❌ NOT IMPLEMENTED
| Requirement | Status | Gap |
|---|---|---|
| LangGraph-style nodes | ❌ | No state machine architecture |
| Parser node | ❌ | No parser |
| Architect node | ❌ | No tool selection logic |
| Validator node | ❌ | No validation layer |
| Executor node | ❌ | ExecutionEngine exists but incomplete |

**Current Issue**: ExecutionEngine just calls APIs directly, no state management

---

### 3. **CAMPAIGN MANIFEST (DAG) SYSTEM** ❌ NOT IMPLEMENTED
| Requirement | Status | Gap |
|---|---|---|
| DAG structure | ❌ | No directed acyclic graph model |
| Step dependencies | ❌ | No dependency tracking |
| Visual flow data | ❌ | No flow visualization data |
| Conditional routing | ❌ | No branching logic |

**Missing database model**: `Campaign` / `CampaignStep` / `CampaignManifest`

---

### 4. **PLAN → EXECUTE → VERIFY FLOW** ❌ NOT IMPLEMENTED
| Requirement | Status | Gap |
|---|---|---|
| Draft mode | ❌ | No draft/approval workflow |
| Shadow config (dry run) | ❌ | No simulation capability |
| Approval gates | ❌ | No approval workflow |
| Verify step | ❌ | No post-execution verification |

**Current**: Executions go straight to APIs without approval

---

### 5. **ACTIVE TOOL INVENTORY** ❌ NOT IMPLEMENTED
| Requirement | Status | Gap |
|---|---|---|
| Detect user's connected tools | ❌ | No active tool detection |
| Inject into AI context | ❌ | No AI context injection |
| Filter available tools | ❌ | No tool filtering by client |
| Tool capability mapping | ❌ | No capability-based routing |

**Missing**: Logic to know which tools a client has credentials for

---

### 6. **TOOL REGISTRY SYSTEM** ⚠️ PARTIAL
| Requirement | Status | Gap |
|---|---|---|
| Tool model exists | ✅ | Tool table has 14 tools |
| Tool capabilities | ❌ | Only has name/category, needs methods, schemas |
| API schemas | ❌ | No method signatures stored |
| Rate limits | ❌ | No rate limit metadata |
| Provider configuration | ❌ | No provider-specific configs |

**Current tools (14 seeded)**:
```
apollo, zoominfo, cognism, lusha, clay, clearbit, smartlead, 
instantly, lemlist, heyreach, expandi, zapier, make, hubspot, 
salesforce, pipedrive
```

**Missing**: Each tool needs:
- `capabilities: ["LeadSource", "Enrichment", "Delivery", "CRM"]`
- `methods: ["search", "export", "enrich"]`
- `rate_limit: "50/min"`
- `required_fields: ["api_key", "workspace_id"]`
- `auth_schema: { type: "oauth|api_key", fields: [...] }`

---

### 7. **SHADOW CONFIG / DRY RUN MODE** ❌ NOT IMPLEMENTED
| Requirement | Status | Gap |
|---|---|---|
| Simulate API calls | ❌ | No simulation mode |
| Check credentials | ❌ | No validation before execution |
| Check rate limits | ❌ | No rate limit checking |
| Check required fields | ❌ | No field validation |

---

### 8. **GUARDRAILS & VALIDATION** ❌ NOT IMPLEMENTED
| Requirement | Status | Gap |
|---|---|---|
| No 0 delay emails | ❌ | No warmup rules |
| Respect sending limits | ❌ | No limit enforcement |
| Avoid duplicate leads | ❌ | No dedup logic |
| Calendar integration | ❌ | No calendar awareness |
| Validator override AI | ❌ | No validation layer |

---

### 9. **API VIRTUALIZATION LAYER** ❌ NOT IMPLEMENTED
| Requirement | Status | Gap |
|---|---|---|
| Wrapper around external APIs | ⚠️ | Services exist but minimal |
| Retry logic | ❌ | No retry mechanism |
| Rate limiting | ❌ | No rate limiter |
| Failure handling | ❌ | Basic error handling only |
| Queue system | ❌ | No queue (no Redis/BullMQ) |

**Current**: Direct service calls to apollo.service.ts, clay.service.ts, etc.

---

### 10. **QUEUE SYSTEM** ❌ NOT IMPLEMENTED
| Requirement | Status | Gap |
|---|---|---|
| Redis installation | ❌ | No Redis |
| BullMQ setup | ❌ | No job queue |
| Async execution | ❌ | No background jobs |
| Retry queue | ❌ | No failed job handling |
| Event streaming | ❌ | No event bus |

---

### 11. **VECTOR MEMORY** ❌ NOT IMPLEMENTED
| Requirement | Status | Gap |
|---|---|---|
| Past campaigns store | ❌ | No campaign history model |
| Embeddings | ❌ | No vector DB integration |
| Template storage | ❌ | No reusable templates |
| Semantic search | ❌ | No embedding search |

---

### 12. **MULTI-TENANT ISOLATION** ⚠️ PARTIAL
| Requirement | Status | Gap |
|---|---|---|
| Separate tool connections | ✅ | client_tool_accounts exists |
| Separate memory/context | ❌ | No tenant context isolation |
| Separate rate limits | ❌ | No per-tenant limits |
| Data isolation | ⚠️ | Queries filter by client_id but no DB-level isolation |

---

### 13. **API DESIGN GAPS** ❌ INCOMPLETE
| Endpoint | Status | Issue |
|---|---|---|
| Campaign creation | ❌ | No endpoint |
| Campaign approval | ❌ | No endpoint |
| Campaign execution | ⚠️ | Direct, no plan-first flow |
| Campaign manifest view | ❌ | No endpoint |
| Tool activation | ❌ | No endpoint |
| AI planning | ❌ | No endpoint |
| Dry run / shadow mode | ❌ | No endpoint |

---

### 14. **FRONTEND GAPS** ❌ INCOMPLETE
| Feature | Status | Issue |
|---|---|---|
| Campaign builder UI | ❌ | Not in current structure |
| Visual DAG editor | ❌ | No flow visualization |
| Approval workflow UI | ❌ | No approval modal |
| AI prompt input | ❌ | No NLP input form |
| Step-by-step preview | ❌ | No manifest preview |
| "Why this step?" explanation | ❌ | No AI reasoning display |

---

## 🎯 SCOPE MAPPING: Requirements vs Current Architecture

### Tier 1: Foundation (DONE ✅)
```
✅ Multi-tenant database schema
✅ User authentication
✅ Tool registry with 14 tools
✅ Execution logging
✅ Supabase connectivity
```

### Tier 2: Core AI Compiler (CRITICAL - 0% DONE) ❌
```
❌ Natural language parser (Parser node)
❌ AI tool selection logic (Architect node)
❌ Campaign manifest generator (DAG builder)
❌ LLM integration (OpenAI/Claude)
❌ LangGraph state machine
```

### Tier 3: Execution Flow (CRITICAL - 10% DONE) ⚠️
```
⚠️ Draft → Approve → Execute flow (only Execute)
❌ Shadow config / dry run validation
❌ Guardrails enforcement
❌ Post-execution verification
```

### Tier 4: Production Infrastructure (0% DONE) ❌
```
❌ Redis queue system (BullMQ)
❌ Rate limiting
❌ Retry mechanism
❌ Vector memory (embeddings)
❌ Event streaming
```

### Tier 5: Frontend UI (0% DONE) ❌
```
❌ AI prompt interface
❌ Visual campaign builder
❌ DAG editor with drag-drop
❌ Approval workflow screens
❌ Execution monitoring dashboard
```

---

## 🏛️ HIGH-LEVEL ARCHITECTURE NEEDED

### Current (Incomplete)
```
User → API → Service → Tool API
      (Direct execution, no AI planning)
```

### Needed (Complete)
```
User
  ↓
Frontend UI (AI Prompt)
  ↓
API Gateway
  ├─ Authentication Middleware
  ├─ Rate Limiting
  └─ Request Validation
  ↓
AI Compiler Service (LangGraph)
  ├─ Parser Node (NLP Intent)
  ├─ Architect Node (Tool Selection based on availability)
  ├─ Validator Node (Guardrails + Dry Run)
  └─ Manifest Generator (DAG/JSON Output)
  ↓
Campaign Manager Service
  ├─ Create Campaign (Draft)
  ├─ Store Manifest
  └─ Trigger Approval Flow
  ↓
Approval Queue (Draft → Approved)
  ↓
Execution Engine
  ├─ Executor Node (Execute steps)
  ├─ Queue System (BullMQ + Redis)
  ├─ Retry Logic
  └─ Event Stream
  ↓
API Virtualization Layer
  ├─ Apollo.io Wrapper
  ├─ Clay Wrapper
  ├─ HeyReach Wrapper
  ├─ Smartlead Wrapper
  ├─ Rate Limiter per Tool
  └─ Error Handler + Retry
  ↓
External Tool APIs
```

---

## 📋 WORK BREAKDOWN STRUCTURE (WBS)

### Phase 1: AI Compiler Foundation (Sprint 1-2, ~2 weeks)
```
[1.1] Setup LangGraph + LLM integration
[1.2] Implement Parser node (NLP → Intent extraction)
[1.3] Implement Architect node (Tool selection logic)
[1.4] Implement Validator node (Shadow config)
[1.5] Generate Campaign Manifest (DAG builder)
[1.6] API endpoint: POST /api/campaigns/plan
```

### Phase 2: Campaign Management (Sprint 2-3, ~1.5 weeks)
```
[2.1] Create Campaign database model + migrations
[2.2] Implement CampaignStep model for DAG
[2.3] Implement approval workflow (Draft → Approved states)
[2.4] API endpoints for campaign CRUD
[2.5] API endpoints for approval flow
[2.6] Frontend: Campaign builder UI
```

### Phase 3: Queue System & Execution (Sprint 3-4, ~2 weeks)
```
[3.1] Setup Redis + BullMQ
[3.2] Implement queue processor
[3.3] Implement retry logic
[3.4] Add rate limiting per tool
[3.5] Add event streaming
[3.6] Update ExecutionEngine to use queue
```

### Phase 4: Active Tool Inventory (Sprint 2, ~3 days)
```
[4.1] Extend Tool model with capabilities, schemas, rate limits
[4.2] Detect active tools per client (ClientToolAccount check)
[4.3] Inject into AI context
[4.4] Filter tools available for campaign
```

### Phase 5: Guardrails & Validation (Sprint 4, ~3 days)
```
[5.1] Implement no-zero-delay rule
[5.2] Implement sending limits per client/tool
[5.3] Implement duplicate lead detection
[5.4] Implement calendar availability check
[5.5] Validation override logic in Validator node
```

### Phase 6: API Virtualization (Sprint 5, ~1.5 weeks)
```
[6.1] Create wrapper classes for each tool service
[6.2] Implement centralized error handler
[6.3] Implement centralized retry logic
[6.4] Implement rate limit decorator
[6.5] Add monitoring/logging
```

### Phase 7: Vector Memory (Sprint 6, ~1.5 weeks)
```
[7.1] Setup Pinecone / Weaviate vector DB
[7.2] Create Campaign History model
[7.3] Implement embeddings generation
[7.4] Implement semantic search
[7.5] Implement template recommendations
```

### Phase 8: Frontend UI (Sprint 5-7, ~2.5 weeks)
```
[8.1] Build AI prompt input component
[8.2] Build campaign manifest preview (DAG visualization)
[8.3] Build visual campaign editor
[8.4] Build approval workflow UI
[8.5] Build execution monitoring dashboard
[8.6] Build error handling screens
```

### Phase 9: Testing & Deployment (Sprint 8, ~1 week)
```
[9.1] E2E tests for campaign flow
[9.2] Load testing
[9.3] Security audit
[9.4] Production deployment
[9.5] Monitoring setup
```

---

## 📊 FEATURE COMPLETION MATRIX

| Feature | Current | Needed | Effort | Priority |
|---|---|---|---|---|
| **Core AI Compiler** | 0% | 100% | 2 weeks | 🔴 CRITICAL |
| **Plan-Approve-Execute** | 10% | 100% | 1.5 weeks | 🔴 CRITICAL |
| **Campaign Manifest (DAG)** | 0% | 100% | 1 week | 🔴 CRITICAL |
| **Active Tool Detection** | 0% | 100% | 3 days | 🟡 HIGH |
| **Queue System (Redis/BullMQ)** | 0% | 100% | 1.5 weeks | 🟡 HIGH |
| **Guardrails & Validation** | 0% | 100% | 1 week | 🟡 HIGH |
| **API Virtualization** | 20% | 100% | 1.5 weeks | 🟡 HIGH |
| **Vector Memory** | 0% | 100% | 1.5 weeks | 🟢 MEDIUM |
| **Frontend UI** | 20% | 100% | 2.5 weeks | 🟢 MEDIUM |
| **Rate Limiting** | 0% | 100% | 3 days | 🟢 MEDIUM |
| **Monitoring/Logging** | 10% | 100% | 1 week | 🟢 MEDIUM |
| **Documentation** | 0% | 100% | 1 week | 🟢 MEDIUM |

---

## 🗂️ DATABASE SCHEMA GAPS

### Current Schema
```
✅ operators
✅ clients
✅ client_tool_accounts
✅ tools
✅ execution_contexts
✅ executions
✅ plans
```

### Missing Models (CRITICAL)
```
❌ Campaign (draft, approved, executed)
   - id, client_id, name, description, status, manifest_json, created_by, created_at
❌ CampaignStep (DAG nodes)
   - id, campaign_id, step_order, tool_name, action, params, status, dependencies
❌ CampaignApproval (approval workflow)
   - id, campaign_id, requested_by, approved_by, status, rejected_reason
❌ ExecutionStep (track individual step execution)
   - id, campaign_id, step_id, status, request, response, error
❌ ToolMethod (tool capabilities)
   - id, tool_id, method_name, description, required_fields, optional_fields
❌ CampaignTemplate (for vector memory)
   - id, name, industry, campaign_type, manifest_json, success_rate, embeddings
❌ AuditLog (compliance)
   - id, operator_id, client_id, action, resource, old_value, new_value, timestamp
```

---

## 🔌 API ENDPOINTS NEEDED

### AI Compiler Endpoints
```
POST   /api/campaigns/plan              - Create plan from NLP prompt
GET    /api/campaigns/:id/manifest      - Get campaign manifest
POST   /api/campaigns/:id/validate      - Dry-run validation
```

### Campaign Management
```
GET    /api/campaigns                   - List campaigns (paginated)
POST   /api/campaigns                   - Create campaign (save plan)
GET    /api/campaigns/:id               - Get campaign details
PUT    /api/campaigns/:id               - Update campaign
DELETE /api/campaigns/:id               - Delete campaign
GET    /api/campaigns/:id/history       - Get execution history
```

### Approval Workflow
```
POST   /api/campaigns/:id/request-approval    - Request approval
POST   /api/campaigns/:id/approve             - Approve campaign
POST   /api/campaigns/:id/reject              - Reject campaign
GET    /api/campaigns/:id/approvals           - Get approval history
```

### Execution
```
POST   /api/campaigns/:id/execute       - Execute approved campaign
GET    /api/executions                  - List all executions
GET    /api/executions/:id              - Get execution details
GET    /api/executions/:id/steps        - Get step-by-step progress
PATCH  /api/executions/:id/pause        - Pause execution
PATCH  /api/executions/:id/resume       - Resume execution
```

### Active Tools
```
GET    /api/clients/:clientId/active-tools       - Get connected tools
GET    /api/clients/:clientId/tool-capabilities  - Get tool capabilities
POST   /api/clients/:clientId/activate-tool      - Connect new tool
```

### Templates & Memory
```
GET    /api/templates                   - List campaign templates
POST   /api/templates/:id/similar       - Find similar campaigns
POST   /api/templates/search             - Semantic search
```

---

## 🏗️ FOLDER STRUCTURE NEEDED

```
backend/
├── src/
│   ├── ai/                           ← NEW
│   │   ├── compiler/
│   │   │   ├── parser.ts             ← NLP parser
│   │   │   ├── architect.ts          ← Tool selection
│   │   │   ├── validator.ts          ← Guardrails
│   │   │   └── manifests-builder.ts  ← DAG generator
│   │   ├── langchain/
│   │   │   ├── state-machine.ts      ← LangGraph setup
│   │   │   └── tools.ts              ← LangChain tool definitions
│   │   └── prompts/
│   │       ├── system.ts
│   │       ├── parser.ts
│   │       └── architect.ts
│   ├── queue/                        ← NEW
│   │   ├── redis.ts
│   │   ├── bullmq-setup.ts
│   │   ├── processors/
│   │   │   ├── execution.processor.ts
│   │   │   └── retry.processor.ts
│   │   └── events.ts
│   ├── vector-db/                    ← NEW
│   │   ├── embeddings.ts
│   │   ├── pinecone.ts
│   │   └── search.ts
│   ├── config/
│   │   ├── encryption.ts             ✅ EXISTS
│   │   ├── llm.ts                    ← NEW (OpenAI config)
│   │   └── tools-registry.ts         ← NEW (Tool capabilities)
│   ├── lib/
│   │   ├── prisma.ts                 ✅ EXISTS
│   │   └── validation.ts             ← NEW (Guardrails)
│   ├── middleware/
│   │   ├── auth.ts                   ✅ EXISTS
│   │   ├── rate-limiter.ts           ← NEW
│   │   └── error-handler.ts          ← NEW
│   ├── routes/
│   │   ├── auth.ts                   ✅ EXISTS
│   │   ├── clients.ts                ✅ EXISTS
│   │   ├── tools.ts                  ✅ EXISTS
│   │   ├── executions.ts             ✅ EXISTS
│   │   ├── plans.ts                  ✅ EXISTS
│   │   ├── campaigns.ts              ← NEW (Main feature)
│   │   └── approvals.ts              ← NEW
│   ├── services/
│   │   ├── apollo.service.ts         ✅ EXISTS
│   │   ├── clay.service.ts           ✅ EXISTS
│   │   ├── heyreach.service.ts       ✅ EXISTS
│   │   ├── smartlead.service.ts      ✅ EXISTS
│   │   ├── execution.engine.ts       ✅ EXISTS (NEEDS REFACTOR)
│   │   ├── campaign.service.ts       ← NEW
│   │   ├── approval.service.ts       ← NEW
│   │   ├── tool-availability.service.ts ← NEW
│   │   └── virtualization/           ← NEW
│   │       ├── base-wrapper.ts
│   │       ├── retry-handler.ts
│   │       └── rate-limiter.ts
│   ├── types/
│   │   ├── index.ts                  ✅ EXISTS
│   │   ├── campaign.ts               ← NEW
│   │   ├── manifest.ts               ← NEW
│   │   └── compiler.ts               ← NEW
│   └── index.ts                      ✅ EXISTS
├── prisma/
│   ├── schema.prisma                 ✅ EXISTS (NEEDS UPDATES)
│   └── migrations/                   ← NEW
│       ├── add_campaigns.sql         ← NEW
│       ├── add_campaign_steps.sql    ← NEW
│       └── ...
├── docker-compose.yml
├── .env
├── package.json
└── tsconfig.json
```

---

## 🎯 IMMEDIATE NEXT STEPS (Priority Order)

### Week 1-2: AI Compiler (CRITICAL PATH)
1. [ ] Add `Campaign` model to schema (draft/approved/executed states)
2. [ ] Add `CampaignStep` model (DAG representation)
3. [ ] Setup LLM integration (OpenAI API)
4. [ ] Create Parser node (NLP → Intent)
5. [ ] Create Architect node (Tool selection based on active tools)
6. [ ] Create Validator node (Dry run simulation)
7. [ ] Build Manifest Generator
8. [ ] Create `/api/campaigns/plan` endpoint

### Week 2: Active Tool Detection
1. [ ] Extend `Tool` model with capabilities/schemas
2. [ ] Create tool detection logic
3. [ ] Create API to get active tools per client
4. [ ] Inject into AI context

### Week 3: Campaign Management
1. [ ] Build campaign CRUD endpoints
2. [ ] Build approval workflow endpoints
3. [ ] Create Campaign and CampaignApproval routes

### Week 4: Queue System
1. [ ] Setup Redis
2. [ ] Setup BullMQ
3. [ ] Refactor ExecutionEngine to use queue
4. [ ] Add retry logic

---

## 🚨 RISK FACTORS

| Risk | Impact | Mitigation |
|---|---|---|
| LLM API costs | 🔴 HIGH | Implement caching, rate limits, usage monitoring |
| Tool API rate limits | 🔴 HIGH | Queue system + rate limiter + backoff |
| Data privacy (multi-tenant) | 🔴 HIGH | Row-level security (RLS) in Supabase |
| Campaign execution failures | 🟡 MEDIUM | Robust error handling + retry + notifications |
| Approval bottleneck | 🟡 MEDIUM | Async notifications + timeout auto-approve |
| Vector DB latency | 🟢 LOW | Cache embeddings, pre-compute on create |

---

## 📈 SUCCESS METRICS

```
✅ AI Compiler generates correct campaign plans >90% accuracy
✅ Plan → Approve → Execute flow <2min latency
✅ Queue system processes 100+ executions/min
✅ Uptime >99.5%
✅ P95 API latency <500ms
✅ Tool integration success rate >98%
✅ User approval time average <5min
```

---

## 📝 CONCLUSION

**Current State**: Foundation layer built (database, auth, basic services)  
**What's Missing**: AI compiler, state machine, approval workflow, queue system, guardrails  
**Effort**: ~8-10 weeks for MVP with all Tier 1-4 features  
**Critical Path**: AI Compiler (Compiler node) → Campaign Management → Queue System  

**Next Decision**: Start with AI Compiler foundation (Week 1) or enhance existing services first?

