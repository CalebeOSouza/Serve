import { Trash2, FlipHorizontal2, Users, Settings } from "lucide-react";
import type { MutableRefObject } from "react";

import type { AllCanvasItem } from "@/app/admin/dashboard/[id]/layout/types";
import { Role } from "@/components/restaurant/layout";
const elementSize = {
  mesa_quadrada: { w: 75, h: 75 },
  mesa_redonda: { w: 75, h: 75 },
  mesa_retangular: { w: 125, h: 75 },
  mesa_l: { w: 125, h: 125 },
  porta: { w: 50, h: 50 },
};

function getRotatedBoundingBox(w: number, h: number, rotationDeg: number) {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));

  return {
    width: w * cos + h * sin,
    height: w * sin + h * cos,
  };
}

type Props = {
  item: AllCanvasItem;
  role: Role;
  isSelected: boolean;
  isHovered: boolean;
  isDragging: boolean;
  isDragReady: boolean;

  panRef: MutableRefObject<{ x: number; y: number }>;
  zoomRef: MutableRefObject<number>;
  dragTimerRef: MutableRefObject<NodeJS.Timeout | null>;
  dragStartPos: MutableRefObject<{ x: number; y: number }>;
  dragStartItemPos: MutableRefObject<{ x: number; y: number }>;
  rotationStartRef: MutableRefObject<number>;

  onSelect: () => void;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
  onDelete: () => void;
  onFlipDoor: (id: string) => void;
  onOpenSettings: (id: string) => void;

  onDragStart: (itemId: string, offset: { x: number; y: number }) => void;

  onRotateStart: (itemId: string, rotationOffset: number) => void;

  renderElement: (item: AllCanvasItem) => React.ReactNode;
};

export default function CanvasItem({
  item,
  role,
  isSelected,
  isHovered,
  isDragging,
  isDragReady,
  panRef,
  zoomRef,
  dragTimerRef,
  dragStartPos,
  dragStartItemPos,
  rotationStartRef,
  onSelect,
  onHoverEnter,
  onHoverLeave,
  onDelete,
  onFlipDoor,
  onDragStart,
  onRotateStart,
  onOpenSettings,
  renderElement,
}: Props) {
  const size = elementSize[item.type];
  const rotation = item.rotation || 0;

  const bbox = getRotatedBoundingBox(size.w, size.h, rotation);

  const centerX = item.x + size.w / 2;
  const centerY = item.y + size.h / 2;

  const HANDLE_GAP = 20;
  const MENU_GAP = 50;

  function handleRotateMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    rotationStartRef.current = item.rotation;

    const container = document.getElementById("layout");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const cx = item.x + size.w / 2;
    const cy = item.y + size.h / 2;

    const mouseX = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
    const mouseY = (e.clientY - rect.top - panRef.current.y) / zoomRef.current;

    const angle = Math.atan2(mouseY - cy, mouseX - cx) * (180 / Math.PI);
    onRotateStart(item.id, angle - item.rotation);
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    e.stopPropagation();

    const container = document.getElementById("layout");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
    const mouseY = (e.clientY - rect.top - panRef.current.y) / zoomRef.current;

    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartItemPos.current = { x: item.x, y: item.y };

    dragTimerRef.current = setTimeout(() => {
      onDragStart(item.id, { x: mouseX - item.x, y: mouseY - item.y });
      dragTimerRef.current = null;
    }, 100);
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
      className="absolute"
      style={{
        left: centerX,
        top: centerY,
        width: 0,
        height: 0,
        zIndex: isSelected ? 100 : 1,
      }}
    >
      <div
        className="absolute"
        style={{
          width: size.w,
          height: size.h,
          left: -size.w / 2,
          top: -size.h / 2,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center center",
        }}
      >
        <div
          className={`relative w-full h-full ${
            isDragging && isDragReady ? "animate-drag-pickup" : ""
          }`}
        >
          {renderElement(item)}
        </div>

        {(isSelected || isHovered) &&
          (role !== "admin" && !("tableNumber" in item) ? null : (
            <div className="absolute -inset-1 border-2 border-(--color-secondary) rounded-md pointer-events-none" />
          ))}
      </div>

      {isSelected && 
      (role !== "admin" ? null : (
        <div
          className="absolute flex items-center gap-1 px-2 h-7 bg-white border border-gray-300 rounded-full cursor-grab shadow-md hover:scale-110 transition select-none text-xs z-50"
          style={{
            left: bbox.width / 2 + HANDLE_GAP,
            top: 0,
            transform: "translateY(-50%)",
          }}
          onMouseDown={handleRotateMouseDown}
        >
          ⟳ <span className="text-[10px] text-gray-500">R</span>
        </div>
      ))}

      {isSelected && 
      (role !== "admin" ? null : (
        <div
          className="absolute flex items-center gap-2 bg-white border border-gray-300 shadow-md rounded-md px-2 py-1 cursor-pointer z-50"
          style={{
            left: 0,
            top: -(bbox.height / 2 + MENU_GAP),
            transform: "translateX(-50%)",
          }}
        >
          {item.type === "porta" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFlipDoor(item.id);
              }}
              className="text-(--color-primary) hover:bg-gray-50 p-1 rounded transition cursor-pointer"
            >
              <FlipHorizontal2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-500 hover:bg-gray-50 p-1 rounded transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {item.type !== "porta" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings(item.id);
              }}
              className="text-(--color-secondary) hover:bg-gray-50 p-1 rounded transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
