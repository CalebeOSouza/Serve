// /components/WallRenderer.tsx
import React from "react";
import { Trash2 } from "lucide-react";

export type Wall = {
  id: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
  side: "near" | "far"; // near = topo/esquerda da célula, far = baixo/direita
  wallType?: "externa" | "interna";
};

type Props = {
  wall: Wall;
  isSelected: boolean;
  isHovered: boolean;
  isDragging: boolean;
  zoom: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent, side: "start" | "end") => void;
  onDelete: (e: React.MouseEvent) => void;
};

const WALL_THICKNESS = 12.5; // espessura em px (meia célula de 25)
const WALL_THICKNESS_INTERNA = 6.25;

export default function WallRenderer({
  wall,
  isSelected,
  isHovered,
  isDragging,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onResizeStart,
  onDelete,
}: Props) {
  const isVertical = wall.rotation === 90;
  const thickness =
    wall.wallType === "interna" ? WALL_THICKNESS_INTERNA : WALL_THICKNESS;
  const displayW = isVertical ? thickness : wall.width;
  const displayH = isVertical ? wall.width : thickness;
  const borderRadius = wall.wallType === "interna" ? 0 : 10;

  return (
    <div
      className="absolute"
      style={{
        left: wall.x,
        top: wall.y,
        width: displayW,
        height: displayH,
        zIndex: isSelected
      ? 9999
      : wall.wallType === "externa"
        ? 20
        : 10,
        cursor: "move",
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {(isSelected || isHovered) && (
        <div
          className="absolute pointer-events-none rounded-sm"
          style={{
            inset: -3,
            border: "2px solid #6366f1",
            borderRadius: borderRadius,
          }}
        />
      )}

      {/* CORPO DA PAREDE */}
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: wall.wallType === "externa" ? "#59595B" : "#C3C5C9",
          borderRadius: borderRadius,
          opacity: isDragging ? 0.7 : 1,
          boxSizing: "border-box",
          
        }}
      />

      {/* BOTÃO DELETE */}
      {isSelected && (
        <div
          className="absolute flex items-center gap-2 bg-white border border-gray-300 shadow-md rounded-md px-2 py-1"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            top: isVertical ? -43 : -40,
            bottom: isVertical ? "auto" : "auto",
            whiteSpace: "nowrap",
            zIndex: 10000,
          }}
        >
          <button
            onClick={onDelete}
            className="text-red-500 hover:bg-red-100 p-1 rounded transition"
            title="Deletar parede"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Botão de resize - inicio*/}
      {isSelected && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, "start");
          }}
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            backgroundColor: "white",
            border: "2px solid #6366f1",
            borderRadius: 2,
            cursor: isVertical ? "ns-resize" : "ew-resize",
            zIndex: 10001,
            left: isVertical ? "50%" : 0,
            top: isVertical ? 0 : "50%",
            transform: isVertical
              ? "translate(-50%, -50%)"
              : "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Botão de resize - final */}
      {isSelected && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, "end");
          }}
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            backgroundColor: "white",
            border: "2px solid #6366f1",
            borderRadius: 2,
            cursor: isVertical ? "ns-resize" : "ew-resize",
            zIndex: 70,

            left: isVertical ? "50%" : "100%",
            top: isVertical ? "100%" : "50%",
            transform: isVertical
              ? "translate(-50%, -50%)"
              : "translate(-50%, -50%)",
          }}
        />
      )}
    </div>
  );
}
