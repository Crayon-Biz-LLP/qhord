import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath, Position } from '@xyflow/react';
import { Plus } from 'lucide-react';

export const ZapierEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: sourcePosition || Position.Bottom,
    targetX,
    targetY,
    targetPosition: targetPosition || Position.Top,
    borderRadius: 8,
  });

  const onAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const edgeData = data as { onAddNode?: (id: string) => void } | undefined;
    if (edgeData?.onAddNode) {
      edgeData.onAddNode(id);
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 2, stroke: '#94a3b8' }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            onClick={onAddClick}
            className="w-6 h-6 bg-white border border-slate-300 rounded-full flex items-center justify-center text-slate-400 hover:text-brand-gold hover:border-brand-gold hover:bg-brand-gold/10 shadow-sm transition-all z-10"
            title="Add a step"
          >
            <Plus size={14} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
