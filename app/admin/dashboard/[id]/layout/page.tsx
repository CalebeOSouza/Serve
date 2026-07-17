"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import AnimatedAlert from "@/components/alert/AnimatedAlert";
import {
  isRectTableVertical,
  isRectTableHorizontalFlipped,
  isRectTableVerticalFlipped,
  getLTableCorner,
} from "../../../../../utils/layout/tableContentRotation";

import WallRenderer, {
  Wall,
} from "@/components/dashboard/dashboard_layout/wallRenderer";
import { useRef } from "react";
import ElementsSidebar from "@/components/dashboard/dashboard_layout/elementsSidebar";
import ZoomControls from "@/components/dashboard/dashboard_layout/zoomControls";
import ToolbarActions from "@/components/dashboard/dashboard_layout/toolbarActions";
import FloorRenderer, {
  Floor,
  FloorHandle,
} from "@/components/dashboard/dashboard_layout/floorRenderer";
import type {
  LayoutItem,
  ElementType,
  Action,
  ElementConfig,
  RestaurantTable,
  TableType,
  AllCanvasItem,
} from "./types";
import CanvasItem from "@/components/dashboard/dashboard_layout/canvasItem";
import { TableOverlay } from "@/components/dashboard/dashboard_layout/tableOverlay";

import {
  GRID_SIZE,
  SNAP_THRESHOLD,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  WALL_THICKNESS,
  GRID_SIZE_WALL,
  HALF_GRID_SIZE_WALL,
  HALF_GRID_SIZE,
} from "@/utils/layout/constants";

import {
  snapToGrid,
  snapToHalfGrid,
  isWallTooSmall,
  getWallAnchorPoint,
} from "@/utils/layout/wall";

import { getAngle, getOBB } from "@/utils/layout/geometry";
import { applyAction, applyInverse } from "@/utils/layout/history";
import TableSettingsPanel from "@/components/dashboard/dashboard_layout/tableSettingsPanel";

