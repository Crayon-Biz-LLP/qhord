import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Play, Pause, Save, AlertTriangle, Settings2, Database, Wand2, Activity, ArrowLeft, Wand, LayoutTemplate, BugPlay, ChevronRight, ChevronDown, Search, Mail, Send, GitBranch, Clock, ShieldAlert, X } from "lucide-react";
import { api } from "@/lib/api";
import { useClient } from "../../../contexts/ClientContext";
import { toast } from "sonner";
import { ZapierNode } from "./ZapierNode";
import { ConfigPanel, ACTIONS } from "./ConfigPanel";
import { ZapierEdge } from "./ZapierEdge";
import { BranchConnectionContext } from "./branchConnectionContext";
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
      { id: "workflow_trigger", label: "Workflow Trigger", icon: Play, type: "trigger" }
    ]
  },
  {
    title: "Logic",
    subtitle: "Branch, delay, filter, loop",
    items: [
      { id: "if_else", label: "If / Else", icon: GitBranch, type: "logic" },
      { id: "branch", label: "Branch", icon: GitBranch, type: "logic" },
      { id: "multi_split", label: "Multi Split", icon: GitBranch, type: "logic" },
      { id: "filter", label: "Filter", icon: Settings2, type: "logic" },
      { id: "delay", label: "Delay", icon: Clock, type: "logic" },
      { id: "wait", label: "Wait", icon: Pause, type: "logic" },
      { id: "loop", label: "Loop", icon: Activity, type: "logic" },
      { id: "merge", label: "Merge", icon: GitBranch, type: "logic" },
      { id: "end_workflow", label: "End Workflow", icon: Play, type: "logic" },
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
  /*
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
  */
  {
    title: "Actions",
    subtitle: "Data, communications, and tasks",
    items: [
      { id: "manage_sequences", label: "Manage Sequences", icon: Activity, type: "action" },
      { id: "manage_lists", label: "Manage lists", icon: Database, type: "action" },
      { id: "manage_deals", label: "Manage deals", icon: Database, type: "action" },
      { id: "enrich_data", label: "Enrich data", icon: Settings2, type: "action" },
      { id: "assign_manual_tasks", label: "Assign manual tasks", icon: Activity, type: "action" },
      { id: "update_contact_account", label: "Update contact/account", icon: Database, type: "action" },
      { id: "send_notifications", label: "Send Notifications", icon: Send, type: "action" },
      { id: "send_webhook", label: "Send webhook", icon: Settings2, type: "action" },
    ]
  },
  {
    title: "Integrations",
    subtitle: "Third-party integrations",
    items: [
      { id: "Apollo", label: "Apollo.io", icon: "/logos/apollo.png", type: "action" },
      { id: "Clay", label: "Clay", icon: "/logos/clay.png", type: "action" },
      { id: "HeyReach", label: "HeyReach", icon: "/logos/heyreach.png", type: "action" },
      { id: "BetterContact", label: "BetterContact", icon: "/logos/bettercontact.png", type: "action" },
      { id: "Smartlead", label: "Smartlead", icon: "/logos/smartleads.webp", type: "action" },
      { id: "Gojiberry", label: "Gojiberry", icon: "/logos/gojiberry.png", type: "action" },
      { id: "Calendly", label: "Calendly", icon: "/logos/calendly.png", type: "action" },
      { id: "Instantly", label: "Instantly", icon: "/logos/instantly.png", type: "action" },
    ]
  }
];

const nodeTypes = {
  customNode: ZapierNode,
};

const edgeTypes = {
  customEdge: ZapierEdge,
};

const NODE_WIDTH = 320;
const NODE_HEIGHT = 120;

// Branch/If-Else/Multi-Split render their named handles spread across the node's
// bottom edge (via flex `justify-around`), not at the node's center. Dagre only knows
// about one center point per node, so it centers a single child directly under the whole
// node — which then has to curve sideways to actually reach the offset handle. This
// computes that handle's real x-offset so we can straighten the connector out afterward.
const getHandleOffsetX = (dataNode: any, handle: string | null | undefined): number => {
  if (!dataNode) return 0;

  if (dataNode.tool === 'if_else') {
    const items = ['true', 'false'];
    const idx = items.indexOf(handle || 'true');
    if (idx < 0) return 0;
    return NODE_WIDTH * ((idx + 0.5) / items.length - 0.5);
  }

  if (dataNode.tool === 'branch') {
    const branches = dataNode.config?.branches || [];
    const items = [...branches.map((b: any, i: number) => b.id || `branch_${i}`), 'fallback'];
    const idx = items.indexOf(handle || 'fallback');
    if (idx < 0) return 0;
    return NODE_WIDTH * ((idx + 0.5) / items.length - 0.5);
  }

  if (dataNode.tool === 'multi_split') {
    const cases = dataNode.config?.cases || [];
    const items = [...cases.map((c: any, i: number) => c.id || `case_${i}`), 'fallback'];
    const idx = items.indexOf(handle || 'fallback');
    if (idx < 0) return 0;
    return NODE_WIDTH * ((idx + 0.5) / items.length - 0.5);
  }

  return 0;
};

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 300, ranksep: 60 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const positioned = new Map<string, { x: number; y: number }>();
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    positioned.set(node.id, {
      x: nodeWithPosition.x - NODE_WIDTH / 2,
      y: nodeWithPosition.y - NODE_HEIGHT / 2,
    });
  });

  // Align each branching node's direct children with the handles they actually connect
  // from, instead of dagre's generic "centered under the parent" placement. Skipped for
  // nodes with more than one incoming edge (e.g. a Merge node) so we don't fight dagre's
  // own collision-avoidance placement for convergence points.
  const nodeById = new Map(nodes.map(n => [n.id, n]));
  const incomingCount = new Map<string, number>();
  edges.forEach(e => incomingCount.set(e.target, (incomingCount.get(e.target) || 0) + 1));

  const bySource = new Map<string, Edge[]>();
  edges.forEach((edge) => {
    if ((incomingCount.get(edge.target) || 0) > 1) return;
    const sourceNode = nodeById.get(edge.source);
    const dataNode = (sourceNode?.data as any)?.node;
    if (!dataNode || !['if_else', 'branch', 'multi_split'].includes(dataNode.tool)) return;
    const list = bySource.get(edge.source) || [];
    list.push(edge);
    bySource.set(edge.source, list);
  });

  // Shifting a child alone (without whatever hangs below it) would just push the same
  // kink one hop deeper the moment that branch grows past its first node — the edge from
  // the (moved) child to its own (unmoved) grandchild would develop the exact same offset.
  // So any x change to a child is propagated down its whole downstream chain.
  const shiftSubtree = (startId: string, deltaX: number, visited: Set<string>) => {
    if (!deltaX || visited.has(startId)) return;
    visited.add(startId);
    const pos = positioned.get(startId);
    if (pos) pos.x += deltaX;
    edges.filter(e => e.source === startId).forEach(e => shiftSubtree(e.target, deltaX, visited));
  };

  bySource.forEach((outEdges, sourceId) => {
    const sourceNode = nodeById.get(sourceId)!;
    const dataNode = (sourceNode.data as any).node;
    const sourcePos = positioned.get(sourceId);
    if (!sourcePos) return;
    const sourceCenterX = sourcePos.x + NODE_WIDTH / 2;

    const children = outEdges
      .map(e => ({ edge: e, pos: positioned.get(e.target) }))
      .filter((c): c is { edge: Edge; pos: { x: number; y: number } } => !!c.pos);
    if (children.length === 0) return;

    // Only touch children dagre placed directly below on the same row — mixed rows
    // (e.g. one branch's chain is longer than another's) are left to dagre as-is.
    const rowY = children[0].pos.y;
    if (!children.every(c => c.pos.y === rowY)) return;

    const visited = new Set<string>();

    if (children.length === 1) {
      // A lone active branch can safely sit exactly under its real handle — nothing
      // else from this parent occupies this row to collide with.
      const child = children[0];
      const newX = sourceCenterX + getHandleOffsetX(dataNode, child.edge.sourceHandle) - NODE_WIDTH / 2;
      shiftSubtree(child.edge.target, newX - child.pos.x, visited);
    } else {
      // Multiple branches: handles sit closer together than a node is wide, so aligning
      // each child exactly under its handle would make them overlap. Instead, reuse
      // dagre's own already-spaced x positions, just reordered so left-to-right
      // matches the handles' left-to-right rank (TRUE left of FALSE, branch/case order,
      // fallback last) — correct order, no overlap.
      const xs = children.map(c => c.pos.x).sort((a, b) => a - b);
      const ranked = [...children].sort(
        (a, b) => getHandleOffsetX(dataNode, a.edge.sourceHandle) - getHandleOffsetX(dataNode, b.edge.sourceHandle)
      );
      ranked.forEach((c, i) => { shiftSubtree(c.edge.target, xs[i] - c.pos.x, visited); });
    }
  });

  const layoutedNodes = nodes.map((node) => ({
    ...node,
    targetPosition: 'top' as any,
    sourcePosition: 'bottom' as any,
    position: positioned.get(node.id)!,
  }));

  return { nodes: layoutedNodes, edges };
};

