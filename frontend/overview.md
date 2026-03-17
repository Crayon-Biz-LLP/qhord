
### How this project is designed to work

- **This app is an execution layer, not a clone of the tools.**
  - It does **not store leads** or replace Apollo/Clay/HeyReach/SmartLead UIs.
  - It issues **API calls into those tools** to run specific actions you configure.

- **What you *can* do from here (conceptually):**
  - Apollo: trigger things like **searching leads**, **creating lists**, **launching sequences**, as long as you provide valid Apollo API keys and payloads.
  - Clay: send data into Clay, **run workflows**, **fetch enrichment outputs**.
  - HeyReach: **create campaigns**, **push leads**, **fetch replies**.
  - SmartLead: **manage campaigns**, **add leads**, **view statistics**, **manage email accounts**.

- **What you *cannot* do:**
  - Bypass each platform’s rules, permissions, or rate limits.
  - Access features they don’t expose via API.
  - Use it without setting up and maintaining valid API credentials per client and per tool.

### How to think about it

- You use Clay/Apollo/HeyReach/SmartLead to **hold the data and run their native logic**.
- You use GTM Command Center to **centrally manage client workspaces and trigger/coordinate actions across those tools** from one place (with logging, roles, and encryption around API keys).