export type FieldType = "string" | "number" | "boolean" | "select" | "multiselect" | "text";

export interface FieldOption {
  value: string;
  label: string;
}

export interface ActionField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  options?: FieldOption[];
}

export interface ActionTemplate {
  id: string;
  tool: string;
  action: string;
  label: string;
  description?: string;
  fields: ActionField[];
}

export const actionTemplates: ActionTemplate[] = [
  {
    id: "apollo.search_leads",
    tool: "apollo",
    action: "search_leads",
    label: "Search leads",
    description: "Search leads in Apollo based on basic firmographic filters.",
    fields: [
      {
        name: "query",
        label: "Search query",
        type: "string",
        required: true,
        placeholder: "e.g. SaaS companies in US",
      },
      {
        name: "persona",
        label: "Persona",
        type: "select",
        options: [
          { value: "founder", label: "Founder" },
          { value: "head_of_sales", label: "Head of Sales" },
          { value: "marketing", label: "Marketing" },
          { value: "revops", label: "RevOps" },
          { value: "custom", label: "Custom / other" },
        ],
      },
      {
        name: "locations",
        label: "Locations",
        type: "string",
        placeholder: "Comma-separated, e.g. United States, Canada",
      },
      {
        name: "industries",
        label: "Industries",
        type: "string",
        placeholder: "Comma-separated, e.g. SaaS, Fintech",
      },
      {
        name: "min_employees",
        label: "Min employees",
        type: "number",
      },
      {
        name: "max_employees",
        label: "Max employees",
        type: "number",
      },
      {
        name: "limit",
        label: "Max leads to return",
        type: "number",
        required: true,
        defaultValue: 50,
      },
    ],
  },
  {
    id: "apollo.create_list",
    tool: "apollo",
    action: "create_list",
    label: "Create list",
    description: "Create a new list in Apollo.",
    fields: [
      {
        name: "name",
        label: "List name",
        type: "string",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        type: "text",
      },
      {
        name: "visibility",
        label: "Visibility",
        type: "select",
        required: true,
        defaultValue: "private",
        options: [
          { value: "private", label: "Private" },
          { value: "team", label: "Team" },
          { value: "org", label: "Organisation" },
        ],
      },
      {
        name: "source",
        label: "Source",
        type: "select",
        defaultValue: "manual",
        options: [
          { value: "manual", label: "Manual" },
          { value: "search", label: "Search results" },
          { value: "upload", label: "CSV upload" },
        ],
      },
    ],
  },
  {
    id: "apollo.launch_sequence",
    tool: "apollo",
    action: "launch_sequence",
    label: "Launch sequence",
    description: "Launch a sequence for a list or explicit lead IDs.",
    fields: [
      {
        name: "sequence_id",
        label: "Sequence ID",
        type: "string",
        required: true,
      },
      {
        name: "list_id",
        label: "List ID",
        type: "string",
        helpText: "Either list ID or explicit lead IDs must be provided.",
      },
      {
        name: "lead_ids",
        label: "Lead IDs",
        type: "string",
        placeholder: "Comma-separated lead IDs",
      },
      {
        name: "start_date",
        label: "Start date",
        type: "string",
        placeholder: "YYYY-MM-DD",
      },
      {
        name: "throttle_per_day",
        label: "Max new leads per day",
        type: "number",
      },
    ],
  },
  {
    id: "apollo.search_organizations",
    tool: "apollo",
    action: "search_organizations",
    label: "Search Organizations",
    description: "Search for companies/organizations.",
    fields: [
      {
        name: "q_organization_name",
        label: "Company Name",
        type: "string",
        placeholder: "e.g. Acme Corp",
      },
      {
        name: "organization_locations",
        label: "Locations",
        type: "string",
        placeholder: "Comma-separated, e.g. United States, Canada",
      },
      {
        name: "per_page",
        label: "Max results to return",
        type: "number",
        defaultValue: 50,
      },
    ],
  },
  {
    id: "apollo.enrich_person",
    tool: "apollo",
    action: "enrich_person",
    label: "Enrich Person",
    description: "Find an email or retrieve contact details.",
    fields: [
      {
        name: "first_name",
        label: "First Name",
        type: "string",
      },
      {
        name: "last_name",
        label: "Last Name",
        type: "string",
      },
      {
        name: "organization_name",
        label: "Company Name",
        type: "string",
      },
      {
        name: "email",
        label: "Email",
        type: "string",
        placeholder: "If you want to enrich by email",
      },
      {
        name: "id",
        label: "Apollo Contact ID",
        type: "string",
      },
    ],
  },
  {
    id: "apollo.enrich_organization",
    tool: "apollo",
    action: "enrich_organization",
    label: "Enrich Organization",
    description: "Get detailed info and funding details for a company.",
    fields: [
      {
        name: "domain",
        label: "Company Domain",
        type: "string",
        required: true,
      },
    ],
  },
  {
    id: "apollo.list_sequences",
    tool: "apollo",
    action: "list_sequences",
    label: "List Sequences",
    description: "Get a list of Sequences/Campaigns.",
    fields: [
      {
        name: "per_page",
        label: "Results per page",
        type: "number",
        defaultValue: 50,
      },
      {
        name: "page",
        label: "Page",
        type: "number",
        defaultValue: 1,
      },
    ],
  },
  {
    id: "apollo.add_to_sequence",
    tool: "apollo",
    action: "add_to_sequence",
    label: "Add to Sequence",
    description: "Add multiple contacts directly to an active sequence.",
    fields: [
      {
        name: "emailer_campaign_id",
        label: "Sequence ID",
        type: "string",
        required: true,
      },
      {
        name: "contact_ids",
        label: "Contact IDs",
        type: "string",
        required: true,
        helpText: "Comma-separated list of contact IDs.",
      },
      {
        name: "sequence_send_email_mailbox_id",
        label: "Mailbox ID (Optional)",
        type: "string",
        helpText: "ID of the email account used to send emails.",
      },
    ],
  },
  {
    id: "apollo.list_mailboxes",
    tool: "apollo",
    action: "list_mailboxes",
    label: "List Mailboxes",
    description: "Get all email accounts tied to this Apollo workspace.",
    fields: [],
  },
  {
    id: "apollo.list_labels",
    tool: "apollo",
    action: "list_labels",
    label: "List Labels (Contact Lists)",
    description: "Get a list of Labels or Lists.",
    fields: [
      {
        name: "per_page",
        label: "Results",
        type: "number",
        defaultValue: 50,
      },
    ],
  },
  {
    id: "apollo.create_contact",
    tool: "apollo",
    action: "create_contact",
    label: "Create Contact",
    description: "Create a new contact (person).",
    fields: [
      { name: "first_name", label: "First Name", type: "string", required: true },
      { name: "last_name", label: "Last Name", type: "string", required: true },
      { name: "organization_name", label: "Organization Name", type: "string" },
      { name: "email", label: "Email", type: "string", required: true },
    ]
  },
  {
    id: "apollo.update_contact",
    tool: "apollo",
    action: "update_contact",
    label: "Update Contact",
    description: "Update an existing contact.",
    fields: [
      { name: "contact_id", label: "Contact ID", type: "string", required: true },
      { name: "first_name", label: "First Name", type: "string" },
      { name: "last_name", label: "Last Name", type: "string" },
      { name: "email", label: "Email", type: "string" },
    ]
  },
  {
    id: "apollo.create_account",
    tool: "apollo",
    action: "create_account",
    label: "Create Account",
    description: "Create a new account (organization).",
    fields: [
      { name: "name", label: "Account Name", type: "string", required: true },
      { name: "domain", label: "Domain", type: "string", required: true },
    ]
  },
  {
    id: "apollo.update_account",
    tool: "apollo",
    action: "update_account",
    label: "Update Account",
    description: "Update an existing account.",
    fields: [
      { name: "account_id", label: "Account ID", type: "string", required: true },
      { name: "name", label: "Account Name", type: "string" },
      { name: "domain", label: "Domain", type: "string" },
    ]
  },
  {
    id: "apollo.bulk_people_enrich",
    tool: "apollo",
    action: "bulk_people_enrich",
    label: "Bulk People Enrich",
    description: "Enrich a list of people based on a JSON array.",
    fields: [
      { name: "details_json", label: "Details (JSON Array)", type: "text", required: true, helpText: "e.g. [{\"first_name\":\"John\",\"last_name\":\"Doe\",\"organization_name\":\"Acme\"}]" }
    ]
  },
  {
    id: "apollo.create_deal",
    tool: "apollo",
    action: "create_deal",
    label: "Create Deal",
    description: "Create a deal.",
    fields: [
      { name: "name", label: "Deal Name", type: "string", required: true },
      { name: "amount", label: "Amount", type: "number" },
      { name: "account_id", label: "Account ID", type: "string" }
    ]
  },
  {
    id: "apollo.list_deals",
    tool: "apollo",
    action: "list_deals",
    label: "List Deals",
    description: "List all deals.",
    fields: [
      { name: "per_page", label: "Per Page", type: "number", defaultValue: 50 },
      { name: "page", label: "Page", type: "number", defaultValue: 1 }
    ]
  },
  {
    id: "apollo.create_task",
    tool: "apollo",
    action: "create_task",
    label: "Create Task",
    description: "Create a new task.",
    fields: [
      { name: "priority", label: "Priority", type: "select", options: [{ value: "high", label: "High" }, { value: "normal", label: "Normal" }], defaultValue: "normal" },
      { name: "note", label: "Note", type: "text" },
      { name: "type", label: "Type", type: "string", defaultValue: "todo" }
    ]
  },
  {
    id: "apollo.search_tasks",
    tool: "apollo",
    action: "search_tasks",
    label: "Search Tasks",
    description: "Search/list tasks.",
    fields: [
      { name: "per_page", label: "Per Page", type: "number", defaultValue: 50 },
      { name: "page", label: "Page", type: "number", defaultValue: 1 }
    ]
  },
  {
    id: "apollo.create_call",
    tool: "apollo",
    action: "create_call",
    label: "Create Call Record",
    description: "Create a call record.",
    fields: [
      { name: "contact_id", label: "Contact ID", type: "string", required: true },
      { name: "note", label: "Note", type: "text" }
    ]
  },
  {
    id: "apollo.search_calls",
    tool: "apollo",
    action: "search_calls",
    label: "Search Calls",
    description: "Search/list calls.",
    fields: [
      { name: "per_page", label: "Per Page", type: "number", defaultValue: 50 },
      { name: "page", label: "Page", type: "number", defaultValue: 1 }
    ]
  },
  {
    id: "apollo.health",
    tool: "apollo",
    action: "health",
    label: "API Health & Usage",
    description: "Check authentication state and rate limits.",
    fields: []
  },
  {
    id: "apollo.get_users",
    tool: "apollo",
    action: "get_users",
    label: "Get Users",
    description: "List users in workspace.",
    fields: [
      { name: "per_page", label: "Per Page", type: "number", defaultValue: 50 }
    ]
  },
  {
    id: "clay.send_leads",
    tool: "clay",
    action: "send_leads",
    label: "Send leads to table",
    description: "Send structured rows into a Clay table.",
    fields: [
      {
        name: "workspace_id",
        label: "Workspace ID",
        type: "string",
        required: true,
      },
      {
        name: "table_id",
        label: "Table ID",
        type: "string",
        required: true,
      },
      {
        name: "rows_json",
        label: "Rows (JSON array)",
        type: "text",
        required: true,
        helpText: "JSON array of row objects that match the Clay table schema.",
      },
      {
        name: "upsert_on",
        label: "Dedup column",
        type: "string",
        placeholder: "Optional column name used for upserts",
      },
    ],
  },
  {
    id: "clay.run_workflow",
    tool: "clay",
    action: "run_workflow",
    label: "Run workflow",
    description: "Trigger a Clay workflow against a sheet and row range.",
    fields: [
      {
        name: "workflow_id",
        label: "Workflow ID",
        type: "string",
        required: true,
      },
      {
        name: "input_sheet_id",
        label: "Input sheet ID",
        type: "string",
      },
      {
        name: "start_row",
        label: "Start row",
        type: "number",
        defaultValue: 1,
      },
      {
        name: "end_row",
        label: "End row",
        type: "number",
      },
      {
        name: "dry_run",
        label: "Dry run",
        type: "boolean",
        defaultValue: false,
      },
    ],
  },
  {
    id: "clay.fetch_enrichment_output",
    tool: "clay",
    action: "fetch_enrichment_output",
    label: "Fetch enrichment output",
    fields: [
      {
        name: "job_id",
        label: "Job ID",
        type: "string",
        required: true,
      },
      {
        name: "page",
        label: "Page",
        type: "number",
        defaultValue: 1,
      },
      {
        name: "page_size",
        label: "Page size",
        type: "number",
        defaultValue: 100,
      },
    ],
  },
  {
    id: "heyreach.create_campaign",
    tool: "heyreach",
    action: "create_campaign",
    label: "Create campaign",
    fields: [
      {
        name: "name",
        label: "Campaign name",
        type: "string",
        required: true,
      },
      {
        name: "channel",
        label: "Channel",
        type: "select",
        required: true,
        defaultValue: "linkedin",
        options: [
          { value: "linkedin", label: "LinkedIn" },
          { value: "email", label: "Email" },
          { value: "multi", label: "Multi-channel" },
        ],
      },
      {
        name: "start_date",
        label: "Start date",
        type: "string",
        placeholder: "YYYY-MM-DD",
      },
      {
        name: "daily_limit",
        label: "Daily send limit",
        type: "number",
      },
      {
        name: "notes",
        label: "Internal notes",
        type: "text",
      },
    ],
  },
  {
    id: "heyreach.push_leads",
    tool: "heyreach",
    action: "push_leads",
    label: "Push leads",
    fields: [
      {
        name: "campaign_id",
        label: "Campaign ID",
        type: "string",
        required: true,
      },
      {
        name: "leads_csv",
        label: "Leads CSV",
        type: "text",
        required: true,
        helpText: "CSV text with header row and one row per lead.",
      },
      {
        name: "dedupe_on",
        label: "Deduplicate on",
        type: "select",
        defaultValue: "email",
        options: [
          { value: "email", label: "Email" },
          { value: "linkedin_url", label: "LinkedIn URL" },
          { value: "none", label: "No deduplication" },
        ],
      },
    ],
  },
  {
    id: "heyreach.fetch_replies",
    tool: "heyreach",
    action: "fetch_replies",
    label: "Fetch replies",
    fields: [
      {
        name: "campaign_id",
        label: "Campaign ID",
        type: "string",
      },
      {
        name: "since_date",
        label: "Since date",
        type: "string",
        placeholder: "YYYY-MM-DD",
      },
      {
        name: "only_positive",
        label: "Only positive replies",
        type: "boolean",
        defaultValue: false,
      },
    ],
  },
  {
    id: "heyreach.get_all_campaigns",
    tool: "heyreach",
    action: "get_all_campaigns",
    label: "Get All Campaigns",
    description: "Get a list of all campaigns.",
    fields: [
      { name: "offset", label: "Offset", type: "number", defaultValue: 0 },
      { name: "limit", label: "Limit", type: "number", defaultValue: 50 },
      { name: "keyword", label: "Keyword", type: "string" },
    ],
  },
  {
    id: "heyreach.get_campaign_by_id",
    tool: "heyreach",
    action: "get_campaign_by_id",
    label: "Get Campaign By ID",
    description: "Retrieve a specific campaign by ID.",
    fields: [
      { name: "id", label: "Campaign ID", type: "string", required: true },
    ],
  },
  {
    id: "heyreach.add_leads_to_campaign",
    tool: "heyreach",
    action: "add_leads_to_campaign",
    label: "Add Leads to Campaign",
    description: "Add leads to an existing campaign.",
    fields: [
      { name: "campaignId", label: "Campaign ID", type: "number", required: true },
      { name: "leads_json", label: "Leads (JSON Array)", type: "text", required: true, helpText: "Provide JSON array of lead objects" },
    ],
  },
  {
    id: "heyreach.get_conversations",
    tool: "heyreach",
    action: "get_conversations",
    label: "Get Conversations",
    description: "Retrieve inbox conversations.",
    fields: [
      { name: "offset", label: "Offset", type: "number", defaultValue: 0 },
      { name: "limit", label: "Limit", type: "number", defaultValue: 50 },
      { name: "keyword", label: "Keyword", type: "string" },
      { name: "isUnread", label: "Is Unread?", type: "boolean", defaultValue: false },
    ],
  },
  {
    id: "heyreach.send_message",
    tool: "heyreach",
    action: "send_message",
    label: "Send Message",
    description: "Send a message in a chatroom.",
    fields: [
      { name: "chatroomId", label: "Chatroom ID", type: "number", required: true },
      { name: "text", label: "Message Text", type: "text", required: true },
    ],
  },
  {
    id: "heyreach.get_all_linkedin_accounts",
    tool: "heyreach",
    action: "get_all_linkedin_accounts",
    label: "Get All LinkedIn Accounts",
    description: "Get all LinkedIn accounts associated with HeyReach.",
    fields: [
      { name: "offset", label: "Offset", type: "number", defaultValue: 0 },
      { name: "limit", label: "Limit", type: "number", defaultValue: 50 },
      { name: "keyword", label: "Keyword", type: "string" },
    ],
  },
  {
    id: "heyreach.get_all_lists",
    tool: "heyreach",
    action: "get_all_lists",
    label: "Get All Lists",
    description: "Get all lead lists.",
    fields: [
      { name: "offset", label: "Offset", type: "number", defaultValue: 0 },
      { name: "limit", label: "Limit", type: "number", defaultValue: 50 },
      { name: "keyword", label: "Keyword", type: "string" },
    ],
  },
  {
    id: "heyreach.create_empty_list",
    tool: "heyreach",
    action: "create_empty_list",
    label: "Create Empty List",
    description: "Create an empty list.",
    fields: [
      { name: "name", label: "List Name", type: "string", required: true },
    ],
  },
  {
    id: "heyreach.get_lead",
    tool: "heyreach",
    action: "get_lead",
    label: "Get Lead",
    description: "Get a lead by profile URL.",
    fields: [
      { name: "profileUrl", label: "Profile URL", type: "string", required: true },
    ],
  },
  {
    id: "smartlead.get_all_campaigns",
    tool: "smartlead",
    action: "get_all_campaigns",
    label: "Get All Campaigns",
    description: "Retrieve all campaigns from your SmartLead account.",
    fields: [],
  },
  {
    id: "smartlead.get_campaign_by_id",
    tool: "smartlead",
    action: "get_campaign_by_id",
    label: "Get Campaign By ID",
    description: "Retrieve a specific campaign by its ID.",
    fields: [
      { name: "campaign_id", label: "Campaign ID", type: "number", required: true },
    ],
  },
  {
    id: "smartlead.create_campaign",
    tool: "smartlead",
    action: "create_campaign",
    label: "Create Campaign",
    description: "Create a new email campaign.",
    fields: [
      { name: "name", label: "Campaign Name", type: "string", required: true },
    ],
  },
  {
    id: "smartlead.update_campaign_schedule",
    tool: "smartlead",
    action: "update_campaign_schedule",
    label: "Update Campaign Schedule",
    description: "Update the sending schedule for a campaign.",
    fields: [
      { name: "campaign_id", label: "Campaign ID", type: "number", required: true },
      { name: "timezone", label: "Timezone", type: "string", placeholder: "e.g. America/New_York" },
      { name: "days_of_the_week", label: "Days of the Week", type: "string", placeholder: "Comma-separated, e.g. monday,tuesday,wednesday" },
      { name: "start_hour", label: "Start Hour", type: "string", placeholder: "e.g. 09:00" },
      { name: "end_hour", label: "End Hour", type: "string", placeholder: "e.g. 17:00" },
      { name: "min_time_btw_emails", label: "Min Time Between Emails (min)", type: "number", defaultValue: 5 },
      { name: "max_new_leads_per_day", label: "Max New Leads Per Day", type: "number", defaultValue: 50 },
    ],
  },
  {
    id: "smartlead.get_campaign_statistics",
    tool: "smartlead",
    action: "get_campaign_statistics",
    label: "Get Campaign Statistics",
    description: "Fetch statistics (opens, clicks, replies, etc.) for a campaign.",
    fields: [
      { name: "campaign_id", label: "Campaign ID", type: "number", required: true },
    ],
  },
  {
    id: "smartlead.add_leads_to_campaign",
    tool: "smartlead",
    action: "add_leads_to_campaign",
    label: "Add Leads to Campaign",
    description: "Add leads to an existing SmartLead campaign.",
    fields: [
      { name: "campaign_id", label: "Campaign ID", type: "number", required: true },
      {
        name: "lead_list_json",
        label: "Lead List (JSON Array)",
        type: "text",
        required: true,
        helpText: 'e.g. [{"first_name":"John","last_name":"Doe","email":"john@example.com","company_name":"Acme"}]',
      },
      { name: "ignore_global_block_list", label: "Ignore Global Block List", type: "boolean", defaultValue: false },
      { name: "ignore_unsubscribe_list", label: "Ignore Unsubscribe List", type: "boolean", defaultValue: false },
    ],
  },
  {
    id: "smartlead.get_leads_by_campaign",
    tool: "smartlead",
    action: "get_leads_by_campaign",
    label: "Get Leads By Campaign",
    description: "Fetch leads associated with a specific campaign.",
    fields: [
      { name: "campaign_id", label: "Campaign ID", type: "number", required: true },
      { name: "offset", label: "Offset", type: "number", defaultValue: 0 },
      { name: "limit", label: "Limit", type: "number", defaultValue: 100 },
    ],
  },
  {
    id: "smartlead.get_lead_by_email",
    tool: "smartlead",
    action: "get_lead_by_email",
    label: "Get Lead By Email",
    description: "Search for a lead by email address.",
    fields: [
      { name: "email", label: "Email Address", type: "string", required: true },
    ],
  },
  {
    id: "smartlead.update_lead_status",
    tool: "smartlead",
    action: "update_lead_status",
    label: "Update Lead Status",
    description: "Update the status of a lead in a campaign.",
    fields: [
      { name: "campaign_id", label: "Campaign ID", type: "number", required: true },
      { name: "email", label: "Lead Email", type: "string", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "INTERESTED", label: "Interested" },
          { value: "NOT_INTERESTED", label: "Not Interested" },
          { value: "DO_NOT_CONTACT", label: "Do Not Contact" },
          { value: "WRONG_PERSON", label: "Wrong Person" },
          { value: "CLOSED", label: "Closed" },
        ],
      },
    ],
  },
  {
    id: "smartlead.get_all_email_accounts",
    tool: "smartlead",
    action: "get_all_email_accounts",
    label: "Get All Email Accounts",
    description: "Retrieve all email accounts connected to your SmartLead workspace.",
    fields: [],
  },
  {
    id: "smartlead.add_email_account_to_campaign",
    tool: "smartlead",
    action: "add_email_account_to_campaign",
    label: "Add Email Account to Campaign",
    description: "Assign email accounts to a campaign for sending.",
    fields: [
      { name: "campaign_id", label: "Campaign ID", type: "number", required: true },
      { name: "email_account_ids", label: "Email Account IDs", type: "string", required: true, helpText: "Comma-separated numeric IDs of email accounts." },
    ],
  },
  {
    id: "hunter.search_leads",
    tool: "hunter",
    action: "search_leads",
    label: "Discover & find emails",
    description: "Free demo: Hunter Discover + domain search (auto pipeline source).",
    fields: [
      { name: "query", label: "Company search query", type: "string", required: true, placeholder: "SaaS companies in the United States" },
      { name: "limit", label: "Max leads", type: "number", defaultValue: 10 },
    ],
  },
  {
    id: "hunter.verify_emails",
    tool: "hunter",
    action: "verify_emails",
    label: "Verify emails",
    description: "Free demo: verify emails on leads in pipeline.",
    fields: [{ name: "max", label: "Max to verify", type: "number", defaultValue: 10 }],
  },
  {
    id: "brevo.prepare_campaign",
    tool: "brevo",
    action: "prepare_campaign",
    label: "Prepare campaign",
    description: "Free demo: create Brevo list + draft campaign.",
    fields: [
      { name: "name", label: "Campaign name", type: "string", required: true },
      { name: "subject", label: "Email subject", type: "string", placeholder: "Quick intro" },
    ],
  },
];

export function getTemplate(tool: string, action: string | null | undefined): ActionTemplate | undefined {
  if (!action) {
    return undefined;
  }
  return actionTemplates.find((t) => t.tool === tool && t.action === action);
}

