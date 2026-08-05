import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Play, Pause, Save, AlertTriangle, Settings2, Database, Wand2, Activity, ArrowLeft, Wand, LayoutTemplate, BugPlay, ChevronRight, ChevronDown, Search, Mail, Send, GitBranch, Clock, ShieldAlert, X } from "lucide-react";
import { api } from "@/lib/api";
import { useClient } from "../../../contexts/ClientContext";
import { toast } from "sonner";
import { ZapierNode } from "./ZapierNode";
import { ConfigPanel, ACTIONS } from "./ConfigPanel";
import { ZapierEdge } from "./ZapierEdge";
import dagre from "dagre";
import { 
  ReactFlow, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ReactFlowProvider,
  Node,
  Panel,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export type WfNode = {
  id: string;
  type: string;
  tool: string;
  action: string | null;
  label: string | null;
  config: Record<string, any>;
};

const BLOCK_LIBRARY_CATEGORIES = [
  {
    title: "Triggers",
    subtitle: "What starts this workflow",
    items: [
      { id: "manual_trigger", label: "Manual Trigger", icon: Wand, type: "trigger" },
      { id: "run_on_schedule", label: "Schedule", icon: Clock, type: "trigger" },
      { id: "webhook", label: "Webhook", icon: Settings2, type: "trigger" },
      { id: "campaign_started", label: "Campaign Started", icon: Play, type: "trigger" },
      { id: "campaign_completed", label: "Campaign Completed", icon: Activity, type: "trigger" },
      { id: "reply_received", label: "Reply Received", icon: Mail, type: "trigger" },
      { id: "email_opened", label: "Email Opened", icon: Mail, type: "trigger" },
      { id: "email_clicked", label: "Email Clicked", icon: Activity, type: "trigger" },
      { id: "meeting_booked", label: "Meeting Booked", icon: Clock, type: "trigger" },
      { id: "deal_created", label: "Deal Created", icon: Database, type: "trigger" },
      { id: "deal_updated", label: "Deal Updated", icon: Database, type: "trigger" },
    ]
  },
  {
    title: "Logic",
    subtitle: "Branch, delay, filter, loop",
    items: [
      { id: "if_else", label: "If / Else", icon: GitBranch, type: "action" },
      { id: "branch", label: "Branch", icon: GitBranch, type: "action" },
      { id: "multi_split", label: "Multi Split", icon: GitBranch, type: "action" },
      { id: "filter", label: "Filter", icon: Settings2, type: "action" },
      { id: "delay", label: "Delay", icon: Clock, type: "action" },
      { id: "wait", label: "Wait", icon: Pause, type: "action" },
      { id: "loop", label: "Loop", icon: Activity, type: "action" },
      { id: "merge", label: "Merge", icon: GitBranch, type: "action" },
      { id: "end_workflow", label: "End Workflow", icon: Play, type: "action" },
    ]
  },
  /* 
  {
    title: "AI",
    subtitle: "Smart text generation",
    items: [
      { id: "ai_prompt", label: "AI Prompt", icon: Wand2, type: "action" },
      { id: "generate_email", label: "Generate Email", icon: Wand2, type: "action" },
      { id: "rewrite_message", label: "Rewrite Message", icon: Wand2, type: "action" },
      { id: "personalize_message", label: "Personalize Message", icon: Wand2, type: "action" },
      { id: "summarize_lead", label: "Summarize Lead", icon: Wand2, type: "action" },
      { id: "intent_analysis", label: "Intent Analysis", icon: Activity, type: "action" },
    ]
  }, 
  */
  {
    title: "CRM",
    subtitle: "Deals, contacts, tasks",
    items: [
      { id: "create_deal", label: "Create Deal", icon: Database, type: "action" },
      { id: "update_deal", label: "Update Deal", icon: Database, type: "action" },
      { id: "move_deal_stage", label: "Move Deal Stage", icon: Database, type: "action" },
      { id: "create_contact", label: "Create Contact", icon: Database, type: "action" },
      { id: "update_contact", label: "Update Contact", icon: Database, type: "action" },
      { id: "create_company", label: "Create Company", icon: Database, type: "action" },
      { id: "add_note", label: "Add Note", icon: Settings2, type: "action" },
      { id: "create_task", label: "Create Task", icon: Activity, type: "action" },
    ]
  },
  {
    title: "Apps",
    subtitle: "Third-party integrations",
    items: [
      { id: "Apollo", label: "Apollo.io", icon: "/logos/apollo.png", type: "action" },
      { id: "Clay", label: "Clay", icon: "/logos/clay.png", type: "action" },
      { id: "HeyReach", label: "HeyReach", icon: "/logos/heyreach.png", type: "action" },
      { id: "BetterContact", label: "BetterContact", icon: "/logos/bettercontact.png", type: "action" },
      { id: "Smartlead", label: "Smartlead", icon: "/logos/smartleads.webp", type: "action" },
      { id: "Gojiberry", label: "Gojiberry", icon: "/logos/gojiberry.png", type: "action" },
      { id: "Calendly", label: "Calendly", icon: "/logos/calendly.png", type: "action" },
    ]
  }
];

const nodeTypes = {
  customNode: ZapierNode,
};

const edgeTypes = {
  customEdge: ZapierEdge,
};

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 60, align: 'UL' });
  
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 320, height: 120 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: 'top' as any,
      sourcePosition: 'bottom' as any,
      position: {
        x: nodeWithPosition.x - 320 / 2,
        y: nodeWithPosition.y - 120 / 2,
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};

