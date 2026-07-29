import React from "react";
import { WfNode } from "./ZapierBuilder";
import { Search, Wand2, Mail, Send, Activity, Trash2, Clock, GitBranch, ShieldAlert } from "lucide-react";

export const ZapierNode = ({ 
  node, 
  index, 
  isSelected, 
  onClick, 
  onDelete 
}: { 
  node: WfNode; 
  index: number; 
  isSelected: boolean; 
  onClick: () => void;
  onDelete: () => void;
}) => {
  
  const getIcon = () => {
     if (node.type === "trigger") return <Activity size={18} />;
     if (node.type === "delay") return <Clock size={18} />;
     if (node.type === "condition" || node.type === "branch") return <GitBranch size={18} />;
     
     switch (node.tool.toLowerCase()) {
        case "human": return <ShieldAlert size={18} />;
        case "apollo": return <Search size={18} />;
        case "clay": return <Wand2 size={18} />;
        case "smartlead": 
        case "instantly": return <Mail size={18} />;
        case "heyreach": return <Send size={18} />;
        default: return <Activity size={18} />;
     }
  };

  const getToolColor = () => {
    switch (node.tool.toLowerCase()) {
      case "human": return "bg-orange-50 text-orange-600 border-orange-200";
      case "apollo": return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "clay": return "bg-zinc-800 text-yellow-300 border-zinc-700";
      case "smartlead": return "bg-blue-50 text-blue-600 border-blue-200";
      case "instantly": return "bg-rose-50 text-rose-600 border-rose-200";
      case "bettercontact": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "heyreach": return "bg-sky-50 text-sky-600 border-sky-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div 
      className={`relative w-full max-w-xl rounded-2xl border bg-white shadow-sm transition-all cursor-pointer group hover:shadow-md ${isSelected ? 'border-brand-gold ring-1 ring-brand-gold shadow-md' : 'border-slate-200'}`}
      onClick={onClick}
    >
      <div className="flex items-start p-4">
        {/* Number Badge */}
        <div className="absolute -left-3 top-4 w-6 h-6 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm z-10">
          {index + 1}
        </div>
        
        {/* Delete Button (visible on hover) */}
        {node.type !== "trigger" && (
           <button 
             onClick={(e) => { e.stopPropagation(); onDelete(); }}
             className="absolute -right-3 top-4 w-7 h-7 rounded-full bg-white text-rose-500 border border-slate-200 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 hover:bg-rose-50 transition-all z-10"
           >
             <Trash2 size={12} />
           </button>
        )}

        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${getToolColor()}`}>
          {getIcon()}
        </div>
        
        <div className="ml-4 flex-1 min-w-0">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">
            {node.type === "trigger" ? "Trigger" : node.tool || "Action"}
          </div>
          <h4 className="text-sm font-semibold text-slate-800 truncate">
            {node.label || "Select an action..."}
          </h4>
          
          {/* Validation or Config Status */}
          {(!node.tool && node.type !== "trigger") && (
             <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600 font-medium">
                <ShieldAlert size={12} /> Needs configuration
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