export const BuilderCanvas = ({ workflowId, onClose }: { workflowId: string | null; onClose: (workflowId?: string) => void }) => {
  const { selectedClient } = useClient();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Tracks the persisted workflow's id. Starts from the prop (editing an existing
  // workflow) but is updated in place the first time a brand-new workflow is saved,
  // so the builder never has to close/reopen just to obtain an id.
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(workflowId);

  const [workflowName, setWorkflowName] = useState("Untitled workflow");
  const [workflowStatus, setWorkflowStatus] = useState("draft");
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [insertingEdgeId, setInsertingEdgeId] = useState<string | null>(null);
  const [pendingHandleConnection, setPendingHandleConnection] = useState<{ nodeId: string; handle: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testTrace, setTestTrace] = useState<string[] | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [isLoading, setIsLoading] = useState(!!activeWorkflowId);
  const [searchBlock, setSearchBlock] = useState("");
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedClient?.id && showTemplatesModal) {
      api.get(`/workflows?clientId=${selectedClient.id}&status=template`)
        .then(res => {
          if (res.data.success) {
            setTemplates(res.data.workflows);
          }
        })
        .catch(console.error);
    }
  }, [selectedClient?.id, showTemplatesModal]);

  const handleAddNodeClick = useCallback((edgeId: string) => {
    setInsertingEdgeId(edgeId);
    toast("Select a block from the library to insert");
  }, []);

  const handleAddFromHandle = useCallback((nodeId: string, handle: string) => {
    setPendingHandleConnection({ nodeId, handle });
    toast("Select a block from the library to start this branch");
  }, []);

  useEffect(() => {
    if (activeWorkflowId) {
      loadWorkflow(activeWorkflowId);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [activeWorkflowId]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => {
        const newEdge: Edge = {
          ...params,
          id: `e-${params.source}-${params.target}-${params.sourceHandle || 'default'}`,
          type: 'customEdge',
          markerEnd: { type: MarkerType.ArrowClosed },
          data: { onAddNode: handleAddNodeClick }
        };
        const newEds = addEdge(newEdge, eds);
        setTimeout(() => applyLayout(nodes, newEds), 0);
        return newEds;
      });
    },
    [nodes, setEdges]
  );

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
             source: e.source_node_id || e.source,
             target: e.target_node_id || e.target,
             sourceHandle: e.sourceHandle,
             targetHandle: e.targetHandle,
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
          // Preserve the incoming edge's sourceHandle (e.g. "true"/"false"/a branch or case id) —
          // without it, the bypass edge silently defaults to no branch and the engine will
          // never route down what used to be e.g. the TRUE path of an If/Else.
          remainingEdges.push({
            id: `e-${incomingEdges[0].source}-${outgoingEdges[0].target}`,
            source: incomingEdges[0].source,
            target: outgoingEdges[0].target,
            sourceHandle: incomingEdges[0].sourceHandle,
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
    if (itemData.type === 'trigger' && nodes.some(n => (n.data.node as any).type === 'trigger')) {
      toast.error("A workflow can only have one trigger.");
      return;
    }
    
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
        // Preserve the split edge's sourceHandle on the first half — clicking "+" on a
        // TRUE/FALSE/branch/case edge must keep routing down that same branch after the
        // new node is spliced in, otherwise the branch silently stops executing.
        newEdges.push({
          id: `e-${edgeToSplit.source}-${newNodeId}`,
          source: edgeToSplit.source,
          target: newNodeId,
          sourceHandle: edgeToSplit.sourceHandle,
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
    } else if (pendingHandleConnection) {
      // Wire the new node directly from the specific named handle (TRUE/FALSE, a branch/case
      // id, fallback) the user clicked "+" on, rather than the generic "append to every leaf"
      // behavior below — that handle had no edge yet, so there's nothing to preserve/split.
      const { nodeId, handle } = pendingHandleConnection;
      newEdges.push({
        id: `e-${nodeId}-${newNodeId}-${handle}`,
        source: nodeId,
        target: newNodeId,
        sourceHandle: handle,
        type: 'customEdge',
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { onAddNode: handleAddNodeClick }
      });
      setPendingHandleConnection(null);
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

  // Returns the persisted workflow id on success (existing or newly created), or
  // null if validation/save failed. Callers that need the id (e.g. Test Run) should
  // use the return value rather than reading activeWorkflowId immediately after,
  // since the state update from a fresh create hasn't flushed yet.
  const handleSave = async (status: string = workflowStatus): Promise<string | null> => {
    if (!selectedClient?.id) return null;

    // Validation
    const triggerNodes = nodes.filter(n => (n.data.node as any).type === 'trigger');
    if (triggerNodes.length !== 1) {
      toast.error(`Workflow must have exactly one trigger node. Found ${triggerNodes.length}.`);
      return null;
    }

    const triggerNodeId = triggerNodes[0].id;
    const incomingEdgesToTrigger = edges.filter(e => e.target === triggerNodeId);
    if (incomingEdgesToTrigger.length > 0) {
      toast.error("Trigger node must be the root node and cannot have incoming connections.");
      return null;
    }

    if (nodes.length < 2) {
      toast.error("Workflow must have at least one action or logic node after the trigger.");
      return null;
    }

    // Reachability Validation
    const visited = new Set<string>();
    const queue = [triggerNodeId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (!visited.has(current)) {
        visited.add(current);
        const outEdges = edges.filter(e => e.source === current);
        outEdges.forEach(e => queue.push(e.target));
      }
    }

    const unreachedNodes = nodes.filter(n => !visited.has(n.id));
    if (unreachedNodes.length > 0) {
      toast.error(`Workflow has ${unreachedNodes.length} orphaned nodes. All nodes must be connected to the trigger.`);
      return null;
    }

    // Connection Rules Validation
    for (const node of nodes) {
      const dataNode = node.data.node as any;
      const inEdges = edges.filter(e => e.target === node.id);
      const outEdges = edges.filter(e => e.source === node.id);

      if (dataNode.tool === 'end_workflow' && outEdges.length > 0) {
        toast.error("End Workflow node cannot have outgoing connections.");
        return null;
      }

      if (dataNode.tool === 'merge' && inEdges.length < 2) {
        toast.error("Merge node must have at least two incoming connections.");
        return null;
      }
    }

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
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          branchKey: e.data?.branchKey,
          conditionJson: e.data?.conditionJson
        }))
      };

      if (activeWorkflowId) {
        await api.put(`/workflows/${activeWorkflowId}`, payload);
        setWorkflowStatus(status);
        toast.success("Workflow updated");
        return activeWorkflowId;
      } else {
        const { data } = await api.post("/workflows", payload);
        if (data.success && data.workflow?.id) {
           toast.success("Workflow created");
           setWorkflowStatus(status);
           setActiveWorkflowId(data.workflow.id);
           return data.workflow.id;
        }
        toast.error(data.error || "Failed to save workflow");
        return null;
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save workflow");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestRun = async () => {
    // Auto-saves (creating the workflow if it doesn't have an id yet) so Test Run
    // never has to bounce the user out to save manually first.
    const idToTest = await handleSave(workflowStatus);
    if (!idToTest) return;

    setIsTesting(true);
    setTestTrace(null);
    setShowTestModal(true);

    try {
      const { data } = await api.post(`/workflows/${idToTest}/test`, {});
      if (data.success) {
        setTestTrace(data.trace || []);
        toast.success("Test run completed");
      } else {
        toast.error(data.error || "Test run failed");
        setTestTrace(["❌ Test run failed: " + data.error]);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Test run error");
      setTestTrace(["❌ Exception occurred: " + error.message]);
    } finally {
      setIsTesting(false);
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
          <button onClick={() => onClose()} className="h-8 px-3 text-sm font-semibold text-[#1a1510]/70 hover:text-[#1a1510] flex items-center gap-1.5 rounded-lg hover:bg-slate-100 transition-colors">
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
            <button
              onClick={() => applyLayout(nodes, edges)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
            >
              <Wand size={12} /> Auto Layout
            </button>
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Healthy
            </span>
          </div>
          
          <button 
            onClick={() => handleSave("template")} 
            disabled={isSaving || isTesting}
            className="h-8 px-3 text-[13px] font-semibold text-slate-600 hover:text-[#1a1510] flex items-center gap-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LayoutTemplate size={14} /> Save as Template
          </button>
          <button 
            onClick={() => handleSave("draft")} 
            disabled={isSaving || isTesting}
            className="h-8 px-3 text-[13px] font-semibold text-slate-600 hover:text-[#1a1510] flex items-center gap-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Save size={14} /> {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button 
            onClick={handleTestRun} 
            disabled={isSaving || isTesting}
            className="h-8 px-3 text-[13px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 hover:bg-indigo-50 rounded-lg border border-indigo-100 transition-colors"
          >
            <Play size={14} /> {isTesting ? "Testing..." : "Test Run"}
          </button>
          <button 
            onClick={() => handleSave(workflowStatus === "active" ? "paused" : "active")} 
            disabled={isSaving || isTesting}
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

          {pendingHandleConnection && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-brand-gold text-[#1a1510] px-4 py-2 rounded-full shadow-lg font-semibold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
              <Plus size={16} /> Select a block to start this branch...
              <button onClick={() => setPendingHandleConnection(null)} className="ml-2 hover:bg-[#1a1510]/10 rounded-full p-0.5">
                <X size={14} />
              </button>
            </div>
          )}

          {nodes.length === 0 && (
            <div className="absolute inset-0 z-10 flex flex-col items-center overflow-y-auto py-12 pointer-events-none custom-scrollbar">
              <div className="pointer-events-auto w-full max-w-2xl flex flex-col items-center my-auto">
                <h2 className="text-[26px] font-bold text-[#1a1510] mb-2 tracking-tight">Design a sales process</h2>
                <p className="text-slate-500 mb-10 text-[15px]">Pick a trigger, start from a template, or describe the workflow in plain English.</p>
                
                <div className="flex justify-center w-full px-12 mb-10">
                  <button onClick={() => setShowTemplatesModal(true)} className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 hover:border-brand-gold hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <LayoutTemplate size={22} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-[15px] text-[#1a1510]">Templates</div>
                      <div className="text-xs text-slate-500 mt-0.5">Start from a shape</div>
                    </div>
                  </button>
                </div>

                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">OR START WITH A TRIGGER</div>

                <div className="w-full px-12 space-y-3">
                  {[
                    { id: "workflow_trigger", label: "Manual Trigger", desc: "Start on-demand from a button or bulk action.", icon: Wand2 },
                  ].map((trig, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleItemClick({ type: 'trigger', id: trig.id, label: trig.label })}
                      className="w-full flex items-center bg-white border border-slate-200 rounded-2xl p-4 hover:border-brand-gold hover:shadow-sm transition-all group text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center mr-4 group-hover:text-brand-gold group-hover:bg-brand-gold/10 transition-colors">
                        <trig.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[14px] text-[#1a1510]">{trig.label}</div>
                        <div className="text-[13px] text-slate-500 mt-0.5">{trig.desc}</div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-brand-gold transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <BranchConnectionContext.Provider
            value={{
              hasOutgoingEdge: (nodeId, handle) => edges.some(e => e.source === nodeId && (e.sourceHandle || 'default') === handle),
              onAddFromHandle: handleAddFromHandle,
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onInit={() => console.log('flow loaded')}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodesDraggable={false}
              nodesConnectable={true}
              elementsSelectable={true}
              fitView
              className="custom-scrollbar"
            >
              <Background color="#1a1510" gap={16} size={1} style={{ opacity: 0.05 }} />
              <Controls className="bg-white border border-slate-200 rounded-lg shadow-sm" showInteractive={false} />
            </ReactFlow>
          </BranchConnectionContext.Provider>
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
              ) : pendingHandleConnection ? (
                <span className="text-brand-gold font-bold">Starting new branch...</span>
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
      
      {/* Test Trace Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1510]/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-[#1a1510]/[0.07] w-[600px] max-w-full flex flex-col overflow-hidden max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-[#1a1510]/[0.07]">
              <h3 className="font-bold text-sm text-[#1a1510] flex items-center gap-2">
                <Play size={16} className="text-indigo-500" />
                Workflow Test Execution Trace
              </h3>
              <button onClick={() => setShowTestModal(false)} className="p-1 hover:bg-slate-100 rounded-md">
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-slate-50 font-mono text-xs text-slate-700 leading-relaxed space-y-1">
              {isTesting && !testTrace && (
                <div className="text-slate-500 flex items-center gap-2 animate-pulse">
                  <Activity size={14} /> Executing graph dynamically...
                </div>
              )}
              {testTrace?.map((line, idx) => (
                <div key={idx} className={`
                  ${line.includes('❌') ? 'text-red-600 font-semibold' : ''}
                  ${line.includes('⚠') ? 'text-amber-600' : ''}
                  ${line.includes('✓') ? 'text-emerald-600' : ''}
                  ${line.includes('↳') ? 'text-indigo-600 pl-4' : ''}
                  ${line.includes('Starting node:') ? 'font-bold mt-2 pt-2 border-t border-slate-200' : ''}
                `}>
                  {line}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[#1a1510]/[0.07] flex justify-end">
              <button 
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Gallery Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1510]/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-3xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.2)] w-full max-w-4xl flex flex-col overflow-hidden max-h-[85vh]">
            <div className="flex items-center justify-between p-7 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-bold text-[22px] tracking-tight text-[#1a1510]">Template gallery</h3>
                <p className="text-[14px] text-slate-500 mt-1.5">Start from a workflow shape. Every template focuses on logic — you fill in the messaging elsewhere.</p>
              </div>
              <button onClick={() => setShowTemplatesModal(false)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-7 overflow-y-auto flex-1 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-5 custom-scrollbar">
              {templates.length === 0 ? (
                <div className="col-span-1 md:col-span-2 py-12 text-center text-slate-500 flex flex-col items-center justify-center">
                  <LayoutTemplate size={32} className="text-slate-300 mb-3" />
                  <p className="font-semibold text-[#1a1510]">No templates found</p>
                  <p className="text-sm mt-1">Save a workflow as a template to see it here.</p>
                </div>
              ) : templates.map((tpl) => {
                const tags = [tpl.triggerType || "Manual"];
                return (
                  <button key={tpl.id} onClick={() => { setShowTemplatesModal(false); loadWorkflow(tpl.id); toast.success("Template loaded!"); }} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-brand-gold hover:shadow-lg transition-all text-left flex flex-col justify-between min-h-[170px] group">
                    <div>
                      <h4 className="font-bold text-[16px] text-[#1a1510] group-hover:text-brand-gold transition-colors">{tpl.name}</h4>
                      <p className="text-[14px] text-slate-500 mt-2 leading-relaxed">{tpl.status === 'template' ? 'Saved template' : 'Template'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-5">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md text-[11px] font-semibold border border-slate-100">{tag}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
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

export const ZapierBuilder = ({ workflowId, onClose }: { workflowId: string | null; onClose: (workflowId?: string) => void }) => {
  return (
    <ReactFlowProvider>
      <BuilderCanvas workflowId={workflowId} onClose={onClose} />
    </ReactFlowProvider>
  );
};
