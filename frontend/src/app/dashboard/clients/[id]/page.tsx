"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "../../../../components/Sidebar";
import { useAuth } from "../../../../hooks/useAuth";
import { api } from "../../../../lib/api";
import type { Client, ClientToolAccount, Execution } from "../../../../types";
import { getTemplate, type ActionField } from "../../../../lib/executionTemplates";

const TOOLS = [
  { id: "apollo", label: "Apollo.io" },
  { id: "clay", label: "Clay" },
  { id: "heyreach", label: "HeyReach" },
  { id: "smartlead", label: "SmartLead" },
] as const;

const ACTIONS: Record<string, { id: string; label: string }[]> = {
  apollo: [
    { id: "search_leads", label: "Search leads" },
    { id: "create_list", label: "Create list" },
    { id: "launch_sequence", label: "Launch sequence" },
    { id: "search_organizations", label: "Search Organizations" },
    { id: "enrich_person", label: "Enrich Person" },
    { id: "enrich_organization", label: "Enrich Organization" },
    { id: "list_sequences", label: "List Sequences" },
    { id: "add_to_sequence", label: "Add to Sequence" },
    { id: "list_mailboxes", label: "List Mailboxes" },
    { id: "list_labels", label: "List Labels" },
    { id: "create_contact", label: "Create Contact" },
    { id: "update_contact", label: "Update Contact" },
    { id: "create_account", label: "Create Account" },
    { id: "update_account", label: "Update Account" },
    { id: "bulk_people_enrich", label: "Bulk People Enrich" },
    { id: "create_deal", label: "Create Deal" },
    { id: "list_deals", label: "List Deals" },
    { id: "create_task", label: "Create Task" },
    { id: "search_tasks", label: "Search Tasks" },
    { id: "create_call", label: "Create Call" },
    { id: "search_calls", label: "Search Calls" },
    { id: "health", label: "API Health & Usage" },
    { id: "get_users", label: "Get Users" },
  ],
  clay: [
    { id: "send_leads", label: "Send leads" },
    { id: "run_workflow", label: "Run workflow" },
    { id: "fetch_enrichment_output", label: "Fetch enrichment output" },
  ],
  heyreach: [
    { id: "get_all_campaigns", label: "Get All Campaigns" },
    { id: "get_campaign_by_id", label: "Get Campaign By Id" },
    { id: "add_leads_to_campaign", label: "Add Leads to Campaign" },
    { id: "get_conversations", label: "Get Conversations" },
    { id: "send_message", label: "Send Message" },
    { id: "get_all_linkedin_accounts", label: "Get All LinkedIn Accounts" },
    { id: "get_all_lists", label: "Get All Lists" },
    { id: "create_empty_list", label: "Create Empty List" },
    { id: "get_lead", label: "Get Lead" },
    // legacy
    { id: "create_campaign", label: "Create campaign" },
    { id: "push_leads", label: "Push leads" },
    { id: "fetch_replies", label: "Fetch replies" },
  ],
  smartlead: [
    { id: "get_all_campaigns", label: "Get All Campaigns" },
    { id: "get_campaign_by_id", label: "Get Campaign By ID" },
    { id: "create_campaign", label: "Create Campaign" },
    { id: "update_campaign_schedule", label: "Update Campaign Schedule" },
    { id: "get_campaign_statistics", label: "Get Campaign Statistics" },
    { id: "add_leads_to_campaign", label: "Add Leads to Campaign" },
    { id: "get_leads_by_campaign", label: "Get Leads By Campaign" },
    { id: "get_lead_by_email", label: "Get Lead By Email" },
    { id: "update_lead_status", label: "Update Lead Status" },
    { id: "get_all_email_accounts", label: "Get All Email Accounts" },
    { id: "add_email_account_to_campaign", label: "Add Email Account to Campaign" },
  ],
};

