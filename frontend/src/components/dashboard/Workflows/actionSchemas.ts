export type FieldType = 'text' | 'textarea' | 'email' | 'number' | 'boolean' | 'select' | 'multiselect' | 'url' | 'json';

export interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export type ActionSchemas = Record<string, Record<string, FieldSchema[]>>;

export const ACTION_SCHEMAS: ActionSchemas = {
  Apollo: {
    search_people: [
      { name: "keywords", label: "Keywords", type: "text", placeholder: "e.g., software engineer, VP" },
      { name: "titles", label: "Job Titles", type: "text", placeholder: "Comma separated" },
      { name: "locations", label: "Locations", type: "text", placeholder: "Comma separated" },
      { name: "company_names", label: "Company Names", type: "text", placeholder: "Comma separated" }
    ],
    enrich_contact: [
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "{{contact.email}}" },
      { name: "first_name", label: "First Name", type: "text" },
      { name: "last_name", label: "Last Name", type: "text" },
      { name: "organization_name", label: "Organization Name", type: "text" }
    ],
    create_contact: [
      { name: "email", label: "Email Address", type: "email", required: true },
      { name: "first_name", label: "First Name", type: "text", required: true },
      { name: "last_name", label: "Last Name", type: "text" },
      { name: "organization_name", label: "Company", type: "text" },
      { name: "title", label: "Job Title", type: "text" }
    ]
  },
  Clay: {
    import_table: [
      { name: "table_id", label: "Table ID", type: "text", required: true },
      { name: "data", label: "Data (JSON)", type: "textarea", placeholder: '[{"column": "value"}]' }
    ],
    email_enrichment: [
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "{{contact.email}}" }
    ],
    company_enrichment: [
      { name: "domain", label: "Company Domain", type: "text", required: true, placeholder: "e.g., clay.com" },
      { name: "company_name", label: "Company Name", type: "text" }
    ]
  },
  HeyReach: {
    send_connection_request: [
      { name: "profile_url", label: "LinkedIn Profile URL", type: "text", required: true, placeholder: "{{contact.linkedin_url}}" },
      { name: "message", label: "Message / Note", type: "textarea", placeholder: "Hi {{first_name}}, let's connect!" },
      { name: "campaign_id", label: "Campaign ID (Optional)", type: "text" }
    ],
    send_linkedin_message: [
      { name: "profile_url", label: "LinkedIn Profile URL", type: "text", required: true, placeholder: "{{contact.linkedin_url}}" },
      { name: "message_template", label: "Message Template", type: "textarea", required: true, placeholder: "Hi {{first_name}}, saw your recent post..." },
      { name: "campaign_id", label: "Campaign ID (Optional)", type: "text" },
      { name: "delay", label: "Delay (Hours)", type: "number", placeholder: "24" },
      { name: "variables", label: "Variables (JSON)", type: "textarea", placeholder: '{"first_name": "{{contact.first_name}}"}' }
    ],
    visit_profile: [
      { name: "profile_url", label: "LinkedIn Profile URL", type: "text", required: true }
    ],
    like_post: [
      { name: "post_url", label: "LinkedIn Post URL", type: "text", required: true }
    ],
    follow_profile: [
      { name: "profile_url", label: "LinkedIn Profile URL", type: "text", required: true }
    ]
  },
  Smartlead: {
    send_email: [
      { name: "campaign_id", label: "Campaign ID", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "{{contact.email}}" },
      { name: "subject", label: "Subject", type: "text" },
      { name: "body", label: "Email Body", type: "textarea" }
    ],
    add_lead: [
      { name: "campaign_id", label: "Campaign ID", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "{{contact.email}}" },
      { name: "first_name", label: "First Name", type: "text" },
      { name: "last_name", label: "Last Name", type: "text" },
      { name: "company_name", label: "Company Name", type: "text" }
    ],
    add_to_campaign: [
      { name: "campaign_id", label: "Campaign ID", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email", required: true }
    ],
    pause_campaign: [
      { name: "campaign_id", label: "Campaign ID", type: "text", required: true }
    ],
    resume_campaign: [
      { name: "campaign_id", label: "Campaign ID", type: "text", required: true }
    ],
    stop_campaign: [
      { name: "campaign_id", label: "Campaign ID", type: "text", required: true }
    ]
  },
  BetterContact: {
    find_email: [
      { name: "first_name", label: "First Name", type: "text", required: true },
      { name: "last_name", label: "Last Name", type: "text", required: true },
      { name: "company", label: "Company Name", type: "text" },
      { name: "domain", label: "Company Domain", type: "text" }
    ],
    enrich_contact: [
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "{{contact.email}}" }
    ]
  },
  Calendly: {
    create_scheduling_link: [
      { name: "event_type", label: "Event Type URI", type: "text", required: true, placeholder: "e.g., https://api.calendly.com/event_types/xxx" }
    ],
    book_meeting: [
      { name: "event_type", label: "Event Type URI", type: "text", required: true },
      { name: "inviteeEmail", label: "Invitee Email", type: "email", required: true }
    ],
    cancel_meeting: [
      { name: "event_uuid", label: "Event UUID", type: "text", required: true },
      { name: "reason", label: "Cancellation Reason", type: "text" }
    ]
  },
  Gojiberry: {
    import_contacts: [
      { name: "listId", label: "List ID", type: "text", required: true },
      { name: "contacts", label: "Contacts (JSON)", type: "textarea" }
    ],
    sync_leads: [
      { name: "listId", label: "List ID", type: "text", required: true }
    ]
  },
  Instantly: {
    add_lead: [
      { name: "campaign_id", label: "Campaign ID", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "{{contact.email}}" },
      { name: "first_name", label: "First Name", type: "text" },
      { name: "last_name", label: "Last Name", type: "text" },
      { name: "company_name", label: "Company Name", type: "text" }
    ],
    send_email: [
      { name: "campaign_id", label: "Campaign ID", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email", required: true }
    ],
    add_to_campaign: [
      { name: "campaign_id", label: "Campaign ID", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email", required: true }
    ]
  },
  delay: {
    delay_for: [
      { name: "delay_value", label: "Time Delayed For (value)", type: "number", required: true, placeholder: "1.0" },
      { name: "delay_unit", label: "Time Delayed For (unit)", type: "select", required: true, options: [
        { value: "minutes", label: "Minutes" },
        { value: "hours", label: "Hours" },
        { value: "days", label: "Days" },
        { value: "weeks", label: "Weeks" }
      ] }
    ],
    delay_until: [
      { name: "delay_until_time", label: "Date/Time Delayed Until", type: "text", required: true, placeholder: "e.g. 2026-10-10 10:00:00" },
      { name: "delay_past_behavior", label: "Past Dates Behavior", type: "select", options: [
        { value: "continue_15_min", label: "Continue if it's up to 15 minutes" },
        { value: "continue_1_hour", label: "Continue if it's up to one hour" },
        { value: "continue_1_day", label: "Continue if it's up to one day (default)" },
        { value: "always_continue", label: "Always continue" }
      ] }
    ]
  }
};