export default function RestaurantLayout() {
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const rotationStartRef = useRef<number>(0);

  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const dragTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartItemPos = useRef({ x: 0, y: 0 });

  const isAltPressedRef = useRef(false);
  // Contador dos numeros das mesas
  const nextTableNumberRef = useRef(1);
  const [guides, setGuides] = useState<{
    vertical: number | null;
    horizontal: number | null;
    distanceX?: number;
    distanceY?: number;
  }>({ vertical: null, horizontal: null });

  const [previewItem, setPreviewItem] = useState<AllCanvasItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedType, setSelectedType] = useState<
    TableType | ElementType | "parede" | "parede_interna" | "piso" | null
  >(null);
  const [rotation, setRotation] = useState(0);
  const [lastMouseX, setLastMouseX] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragReady, setIsDragReady] = useState(false);
  const [zoomInput, setZoomInput] = useState("100");
  const [gridEnabled, setGridEnabled] = useState(true);
  const [layoutState, setLayoutState] = useState<{
    items: AllCanvasItem[];
    walls: Wall[];
    floors: Floor[];
    history: Action[];
    future: Action[];
  }>({ items: [], walls: [], floors: [], history: [], future: [] });

  const [wallDrawing, setWallDrawing] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isVertical: boolean;
    wallType: "externa" | "interna";
  } | null>(null);

  const [wallResizing, setWallResizing] = useState<{
    wallId: string;
    side: "start" | "end";
    originalWall: Wall;
  } | null>(null);

  const [draggingWallId, setDraggingWallId] = useState<string | null>(null);
  const [wallDragOffset, setWallDragOffset] = useState({ x: 0, y: 0 });
  const wallDragStartPos = useRef<{ x: number; y: number } | null>(null);
  const [hoveredWallId, setHoveredWallId] = useState<string | null>(null);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  const [isWallModeActive, setIsWallModeActive] = useState<
    false | "externa" | "interna"
  >(false);

  const wallDragTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wallDragClientStartRef = useRef({ x: 0, y: 0 });
  const [isWallDragReady, setIsWallDragReady] = useState(false);

  // ---- PISO ----
  const [isFloorModeActive, setIsFloorModeActive] = useState(false);

  const [floorDrawing, setFloorDrawing] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const [draggingFloorId, setDraggingFloorId] = useState<string | null>(null);
  const [floorDragOffset, setFloorDragOffset] = useState({ x: 0, y: 0 });
  const floorDragStartPos = useRef<{ x: number; y: number } | null>(null);

  const [hoveredFloorId, setHoveredFloorId] = useState<string | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);

  const floorDragTimerRef = useRef<NodeJS.Timeout | null>(null);
  const floorDragClientStartRef = useRef({ x: 0, y: 0 });
  const [isFloorDragReady, setIsFloorDragReady] = useState(false);

  const [floorResizing, setFloorResizing] = useState<{
    floorId: string;
    handle: FloorHandle;
    originalFloor: Floor;
  } | null>(null);

  const [settingsTableId, setSettingsTableId] = useState<string | null>(null);

  const { items, walls, floors, history, future } = layoutState;

  const [clipboard, setClipboard] = useState<
    | { type: "item"; data: AllCanvasItem }
    | { type: "wall"; data: Wall }
    | { type: "floor"; data: Floor }
    | null
  >(null);

  const elementSize = {
    mesa_quadrada: { w: 75, h: 75 },
    mesa_redonda: { w: 75, h: 75 },
    mesa_retangular: { w: 125, h: 75 },
    mesa_l: { w: 125, h: 125 },
    porta: { w: 50, h: 50 },
  };

  function isDoor(item: AllCanvasItem): item is LayoutItem & { type: "porta" } {
    return item.type === "porta";
  }

  function isRestaurantTable(item: AllCanvasItem): item is RestaurantTable {
    return (
      item.type === "mesa_quadrada" ||
      item.type === "mesa_redonda" ||
      item.type === "mesa_retangular" ||
      item.type === "mesa_l"
    );
  }

  function normalizeRotation(rotation: number) {
    return ((rotation % 360) + 360) % 360;
  }

  function isCardinalRotation(rotation: number) {
    const r = normalizeRotation(rotation);

    return r === 0 || r === 90 || r === 180 || r === 270;
  }

  function getInternalRotation(rotation: number) {
    if (!isCardinalRotation(rotation)) {
      return 0;
    }

    return -rotation;
  }

  function snapItemToHalfGrid(value: number) {
    return Math.round(value / HALF_GRID_SIZE) * HALF_GRID_SIZE;
  }

  const QUARTER_GRID_SIZE = GRID_SIZE / 4;

  function snapDoorToQuarterGrid(value: number) {
    return Math.round(value / QUARTER_GRID_SIZE) * QUARTER_GRID_SIZE;
  }

  const snapFloorToGrid = snapItemToHalfGrid;

  function isFloorTooSmall(ax: number, ay: number, bx: number, by: number) {
    return (
      Math.abs(bx - ax) < HALF_GRID_SIZE && Math.abs(by - ay) < HALF_GRID_SIZE
    );
  }

  function startRotateWithOffset(itemId: string, rotationOffset: number) {
    setSelectedItemId(itemId);
    setIsRotating(true);
    setRotationOffset(rotationOffset);
  }

  function undo() {
    setLayoutState((s) => {
      if (s.history.length === 0) return s;
      const action = s.history[s.history.length - 1];
      const result = applyInverse(s.items, s.walls, s.floors, action);
      return {
        items: result.items,
        walls: result.walls,
        floors: result.floors,
        history: s.history.slice(0, -1),
        future: [action, ...s.future],
      };
    });
  }

  function redo() {
    setLayoutState((s) => {
      if (s.future.length === 0) return s;
      const action = s.future[0];
      const result = applyAction(s.items, s.walls, s.floors, action);
      return {
        items: result.items,
        walls: result.walls,
        floors: result.floors,
        history: [...s.history, action],
        future: s.future.slice(1),
      };
    });
  }

  function applySnap(x: number, y: number, currentId?: string) {
    if (isAltPressedRef.current) {
      setGuides({ vertical: null, horizontal: null });
      return { x, y };
    }

    const myItem = currentId
      ? items.find((i) => i.id === currentId)
      : previewItem;

    if (!myItem) {
      setGuides({ vertical: null, horizontal: null });
      return { x, y };
    }

    const mySize = elementSize[myItem.type];
    const myRotation = myItem.rotation || 0;

    const THRESHOLD = 8;

    let snappedX = x;
    let snappedY = y;

    if (!isAltPressedRef.current) {
      if (myItem.type === "porta") {
        snappedX = snapDoorToQuarterGrid(x);
        snappedY = snapDoorToQuarterGrid(y);
      } else {
        snappedX = snapItemToHalfGrid(x);
        snappedY = snapItemToHalfGrid(y);
      }
    }

    if (!gridEnabled) {
      setGuides({ vertical: null, horizontal: null });
      return { x: snappedX, y: snappedY };
    }

    let currentOBB = getOBB(snappedX, snappedY, mySize.w, mySize.h, myRotation);

    type Candidate = { offset: number; guide: number };
    let bestX: Candidate | null = null;
    let bestY: Candidate | null = null;

    const myEdgesX = [currentOBB.left, currentOBB.cx, currentOBB.right];
    const myEdgesY = [currentOBB.top, currentOBB.cy, currentOBB.bottom];

    items.forEach((other) => {
      if (other.id === currentId) return;

      const otherSize = elementSize[other.type];
      const otherOBB = getOBB(
        other.x,
        other.y,
        otherSize.w,
        otherSize.h,
        other.rotation || 0,
      );

      const targetX = [otherOBB.left, otherOBB.cx, otherOBB.right];
      const targetY = [otherOBB.top, otherOBB.cy, otherOBB.bottom];

      myEdgesX.forEach((myEdge) => {
        targetX.forEach((target) => {
          const dist = Math.abs(myEdge - target);
          if (dist < THRESHOLD) {
            const offset = target - myEdge;
            if (!bestX || dist < Math.abs(bestX.offset)) {
              bestX = { offset, guide: target };
            }
          }
        });
      });

      myEdgesY.forEach((myEdge) => {
        targetY.forEach((target) => {
          const dist = Math.abs(myEdge - target);
          if (dist < THRESHOLD) {
            const offset = target - myEdge;
            if (!bestY || dist < Math.abs(bestY.offset)) {
              bestY = { offset, guide: target };
            }
          }
        });
      });
    });

    if (bestX) snappedX += (bestX as Candidate).offset;
    if (bestY) snappedY += (bestY as Candidate).offset;

    setGuides({
      vertical: bestX ? (bestX as Candidate).guide : null,
      horizontal: bestY ? (bestY as Candidate).guide : null,
    });

    return { x: snappedX, y: snappedY };
  }

  function wallFromDrag(ax: number, ay: number, bx: number, by: number) {
    const dx = Math.abs(bx - ax);
    const dy = Math.abs(by - ay);

    const distance = Math.sqrt(dx * dx + dy * dy);

    const isVertical = distance < GRID_SIZE_WALL ? false : dy >= dx;

    if (isAltPressedRef.current) {
      if (isVertical) {
        return {
          x: ax - WALL_THICKNESS / 2,
          y: Math.min(ay, by),
          width: Math.max(WALL_THICKNESS, Math.abs(by - ay)),
          isVertical: true,
          side: "near" as const,
        };
      }
      return {
        x: Math.min(ax, bx),
        y: ay - WALL_THICKNESS / 2,
        width: Math.max(WALL_THICKNESS, Math.abs(bx - ax)),
        isVertical: false,
        side: "near" as const,
      };
    }

    if (isVertical) {
      const goingUp = by < ay;
      const nearestLineX = Math.round(ax / GRID_SIZE_WALL) * GRID_SIZE_WALL;

      const side: "near" | "far" = ax >= nearestLineX ? "far" : "near";
      const x = side === "near" ? nearestLineX - WALL_THICKNESS : nearestLineX;

      const startY = snapToHalfGrid(Math.min(ay, by));
      const endY = snapToHalfGrid(Math.max(ay, by));
      const shiftedY = goingUp ? startY + HALF_GRID_SIZE_WALL : startY;

      return {
        x,
        y: shiftedY,
        width: Math.max(GRID_SIZE_WALL, endY - startY),
        isVertical: true,
        side,
      };
    } else {
      const goingLeft = bx < ax;

      const nearestLineY = Math.round(ay / GRID_SIZE_WALL) * GRID_SIZE_WALL;

      const side: "near" | "far" = ay >= nearestLineY ? "far" : "near";
      const y = side === "near" ? nearestLineY - WALL_THICKNESS : nearestLineY;

      const startX = snapToHalfGrid(Math.min(ax, bx));
      const endX = snapToHalfGrid(Math.max(ax, bx));
      const shiftedX = goingLeft ? startX + HALF_GRID_SIZE_WALL : startX;

      return {
        x: shiftedX,
        y,
        width: Math.max(GRID_SIZE_WALL, endX - startX),
        isVertical: false,
        side,
      };
    }
  }

  function spawnElement(type: TableType | ElementType) {
    setSelectedType(type);

    const container = document.getElementById("layout");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const size = elementSize[type];

    const rawX =
      (mousePos.x - rect.left - panRef.current.x) / zoomRef.current -
      size.w / 2;

    const rawY =
      (mousePos.y - rect.top - panRef.current.y) / zoomRef.current - size.h / 2;

    const isDoor = type === "porta";

    const newItem: AllCanvasItem = {
      id: crypto.randomUUID(),
      type,
      x: isDoor ? snapDoorToQuarterGrid(rawX) : snapItemToHalfGrid(rawX),
      y: isDoor ? snapDoorToQuarterGrid(rawY) : snapItemToHalfGrid(rawY),
      rotation: 0,
      swingDirection: "left",
    };

    setPreviewItem(newItem);
  }

  function applyTransformDirect(
    newZoom: number,
    newPan: { x: number; y: number },
  ) {
    const world = worldRef.current;
    if (!world) return;
    world.style.transform = `translate(${newPan.x}px, ${newPan.y}px) scale(${newZoom})`;
  }

  function applyZoom(newZoom: number) {
    const el = layoutRef.current;
    if (!el) return;

    const currentZoom = zoomRef.current;
    const currentPan = panRef.current;

    const centerX = el.clientWidth / 2;
    const centerY = el.clientHeight / 2;

    const worldX = (centerX - currentPan.x) / currentZoom;
    const worldY = (centerY - currentPan.y) / currentZoom;

    let newX = centerX - worldX * newZoom;
    let newY = centerY - worldY * newZoom;

    const minX = el.clientWidth - WORLD_WIDTH * newZoom;
    const minY = el.clientHeight - WORLD_HEIGHT * newZoom;

    newX =
      minX < 0
        ? Math.max(minX, Math.min(0, newX))
        : (el.clientWidth - WORLD_WIDTH * newZoom) / 2;
    newY =
      minY < 0
        ? Math.max(minY, Math.min(0, newY))
        : (el.clientHeight - WORLD_HEIGHT * newZoom) / 2;

    zoomRef.current = newZoom;
    panRef.current = { x: newX, y: newY };

    applyTransformDirect(newZoom, { x: newX, y: newY });
    setZoom(newZoom);
    setPan({ x: newX, y: newY });
  }

  useEffect(() => {
    setZoomInput(String(Math.round(zoom * 100)));
  }, [zoom]);

  // UseEffect de centralizar o usuário no meio do layout
  useEffect(() => {
    const el = layoutRef.current;
    if (!el) return;

    const centerX = (el.clientWidth - WORLD_WIDTH * zoomRef.current) / 2;
    const centerY = (el.clientHeight - WORLD_HEIGHT * zoomRef.current) / 2;

    setPan({
      x: centerX,
      y: centerY,
    });
  }, []);

  // UseEffect para rastrear a posição do mouse
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // UseEffect exclusivo para o Alt — sempre ativo, nunca re-registra
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Alt") {
        e.preventDefault();
        isAltPressedRef.current = true;
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === "Alt") {
        isAltPressedRef.current = false;
      }
    }

    function handleBlur() {
      isAltPressedRef.current = false;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // UseEffect para atalhos de teclado
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;

      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTyping) return;

      if (e.key === "Escape") {
        setPreviewItem(null);
        setGuides({ vertical: null, horizontal: null });
        setWallDrawing(null);
        setIsWallModeActive(false);
        setFloorDrawing(null);
        setIsFloorModeActive(false);
        setSelectedType(null);
        setSelectedWallId(null);
        setSelectedFloorId(null);
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();

        if (selectedItemId) {
          setLayoutState((s) => {
            const itemToRemove = s.items.find((i) => i.id === selectedItemId);
            if (!itemToRemove) return s;
            return {
              ...s,
              items: s.items.filter((i) => i.id !== selectedItemId),
              history: [
                ...s.history,
                { type: "REMOVE", id: selectedItemId, item: itemToRemove },
              ],
              future: [],
            };
          });
          setSelectedItemId(null);
        }

        if (selectedWallId) {
          setLayoutState((s) => {
            const wallToRemove = s.walls.find((w) => w.id === selectedWallId);
            if (!wallToRemove) return s;
            return {
              ...s,
              walls: s.walls.filter((w) => w.id !== selectedWallId),
              history: [
                ...s.history,
                {
                  type: "REMOVE_WALL",
                  id: selectedWallId,
                  wall: wallToRemove,
                },
              ],
              future: [],
            };
          });
          setSelectedWallId(null);
        }

        if (selectedFloorId) {
          setLayoutState((s) => {
            const floorToRemove = s.floors.find(
              (f) => f.id === selectedFloorId,
            );
            if (!floorToRemove) return s;
            return {
              ...s,
              floors: s.floors.filter((f) => f.id !== selectedFloorId),
              history: [
                ...s.history,
                {
                  type: "REMOVE_FLOOR",
                  id: selectedFloorId,
                  floor: floorToRemove,
                },
              ],
              future: [],
            };
          });
          setSelectedFloorId(null);
        }
      }

      if (e.key.toLowerCase() === "r") {
        if (previewItem) {
          setPreviewItem((prev) =>
            prev ? { ...prev, rotation: (prev.rotation + 90) % 360 } : null,
          );
          return;
        }

        if (selectedItemId) {
          setLayoutState((s) => {
            const item = s.items.find((i) => i.id === selectedItemId);
            if (!item) return s;

            const newRotation = (item.rotation + 90) % 360;

            return {
              ...s,
              items: s.items.map((i) =>
                i.id === selectedItemId ? { ...i, rotation: newRotation } : i,
              ),
              history: [
                ...s.history,
                {
                  type: "ROTATE",
                  id: item.id,
                  from: item.rotation,
                  to: newRotation,
                },
              ],
              future: [],
            };
          });
        }
      }

      if (e.key.toLowerCase() === "f") {
        if (!selectedItemId) return;

        setLayoutState((s) => {
          const item = s.items.find((i) => i.id === selectedItemId);

          if (!item) return s;
          if (item.type !== "porta") return s;

          const from = item.swingDirection ?? "left";
          const to = from === "left" ? "right" : "left";

          return {
            ...s,

            items: s.items.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    swingDirection: to,
                  }
                : i,
            ),

            history: [
              ...s.history,
              {
                type: "FLIP_DOOR",
                id: item.id,
                from,
                to,
              },
            ],

            future: [],
          };
        });
      }
      // CTRL + C
      if (e.ctrlKey && e.key.toLowerCase() === "c") {
        e.preventDefault();

        if (selectedItemId) {
          const item = items.find((i) => i.id === selectedItemId);

          if (item) {
            setClipboard({
              type: "item",
              data: item,
            });

            console.log("ITEM COPIADO:", item);
          }
        }

        if (selectedWallId) {
          const wall = walls.find((w) => w.id === selectedWallId);

          if (wall) {
            setClipboard({
              type: "wall",
              data: wall,
            });

            console.log("PAREDE COPIADA:", wall);
          }
        }

        if (selectedFloorId) {
          const floor = floors.find((f) => f.id === selectedFloorId);

          if (floor) {
            setClipboard({
              type: "floor",
              data: floor,
            });

            console.log("PISO COPIADO:", floor);
          }
        }
      }

      function isRestaurantTable(item: AllCanvasItem): item is RestaurantTable {
        return (
          item.type === "mesa_quadrada" ||
          item.type === "mesa_redonda" ||
          item.type === "mesa_retangular" ||
          item.type === "mesa_l"
        );
      }

      // CTRL + V
      if (e.ctrlKey && e.key.toLowerCase() === "v") {
        e.preventDefault();

        if (!clipboard) return;

        const OFFSET = 25;

        if (clipboard.type === "item") {
          const original = clipboard.data;

          const isTable =
            original.type === "mesa_quadrada" ||
            original.type === "mesa_redonda" ||
            original.type === "mesa_retangular" ||
            original.type === "mesa_l";

          const newItem: AllCanvasItem = isRestaurantTable(original)
            ? {
                ...original,
                id: crypto.randomUUID(),
                x: original.x + OFFSET,
                y: original.y + OFFSET,
                tableNumber: nextTableNumberRef.current++,
              }
            : {
                ...original,
                id: crypto.randomUUID(),
                x: original.x + OFFSET,
                y: original.y + OFFSET,
              };

          setLayoutState((s) => ({
            ...s,
            items: [...s.items, newItem],
            history: [
              ...s.history,
              {
                type: "PASTE",
                item: newItem,
              },
            ],
            future: [],
          }));

          setSelectedItemId(newItem.id);
          setSelectedWallId(null);

          console.log("ITEM COLADO:", newItem);
        }

        if (clipboard.type === "wall") {
          const original = clipboard.data;

          const newWall: Wall = {
            ...original,
            id: crypto.randomUUID(),
            x: original.x + OFFSET,
            y: original.y + OFFSET,
          };

          setLayoutState((s) => ({
            ...s,
            walls: [...s.walls, newWall],
            history: [
              ...s.history,
              {
                type: "PASTE_WALL",
                wall: newWall,
              },
            ],
            future: [],
          }));

          setSelectedWallId(newWall.id);
          setSelectedItemId(null);

          console.log("PAREDE COLADA:", newWall);
        }

        if (clipboard.type === "floor") {
          const original = clipboard.data;

          const newFloor: Floor = {
            ...original,
            id: crypto.randomUUID(),
            x: original.x + OFFSET,
            y: original.y + OFFSET,
          };

          setLayoutState((s) => ({
            ...s,
            floors: [...s.floors, newFloor],
            history: [...s.history, { type: "PASTE_FLOOR", floor: newFloor }],
            future: [],
          }));

          setSelectedFloorId(newFloor.id);
          setSelectedItemId(null);
          setSelectedWallId(null);

          console.log("PISO COLADO:", newFloor);
        }
      }

      if (e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }

      if (
        (e.ctrlKey && e.key.toLowerCase() === "y") ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [
    previewItem,
    selectedItemId,
    selectedWallId,
    selectedFloorId,
    clipboard,
    items,
    walls,
    floors,
  ]);

  // UseEffect para suavizar a animação dos elementos
  useEffect(() => {
    if (!previewItem) return;

    const timeout = setTimeout(() => {
      setRotation((r) => r * 0.8);
    }, 8); // 30fps

    return () => clearTimeout(timeout);
  }, [rotation, previewItem]);

  // UseEffect para rotação dos elementos
  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (!isRotating || !selectedItemId) return;

      const container = document.getElementById("layout");
      if (!container) return;

      const rect = container.getBoundingClientRect();

      setLayoutState((s) => ({
        ...s,
        items: s.items.map((item) => {
          if (item.id !== selectedItemId) return item;
          const size = elementSize[item.type];
          const centerX = item.x + size.w / 2;
          const centerY = item.y + size.h / 2;
          const mouseX =
            (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
          const mouseY =
            (e.clientY - rect.top - panRef.current.y) / zoomRef.current;
          const angle = getAngle(centerX, centerY, mouseX, mouseY);

          let newRotation = angle - rotationOffset;

          if (!isAltPressedRef.current) {
            const snapAngles = [0, 90, 180, 270, 360, -90, -180, -270];
            const ROTATION_SNAP_THRESHOLD = 6;

            function angleDiff(a: number, b: number) {
              let diff = ((a - b + 180) % 360) - 180;
              if (diff < -180) diff += 360;
              return diff;
            }

            let bestSnap: number | null = null;
            let bestDist = Infinity;

            for (const snap of snapAngles) {
              const dist = Math.abs(angleDiff(newRotation, snap));
              if (dist < ROTATION_SNAP_THRESHOLD && dist < bestDist) {
                bestDist = dist;
                bestSnap = snap;
              }
            }

            if (bestSnap !== null) {
              newRotation = bestSnap;
            }
          }

          return { ...item, rotation: newRotation };
        }),
      }));
    }

    function stopRotate() {
      setLayoutState((s) => {
        const item = s.items.find((i) => i.id === selectedItemId);
        if (!item) return s;

        const didRotate =
          Math.abs(item.rotation - rotationStartRef.current) > 0.1;
        if (!didRotate) return s;

        return {
          ...s,
          history: [
            ...s.history,
            {
              type: "ROTATE",
              id: item.id,
              from: rotationStartRef.current,
              to: item.rotation,
            },
          ],
          future: [],
        };
      });

      setIsRotating(false);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopRotate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopRotate);
    };
  }, [isRotating, selectedItemId, rotationOffset]);

  // UseEffect do pan - movimentação do layout
  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (!isPanning) return;

      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;

      const currentZoom = zoomRef.current;
      const prev = panRef.current;

      const newX = prev.x + dx;
      const newY = prev.y + dy;

      const el = layoutRef.current!;
      const minX = el.clientWidth - WORLD_WIDTH * currentZoom;
      const minY = el.clientHeight - WORLD_HEIGHT * currentZoom;

      const clampedX =
        minX < 0
          ? Math.max(minX, Math.min(0, newX))
          : (el.clientWidth - WORLD_WIDTH * currentZoom) / 2;
      const clampedY =
        minY < 0
          ? Math.max(minY, Math.min(0, newY))
          : (el.clientHeight - WORLD_HEIGHT * currentZoom) / 2;

      panRef.current = { x: clampedX, y: clampedY };
      applyTransformDirect(currentZoom, panRef.current);
      setPan({ x: clampedX, y: clampedY });

      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }

    function stopPan() {
      setIsPanning(false);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopPan);

    window.addEventListener("mouseleave", stopPan);
    window.addEventListener("blur", stopPan);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopPan);
      window.removeEventListener("mouseleave", stopPan);
      window.removeEventListener("blur", stopPan);
    };
  }, [isPanning, lastPanPoint]);

  // Use effect do zoom

  useEffect(() => {
    const el = layoutRef.current;
    if (!el) return;

    const initX = (el.clientWidth - WORLD_WIDTH) / 2;
    const initY = (el.clientHeight - WORLD_HEIGHT) / 2;

    zoomRef.current = 1;
    panRef.current = { x: initX, y: initY };
    applyTransformDirect(1, panRef.current);

    setZoom(1);
    setPan({ x: initX, y: initY });

    function handleWheel(e: WheelEvent) {
      const el = layoutRef.current;
      if (!el) return;
      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;

      const zoomFactor = Math.exp(-e.deltaY * 0.0015);
      const newZoom = Math.max(0.4, Math.min(3, currentZoom * zoomFactor));

      const worldX = (mouseX - currentPan.x) / currentZoom;
      const worldY = (mouseY - currentPan.y) / currentZoom;

      let newX = mouseX - worldX * newZoom;
      let newY = mouseY - worldY * newZoom;

      const minX = el.clientWidth - WORLD_WIDTH * newZoom;
      const minY = el.clientHeight - WORLD_HEIGHT * newZoom;

      newX =
        minX < 0
          ? Math.max(minX, Math.min(0, newX))
          : (el.clientWidth - WORLD_WIDTH * newZoom) / 2;

      newY =
        minY < 0
          ? Math.max(minY, Math.min(0, newY))
          : (el.clientHeight - WORLD_HEIGHT * newZoom) / 2;

      zoomRef.current = newZoom;
      panRef.current = { x: newX, y: newY };

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        applyTransformDirect(newZoom, { x: newX, y: newY });
        setZoom(newZoom);
      });
    }

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Use effect da movimentação dos elementos

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (!draggingItemId || !isDragReady) return;

      const container = document.getElementById("layout");
      if (!container) return;

      const rect = container.getBoundingClientRect();

      const mouseX =
        (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
      const mouseY =
        (e.clientY - rect.top - panRef.current.y) / zoomRef.current;

      setLayoutState((s) => ({
        ...s,
        items: s.items.map((item) =>
          item.id === draggingItemId
            ? (() => {
                const rawX = mouseX - dragOffset.x;
                const rawY = mouseY - dragOffset.y;

                const snapped = applySnap(rawX, rawY, item.id);

                return { ...item, x: snapped.x, y: snapped.y };
              })()
            : item,
        ),
      }));
    }

    function stopDrag() {
      if (draggingItemId) {
        setLayoutState((s) => {
          const item = s.items.find((i) => i.id === draggingItemId);
          if (!item) return s;

          const didMove =
            Math.abs(item.x - dragStartItemPos.current.x) > 0.5 ||
            Math.abs(item.y - dragStartItemPos.current.y) > 0.5;

          if (!didMove) return s;

          return {
            ...s,
            history: [
              ...s.history,
              {
                type: "MOVE",
                id: item.id,
                from: dragStartItemPos.current,
                to: { x: item.x, y: item.y },
              },
            ],
            future: [],
          };
        });
      }
      setGuides({ vertical: null, horizontal: null });
      setDraggingItemId(null);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopDrag);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [draggingItemId, dragOffset]);

  // UseEffect do resize de parede
  useEffect(() => {
    if (!wallResizing) return;

    function handleMove(e: MouseEvent) {
      const container = document.getElementById("layout");
      if (!container || !wallResizing) return;

      const rect = container.getBoundingClientRect();
      const mouseX =
        (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
      const mouseY =
        (e.clientY - rect.top - panRef.current.y) / zoomRef.current;

      const snappedX = isAltPressedRef.current
        ? mouseX
        : snapToHalfGrid(mouseX);

      const snappedY = isAltPressedRef.current
        ? mouseY
        : snapToHalfGrid(mouseY);

      setLayoutState((s) => ({
        ...s,
        walls: s.walls.map((w) => {
          if (w.id !== wallResizing.wallId) return w;
          const isVertical = w.rotation === 90;
          const orig = wallResizing.originalWall;

          if (wallResizing.side === "end") {
            if (isVertical) {
              const newHeight = Math.max(GRID_SIZE_WALL, snappedY - orig.y);
              return { ...w, width: newHeight };
            } else {
              const newWidth = Math.max(GRID_SIZE_WALL, snappedX - orig.x);
              return { ...w, width: newWidth };
            }
          } else {
            if (isVertical) {
              const endY = orig.y + orig.width;
              const newY = Math.min(snappedY, endY - GRID_SIZE_WALL);
              const newWidth = endY - newY;
              return { ...w, y: newY, width: newWidth };
            } else {
              const endX = orig.x + orig.width;
              const newX = Math.min(snappedX, endX - GRID_SIZE_WALL);
              const newWidth = endX - newX;
              return { ...w, x: newX, width: newWidth };
            }
          }
        }),
      }));
    }

    function stopResize() {
      if (!wallResizing) return;

      setLayoutState((s) => {
        const wall = s.walls.find((w) => w.id === wallResizing.wallId);
        if (!wall) return s;

        const orig = wallResizing.originalWall;
        const didChange =
          Math.abs(wall.x - orig.x) > 0.5 ||
          Math.abs(wall.y - orig.y) > 0.5 ||
          Math.abs(wall.width - orig.width) > 0.5;

        if (!didChange) return s;

        return {
          ...s,
          history: [
            ...s.history,
            {
              type: "RESIZE_WALL",
              id: wall.id,
              from: { x: orig.x, y: orig.y, width: orig.width },
              to: { x: wall.x, y: wall.y, width: wall.width },
            },
          ],
          future: [],
        };
      });

      setWallResizing(null);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopResize);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [wallResizing]);

  //UseEffect do drag de parede já posicionada
  useEffect(() => {
    if (!draggingWallId) return;

    function handleMove(e: MouseEvent) {
      const container = document.getElementById("layout");
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX =
        (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
      const mouseY =
        (e.clientY - rect.top - panRef.current.y) / zoomRef.current;

      setLayoutState((s) => ({
        ...s,
        walls: s.walls.map((w) => {
          if (w.id !== draggingWallId) return w;

          const isVertical = w.rotation === 90;

          const rawX = mouseX - wallDragOffset.x;
          const rawY = mouseY - wallDragOffset.y;

          // Movimento livre com o ALT
          if (isAltPressedRef.current) {
            return {
              ...w,
              x: rawX,
              y: rawY,
            };
          }

          const snappedX = snapToHalfGrid(rawX);
          const snappedY = snapToHalfGrid(rawY);

          return {
            ...w,
            x: snappedX,
            y: snappedY,
          };
        }),
      }));
    }

    function stopDrag() {
      setLayoutState((s) => {
        const wall = s.walls.find((w) => w.id === draggingWallId);
        if (!wall || !wallDragStartPos.current) return s;

        const didMove =
          Math.abs(wall.x - wallDragStartPos.current.x) > 0.5 ||
          Math.abs(wall.y - wallDragStartPos.current.y) > 0.5;

        if (!didMove) return s;

        return {
          ...s,
          history: [
            ...s.history,
            {
              type: "MOVE_WALL",
              id: wall.id,
              from: wallDragStartPos.current,
              to: { x: wall.x, y: wall.y },
            },
          ],
          future: [],
        };
      });

      wallDragStartPos.current = null;
      setDraggingWallId(null);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [draggingWallId, wallDragOffset]);

  // UseEffect do drag do piso já posicionado
  useEffect(() => {
    if (!draggingFloorId) return;

    function handleMove(e: MouseEvent) {
      const container = document.getElementById("layout");
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX =
        (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
      const mouseY =
        (e.clientY - rect.top - panRef.current.y) / zoomRef.current;

      setLayoutState((s) => ({
        ...s,
        floors: s.floors.map((f) => {
          if (f.id !== draggingFloorId) return f;

          const rawX = mouseX - floorDragOffset.x;
          const rawY = mouseY - floorDragOffset.y;

          const snappedX = isAltPressedRef.current
            ? rawX
            : snapFloorToGrid(rawX);
          const snappedY = isAltPressedRef.current
            ? rawY
            : snapFloorToGrid(rawY);

          return { ...f, x: snappedX, y: snappedY };
        }),
      }));
    }

    function stopDrag() {
      setLayoutState((s) => {
        const floor = s.floors.find((f) => f.id === draggingFloorId);
        if (!floor || !floorDragStartPos.current) return s;

        const didMove =
          Math.abs(floor.x - floorDragStartPos.current.x) > 0.5 ||
          Math.abs(floor.y - floorDragStartPos.current.y) > 0.5;

        if (!didMove) return s;

        return {
          ...s,
          history: [
            ...s.history,
            {
              type: "MOVE_FLOOR",
              id: floor.id,
              from: floorDragStartPos.current,
              to: { x: floor.x, y: floor.y },
            },
          ],
          future: [],
        };
      });

      floorDragStartPos.current = null;
      setDraggingFloorId(null);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [draggingFloorId, floorDragOffset]);

  // UseEffect do resize do piso
  useEffect(() => {
    if (!floorResizing) return;

    function handleMove(e: MouseEvent) {
      const container = document.getElementById("layout");
      if (!container || !floorResizing) return;

      const rect = container.getBoundingClientRect();
      const mouseX =
        (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
      const mouseY =
        (e.clientY - rect.top - panRef.current.y) / zoomRef.current;

      const snappedX = isAltPressedRef.current
        ? mouseX
        : snapFloorToGrid(mouseX);
      const snappedY = isAltPressedRef.current
        ? mouseY
        : snapFloorToGrid(mouseY);

      setLayoutState((s) => ({
        ...s,
        floors: s.floors.map((f) => {
          if (f.id !== floorResizing.floorId) return f;

          const orig = floorResizing.originalFloor;
          const handle = floorResizing.handle;

          let { x, y, width, height } = f;
          const MIN_SIZE = HALF_GRID_SIZE;

          if (handle.includes("e")) {
            width = Math.max(MIN_SIZE, snappedX - orig.x);
            x = orig.x;
          }
          if (handle.includes("w")) {
            const rightEdge = orig.x + orig.width;
            const newX = Math.min(snappedX, rightEdge - MIN_SIZE);
            x = newX;
            width = rightEdge - newX;
          }
          if (handle.includes("s")) {
            height = Math.max(MIN_SIZE, snappedY - orig.y);
            y = orig.y;
          }
          if (handle.includes("n")) {
            const bottomEdge = orig.y + orig.height;
            const newY = Math.min(snappedY, bottomEdge - MIN_SIZE);
            y = newY;
            height = bottomEdge - newY;
          }

          return { ...f, x, y, width, height };
        }),
      }));
    }

    function stopResize() {
      if (!floorResizing) return;

      setLayoutState((s) => {
        const floor = s.floors.find((f) => f.id === floorResizing.floorId);
        if (!floor) return s;

        const orig = floorResizing.originalFloor;
        const didChange =
          Math.abs(floor.x - orig.x) > 0.5 ||
          Math.abs(floor.y - orig.y) > 0.5 ||
          Math.abs(floor.width - orig.width) > 0.5 ||
          Math.abs(floor.height - orig.height) > 0.5;

        if (!didChange) return s;

        return {
          ...s,
          history: [
            ...s.history,
            {
              type: "RESIZE_FLOOR",
              id: floor.id,
              from: {
                x: orig.x,
                y: orig.y,
                width: orig.width,
                height: orig.height,
              },
              to: {
                x: floor.x,
                y: floor.y,
                width: floor.width,
                height: floor.height,
              },
            },
          ],
          future: [],
        };
      });

      setFloorResizing(null);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopResize);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [floorResizing]);

  useEffect(() => {
    function cancelItemDrag() {
      if (dragTimerRef.current) {
        clearTimeout(dragTimerRef.current);
        dragTimerRef.current = null;
      }
      setIsDragReady(false);
    }

    function cancelWallDrag() {
      if (wallDragTimerRef.current) {
        clearTimeout(wallDragTimerRef.current);
        wallDragTimerRef.current = null;
      }
      setIsWallDragReady(false);
    }

    function cancelFloorDrag() {
      if (floorDragTimerRef.current) {
        clearTimeout(floorDragTimerRef.current);
        floorDragTimerRef.current = null;
      }
      setIsFloorDragReady(false);
    }

    function handleMouseUp() {
      cancelItemDrag();
      cancelWallDrag();
      cancelFloorDrag();
    }

    function handleMouseMove(e: MouseEvent) {
      if (dragTimerRef.current && !isDragReady) {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > 5) cancelItemDrag();
      }

      if (wallDragTimerRef.current && !isWallDragReady) {
        const dx = e.clientX - wallDragClientStartRef.current.x;
        const dy = e.clientY - wallDragClientStartRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > 5) cancelWallDrag();
      }

      if (floorDragTimerRef.current && !isFloorDragReady) {
        const dx = e.clientX - floorDragClientStartRef.current.x;
        const dy = e.clientY - floorDragClientStartRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > 5) cancelFloorDrag();
      }
    }

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragReady, isWallDragReady, isFloorDragReady]);

  // Configurações da renderização e estilização dos elementos no layout

  function renderElement(item: AllCanvasItem, hideOverlay = false) {
    const size = elementSize[item.type];

    const isIndisponivel =
      isRestaurantTable(item) && item.status === "indisponivel";

    const base = isIndisponivel
      ? "border border-[#6D7387] bg-gray-100"
      : "border border-[#6388b2] bg-[#EBF5FF]";

    const rotation = item.rotation ?? 0;

    const isVertical =
      item.type === "mesa_retangular" ? isRectTableVertical(rotation) : false;

    const isHorizontalFlipped =
      item.type === "mesa_retangular"
        ? isRectTableHorizontalFlipped(rotation)
        : false;

    const isVerticalFlipped =
      item.type === "mesa_retangular"
        ? isRectTableVerticalFlipped(rotation)
        : false;

    const lCorner =
      item.type === "mesa_l" ? getLTableCorner(rotation) : "top-left";

    const internalRotation = getInternalRotation(rotation);

    switch (item.type) {
      case "mesa_quadrada":
        // const capacity = item.capacity ?? 0;

        // const chairConfig = {
        //   top: capacity >= 1,
        //   bottom: capacity >= 2,
        //   left: capacity >= 3,
        //   right: capacity >= 4,
        // };

        return (
          <div
            style={{ width: size.w, height: size.h }}
            className={`${base} rounded-md`}
          >
            {/* {chairConfig.top && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-(--color-primary)" />
            )}

            {chairConfig.bottom && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-(--color-primary)" />
            )}

            {chairConfig.left && (
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-10 rounded-full bg-(--color-primary)" />
            )}

            {chairConfig.right && (
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-2 h-10 rounded-full bg-(--color-primary)" />
            )} */}

            <div
              className="w-full h-full"
              style={{
                transform: `rotate(${internalRotation}deg)`,
              }}
            >
              {!hideOverlay && (
                <TableOverlay
                  type="mesa_quadrada"
                  tableNumber={item.tableNumber}
                  capacity={item.capacity}
                  status={item.status}
                  isPreview={previewItem?.id === item.id}
                />
              )}
            </div>
          </div>
        );

      case "mesa_redonda":
        return (
          <div
            style={{ width: size.w, height: size.h }}
            className={`${base} rounded-full`}
          >
            <div
              className="w-full h-full"
              style={{
                transform: `rotate(${internalRotation}deg)`,
              }}
            >
              {!hideOverlay && (
                <TableOverlay
                  type="mesa_redonda"
                  tableNumber={item.tableNumber}
                  capacity={item.capacity}
                  status={item.status}
                  isPreview={previewItem?.id === item.id}
                />
              )}
            </div>
          </div>
        );

      case "mesa_retangular":
        return (
          <div
            style={{ width: size.w, height: size.h }}
            className={`${base} rounded-md`}
          >
            {!hideOverlay && (
              <TableOverlay
                type="mesa_retangular"
                tableNumber={item.tableNumber}
                capacity={item.capacity}
                status={item.status}
                isPreview={previewItem?.id === item.id}
                isVertical={isVertical}
                isHorizontalFlipped={isHorizontalFlipped}
                isVerticalFlipped={isVerticalFlipped}
              />
            )}
          </div>
        );

      case "mesa_l":
        const isIndisponivel =
          isRestaurantTable(item) && item.status === "indisponivel";

        const lFill = isIndisponivel ? "#f3f4f6" : "#EBF5FF";
        const lStroke = isIndisponivel ? "#6D7387" : "#6388b2";

        return (
          <div style={{ width: size.w, height: size.h }} className="relative">
            <svg
              width={size.w}
              height={size.h}
              viewBox="0 0 125 125"
              style={{ display: "block" }}
            >
              <defs>
                <clipPath id="mesa-l-clip">
                  <path d="M0,0 L125,0 L125,75 L75,75 L75,125 L0,125 Z" />
                </clipPath>
              </defs>

              <path
                d="M12,0 L113,0 Q125,0 125,12
             L125,63 Q125,75 113,75
             L87,75 Q75,75 75,87
             L75,113 Q75,125 63,125
             L12,125 Q0,125 0,113
             L0,12 Q0,0 12,0 Z"
                fill={lFill}
                stroke={lStroke}
                strokeWidth="1.5"
              />
            </svg>

            <div className="absolute inset-0">
              {!hideOverlay && (
                <TableOverlay
                  type="mesa_l"
                  tableNumber={item.tableNumber}
                  capacity={item.capacity}
                  status={item.status}
                  isPreview={previewItem?.id === item.id}
                  lCorner={lCorner}
                />
              )}
            </div>
          </div>
        );
      case "porta": {
        const isRight = item.swingDirection === "right";

        return (
          <img
            src="/porta4.png"
            draggable={false}
            alt="Porta"
            width={50}
            height={50}
            style={{
              display: "block",
              transform: isRight ? "scaleX(-1)" : undefined,
              imageRendering: "auto",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        );
      }
    }
  }

  useEffect(() => {
    console.log("Array atualizado:", history);
    console.log("Total de ações:", history.length);
    history.forEach((action, index) => {
      console.log(`  [${index}]`, action.type, action);
    });
  }, [history]);

  const interactionsBlocked =
    !!previewItem || isWallModeActive !== false || isFloorModeActive;

  return (
    <div className={`w-full mx-auto flex flex-col p-10`}>
      <div className="flex flex-col text-start gap-8 px-5">
        <div className="flex justify-between text-start flex-col gap-6 lg:flex-row lg:gap-0">
          <div className="flex flex-col">
            <h1 className="font-semibold text-[25px] text-[#19274b]">
              Layout do restaurante
            </h1>
            <p className=" text-[15px] text-[#19274b]">
              Gerencie o mapa de mesas e ambientes do seu restaurante!
            </p>
          </div>
          <ToolbarActions onUndo={undo} onRedo={redo} onSave={() => {}} />
        </div>

        {/* Div principal do gerenciamento do layout */}
        <div className="flex border border-[#e1e4f0] bg-[#F9F8FB] rounded-xl">
          {/* Div dos elementos */}
          <ElementsSidebar
            selectedType={selectedType}
            onSelect={(type) => {
              if (type === "parede") {
                setIsWallModeActive("externa");
                setIsFloorModeActive(false);
                setFloorDrawing(null);
                setPreviewItem(null);
                setSelectedType("parede");
              } else if (type === "parede_interna") {
                setIsWallModeActive("interna");
                setIsFloorModeActive(false);
                setFloorDrawing(null);
                setPreviewItem(null);
                setSelectedType("parede_interna");
              } else if (type === "piso") {
                setIsWallModeActive(false);
                setWallDrawing(null);
                setSelectedWallId(null);

                setIsFloorModeActive(true);
                setFloorDrawing(null);
                setSelectedFloorId(null);
                setPreviewItem(null);
                setSelectedType("piso");
              } else {
                setIsWallModeActive(false);
                setWallDrawing(null);
                setSelectedWallId(null);

                setIsFloorModeActive(false);
                setFloorDrawing(null);
                setSelectedFloorId(null);

                spawnElement(type);
              }
            }}
          />
          {/* Div layout do centro */}
          <div className="flex-1 p-6">
            <div className="w-full max-w-[1100px] mx-auto">
              <div className="flex justify-between items-center pb-5">
                {/* ZOOM */}
                <ZoomControls
                  zoom={zoom}
                  zoomInput={zoomInput}
                  onZoomOut={() => applyZoom(Math.max(0.4, zoom - 0.1))}
                  onZoomIn={() => applyZoom(Math.min(3, zoom + 0.1))}
                  onInputChange={(val) => setZoomInput(val)}
                  onInputBlur={() => {
                    let num = Number(zoomInput);
                    if (isNaN(num)) {
                      setZoomInput(String(Math.round(zoom * 100)));
                      return;
                    }
                    num = Math.max(40, Math.min(300, num));
                    applyZoom(num / 100);
                  }}
                  onInputKeyDown={(e) => {
                    if (e.key === "Enter")
                      (e.target as HTMLInputElement).blur();
                  }}
                  gridEnabled={gridEnabled}
                  onToggleGrid={() => setGridEnabled((prev) => !prev)}
                />
              </div>

              <div
                id="layout"
                ref={layoutRef}
                className={`
              
    bg-[#ffffff]
    w-full 
    max-w-[1100px]
    h-175
    
    rounded-2xl
    border-[1.5px] border-gray-300
    relative
    overflow-hidden
    select-none
 ${isPanning ? "cursor-grabbing" : "cursor-grab"}
    
    
  `}
                onContextMenu={(e) => e.preventDefault()}
                onMouseDown={(e) => {
                  e.preventDefault();

                  if (e.button === 2) {
                    if (previewItem) return;

                    setIsPanning(true);
                    setLastPanPoint({ x: e.clientX, y: e.clientY });

                    return;
                  }

                  // Início do desenho de parede
                  if (isWallModeActive) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const worldX =
                      (e.clientX - rect.left - panRef.current.x) /
                      zoomRef.current;
                    const worldY =
                      (e.clientY - rect.top - panRef.current.y) /
                      zoomRef.current;

                    const anchor = getWallAnchorPoint(worldX, worldY);

                    setWallDrawing({
                      startX: anchor.x,
                      startY: anchor.y,
                      currentX: anchor.x,
                      currentY: anchor.y,
                      isVertical: false,
                      wallType: isWallModeActive,
                    });
                    return;
                  }

                  // Início do desenho do piso
                  if (isFloorModeActive) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const worldX =
                      (e.clientX - rect.left - panRef.current.x) /
                      zoomRef.current;
                    const worldY =
                      (e.clientY - rect.top - panRef.current.y) /
                      zoomRef.current;

                    const snappedX = snapFloorToGrid(worldX);
                    const snappedY = snapFloorToGrid(worldY);

                    setFloorDrawing({
                      startX: snappedX,
                      startY: snappedY,
                      currentX: snappedX,
                      currentY: snappedY,
                    });
                    return;
                  }
                }}
                onMouseMove={(e) => {
                  // Preview do desenho do piso
                  if (floorDrawing) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const worldX =
                      (e.clientX - rect.left - panRef.current.x) /
                      zoomRef.current;
                    const worldY =
                      (e.clientY - rect.top - panRef.current.y) /
                      zoomRef.current;

                    setFloorDrawing((prev) =>
                      prev
                        ? {
                            ...prev,
                            currentX: snapFloorToGrid(worldX),
                            currentY: snapFloorToGrid(worldY),
                          }
                        : null,
                    );
                    return;
                  }

                  // Preview do desenho da parede
                  if (wallDrawing) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const worldX =
                      (e.clientX - rect.left - panRef.current.x) /
                      zoomRef.current;
                    const worldY =
                      (e.clientY - rect.top - panRef.current.y) /
                      zoomRef.current;
                    const dx = Math.abs(worldX - wallDrawing.startX);
                    const dy = Math.abs(worldY - wallDrawing.startY);

                    const lockThreshold = 8;

                    setWallDrawing((prev) =>
                      prev
                        ? {
                            ...prev,
                            currentX: isAltPressedRef.current
                              ? worldX
                              : snapToHalfGrid(worldX),

                            currentY: isAltPressedRef.current
                              ? worldY
                              : snapToHalfGrid(worldY),
                            isVertical: dx < lockThreshold ? true : dy > dx,
                          }
                        : null,
                    );
                    return;
                  }

                  if (!previewItem) {
                    setGuides({ vertical: null, horizontal: null });
                    return;
                  }

                  const rect = e.currentTarget.getBoundingClientRect();
                  const size = elementSize[previewItem.type];

                  const centerX =
                    (e.clientX - rect.left - panRef.current.x) /
                    zoomRef.current;
                  const centerY =
                    (e.clientY - rect.top - panRef.current.y) / zoomRef.current;

                  const rawX = centerX - size.w / 2;
                  const rawY = centerY - size.h / 2;

                  const snapped = applySnap(rawX, rawY);

                  const newX = snapped.x;
                  const newY = snapped.y;

                  setPreviewItem((prev) =>
                    prev
                      ? {
                          ...prev,
                          x: newX,
                          y: newY,
                        }
                      : null,
                  );

                  const deltaX = e.clientX - lastMouseX;
                  if (!lastMouseX) {
                    setLastMouseX(e.clientX);
                    return;
                  }
                  const maxRotation = 15;
                  const newRotation = Math.max(
                    -maxRotation,
                    Math.min(maxRotation, deltaX * 0.5),
                  );

                  setRotation(newRotation);
                  setLastMouseX(e.clientX);
                }}
                onClick={() => {
                  if (!previewItem) {
                    setSelectedItemId(null);
                    setSelectedWallId(null);
                    setSelectedFloorId(null);
                    setSettingsTableId(null);
                    return;
                  }

                  // const isTable = previewItem.type !== "porta";

                  const isTable =
                    previewItem.type === "mesa_quadrada" ||
                    previewItem.type === "mesa_redonda" ||
                    previewItem.type === "mesa_retangular" ||
                    previewItem.type === "mesa_l";

                  const item: AllCanvasItem = {
                    ...previewItem,

                    ...(isTable && {
                      tableNumber: nextTableNumberRef.current++,
                      capacity: 0,
                      status: "livre",
                    }),
                  };

                  setLayoutState((s) => ({
                    ...s,
                    items: [...s.items, item],
                    history: [...s.history, { type: "ADD", item }],
                    future: [],
                  }));

                  setPreviewItem(null);
                }}
                onMouseUp={(e) => {
                  setIsPanning(false);

                  if (wallDrawing && isWallModeActive) {
                    if (
                      isWallTooSmall(
                        wallDrawing.startX,
                        wallDrawing.startY,
                        wallDrawing.currentX,
                        wallDrawing.currentY,
                      )
                    ) {
                      setWallDrawing(null);
                      return;
                    }

                    const computed = wallFromDrag(
                      wallDrawing.startX,
                      wallDrawing.startY,
                      wallDrawing.currentX,
                      wallDrawing.currentY,
                    );

                    const newWall: Wall = {
                      id: crypto.randomUUID(),
                      x: computed.x,
                      y: computed.y,
                      width: computed.width,
                      rotation: computed.isVertical ? 90 : 0,
                      side: computed.side,
                      wallType:
                        isWallModeActive === "interna" ? "interna" : "externa", // veja passo 4
                    };

                    setLayoutState((s) => ({
                      ...s,
                      walls: [...s.walls, newWall],
                      history: [
                        ...s.history,
                        { type: "ADD_WALL", wall: newWall },
                      ],
                      future: [],
                    }));

                    setWallDrawing(null);
                  }

                  if (floorDrawing && isFloorModeActive) {
                    if (
                      isFloorTooSmall(
                        floorDrawing.startX,
                        floorDrawing.startY,
                        floorDrawing.currentX,
                        floorDrawing.currentY,
                      )
                    ) {
                      setFloorDrawing(null);
                      return;
                    }

                    const x = Math.min(
                      floorDrawing.startX,
                      floorDrawing.currentX,
                    );
                    const y = Math.min(
                      floorDrawing.startY,
                      floorDrawing.currentY,
                    );
                    const width = Math.abs(
                      floorDrawing.currentX - floorDrawing.startX,
                    );
                    const height = Math.abs(
                      floorDrawing.currentY - floorDrawing.startY,
                    );

                    const newFloor: Floor = {
                      id: crypto.randomUUID(),
                      x,
                      y,
                      width,
                      height,
                    };

                    setLayoutState((s) => ({
                      ...s,
                      floors: [...s.floors, newFloor],
                      history: [
                        ...s.history,
                        { type: "ADD_FLOOR", floor: newFloor },
                      ],
                      future: [],
                    }));

                    setFloorDrawing(null);
                  }
                }}
                onMouseLeave={() => setIsPanning(false)}
              >
                {(previewItem || isWallModeActive || isFloorModeActive) && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-(--color-primary) text-white text-xs px-3 py-1 rounded-md shadow-md pointer-events-none flex flex-col items-center text-center z-50">
                    <p>{( isWallModeActive ? 'Clique e arraste para criar uma parede' : isFloorModeActive ? 'Clique e arraste para criar um piso' : 'Clique para posicionar' )}</p>
                    <p>
                      (<span className="font-bold">Esc</span> para cancelar)
                    </p>
                  </div>
                )}

                <div
                  className={`
absolute inset-0 bg-black/5 pointer-events-none
transition-opacity duration-200
${previewItem || isFloorModeActive || isWallModeActive ? "opacity-100" : "opacity-0"}
`}
                />

                <div
                  ref={worldRef}
                  style={{
                    width: WORLD_WIDTH,
                    height: WORLD_HEIGHT,

                    transformOrigin: "0 0",
                    position: "absolute",
                    border: "2px dashed #6366f1",
                    boxShadow: "0 0 0 4px rgba(99,102,241,0.1)",
                  }}
                >
                  <svg
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: WORLD_WIDTH,
                      height: WORLD_HEIGHT,
                      pointerEvents: "none",
                      zIndex: 0,
                    }}
                  >
                    <defs>
                      <pattern
                        id="grid"
                        width="25"
                        height="25"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 25 0 L 0 0 0 25"
                          fill="none"
                          stroke="#c4c7d0" //#c4c7d0
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  <div
                    style={{
                      pointerEvents: interactionsBlocked ? "none" : "auto",
                    }}
                  >
                    {/* ── PISOS POSICIONADOS ───────────────────────────────── */}
                    {floors.map((floor) => (
                      <FloorRenderer
                        key={floor.id}
                        floor={floor}
                        isSelected={selectedFloorId === floor.id}
                        isHovered={hoveredFloorId === floor.id}
                        isDragging={draggingFloorId === floor.id}
                        zoom={zoom}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFloorId(floor.id);
                          setSelectedItemId(null);
                          setSelectedWallId(null);
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (floorResizing) return;
                          const container = document.getElementById("layout");
                          if (!container) return;
                          const rect = container.getBoundingClientRect();
                          const mouseX =
                            (e.clientX - rect.left - panRef.current.x) /
                            zoomRef.current;
                          const mouseY =
                            (e.clientY - rect.top - panRef.current.y) /
                            zoomRef.current;

                          floorDragStartPos.current = {
                            x: floor.x,
                            y: floor.y,
                          };
                          floorDragClientStartRef.current = {
                            x: e.clientX,
                            y: e.clientY,
                          };
                          setSelectedFloorId(floor.id);
                          setSelectedItemId(null);
                          setSelectedWallId(null);

                          floorDragTimerRef.current = setTimeout(() => {
                            setDraggingFloorId(floor.id);
                            setIsFloorDragReady(true);
                            setFloorDragOffset({
                              x: mouseX - floor.x,
                              y: mouseY - floor.y,
                            });
                            floorDragTimerRef.current = null;
                          }, 100);
                        }}
                        onMouseEnter={() => setHoveredFloorId(floor.id)}
                        onMouseLeave={() => setHoveredFloorId(null)}
                        onResizeStart={(e, handle) => {
                          e.stopPropagation();
                          setFloorResizing({
                            floorId: floor.id,
                            handle,
                            originalFloor: { ...floor },
                          });
                        }}
                        onDelete={(e) => {
                          e.stopPropagation();
                          setLayoutState((s) => {
                            const floorToRemove = s.floors.find(
                              (f) => f.id === floor.id,
                            );
                            if (!floorToRemove) return s;
                            return {
                              ...s,
                              floors: s.floors.filter((f) => f.id !== floor.id),
                              history: [
                                ...s.history,
                                {
                                  type: "REMOVE_FLOOR",
                                  id: floor.id,
                                  floor: floorToRemove,
                                },
                              ],
                              future: [],
                            };
                          });
                          setSelectedFloorId(null);
                        }}
                      />
                    ))}
                  </div>
                  {/* ── PREVIEW DO PISO SENDO DESENHADO ─────────────────── */}
                  {floorDrawing &&
                    (() => {
                      const x = Math.min(
                        floorDrawing.startX,
                        floorDrawing.currentX,
                      );
                      const y = Math.min(
                        floorDrawing.startY,
                        floorDrawing.currentY,
                      );
                      const width = Math.abs(
                        floorDrawing.currentX - floorDrawing.startX,
                      );
                      const height = Math.abs(
                        floorDrawing.currentY - floorDrawing.startY,
                      );

                      return (
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            left: x,
                            top: y,
                            width,
                            height,
                            backgroundColor: "#FFFFFF",
                            opacity: 0.7,
                            border: "1px dashed #6366f1",
                            zIndex: -1,
                          }}
                        />
                      );
                    })()}

                  {guides.vertical !== null && (
                    <div
                      style={{
                        position: "absolute",
                        left: guides.vertical,
                        top: 0,
                        height: "100%",
                        borderLeft: "1px dashed #6366f1",
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  {guides.vertical !== null &&
                    guides.distanceX !== undefined &&
                    Math.abs(guides.distanceX) < 1 && (
                      <div
                        className="absolute text-xs bg-black text-white px-1 rounded pointer-events-none"
                        style={{
                          left: guides.vertical + 5,
                          top: 10,
                        }}
                      >
                        {guides.distanceX}px
                      </div>
                    )}

                  {guides.horizontal !== null && (
                    <div
                      style={{
                        position: "absolute",
                        top: guides.horizontal,
                        left: 0,
                        width: "100%",
                        height: 1,
                        background: "#6366f1",
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  {guides.horizontal !== null &&
                    guides.distanceY !== undefined &&
                    Math.abs(guides.distanceY) < 1 && (
                      <div
                        className="absolute text-xs bg-black text-white px-1 rounded pointer-events-none"
                        style={{
                          left: 10,
                          top: guides.horizontal + 5,
                        }}
                      >
                        {guides.distanceY}px
                      </div>
                    )}

                  <div
                    style={{
                      pointerEvents: interactionsBlocked ? "none" : "auto",
                    }}
                  >
                    {/* ── PAREDES POSICIONADAS ─────────────────────────────── */}
                    {walls.map((wall) => (
                      <WallRenderer
                        key={wall.id}
                        wall={wall}
                        isSelected={selectedWallId === wall.id}
                        isHovered={hoveredWallId === wall.id}
                        isDragging={draggingWallId === wall.id}
                        zoom={zoom}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWallId(wall.id);
                          setSelectedItemId(null);
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (wallResizing) return;
                          const container = document.getElementById("layout");
                          if (!container) return;
                          const rect = container.getBoundingClientRect();
                          const mouseX =
                            (e.clientX - rect.left - panRef.current.x) /
                            zoomRef.current;
                          const mouseY =
                            (e.clientY - rect.top - panRef.current.y) /
                            zoomRef.current;

                          wallDragStartPos.current = { x: wall.x, y: wall.y };
                          wallDragClientStartRef.current = {
                            x: e.clientX,
                            y: e.clientY,
                          };
                          setSelectedWallId(wall.id);
                          setSelectedItemId(null);

                          wallDragTimerRef.current = setTimeout(() => {
                            setDraggingWallId(wall.id);
                            setIsWallDragReady(true);
                            setWallDragOffset({
                              x: mouseX - wall.x,
                              y: mouseY - wall.y,
                            });
                            wallDragTimerRef.current = null;
                          }, 100);
                        }}
                        onMouseEnter={() => setHoveredWallId(wall.id)}
                        onMouseLeave={() => setHoveredWallId(null)}
                        onResizeStart={(e, side) => {
                          e.stopPropagation();
                          setWallResizing({
                            wallId: wall.id,
                            side,
                            originalWall: { ...wall },
                          });
                        }}
                        onDelete={(e) => {
                          e.stopPropagation();
                          setLayoutState((s) => {
                            const wallToRemove = s.walls.find(
                              (w) => w.id === wall.id,
                            );
                            if (!wallToRemove) return s;
                            return {
                              ...s,
                              walls: s.walls.filter((w) => w.id !== wall.id),
                              history: [
                                ...s.history,
                                {
                                  type: "REMOVE_WALL",
                                  id: wall.id,
                                  wall: wallToRemove,
                                },
                              ],
                              future: [],
                            };
                          });
                          setSelectedWallId(null);
                        }}
                      />
                    ))}
                  </div>
                  {/* ── PREVIEW DA PAREDE SENDO DESENHADA ────────────────── */}
                  {wallDrawing &&
                    (() => {
                      const computed = wallFromDrag(
                        wallDrawing.startX,
                        wallDrawing.startY,
                        wallDrawing.currentX,
                        wallDrawing.currentY,
                      );
                      const isV = computed.isVertical;
                      const previewLength = computed.width;

                      const thickness =
                        wallDrawing.wallType === "externa"
                          ? WALL_THICKNESS
                          : 6.5;

                      const displayW = isV ? thickness : previewLength;
                      const displayH = isV ? previewLength : thickness;
                      return (
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            left: computed.x,
                            top: computed.y,
                            width: displayW,
                            height: displayH,
                            backgroundColor:
                              wallDrawing.wallType === "externa"
                                ? "#59595B"
                                : "#C3C5C9",
                            opacity: 0.5,
                            borderRadius:
                              wallDrawing.wallType === "externa" ? 10 : 0,
                            border: "1px dashed #6366f1",
                            zIndex: 999,
                          }}
                        />
                      );
                    })()}
                  <div
                    style={{
                      pointerEvents: interactionsBlocked ? "none" : "auto",
                    }}
                  >
                    {items.map((item) => (
                      <CanvasItem
                        key={item.id}
                        item={item}
                        isSelected={selectedItemId === item.id}
                        isHovered={hoveredItemId === item.id}
                        isDragging={draggingItemId === item.id}
                        isDragReady={isDragReady}
                        panRef={panRef}
                        zoomRef={zoomRef}
                        dragTimerRef={dragTimerRef}
                        dragStartPos={dragStartPos}
                        dragStartItemPos={dragStartItemPos}
                        rotationStartRef={rotationStartRef}
                        onSelect={() => {
                          setSelectedItemId(item.id);
                          setSettingsTableId(null);
                        }}
                        onHoverEnter={() => setHoveredItemId(item.id)}
                        onHoverLeave={() => setHoveredItemId(null)}
                        onDelete={() => {
                          setLayoutState((s) => {
                            const itemToRemove = s.items.find(
                              (i) => i.id === item.id,
                            );
                            if (!itemToRemove) return s;

                            return {
                              ...s,
                              items: s.items.filter((i) => i.id !== item.id),
                              history: [
                                ...s.history,
                                {
                                  type: "REMOVE",
                                  id: item.id,
                                  item: itemToRemove,
                                },
                              ],
                              future: [],
                            };
                          });

                          setSelectedItemId(null);
                        }}
                        onFlipDoor={(id) => {
                          setLayoutState((s) => {
                            const current = s.items.find((i) => i.id === id);

                            if (!current) return s;
                            if (!isDoor(current)) return s;

                            const from = current.swingDirection ?? "left";
                            const to = from === "left" ? "right" : "left";

                            return {
                              ...s,

                              items: s.items.map((i) =>
                                i.id === id
                                  ? {
                                      ...i,
                                      swingDirection: to,
                                    }
                                  : i,
                              ),

                              history: [
                                ...s.history,
                                {
                                  type: "FLIP_DOOR",
                                  id,
                                  from,
                                  to,
                                },
                              ],

                              future: [],
                            };
                          });
                        }}
                        onDragStart={(itemId, offset) => {
                          setDraggingItemId(itemId);
                          setIsDragReady(true);
                          setDragOffset(offset);
                        }}
                        onRotateStart={(itemId, rotationOffset) => {
                          startRotateWithOffset(itemId, rotationOffset);
                        }}
                        onOpenSettings={(id) =>
                          setSettingsTableId((prev) =>
                            prev === id ? null : id,
                          )
                        }
                        renderElement={renderElement}
                      />
                    ))}
                  </div>
                  {settingsTableId &&
                    (() => {
                      const found = items.find((i) => i.id === settingsTableId);

                      if (!found || !isRestaurantTable(found)) return null;

                      return (
                        <TableSettingsPanel
                          table={found}
                          onClose={() => setSettingsTableId(null)}
                          onUpdate={(id, changes) => {
                            setLayoutState((s) => ({
                              ...s,
                              items: s.items.map((i) =>
                                i.id === id ? { ...i, ...changes } : i,
                              ),
                            }));
                          }}
                        />
                      );
                    })()}

                  {/* Preview */}
                  {previewItem && (
                    <div
                      className="absolute opacity-60 transition-transform duration-150 ease-out"
                      onMouseDown={(e) => e.stopPropagation()}
                      style={{
                        top: previewItem.y,
                        left: previewItem.x,
                        transform: `rotate(${(previewItem.rotation || 0) + rotation}deg)`,
                        transformOrigin: "center center",
                      }}
                    >
                      <div className="relative pointer-events-none">
                        {renderElement(previewItem, true)}

                        <div className="absolute -right-13 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 h-7 bg-white border border-gray-300 rounded-full cursor-grab shadow-md hover:scale-110 transition select-none text-xs">
                          ⟳ <span className="text-[10px] text-gray-500">R</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/*  */}
        </div>
      </div>
    </div>
  );
}
