const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'dashboard', 'Workflows', 'ConfigPanel.tsx');
let content = fs.readFileSync(file, 'utf8');

const originalStep1 = {/* Step 1: Provider / Integration */}
        {node.tool && (
          <div className="space-y-3">
            <label className="text-[13px] font-bold text-[#1a1510]">App <span className="text-red-500">*</span></label>
            <div className="flex items-center justify-between p-3 border border-brand-gold/30 rounded-lg bg-brand-gold/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center text-[#1a1510] border border-[#1a1510]/[0.05]">
                  {getIcon()}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1a1510]">{node.tool}</div>
                  <div className="text-[11px] text-[#1a1510]/60">Connected as {selectedClient?.name || 'Workspace Default'}</div>
                </div>
              </div>
              <button className="text-[11px] font-bold text-brand-gold underline">Change</button>
            </div>
          </div>
        )};

const newStep1 = {/* Step 1: Provider / Integration */}
        {node.tool && (() => {
          const needsAccount = !['delay', 'if_else', 'branch', 'filter', 'wait', 'loop', 'merge', 'end_workflow', 'human', 'manual_trigger', 'run_on_schedule', 'webhook', 'campaign_started', 'campaign_completed', 'reply_received', 'email_opened', 'email_clicked', 'meeting_booked', 'deal_created', 'deal_updated'].includes(node.tool || '');
          const availableAccounts = toolAccounts.filter(a => a.tool_name?.toLowerCase() === node.tool?.toLowerCase() && a.status === 'connected' && a.account_label !== 'Auto (mock-ready)');
          const hasAccount = !needsAccount || availableAccounts.length > 0;

          return (
            <React.Fragment>
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[#1a1510]">App <span className="text-red-500">*</span></label>
                
                {needsAccount && !hasAccount && !isLoadingAccounts ? (
                  <div className="flex flex-col gap-3 p-4 border border-amber-200 rounded-lg bg-amber-50">
                    <div className="flex items-center gap-2 text-amber-800">
                      <ShieldAlert size={16} />
                      <span className="text-[13px] font-bold">⚠ No account connected</span>
                    </div>
                    <p className="text-xs text-amber-700">Please connect a {node.tool} account before configuring this action.</p>
                    <a href="/tools" target="_blank" rel="noopener noreferrer" className="self-start px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[13px] font-bold rounded-md transition-colors">
                      Connect Account
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border border-brand-gold/30 rounded-lg bg-brand-gold/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center text-[#1a1510] border border-[#1a1510]/[0.05]">
                        {getIcon()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#1a1510]">{node.tool}</div>
                        <div className="text-[11px] text-[#1a1510]/60">
                          {needsAccount ? 'Connected to workspace' : 'Built-in Feature'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Action Dropdown (Only if account is present or not needed) */}
              {hasAccount && (
                <div className="space-y-3 pt-4">
                  <label className="text-[13px] font-bold text-[#1a1510]">Action event <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      value={node.action || ""}
                      onChange={(e) => {
                        const label = ACTIONS[node.tool]?.find(a => a.id === e.target.value)?.label || "";
                        onChange({ action: e.target.value, label, config: {} });
                      }}
                      className="w-full p-3 bg-white border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none focus:border-brand-gold font-medium text-[#1a1510] appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select an action...</option>
                      {ACTIONS[node.tool]?.map(action => (
                        <option key={action.id} value={action.id}>{action.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Dynamic Configuration Fields (Only if Action is selected) */}
              {hasAccount && node.action && (
                <div className="space-y-4 pt-4 border-t border-[#1a1510]/[0.07] mt-4">
                  <label className="text-[13px] font-bold text-[#1a1510]">{node.tool === 'delay' ? 'Configure' : 'Account Selection'} <span className="text-red-500">*</span></label>
                  
                  {needsAccount && (
                    <div className="space-y-3 mb-4">
                      {(() => {
                        if (!node.config?.accountId && availableAccounts[0]) {
                          setTimeout(() => handleConfigChange("accountId", availableAccounts[0].id), 0);
                        }
                        return (
                          <select 
                            value={node.config?.accountId || ""} 
                            onChange={(e) => handleConfigChange("accountId", e.target.value)}
                            className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-[#faf9f8] font-medium text-[#1a1510]"
                          >
                            <option value="" disabled>Select {node.tool} Account</option>
                            {availableAccounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.account_label}</option>
                            ))}
                          </select>
                        );
                      })()}
                    </div>
                  )}

                  {/* Render actual tool configurations ONLY if delay OR if we have a valid account configured */}
                  {(node.tool === 'delay' || !!node.config?.accountId) && (
                    <React.Fragment>;

const originalStep2And3Start = {/* Step 2: Action Dropdown */}
        {node.tool && (
          <div className="space-y-3">
            <label className="text-[13px] font-bold text-[#1a1510]">Action event <span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                value={node.action || ""}
                onChange={(e) => {
                  const label = ACTIONS[node.tool]?.find(a => a.id === e.target.value)?.label || "";
                  onChange({ action: e.target.value, label, config: {} }); // reset config when action changes
                }}
                className="w-full p-3 bg-white border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none focus:border-brand-gold font-medium text-[#1a1510] appearance-none cursor-pointer"
              >
                <option value="" disabled>Select an action...</option>
                {ACTIONS[node.tool]?.map(action => (
                  <option key={action.id} value={action.id}>{action.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Dynamic Configuration Fields */}
        {node.tool && node.action && (
          <div className="space-y-4 pt-4 border-t border-[#1a1510]/[0.07]">
            <label className="text-[13px] font-bold text-[#1a1510]">{node.tool === 'delay' ? 'Configure' : 'Account'} <span className="text-red-500">*</span></label>;

// Delete the old Step2 and Step3 start block since it's now integrated into the single return
content = content.replace(originalStep1, newStep1);
content = content.replace(originalStep2And3Start, '');

// Now we need to close the fragments and the IIFE at the very end of the file.
const originalEnd =               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};;

const newEnd =               </div>
            )}
                  </React.Fragment>
                )}
              </div>
            )}
          </React.Fragment>
        )})()}
      </div>
    </div>
  );
};;

content = content.replace(originalEnd, newEnd);

fs.writeFileSync(file, content);
console.log('Successfully patched ConfigPanel.tsx');
