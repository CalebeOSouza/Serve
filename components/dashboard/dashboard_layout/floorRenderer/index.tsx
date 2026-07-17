"use client";

import { Trash2 } from "lucide-react";

export type Floor = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FloorHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

type Props = {
  floor: Floor;
  isSelected: boolean;
  isHovered: boolean;
  isDragging: boolean;
  zoom: number;

  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onResizeStart: (e: React.MouseEvent, handle: FloorHandle) => void;
  onDelete: (e: React.MouseEvent) => void;
};

const CURSOR_BY_HANDLE: Record<FloorHandle, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
};

const HANDLE_POSITION: Record<
  FloorHandle,
  { top: string; left: string }
> = {
  nw: { top: "0%", left: "0%" },
  n: { top: "0%", left: "50%" },
  ne: { top: "0%", left: "100%" },
  e: { top: "50%", left: "100%" },
  se: { top: "100%", left: "100%" },
  s: { top: "100%", left: "50%" },
  sw: { top: "100%", left: "0%" },
  w: { top: "50%", left: "0%" },
};

const ALL_HANDLES: FloorHandle[] = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
];

export default function FloorRenderer({
  floor,
  isSelected,
  isHovered,
  isDragging,
  zoom,
  onClick,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onResizeStart,
  onDelete,
}: Props) {
  const handleSize = 10;
  const borderWidth = 2;
  const deleteButtonOffset = 50;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e);
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute transition-shadow duration-150 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        top: floor.y,
        left: floor.x,
        width: floor.width,
        height: floor.height,
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Borda de seleção/hover */}
      {(isSelected || isHovered) && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[2px]"
          style={{
            border: `${borderWidth}px solid var(--color-secondary)`,
          }}
        />
      )}

      {/* Botão de excluir */}
      {isSelected && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white border border-gray-300 shadow-md rounded-md px-2 py-1 cursor-pointer"
          style={{ top: -deleteButtonOffset }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            className="text-red-500 hover:bg-gray-50 p-1 rounded transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Handles de resize */}
      {isSelected &&
        ALL_HANDLES.map((handle) => {
          const pos = HANDLE_POSITION[handle];
          return (
            <div
              key={handle}
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(e, handle);
              }}
              className="absolute bg-white border border-(--color-secondary) rounded-[2px] z-50"
              style={{
                top: pos.top,
                left: pos.left,
                width: handleSize,
                height: handleSize,
                transform: "translate(-50%, -50%)",
                cursor: CURSOR_BY_HANDLE[handle],
              }}
            />
          );
        })}
    </div>
  );
}