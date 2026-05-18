# 🧪 How to Test Phase 1 is Working

## Step 1: Start Backend Server
```bash
cd backend
npm run dev
```
Server should start on: http://localhost:4000

## Step 2: Open Frontend Test Page
Open this file in your browser:
```
frontend/test-phase1.html
```

## Step 3: What You'll See

### ✅ If Phase 1 is Working:
1. **Backend Status**: "✅ Backend is running and ready"
2. **Node Flow Animation**: All 4 nodes light up green in sequence:
   - 🔵 Parser → 🟡 Architect → 🟢 Validator → 🔴 Executor
3. **Success Message**: "✅ Phase 1 Working! All nodes executed successfully."
4. **Campaign Plan Generated**:
   - Campaign ID: `bb8656cf-625a-44a0-bef2-71e859fd73b1`
   - Name: "B2B Email Outreach Campaign"
   - Steps: 3 (source → warmup → send)
   - Cost: $15

### ❌ If Something's Wrong:
1. **Backend not running**: "❌ Backend not responding"
2. **Node fails**: Specific node turns red
3. **API Error**: Error message displayed

## Step 4: Verify LangGraph State Machine

The test page shows you exactly what each LangGraph node does:

### **Parser Node** (🔵 Blue)
- **Input**: "Send 100 B2B leads from Apollo to Smartlead with 2-day warmup"
- **Output**: JSON Intent object
- **Success**: User text is understood

### **Architect Node** (🟡 Yellow)  
- **Input**: Intent JSON + active tools
- **Output**: Campaign manifest with steps
- **Success**: Logical plan created

### **Validator Node** (🟢 Green)
- **Input**: Campaign manifest
- **Output**: Validated plan + warnings
- **Success**: Guardrails passed

### **Executor Node** (🔴 Red)
- **Input**: Validated plan
- **Output**: Campaign saved to database
- **Success**: Campaign ID returned

## Step 5: Test Different Prompts

Try these test prompts:

### Simple Campaign:
```
"Generate 50 leads from Apollo"
```

### Complex Campaign:
```
"Source 200 SaaS companies, enrich with Clay, then send emails via Smartlead with 3-day warmup"
```

### Multi-Tool Campaign:
```
"Find 100 marketing managers, enrich their data, add to HubSpot, and schedule meetings"
```

## Step 6: Check Database

After successful test, verify data was saved:

```sql
-- Check campaigns
SELECT * FROM campaigns;

-- Check campaign steps  
SELECT * FROM campaign_steps;

-- Should show:
-- 1. Campaign with status "draft"
-- 2. 3 steps with proper dependencies
```

## 🎯 Success Criteria

Phase 1 is **100% working** when:
- ✅ Backend starts without errors
- ✅ Health check passes
- ✅ All 4 LangGraph nodes execute
- ✅ Campaign saved to database
- ✅ Campaign ID returned
- ✅ No error messages

## 🔧 Debugging Tips

If something fails:

### Parser Issues:
- Check Groq API key in `.env`
- Verify model name in `llm-config.ts`

### Architect Issues:
- Check `architect-prompt.ts` exists
- Verify tool names match

### Validator Issues:
- Check `validator-prompt.ts` exists
- Review validation logic

### Executor Issues:
- Check database connection
- Verify Prisma schema applied

### Database Issues:
- Run `npx prisma db push`
- Check `DATABASE_URL` in `.env`

---

**Once all tests pass, Phase 1 is confirmed working and ready for Phase 2!** 🎉
