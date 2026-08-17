import React, { useState } from "react";
import { Search, Wand2, Mail, Send, Activity, Trash2, Clock, GitBranch, ShieldAlert, Play, Copy, GripVertical, MoreVertical } from "lucide-react";
import { Handle, Position, NodeProps } from "@xyflow/react";

export const ZapierNode = ({ data, selected }: NodeProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const node = data.node as any;
  const onDelete = data.onDelete as () => void;
  const onDuplicate = data.onDuplicate as () => void;

  const getIcon = () => {
     if (node.type === "trigger") {
        if (node.label?.includes("Schedule")) return <Clock size={16} />;
        return <Activity size={16} />;
     }
     if (node.tool === "if_else") return <GitBranch size={16} />;
     
     switch (node.tool?.toLowerCase()) {
        case "human": return <ShieldAlert size={16} />;
        case "apollo": return <img src="/logos/apollo.png" alt="Apollo" className="w-4 h-4 object-contain rounded-sm" />;
        case "clay": return <img src="/logos/clay.png" alt="Clay" className="w-4 h-4 object-contain rounded-sm" />;
        case "smartlead": return <img src="/logos/smartleads.webp" alt="Smartlead" className="w-4 h-4 object-contain rounded-sm" />;
        case "instantly": return <img src="/logos/instantly.png" alt="Instantly" className="w-4 h-4 object-contain rounded-sm" />;
        case "heyreach": return <img src="/logos/heyreach.png" alt="HeyReach" className="w-4 h-4 object-contain rounded-sm" />;
        case "bettercontact": return <img src="/logos/bettercontact.png" alt="BetterContact" className="w-4 h-4 object-contain rounded-sm" />;
        case "calendly": return <img src="/logos/calendly.png" alt="Calendly" className="w-4 h-4 object-contain rounded-sm" />;
        case "gojiberry": return <img src="/logos/gojiberry.png" alt="Gojiberry" className="w-4 h-4 object-contain rounded-sm" />;
        default: return <Activity size={16} />;
     }
  };

  const getTypeLabel = () => {
    if (node.type === "trigger") return "TRIGGERS";
    if (node.tool === "if_else") return "LOGIC";
    return node.tool ? node.tool.toUpperCase() : "ACTION";
  };

  const getSubtext = () => {
    if (node.type === "trigger") {
      if (node.label?.includes("Event")) return "Kick off when something happens in...";
      if (node.label?.includes("Schedule")) return "Repeat on a cadence — daily, weekly...";
      return "Start your workflow";
    }
    if (node.tool === "if_else") return "Send down one path if a condition is...";
    if (['Apollo', 'Clay', 'HeyReach', 'Smartlead', 'BetterContact', 'Calendly', 'Gojiberry'].includes(node.tool) && !node.action) {
      return "Select an action to configure...";
    }
    return "Configure this step to proceed...";
  };

  return (
    <div className={`relative w-[320px] rounded-xl border bg-white shadow-sm transition-all cursor-pointer group hover:border-[#1a1510]/30 hover:shadow-md ${selected ? 'border-brand-gold ring-1 ring-brand-gold shadow-md' : 'border-[#1a1510]/[0.07]'}`}>
      
      {/* Target Handle (Incoming connection) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-white border-2 border-slate-300 rounded-full opacity-0 pointer-events-none"
      />

      {/* Drag Handle UI */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-grab text-slate-300 hover:text-slate-500">
        <GripVertical size={16} />
      </div>

      <div className="flex items-start p-5 gap-4">
        {/* Context Menu Trigger */}
        <div className="absolute right-4 top-4">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
            className={`p-1.5 rounded-md transition-colors ${isMenuOpen ? 'bg-slate-100 text-[#1a1510]' : 'text-slate-400 hover:text-[#1a1510] hover:bg-slate-50'}`}
          >
            <MoreVertical size={16} />
          </button>
          
          {isMenuOpen && (
            <>
              {/* Invisible overlay to catch outside clicks */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }} 
              />
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDuplicate?.(); }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-[#1a1510] flex items-center gap-2"
                >
                  <Copy size={12} /> Duplicate
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete?.(); }}
                  className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </>
          )}
        </div>

        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-[#faf9f8] text-[#1a1510]/70 flex items-center justify-center shrink-0 border border-[#1a1510]/[0.05]">
          {getIcon()}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-bold tracking-widest text-[#1a1510]/40 uppercase mb-0.5">
            {getTypeLabel()}
          </div>
          <h4 className="text-[13px] font-bold text-[#1a1510] truncate">
            {node.label || "Select an action..."}
          </h4>
          <p className="text-[11px] text-[#1a1510]/50 mt-1 truncate max-w-full leading-relaxed">
            {getSubtext()}
          </p>
          
          {/* Validation or Config Status */}
          {(!node.tool || (['Apollo', 'Clay', 'HeyReach', 'Smartlead', 'BetterContact', 'Calendly', 'Gojiberry'].includes(node.tool) && !node.action)) && node.type !== "trigger" && (
             <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-600 font-bold bg-amber-50 w-fit px-2 py-1 rounded-md border border-amber-100">
                <ShieldAlert size={10} /> Needs configuration
             </div>
          )}
        </div>
      </div>

      {/* Source Handles */}
      {node.tool === 'end_workflow' ? null : 
       node.tool === 'if_else' ? (
         <div className="flex w-full justify-around absolute -bottom-1.5 left-0">
           <div className="relative group/handle flex flex-col items-center">
             <Handle type="source" position={Position.Bottom} id="true" className="!relative !transform-none w-3 h-3 bg-white border-2 border-slate-300 rounded-full hover:border-brand-gold hover:bg-brand-gold/20 hover:scale-125 transition-all" />
             <span className="absolute top-4 text-[9px] font-bold text-slate-400 group-hover/handle:text-[#1a1510] pointer-events-none">TRUE</span>
           </div>
           <div className="relative group/handle flex flex-col items-center">
             <Handle type="source" position={Position.Bottom} id="false" className="!relative !transform-none w-3 h-3 bg-white border-2 border-slate-300 rounded-full hover:border-brand-gold hover:bg-brand-gold/20 hover:scale-125 transition-all" />
             <span className="absolute top-4 text-[9px] font-bold text-slate-400 group-hover/handle:text-[#1a1510] pointer-events-none">FALSE</span>
           </div>
         </div>
       ) : node.tool === 'branch' ? (
         <div className="flex w-full justify-around absolute -bottom-1.5 left-0">
           {node.config?.branches?.map((b: any, i: number) => (
             <div key={b.id || `branch_${i}`} className="relative group/handle flex flex-col items-center">
               <Handle type="source" position={Position.Bottom} id={b.id || `branch_${i}`} className="!relative !transform-none w-3 h-3 bg-white border-2 border-slate-300 rounded-full hover:border-brand-gold hover:bg-brand-gold/20 hover:scale-125 transition-all" />
               <span className="absolute top-4 text-[9px] font-bold text-slate-400 group-hover/handle:text-[#1a1510] pointer-events-none whitespace-nowrap">{b.name || `Branch ${i+1}`}</span>
             </div>
           ))}
           <div className="relative group/handle flex flex-col items-center">
             <Handle type="source" position={Position.Bottom} id="fallback" className="!relative !transform-none w-3 h-3 bg-white border-2 border-slate-300 rounded-full hover:border-brand-gold hover:bg-brand-gold/20 hover:scale-125 transition-all" />
             <span className="absolute top-4 text-[9px] font-bold text-slate-400 group-hover/handle:text-[#1a1510] pointer-events-none">FALLBACK</span>
           </div>
         </div>
       ) : node.tool === 'multi_split' ? (
         <div className="flex w-full justify-around absolute -bottom-1.5 left-0">
           {node.config?.cases?.map((c: any, i: number) => (
             <div key={c.id || `case_${i}`} className="relative group/handle flex flex-col items-center">
               <Handle type="source" position={Position.Bottom} id={c.id || `case_${i}`} className="!relative !transform-none w-3 h-3 bg-white border-2 border-slate-300 rounded-full hover:border-brand-gold hover:bg-brand-gold/20 hover:scale-125 transition-all" />
               <span className="absolute top-4 text-[9px] font-bold text-slate-400 group-hover/handle:text-[#1a1510] pointer-events-none whitespace-nowrap">{c.label || c.value || `Case ${i+1}`}</span>
             </div>
           ))}
           <div className="relative group/handle flex flex-col items-center">
             <Handle type="source" position={Position.Bottom} id="fallback" className="!relative !transform-none w-3 h-3 bg-white border-2 border-slate-300 rounded-full hover:border-brand-gold hover:bg-brand-gold/20 hover:scale-125 transition-all" />
             <span className="absolute top-4 text-[9px] font-bold text-slate-400 group-hover/handle:text-[#1a1510] pointer-events-none">FALLBACK</span>
           </div>
         </div>
       ) : (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="w-3 h-3 bg-white border-2 border-slate-300 rounded-full hover:border-brand-gold hover:bg-brand-gold/20 hover:scale-125 transition-all cursor-crosshair"
        />
       )}
    </div>
  );
};