const BuilderCanvas = ({ workflowId, onClose }: { workflowId: string | null; onClose: () => void }) => {
  const { selectedClient } = useClient();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  const [workflowName, setWorkflowName] = useState("Untitled workflow");
  const [workflowStatus, setWorkflowStatus] = useState("draft");
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [insertingEdgeId, setInsertingEdgeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!workflowId);
  const [searchBlock, setSearchBlock] = useState("");
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const handleAddNodeClick = useCallback((edgeId: string) => {
    setInsertingEdgeId(edgeId);
    toast("Select a block from the library to insert");
  }, []);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [workflowId]);

  const applyLayout = (currentNodes: Node[], currentEdges: Edge[]) => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(currentNodes, currentEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };

  const loadWorkflow = async (id: string) => {
    try {
      const { data } = await api.get(`/workflows/${id}`);
      if (data.success && data.workflow) {
        setWorkflowName(data.workflow.name);
        setWorkflowStatus(data.workflow.status);
        
        let initialNodes: Node[] = [];
        let initialEdges: Edge[] = [];

        if (data.workflow.nodes && data.workflow.nodes.length > 0) {
           initialNodes = data.workflow.nodes.map((n: any) => ({
             id: n.id,
             type: 'customNode',
             position: n.position || { x: 0, y: 0 },
             data: {
               node: {
                 id: n.id,
                 type: n.node_type,
                 tool: n.tool,
                 action: n.action,
                 label: n.label,
                 config: n.configuration_json
               },
               onDelete: () => removeNode(n.id)
             }
           }));
        }
        
        if (data.workflow.edges && data.workflow.edges.length > 0) {
           initialEdges = data.workflow.edges.map((e: any) => ({
             id: e.id,
             source: e.source_node_id,
             target: e.target_node_id,
             type: 'customEdge',
             markerEnd: { type: MarkerType.ArrowClosed },
             data: { branchKey: e.branchKey, conditionJson: e.conditionJson, onAddNode: handleAddNodeClick }
           }));
        }

        applyLayout(initialNodes, initialEdges);
      }
    } catch (err) {
      console.error("Failed to load workflow", err);
      toast.error("Failed to load workflow");
    } finally {
      setIsLoading(false);
    }
  };

  const removeNode = (id: string) => {
    setNodes((nds) => {
      const remainingNodes = nds.filter((n) => n.id !== id);
      setEdges((eds) => {
        const incomingEdges = eds.filter(e => e.target === id);
        const outgoingEdges = eds.filter(e => e.source === id);
        
        let remainingEdges = eds.filter((e) => e.source !== id && e.target !== id);

        if (incomingEdges.length === 1 && outgoingEdges.length === 1) {
          remainingEdges.push({
            id: `e-${incomingEdges[0].source}-${outgoingEdges[0].target}`,
            source: incomingEdges[0].source,
            target: outgoingEdges[0].target,
            type: 'customEdge',
            markerEnd: { type: MarkerType.ArrowClosed },
            data: { onAddNode: handleAddNodeClick }
          });
        }
        
        setTimeout(() => applyLayout(remainingNodes, remainingEdges), 0);
        return remainingEdges;
      });
      return remainingNodes;
    });
    
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleItemClick = (itemData: any) => {
    const newNodeId = crypto.randomUUID();
    const newNode: Node = {
      id: newNodeId,
      type: 'customNode',
      position: { x: 0, y: 0 },
      data: {
        node: {
          id: newNodeId,
          type: itemData.type,
          tool: itemData.id,
          action: null,
          label: itemData.label,
          config: {}
        },
        onDelete: () => removeNode(newNodeId)
      },
    };

    let newNodes = [...nodes, newNode];
    let newEdges = [...edges];

    if (insertingEdgeId) {
      const edgeToSplit = edges.find(e => e.id === insertingEdgeId);
      if (edgeToSplit) {
        newEdges = newEdges.filter(e => e.id !== insertingEdgeId);
        newEdges.push({
          id: `e-${edgeToSplit.source}-${newNodeId}`,
          source: edgeToSplit.source,
          target: newNodeId,
          type: 'customEdge',
          markerEnd: { type: MarkerType.ArrowClosed },
          data: { onAddNode: handleAddNodeClick }
        });
        newEdges.push({
          id: `e-${newNodeId}-${edgeToSplit.target}`,
          source: newNodeId,
          target: edgeToSplit.target,
          type: 'customEdge',
          markerEnd: { type: MarkerType.ArrowClosed },
          data: { onAddNode: handleAddNodeClick }
        });
      }
      setInsertingEdgeId(null);
    } else {
      const leafNodes = nodes.filter(n => !edges.some(e => e.source === n.id));
      if (leafNodes.length > 0) {
        leafNodes.forEach(leaf => {
          newEdges.push({
            id: `e-${leaf.id}-${newNodeId}`,
            source: leaf.id,
            target: newNodeId,
            type: 'customEdge',
            markerEnd: { type: MarkerType.ArrowClosed },
            data: { onAddNode: handleAddNodeClick }
          });
        });
      }
    }

    applyLayout(newNodes, newEdges);
    setSelectedNodeId(newNodeId);
  };

  const updateNodeConfig = (id: string, updates: Partial<WfNode>) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          const currentData = n.data as any;
          const updatedNode = { ...currentData.node, ...updates };
          return { ...n, data: { ...currentData, node: updatedNode } };
        }
        return n;
      })
    );
  };

  const handleSave = async (status: string = workflowStatus) => {
    if (!selectedClient?.id) return;
    setIsSaving(true);
    try {
      const payload = {
        name: workflowName,
        status,
        clientId: selectedClient.id,
        nodes: nodes.map((n) => {
          const dataNode = n.data.node as any;
          return {
            id: dataNode.id,
            nodeType: dataNode.type,
            tool: dataNode.tool,
            action: dataNode.action,
            label: dataNode.label,
            configurationJson: dataNode.config,
            position: n.position
          };
        }),
        edges: edges.map(e => ({
          source: e.source,
          target: e.target,
          branchKey: e.data?.branchKey,
          conditionJson: e.data?.conditionJson
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

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  if (isLoading) return <div className="p-10 text-center flex-1 h-full items-center justify-center">Loading builder...</div>;

  const selectedNodeFlow = nodes.find(n => n.id === selectedNodeId);
  const selectedNodeData = selectedNodeFlow ? selectedNodeFlow.data.node as WfNode : null;
  const rawNodes = nodes.map(n => n.data.node as WfNode);

  return (
    <div className="fixed inset-0 z-50 flex flex-col h-screen overflow-hidden bg-[#faf9f8]">
      {/* Top Header */}
      <div className="h-14 px-4 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="h-8 px-3 text-sm font-semibold text-[#1a1510]/70 hover:text-[#1a1510] flex items-center gap-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <input 
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-sm font-semibold bg-transparent outline-none border-b border-transparent focus:border-brand-gold/30 placeholder-slate-300 transition-colors min-w-[200px]"
            placeholder="Untitled workflow"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded-md">
              <Wand size={12} /> Auto Layout
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Healthy
            </span>
          </div>
          
          <button 
            onClick={() => handleSave("draft")} 
            disabled={isSaving}
            className="h-8 px-3 text-[13px] font-semibold text-slate-600 hover:text-[#1a1510] flex items-center gap-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Save size={14} /> {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button 
            onClick={() => handleSave(workflowStatus === "active" ? "paused" : "active")} 
            disabled={isSaving}
            className={`h-8 px-4 text-[13px] font-semibold rounded-lg text-white disabled:opacity-50 flex items-center gap-2 transition-colors ${workflowStatus === 'active' ? 'bg-[#1a1510] hover:bg-[#2a2118]' : 'bg-[#1a1510] hover:bg-[#2a2118]'}`}
          >
            {workflowStatus === "active" ? <><Pause size={14}/> Pause</> : "Publish"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Config Panel */}
        <div className="w-[300px] border-r border-[#1a1510]/[0.07] bg-white flex flex-col shrink-0 z-10">
          {selectedNodeData ? (
            <ConfigPanel 
              node={selectedNodeData} 
              allNodes={rawNodes}
              onChange={(updates: Partial<WfNode>) => updateNodeConfig(selectedNodeData.id, updates)} 
              onClose={() => setSelectedNodeId(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-slate-100 mb-4" />
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Select a block to configure it</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Providers, fields, and validation appear here.</p>
            </div>
          )}
        </div>

        {/* Center Canvas with React Flow */}
        <div className="flex-1 relative bg-[#faf9f8]" ref={reactFlowWrapper}>
          {insertingEdgeId && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-brand-gold text-[#1a1510] px-4 py-2 rounded-full shadow-lg font-semibold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
              <Plus size={16} /> Select a block to insert...
              <button onClick={() => setInsertingEdgeId(null)} className="ml-2 hover:bg-[#1a1510]/10 rounded-full p-0.5">
                <X size={14} />
              </button>
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={() => console.log('flow loaded')}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            fitView
            className="custom-scrollbar"
          >
            <Background color="#1a1510" gap={16} size={1} style={{ opacity: 0.05 }} />
            <Controls className="bg-white border border-slate-200 rounded-lg shadow-sm" showInteractive={false} />
          </ReactFlow>
        </div>

        {/* Right Block Library Panel */}
        <div className="w-[300px] border-l border-[#1a1510]/[0.07] bg-white flex flex-col shrink-0 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="p-4 border-b border-[#1a1510]/[0.07]">
            <div className="text-[10px] font-bold tracking-widest text-[#1a1510]/40 uppercase mb-3">BLOCK LIBRARY</div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Try 'Apollo', 'deals', 'Slack'..."
                value={searchBlock}
                onChange={e => setSearchBlock(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-gold/50"
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              {insertingEdgeId ? (
                <span className="text-brand-gold font-bold">Inserting block...</span>
              ) : (
                "Click a block to add it to the workflow."
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {(() => {
              const lowerSearch = searchBlock.toLowerCase();
              const filteredCategories = BLOCK_LIBRARY_CATEGORIES.map(category => {
                if (!searchBlock) return category;
                
                const filteredItems = category.items.filter(item => {
                  if (item.label.toLowerCase().includes(lowerSearch)) return true;
                  if (ACTIONS[item.id]) {
                    return ACTIONS[item.id].some(action => action.label.toLowerCase().includes(lowerSearch));
                  }
                  return false;
                });
                
                return { ...category, items: filteredItems };
              }).filter(category => category.items.length > 0);

              if (filteredCategories.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center p-6 text-center opacity-70 mt-4">
                    <Search size={24} className="mb-2 text-slate-300" />
                    <p className="text-xs font-medium text-slate-500">No matching actions found</p>
                  </div>
                );
              }

              return filteredCategories.map((category, idx) => (
                <BlockCategory key={idx} category={category} onItemClick={handleItemClick} />
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

const BlockCategory = ({ category, onItemClick }: { category: any, onItemClick: (item: any) => void }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="mb-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group transition-colors"
      >
        <div className="text-left">
          <div className="text-xs font-bold text-[#1a1510]">{category.title}</div>
          <div className="text-[10px] text-[#1a1510]/50 mt-0.5">{category.subtitle}</div>
        </div>
        <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pl-2 pr-2 pb-2 space-y-1 mt-1">
          {category.items.map((item: any) => (
            <div 
              key={item.id}
              onClick={() => onItemClick(item)}
              className="w-full p-2 flex items-center gap-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors text-left cursor-pointer active:scale-[0.98]"
            >
              {typeof item.icon === 'string' ? (
                <img src={item.icon} alt={item.label} className="w-4 h-4 object-contain rounded-sm" />
              ) : (
                <item.icon size={14} className="text-slate-500" />
              )}
              <span className="text-xs font-medium text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ZapierBuilder = (props: any) => {
  return (
    <ReactFlowProvider>
      <BuilderCanvas {...props} />
    </ReactFlowProvider>
  );
};
