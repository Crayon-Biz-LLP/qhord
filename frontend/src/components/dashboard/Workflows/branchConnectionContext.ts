import { createContext } from "react";

// Lets ZapierNode know, live, which of its own named handles (true/false, a branch/case id,
// fallback) already have an outgoing edge — so it can offer a "+" to start a brand new branch
// instead of requiring the user to manually drag a connection from a bare handle.
export const BranchConnectionContext = createContext<{
  hasOutgoingEdge: (nodeId: string, handle: string) => boolean;
  onAddFromHandle: (nodeId: string, handle: string) => void;
}>({
  hasOutgoingEdge: () => true,
  onAddFromHandle: () => {},
});
