import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath, getStraightPath, Position } from '@xyflow/react';
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
  // Branch children are laid out to land exactly under their source handle,
  // but a couple of px of layout/measurement rounding is enough to make
  // getSmoothStepPath draw a visible little kink instead of one clean line.
  // Snap to a true straight line whenever the two are close enough that a
  // kink would just be visual noise, not a real horizontal offset worth
  // routing around.
  const isNearlyAligned = Math.abs(sourceX - targetX) < 4;
  const [edgePath, labelX, labelY] = isNearlyAligned
    ? getStraightPath({ sourceX, sourceY, targetX, targetY })
    : getSmoothStepPath({
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
