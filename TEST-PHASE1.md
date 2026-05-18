# 🎯 **HOW TO TEST PHASE 1 IS WORKING**

## **QUICK START GUIDE**

### **Step 1: Start Backend**
```bash
cd backend
npm run dev
```
✅ Backend runs on: http://localhost:4000

### **Step 2: Start Frontend**
```bash
cd frontend
npm run dev
```
✅ Frontend runs on: http://localhost:3000

### **Step 3: Test Phase 1**
1. Open: http://localhost:3000/dashboard/campaigns
2. Click **"New Campaign"** button (gold button)
3. Type in prompt: `"Send 100 B2B leads from Apollo to Smartlead with 2-day warmup"`
4. Click **"Create Campaign"** button
5. Watch the magic happen!

## **WHAT YOU'LL SEE**

### **✅ If Phase 1 Works:**
- 🔄 Loading spinner while creating
- 📋 Campaign creation modal shows progress
- ✅ Success message with campaign details
- 🟢 LangGraph nodes light up: Parser → Architect → Validator → Executor
- 📊 Campaign ID, name, steps, cost displayed
- 🎉 "All 4 LangGraph nodes executed successfully!"

### **❌ If Something's Wrong:**
- Error message in red
- Specific LangGraph node that failed
- Connection error messages

## **🔍 TO VERIFY EACH LANGGRAPH NODE**

The modal shows you exactly what each node does:

### **Parser Node** 🟵 (Understanding)
- **Input**: Your natural language text
- **Output**: Structured JSON intent
- **Success**: AI understands "Send 100 B2B leads..."

### **Architect Node** 🟡 (Planning)  
- **Input**: Intent JSON + available tools
- **Output**: Campaign manifest with 3 steps
- **Success**: Creates logical workflow (source → warmup → send)

### **Validator Node** 🟢 (Guardrails)
- **Input**: Campaign manifest
- **Output**: Validated plan + warnings
- **Success**: Checks compliance, rate limits, duplicates

### **Executor Node** 🔴 (Saving)
- **Input**: Validated plan
- **Output**: Campaign saved to database
- **Success**: Returns campaign ID

## **🧪 TEST DIFFERENT PROMPTS**

Try these to test different scenarios:

### **Simple:**
```
"Generate 50 leads from Apollo"
```

### **Complex:**
```
"Source 200 SaaS companies, enrich with Clay, then send emails via Smartlead with 3-day warmup"
```

### **Multi-Tool:**
```
"Find 100 marketing managers, enrich their data, add to HubSpot, and schedule meetings"
```

## **🎯 SUCCESS CRITERIA**

Phase 1 is **100% WORKING** when:
- ✅ Backend starts without errors
- ✅ Frontend can call `/api/campaigns/plan`
- ✅ All 4 LangGraph nodes execute in sequence
- ✅ Campaign saved to database with ID
- ✅ Visual confirmation of node flow
- ✅ No error messages

## **🔧 DEBUG TIPS**

If something fails:

### **Backend Issues:**
- Check `npm run dev` in backend folder
- Verify port 4000 is free
- Check `.env` has GROQ_API_KEY

### **Frontend Issues:**
- Check `npm run dev` in frontend folder  
- Verify port 3000 is free
- Check browser console for errors

### **API Issues:**
- Check CORS is enabled
- Verify `/api/campaigns/plan` exists
- Check network tab in browser dev tools

### **LangGraph Issues:**
- Parser fails → Check Groq API key
- Architect fails → Check prompt files exist
- Validator fails → Check validation logic
- Executor fails → Check database connection

---

**🎉 Once you see the green success message with all 4 nodes lit up, Phase 1 is confirmed working!**

Now you can test the complete Phase 1 functionality from the actual frontend interface! 🚀
