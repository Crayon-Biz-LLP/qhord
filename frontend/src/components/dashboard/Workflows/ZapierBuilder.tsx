import React, { useState, useEffect } from "react";
import { Plus, Play, Pause, Save, AlertTriangle, Settings2, Database, Wand2, Activity } from "lucide-react";
import { api } from "@/lib/api";
import { useClient } from "../../../contexts/ClientContext";
import { toast } from "sonner";
import { ZapierNode } from "./ZapierNode";
import { ConfigPanel } from "./ConfigPanel";

export type WfNode = {
  id: string;
  type: string;
  tool: string;
  action: string | null;
  label: string | null;
  config: Record<string, any>;
};

export const ZapierBuilder = ({ workflowId, onClose }: { workflowId: string | null; onClose: () => void }) => {
  const { selectedClient } = useClient();
  const [nodes, setNodes] = useState<WfNode[]>([]);
  const [workflowName, setWorkflowName] = useState("Untitled Automation");
  const [workflowStatus, setWorkflowStatus] = useState("draft");
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!workflowId);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    } else {
      setNodes([
        { id: "trigger-1", type: "trigger", tool: "manual", action: "manual", label: "Manual Trigger", config: {} }
      ]);
    }
  }, [workflowId]);

  const loadWorkflow = async (id: string) => {
    try {
      const { data } = await api.get(`/workflows/${id}`);
      if (data.success && data.workflow) {
        setWorkflowName(data.workflow.name);
        setWorkflowStatus(data.workflow.status);
        if (data.workflow.nodes && data.workflow.nodes.length > 0) {
           // Parse nodes mapped from backend
           const parsedNodes = data.workflow.nodes.sort((a:any, b:any) => a.position?.y - b.position?.y).map((n: any) => ({
              id: n.id,
              type: n.node_type,
              tool: n.tool,
              action: n.action,
              label: n.label,
              config: n.configuration_json
           }));
           setNodes(parsedNodes);
        } else {
           setNodes([{ id: "trigger-1", type: "trigger", tool: "manual", action: "manual", label: "Manual Trigger", config: {} }]);
        }
      }
    } catch (err) {
      console.error("Failed to load workflow", err);
      toast.error("Failed to load workflow");
    } finally {
      setIsLoading(false);
    }
  };

  const addNode = (index: number) => {
    const newNode: WfNode = {
      id: `node-${Date.now()}`,
      type: "action",
      tool: "",
      action: null,
      label: "Choose Action",
      config: {}
    };
    const newNodes = [...nodes];
    newNodes.splice(index + 1, 0, newNode);
    setNodes(newNodes);
    setSelectedNodeId(newNode.id);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const updateNode = (id: string, updates: Partial<WfNode>) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const handleSave = async (status: string = workflowStatus) => {
    if (!selectedClient?.id) return;
    setIsSaving(true);
    try {
      const payload = {
        name: workflowName,
        status,
        clientId: selectedClient.id,
        nodes: nodes.map((n, i) => ({
          id: n.id.startsWith("node-") || n.id.startsWith("trigger-") ? undefined : n.id,
          nodeType: n.type,
          tool: n.tool,
          action: n.action,
          label: n.label,
          configurationJson: n.config,
          position: { y: i } // use index as simple vertical positioning
        }))
      };

      if (workflowId) {
        await api.put(`/workflows/${workflowId}`, payload);
        setWorkflowStatus(status);
        toast.success("Workflow updated");
      } else {
        const { data } = await api.post("/workflows", payload);
        if (data.success) {
           toast.success("Workflow created");
           onClose();
        }
      }
    } catch (err) {
      console.error("Save error", err);
      toast.error("Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading builder...</div>;

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Left Canvas */}
      <div className="flex-1 overflow-y-auto bg-slate-50 relative p-8 pb-32">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <input 
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-2xl font-bold bg-transparent outline-none border-b border-transparent focus:border-brand-gold/30 placeholder-slate-300 transition-colors"
              placeholder="Name your workflow..."
            />
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleSave("draft")} 
                disabled={isSaving}
                className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </button>
              <button 
                onClick={() => handleSave(workflowStatus === "active" ? "paused" : "active")} 
                disabled={isSaving}
                className={`px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-50 flex items-center gap-2 transition-colors ${workflowStatus === 'active' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              >
                {workflowStatus === "active" ? <><Pause size={16}/> Pause</> : <><Play size={16}/> Activate</>}
              </button>
            </div>
          </div>

          {/* Nodes Container */}
          <div className="flex flex-col items-center">
            {nodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <ZapierNode 
                  node={node} 
                  index={index} 
                  isSelected={selectedNodeId === node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  onDelete={() => removeNode(node.id)}
                />
                
                {index < nodes.length - 1 && (
                  <div className="w-0.5 h-8 bg-slate-200" />
                )}
                
                {/* Add Node Button positioned precisely below */}
                <div className="relative w-full flex justify-center -my-3 z-10 opacity-0 hover:opacity-100 transition-opacity duration-200 py-2">
                   <button 
                     onClick={() => addNode(index)}
                     className="w-6 h-6 rounded-full bg-brand-gold text-[#1a1510] flex items-center justify-center shadow hover:scale-110 transition-transform"
                   >
                     <Plus size={14} />
                   </button>
                </div>
              </React.Fragment>
            ))}
            
            {/* Final Add Node Button */}
            {nodes.length > 0 && (
               <>
                 <div className="w-0.5 h-8 bg-slate-200" />
                 <button 
                    onClick={() => addNode(nodes.length - 1)}
                    className="w-10 h-10 rounded-full border border-dashed border-slate-300 bg-white hover:border-brand-gold/50 hover:bg-brand-gold/5 flex items-center justify-center text-slate-400 hover:text-brand-gold transition-colors"
                 >
                    <Plus size={20} />
                 </button>
               </>
            )}
          </div>
        </div>
      </div>

      {/* Right Config Panel */}
      <div className={`w-96 border-l border-slate-200 bg-white shadow-xl transition-all duration-300 z-20 ${selectedNodeId ? 'translate-x-0' : 'translate-x-full absolute right-0 top-16 bottom-0'}`}>
         {selectedNode && (
            <ConfigPanel 
               node={selectedNode} 
               allNodes={nodes}
               onChange={(updates: Partial<WfNode>) => updateNode(selectedNode.id, updates)} 
               onClose={() => setSelectedNodeId(null)}
            />
         )}
      </div>
    </div>
  );
};