export default function ClientWorkspacePage() {
  const params = useParams();
  const clientId = params?.id as string;
  const { user, loading } = useAuth(true);
  const [client, setClient] = useState<Client | null>(null);
  const [accounts, setAccounts] = useState<ClientToolAccount[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("apollo");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [lastExecution, setLastExecution] = useState<Execution | null>(null);

  const [connectTool, setConnectTool] = useState<string>("apollo");
  const [accountLabel, setAccountLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [clientRes, accountsRes] = await Promise.all([
          api.get(`/clients/${clientId}`),
          api.get(`/tools/accounts/${clientId}`),
        ]);
        setClient(clientRes.data.client);
        setAccounts(accountsRes.data.accounts);
      } catch (err) {
        console.error(err);
      }
    }
    if (clientId && user) {
      load();
    }
  }, [clientId, user]);

  useEffect(() => {
    const toolAccounts = accounts.filter((a) => a.tool_name === (selectedTool as any));
    if (toolAccounts.length > 0) {
      setSelectedAccountId(toolAccounts[0].id);
    } else {
      setSelectedAccountId("");
    }
    const toolActions = ACTIONS[selectedTool] ?? [];
    const nextAction = toolActions[0]?.id ?? "";
    setSelectedAction(nextAction);
    const template = getTemplate(selectedTool, nextAction);
    if (template) {
      const defaults: Record<string, any> = {};
      template.fields.forEach((f) => {
        if (f.defaultValue !== undefined) {
          defaults[f.name] = f.defaultValue;
        }
      });
      setFieldValues(defaults);
    } else {
      setFieldValues({});
    }
  }, [accounts, selectedTool]);

  useEffect(() => {
    const template = getTemplate(selectedTool, selectedAction);
    if (template) {
      const merged: Record<string, any> = { ...fieldValues };
      template.fields.forEach((f) => {
        if (merged[f.name] === undefined && f.defaultValue !== undefined) {
          merged[f.name] = f.defaultValue;
        }
      });
      setFieldValues(merged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAction]);

  const handleConnectAccount = async () => {
    if (!clientId || !connectTool || !accountLabel || !apiKey) return;
    setBusy(true);
    try {
      const res = await api.post("/tools/accounts", {
        clientId,
        toolName: connectTool,
        accountLabel,
        apiKey,
      });
      setAccounts((prev) => [res.data.account, ...prev]);
      setAccountLabel("");
      setApiKey("");
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleExecute = async () => {
    if (!clientId || !selectedTool || !selectedAccountId || !selectedAction) return;
    const template = getTemplate(selectedTool, selectedAction);
    if (!template) return;
    setBusy(true);
    try {
      const payload = buildPayloadFromTemplate(template.fields, fieldValues, selectedTool, selectedAction);
      const res = await api.post("/executions", {
        clientId,
        tool: selectedTool,
        toolAccountId: selectedAccountId,
        action: selectedAction,
        payload,
      });
      setLastExecution(res.data.execution);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const buildPayloadFromTemplate = (
    fields: ActionField[],
    values: Record<string, any>,
    tool: string,
    action: string
  ) => {
    const base: Record<string, any> = {};
    fields.forEach((field) => {
      const v = values[field.name];
      if (v === undefined || v === "") {
        return;
      }
      base[field.name] = v;
    });

    if (tool === "apollo" && action === "search_leads") {
      return {
        q: base.query,
        persona: base.persona,
        filters: {
          locations: typeof base.locations === "string" ? base.locations.split(",").map((s: string) => s.trim()) : [],
          industries:
            typeof base.industries === "string" ? base.industries.split(",").map((s: string) => s.trim()) : [],
          employee_count: {
            min: base.min_employees,
            max: base.max_employees,
          },
        },
        pagination: {
          per_page: base.limit ?? 50,
        },
      };
    }

    if (tool === "apollo" && action === "create_list") {
      return {
        name: base.name,
        description: base.description,
        visibility: base.visibility ?? "private",
        metadata: {
          source: base.source ?? "manual",
        },
      };
    }

    if (tool === "apollo" && action === "launch_sequence") {
      const leadIds =
        typeof base.lead_ids === "string" && base.lead_ids.trim().length > 0
          ? (base.lead_ids as string).split(",").map((s) => s.trim())
          : undefined;
      return {
        sequence_id: base.sequence_id,
        targets: {
          list_id: base.list_id,
          lead_ids: leadIds,
        },
        options: {
          start_date: base.start_date,
          throttle_per_day: base.throttle_per_day,
        },
      };
    }

    if (tool === "apollo" && action === "search_organizations") {
      return {
        q_organization_name: base.q_organization_name,
        organization_locations: typeof base.organization_locations === "string" ? base.organization_locations.split(",").map((s: string) => s.trim()) : [],
        per_page: base.per_page ?? 50,
      };
    }

    if (tool === "apollo" && action === "add_to_sequence") {
      const contactIds =
        typeof base.contact_ids === "string" && base.contact_ids.trim().length > 0
          ? (base.contact_ids as string).split(",").map((s) => s.trim())
          : undefined;
      return {
        emailer_campaign_id: base.emailer_campaign_id,
        contact_ids: contactIds,
        sequence_send_email_mailbox_id: base.sequence_send_email_mailbox_id,
      };
    }

    if (tool === "apollo" && action === "bulk_people_enrich") {
      let details: any[] = [];
      if (typeof base.details_json === "string") {
        try {
          const parsed = JSON.parse(base.details_json);
          if (Array.isArray(parsed)) {
            details = parsed;
          }
        } catch {
          details = [];
        }
      }
      return {
        details
      };
    }

    if (tool === "clay" && action === "send_leads") {
      let rows: any[] = [];
      if (typeof base.rows_json === "string") {
        try {
          const parsed = JSON.parse(base.rows_json);
          if (Array.isArray(parsed)) {
            rows = parsed;
          }
        } catch {
          rows = [];
        }
      }
      return {
        workspace_id: base.workspace_id,
        table_id: base.table_id,
        rows,
        upsert_on: base.upsert_on,
      };
    }

    if (tool === "clay" && action === "run_workflow") {
      return {
        workflow_id: base.workflow_id,
        input: {
          sheet_id: base.input_sheet_id,
          range: {
            start_row: base.start_row ?? 1,
            end_row: base.end_row,
          },
        },
        dry_run: base.dry_run ?? false,
      };
    }

    if (tool === "clay" && action === "fetch_enrichment_output") {
      return {
        job_id: base.job_id,
        page: base.page ?? 1,
        page_size: base.page_size ?? 100,
      };
    }

    if (tool === "heyreach" && action === "add_leads_to_campaign") {
      let leads: any[] = [];
      if (typeof base.leads_json === "string") {
        try {
          const parsed = JSON.parse(base.leads_json);
          if (Array.isArray(parsed)) {
            leads = parsed;
          }
        } catch {
          leads = [];
        }
      }
      return {
        campaignId: base.campaignId,
        leads
      };
    }

    if (tool === "heyreach" && action === "create_campaign") {
      return {
        name: base.name,
        channel: base.channel ?? "linkedin",
        schedule: {
          start_date: base.start_date,
        },
        limits: {
          daily_limit: base.daily_limit,
        },
        notes: base.notes,
      };
    }

    if (tool === "heyreach" && action === "push_leads") {
      return {
        campaign_id: base.campaign_id,
        leads_csv: base.leads_csv,
        dedupe_on: base.dedupe_on ?? "email",
      };
    }

    if (tool === "heyreach" && action === "fetch_replies") {
      return {
        filters: {
          campaign_id: base.campaign_id,
          since_date: base.since_date,
          only_positive: base.only_positive ?? false,
        },
      };
    }

    if (tool === "smartlead" && action === "get_campaign_by_id") {
      return {
        campaign_id: base.campaign_id,
      };
    }

    if (tool === "smartlead" && action === "create_campaign") {
      return {
        name: base.name,
      };
    }

    if (tool === "smartlead" && action === "update_campaign_schedule") {
      return {
        campaign_id: base.campaign_id,
        timezone: base.timezone,
        days_of_the_week: typeof base.days_of_the_week === "string" ? base.days_of_the_week.split(",").map((s: string) => s.trim().toLowerCase()) : [],
        start_hour: base.start_hour,
        end_hour: base.end_hour,
        min_time_btw_emails: base.min_time_btw_emails,
        max_new_leads_per_day: base.max_new_leads_per_day,
      };
    }

    if (tool === "smartlead" && action === "get_campaign_statistics") {
      return {
        campaign_id: base.campaign_id,
      };
    }

    if (tool === "smartlead" && action === "add_leads_to_campaign") {
      let lead_list: any[] = [];
      if (typeof base.lead_list_json === "string") {
        try {
          const parsed = JSON.parse(base.lead_list_json);
          if (Array.isArray(parsed)) {
            lead_list = parsed;
          }
        } catch {
          lead_list = [];
        }
      }
      return {
        campaign_id: base.campaign_id,
        lead_list,
        settings: {
          ignore_global_block_list: base.ignore_global_block_list ?? false,
          ignore_unsubscribe_list: base.ignore_unsubscribe_list ?? false,
        },
      };
    }

    if (tool === "smartlead" && action === "get_leads_by_campaign") {
      return {
        campaign_id: base.campaign_id,
        offset: base.offset ?? 0,
        limit: base.limit ?? 100,
      };
    }

    if (tool === "smartlead" && action === "get_lead_by_email") {
      return {
        email: base.email,
      };
    }

    if (tool === "smartlead" && action === "update_lead_status") {
      return {
        campaign_id: base.campaign_id,
        email: base.email,
        status: base.status,
      };
    }

    if (tool === "smartlead" && action === "add_email_account_to_campaign") {
      let email_account_ids: number[] = [];
      if (typeof base.email_account_ids === "string") {
        email_account_ids = base.email_account_ids.split(",").map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
      }
      return {
        campaign_id: base.campaign_id,
        email_account_ids,
      };
    }

    return base;
  };
  const handleFieldChange = (field: ActionField, rawValue: string | boolean | string[]) => {
    setFieldValues((prev) => {
      let value: any = rawValue;
      if (field.type === "number" && typeof rawValue === "string") {
        value = rawValue === "" ? undefined : Number(rawValue);
      }
      if (field.type === "boolean" && typeof rawValue === "boolean") {
        value = rawValue;
      }
      if ((field.type === "multiselect" || field.type === "select") && Array.isArray(rawValue)) {
        value = rawValue;
      }
      return { ...prev, [field.name]: value };
    });
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-300">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <h2 className="mb-4 text-xl font-semibold">{client ? client.name : "Client workspace"}</h2>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,2.8fr)]">
          <div className="space-y-6">
            <div className="card">
              <h3 className="mb-3 text-sm font-semibold text-slate-100">Tool accounts</h3>
              <div className="mb-3 flex gap-2 text-xs">
                <select
                  className="input"
                  value={connectTool}
                  onChange={(e) => setConnectTool(e.target.value)}
                >
                  {TOOLS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Account label</label>
                  <input
                    className="input"
                    value={accountLabel}
                    onChange={(e) => setAccountLabel(e.target.value)}
                    placeholder="Primary Apollo workspace"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">API key</label>
                  <input
                    className="input"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="API key is encrypted at rest"
                  />
                </div>
                <button
                  type="button"
                  className="btn-primary w-full"
                  disabled={busy || !accountLabel || !apiKey}
                  onClick={handleConnectAccount}
                >
                  {busy ? "Saving..." : "Connect tool account"}
                </button>
              </div>
              <div className="mt-4 border-t border-slate-800 pt-3 text-xs">
                <p className="mb-2 text-slate-400">Connected accounts</p>
                {accounts.length === 0 ? (
                  <p className="text-slate-500">No tool accounts connected yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {accounts.map((a) => (
                      <li key={a.id} className="flex items-center justify-between rounded bg-slate-900 px-3 py-2">
                        <span className="text-slate-200">
                          {a.account_label}{" "}
                          <span className="text-xs uppercase text-slate-500">({a.tool_name})</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="card">
              <h3 className="mb-3 text-sm font-semibold text-slate-100">Execution panel</h3>
              <div className="mb-3 grid gap-3 md:grid-cols-3">
                <div className="text-xs">
                  <label className="mb-1 block text-slate-400">Tool</label>
                  <select
                    className="input"
                    value={selectedTool}
                    onChange={(e) => setSelectedTool(e.target.value)}
                  >
                    {TOOLS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs">
                  <label className="mb-1 block text-slate-400">Tool account</label>
                  <select
                    className="input"
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                  >
                    {accounts
                      .filter((a) => a.tool_name === (selectedTool as any))
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.account_label}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="text-xs">
                  <label className="mb-1 block text-slate-400">Action</label>
                  <select
                    className="input"
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                  >
                    {(ACTIONS[selectedTool] ?? []).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {selectedTool && selectedAccountId && selectedAction && getTemplate(selectedTool, selectedAction) && (
                <>
                  {getTemplate(selectedTool, selectedAction)?.description && (
                    <p className="mb-2 text-[11px] text-slate-400">
                      {getTemplate(selectedTool, selectedAction)?.description}
                    </p>
                  )}
                  <div className="space-y-3 text-xs">
                    {getTemplate(selectedTool, selectedAction)?.fields.map((field) => {
                      const value = fieldValues[field.name] ?? "";

                      if (field.type === "boolean") {
                        return (
                          <label key={field.name} className="flex items-center gap-2 text-xs text-slate-300">
                            <input
                              type="checkbox"
                              checked={Boolean(value)}
                              onChange={(e) => handleFieldChange(field, e.target.checked)}
                            />
                            <span>{field.label}</span>
                            {field.helpText && (
                              <span className="text-[10px] text-slate-500">({field.helpText})</span>
                            )}
                          </label>
                        );
                      }

                      if (field.type === "select") {
                        return (
                          <div key={field.name}>
                            <label className="mb-1 block text-slate-400">
                              {field.label}
                              {field.required && <span className="text-red-400"> *</span>}
                            </label>
                            <select
                              className="input"
                              value={value}
                              onChange={(e) => handleFieldChange(field, e.target.value)}
                            >
                              <option value="">Select...</option>
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            {field.helpText && (
                              <p className="mt-1 text-[10px] text-slate-500">{field.helpText}</p>
                            )}
                          </div>
                        );
                      }

                      if (field.type === "multiselect") {
                        return (
                          <div key={field.name}>
                            <label className="mb-1 block text-slate-400">
                              {field.label}
                              {field.required && <span className="text-red-400"> *</span>}
                            </label>
                            <select
                              className="input"
                              multiple
                              value={Array.isArray(value) ? value : []}
                              onChange={(e) =>
                                handleFieldChange(
                                  field,
                                  Array.from(e.target.selectedOptions).map((o) => o.value)
                                )
                              }
                            >
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            {field.helpText && (
                              <p className="mt-1 text-[10px] text-slate-500">{field.helpText}</p>
                            )}
                          </div>
                        );
                      }

                      if (field.type === "text") {
                        return (
                          <div key={field.name}>
                            <label className="mb-1 block text-slate-400">
                              {field.label}
                              {field.required && <span className="text-red-400"> *</span>}
                            </label>
                            <textarea
                              className="input min-h-[80px]"
                              value={value}
                              placeholder={field.placeholder}
                              onChange={(e) => handleFieldChange(field, e.target.value)}
                            />
                            {field.helpText && (
                              <p className="mt-1 text-[10px] text-slate-500">{field.helpText}</p>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div key={field.name}>
                          <label className="mb-1 block text-slate-400">
                            {field.label}
                            {field.required && <span className="text-red-400"> *</span>}
                          </label>
                          <input
                            className="input"
                            type={field.type === "number" ? "number" : "text"}
                            value={value}
                            placeholder={field.placeholder}
                            onChange={(e) => handleFieldChange(field, e.target.value)}
                          />
                          {field.helpText && (
                            <p className="mt-1 text-[10px] text-slate-500">{field.helpText}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              <button
                type="button"
                className="btn-primary mt-3 w-full"
                disabled={busy || !selectedAccountId || !selectedAction}
                onClick={handleExecute}
              >
                {busy ? "Executing..." : "Run execution"}
              </button>
              {lastExecution && (
                <div className="mt-4 rounded-lg bg-slate-950 p-3 text-xs">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-slate-100">
                      Last execution – {lastExecution.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(lastExecution.created_at).toLocaleString()}
                    </span>
                  </div>
                  {lastExecution.error_message && (
                    <p className="mb-1 text-red-400">{lastExecution.error_message}</p>
                  )}
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-slate-900/80 p-2 text-[10px] text-slate-300">
                    {JSON.stringify(lastExecution.response_payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

