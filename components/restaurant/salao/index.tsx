"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { LoaderCircle, X, CalendarDays, Clock3 } from "lucide-react";
import AnimatedAlert from "@/components/alert/AnimatedAlert";
import WallRenderer, {
  Wall,
} from "@/components/dashboard/dashboard_layout/wallRenderer";
import FloorRenderer, {
  Floor,
} from "@/components/dashboard/dashboard_layout/floorRenderer";
import { TableOverlay } from "@/components/dashboard/dashboard_layout/tableOverlay";
import { TableActionPanel } from "@/components/dashboard/dashboard_layout/tableActionPanel";

import {
  isRectTableVertical,
  isRectTableHorizontalFlipped,
  isRectTableVerticalFlipped,
  getLTableCorner,
} from "@/utils/layout/tableContentRotation";

import {
  WALL_THICKNESS,
  WALL_THICKNESS_INTERNA,
} from "@/utils/layout/constants";

import type {
  LayoutItem,
  RestaurantTable,
  AllCanvasItem,
} from "@/components/restaurant/layout/types";
import { Pedidos } from "@/components/restaurant/pedidos";
type SalaoRole = "gerente" | "garcom";

type Props = {
  role: SalaoRole;
};

const elementSize = {
  mesa_quadrada: { w: 75, h: 75 },
  mesa_redonda: { w: 75, h: 75 },
  mesa_retangular: { w: 125, h: 75 },
  mesa_l: { w: 125, h: 125 },
  porta: { w: 50, h: 50 },
};

export default function Salao({ role }: Props) {
  const params = useParams();
  const restaurantId = params.id as string;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const contentBoundsRef = useRef<{
    left: number;
    top: number;
    right: number;
    bottom: number;
  } | null>(null);
  const didDragRef = useRef(false);
  const minZoomRef = useRef(1);
  const hasInitialFitRef = useRef(false);

  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AllCanvasItem[]>([]);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const [ordersModal, setOrdersModal] = useState(false);

  const [reservationModal, setReservationModal] = useState(false);
  const [reservationTable, setReservationTable] =
    useState<RestaurantTable | null>(null);

  const [restaurantHours, setRestaurantHours] = useState<
    {
      day_of_week: string;
      enabled: boolean;
      open_time: string | null;
      close_time: string | null;
    }[]
  >([]);

  const [occupationModal, setOccupationModal] = useState(false);

  const [occupationTable, setOccupationTable] =
    useState<RestaurantTable | null>(null);

  const [occupationName, setOccupationName] = useState("");

  const [reservationName, setReservationName] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");

  const [occupationPeopleCount, setOccupationPeopleCount] = useState("");

  const [reservationPeopleCount, setReservationPeopleCount] = useState("");

  const [alert, setAlert] = useState<{
    message: string | null;
    type: "error" | "success";
  }>({
    message: null,
    type: "error",
  });
  const [reservations, setReservations] = useState<
    {
      id: number;
      table_id: string;
      customer_name: string;
      people_count: number;
      reservation_date: string;
      reservation_time: string;
    }[]

    
  >([]);

const [tableCustomers, setTableCustomers] = useState<
  {
    table_id: string;
    name: string;
    people_count: number;
  }[]
>([]);

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    if (!restaurantId) return;

    async function syncReservationsAndTables() {
      try {
        const res = await fetch(
          `/api/restaurant/${restaurantId}/garcom/reservation`,
          {
            cache: "no-store",
          },
        );

        if (!res.ok) return;

        const data = await res.json();

setReservations(data.reservations);
setTableCustomers(data.tableCustomers ?? []);

        setItems((currentItems) =>
          currentItems.map((item) => {
            if (!isRestaurantTable(item)) {
              return item;
            }

            const updatedTable = data.tables.find(
              (table: { id: number; status: RestaurantTable["status"] }) =>
                String(table.id) === String(item.id),
            );

            if (!updatedTable) {
              return item;
            }

            return {
              ...item,
              status: updatedTable.status,
            };
          }),
        );
      } catch (error) {
        console.error("Erro ao sincronizar mesas:", error);
      }
    }

    syncReservationsAndTables();

    const interval = setInterval(syncReservationsAndTables, 10000);

    return () => clearInterval(interval);
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;

    async function loadReservations() {
      try {
        const res = await fetch(
          `/api/restaurant/${restaurantId}/garcom/reservation`,
        );

        if (!res.ok) {
          console.error("Erro ao carregar reservas");
          return;
        }

        const data = await res.json();

        setReservations(data.reservations);
setTableCustomers(data.tableCustomers ?? []);
        setItems((currentItems) =>
          currentItems.map((item) => {
            if (!isRestaurantTable(item)) {
              return item;
            }

            const updatedTable = data.tables.find(
              (table: { id: number; status: RestaurantTable["status"] }) =>
                String(table.id) === String(item.id),
            );

            if (!updatedTable) {
              return item;
            }

            return {
              ...item,
              status: updatedTable.status,
            };
          }),
        );
      } catch (error) {
        console.error("Erro ao carregar reservas:", error);
      }
    }

    loadReservations();
  }, [restaurantId]);

  async function OccupyTable() {
    if (!occupationTable) return;

    try {
      const res = await fetch(
        `/api/restaurant/${restaurantId}/garcom/reservation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "occupy",
            name: occupationName,
            tableId: occupationTable.id,
            peopleCount: Number(occupationPeopleCount),
          }),
        },
      );

      const data = await res.json();

      if (res.status === 409) {
        setAlert({
          message: data.error || "Não foi possível ocupar esta mesa.",
          type: "error",
        });

        return;
      }

      if (!res.ok) {
        setAlert({
          message: data.error || "Erro ao ocupar a mesa.",
          type: "error",
        });

        return;
      }

      const reservationsRes = await fetch(
        `/api/restaurant/${restaurantId}/garcom/reservation`,
        {
          cache: "no-store",
        },
      );

      if (reservationsRes.ok) {
        const reservationsData = await reservationsRes.json();

        setReservations(reservationsData.reservations);

        setItems((currentItems) =>
          currentItems.map((item) => {
            if (!isRestaurantTable(item)) {
              return item;
            }

            const updatedTable = reservationsData.tables.find(
              (table: { id: number; status: RestaurantTable["status"] }) =>
                String(table.id) === String(item.id),
            );

            if (!updatedTable) {
              return item;
            }

            return {
              ...item,
              status: updatedTable.status,
            };
          }),
        );
      }

      const occupiedTableId = String(occupationTable.id);

      setOccupationModal(false);
      setOccupationTable(null);
      setOccupationName("");
      setOccupationTable(null);
      setAlert({
        message: null,
        type: "error",
      });

      setSelectedTableId(occupiedTableId);
    } catch (error) {
      console.error("Erro ao ocupar mesa:", error);

      setAlert({
        message: "Não foi possível ocupar a mesa. Tente novamente.",
        type: "error",
      });
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

  function normalizeRotation(rotation: number) {
    return ((rotation % 360) + 360) % 360;
  }

  function isCardinalRotation(rotation: number) {
    const r = normalizeRotation(rotation);
    return r === 0 || r === 90 || r === 180 || r === 270;
  }

  function getInternalRotation(rotation: number) {
    if (!isCardinalRotation(rotation)) return 0;
    return -rotation;
  }

  function isDoorNearWallEnd(wall: Wall, end: "start" | "end") {
    if (wall.wallType !== "externa") return false;

    const isVertical = wall.rotation === 90;
    const point = isVertical
      ? { x: wall.x, y: end === "start" ? wall.y : wall.y + wall.width }
      : { x: end === "start" ? wall.x : wall.x + wall.width, y: wall.y };

    const THRESHOLD = 6;

    return items.some((item) => {
      if (item.type !== "porta") return false;

      const doorLeft = item.x;
      const doorRight = item.x + 50;
      const doorTop = item.y;
      const doorBottom = item.y + 50;

      const closestX = Math.max(doorLeft, Math.min(point.x, doorRight));
      const closestY = Math.max(doorTop, Math.min(point.y, doorBottom));

      const dist = Math.sqrt(
        (point.x - closestX) ** 2 + (point.y - closestY) ** 2,
      );

      return dist < THRESHOLD;
    });
  }

  function getReservationDateTime(reservation: {
    reservation_date: string;
    reservation_time: string;
  }) {
    const date =
      typeof reservation.reservation_date === "string"
        ? reservation.reservation_date.slice(0, 10)
        : "";

    const time =
      typeof reservation.reservation_time === "string"
        ? reservation.reservation_time.slice(0, 5)
        : "";

    return new Date(`${date}T${time}:00`);
  }

  function getNextReservation(tableId: string | number) {
    const now = new Date();

    return (
      reservations
        .filter(
          (reservation) => String(reservation.table_id) === String(tableId),
        )
        .map((reservation) => ({
          ...reservation,
          dateTime: getReservationDateTime(reservation),
        }))
        .filter(
          (reservation) =>
            !isNaN(reservation.dateTime.getTime()) &&
            reservation.dateTime > now,
        )
        .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())[0] ?? null
    );
  }

  function getTableEffectiveStatus(
    table: RestaurantTable,
  ): RestaurantTable["status"] {
    return table.status;
  }

  function getNextReservationTime(tableId: string | number) {
    const reservation = getNextReservation(tableId);

    return reservation?.reservation_time?.slice(0, 5);
  }

  function renderElement(item: AllCanvasItem) {
    const effectiveStatus = isRestaurantTable(item)
      ? getTableEffectiveStatus(item)
      : undefined;

    const reservationTime = isRestaurantTable(item)
      ? getNextReservationTime(item.id)
      : undefined;

    const size = elementSize[item.type];

    const isIndisponivel =
      isRestaurantTable(item) && effectiveStatus === "indisponivel";

    let base = isIndisponivel
      ? "border border-[#6D7387] bg-gray-100"
      : "border border-[#6388b2] bg-[#EBF5FF]";

    const isReservada =
      isRestaurantTable(item) && effectiveStatus === "reservada";

    const isOcupada = isRestaurantTable(item) && effectiveStatus === "ocupada";

    if (isReservada) {
      base = "border border-[#ffbb7f] bg-[#FFF8ED]";
    }

    if (isOcupada) {
      base = "border border-red-400 bg-red-200";
    }

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
        return (
          <div
            style={{ width: size.w, height: size.h }}
            className={`${base} rounded-md`}
          >
            <div
              className="w-full h-full"
              style={{ transform: `rotate(${internalRotation}deg)` }}
            >
              <TableOverlay
                type="mesa_quadrada"
                tableNumber={item.tableNumber}
                capacity={item.capacity}
                status={effectiveStatus}
                reservationTime={reservationTime}
              />
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
              style={{ transform: `rotate(${internalRotation}deg)` }}
            >
              <TableOverlay
                type="mesa_redonda"
                tableNumber={item.tableNumber}
                capacity={item.capacity}
                status={effectiveStatus}
                reservationTime={reservationTime}
              />
            </div>
          </div>
        );

      case "mesa_retangular":
        return (
          <div
            style={{ width: size.w, height: size.h }}
            className={`${base} rounded-md`}
          >
            <TableOverlay
              type="mesa_retangular"
              tableNumber={item.tableNumber}
              capacity={item.capacity}
              status={effectiveStatus}
              isVertical={isVertical}
              isHorizontalFlipped={isHorizontalFlipped}
              isVerticalFlipped={isVerticalFlipped}
              reservationTime={reservationTime}
            />
          </div>
        );

      case "mesa_l": {
        const isReservada =
          isRestaurantTable(item) && effectiveStatus === "reservada";

        const isOcupada =
          isRestaurantTable(item) && effectiveStatus === "ocupada";

        let lFill = isIndisponivel ? "#f3f4f6" : "#EBF5FF";
        let lStroke = isIndisponivel ? "#6D7387" : "#6388b2";

        if (isReservada) {
          lFill = "#FFF8ED";
          lStroke = "#ffbb7f";
        }

        if (isOcupada) {
          lFill = "#fecaca";
          lStroke = "#ef4444";
        }

        return (
          <div style={{ width: size.w, height: size.h }} className="relative">
            <svg
              width={size.w}
              height={size.h}
              viewBox="0 0 125 125"
              style={{ display: "block" }}
            >
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
              <TableOverlay
                type="mesa_l"
                tableNumber={item.tableNumber}
                capacity={item.capacity}
                status={effectiveStatus}
                lCorner={lCorner}
                reservationTime={reservationTime}
              />
            </div>
          </div>
        );
      }

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
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        );
      }
    }
  }

  function getPreviousDateStr(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() - 1);

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  }

  function getTodayLocal() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    if (!restaurantId) return;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/restaurant/${restaurantId}/layout`);
        if (!res.ok) return;

        const {
          tables,
          doors,
          walls: dbWalls,
          floors: dbFloors,
        } = await res.json();

        const loadedItems: AllCanvasItem[] = [
          ...tables.map((t: any) => ({
            id: String(t.id),
            type: t.type,
            x: Number(t.pos_x),
            y: Number(t.pos_y),
            rotation: Number(t.rotation),
            tableNumber: t.number,
            capacity: t.capacity,
            status: t.status,
          })),
          ...doors.map((d: any) => ({
            id: `door-${d.id}`,
            type: "porta" as const,
            x: Number(d.pos_x),
            y: Number(d.pos_y),
            rotation: Number(d.rotation),
            swingDirection: d.swing_right ? "right" : "left",
          })),
        ];

        const loadedWalls: Wall[] = dbWalls.map((w: any) => ({
          id: String(w.id),
          x: Number(w.pos_x),
          y: Number(w.pos_y),
          width: Number(w.length),
          rotation: w.is_vertical ? 90 : 0,
          side: "near",
          wallType: w.wall_type,
        }));

        const loadedFloors: Floor[] = dbFloors.map((f: any) => ({
          id: String(f.id),
          x: Number(f.pos_x),
          y: Number(f.pos_y),
          width: Number(f.width),
          height: Number(f.height),
        }));

        setItems(loadedItems);
        setWalls(loadedWalls);
        setFloors(loadedFloors);
      } catch (err) {
        console.error("Erro ao carregar salão:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;

    async function loadRestaurantHours() {
      try {
        const res = await fetch(
          `/api/restaurant/me?restaurantId=${restaurantId}`,
        );

        if (!res.ok) {
          console.error("Erro ao carregar horários do restaurante");
          return;
        }

        const data = await res.json();

        setRestaurantHours(data.hours ?? []);
      } catch (error) {
        console.error("Erro ao carregar horários:", error);
      }
    }

    loadRestaurantHours();
  }, [restaurantId]);

  function getItemBounds(item: AllCanvasItem) {
    const size = elementSize[item.type];

    const rotation = normalizeRotation(item.rotation ?? 0);

    if (rotation === 0 || rotation === 180) {
      return {
        left: item.x,
        top: item.y,
        right: item.x + size.w,
        bottom: item.y + size.h,
      };
    }

    if (rotation === 90 || rotation === 270) {
      return {
        left: item.x - (size.h - size.w) / 2,
        top: item.y - (size.w - size.h) / 2,
        right: item.x + size.h - (size.h - size.w) / 2,
        bottom: item.y + size.w - (size.w - size.h) / 2,
      };
    }

    const radians = (rotation * Math.PI) / 180;

    const cos = Math.abs(Math.cos(radians));
    const sin = Math.abs(Math.sin(radians));

    const rotatedW = size.w * cos + size.h * sin;
    const rotatedH = size.w * sin + size.h * cos;

    const centerX = item.x + size.w / 2;
    const centerY = item.y + size.h / 2;

    return {
      left: centerX - rotatedW / 2,
      top: centerY - rotatedH / 2,
      right: centerX + rotatedW / 2,
      bottom: centerY + rotatedH / 2,
    };
  }

  function fitToContent() {
    const container = containerRef.current;
    if (!container) return;

    const boxes: {
      left: number;
      top: number;
      right: number;
      bottom: number;
    }[] = [];

    // Paredes
    walls.forEach((wall) => {
      const isVertical = wall.rotation === 90;

      const thickness =
        wall.wallType === "interna" ? WALL_THICKNESS_INTERNA : WALL_THICKNESS;

      const width = isVertical ? thickness : wall.width;
      const height = isVertical ? wall.width : thickness;

      boxes.push({
        left: wall.x,
        top: wall.y,
        right: wall.x + width,
        bottom: wall.y + height,
      });
    });

    // Pisos
    floors.forEach((floor) => {
      boxes.push({
        left: floor.x,
        top: floor.y,
        right: floor.x + floor.width,
        bottom: floor.y + floor.height,
      });
    });

    // Mesas e portas
    items.forEach((item) => {
      boxes.push(getItemBounds(item));
    });

    if (boxes.length === 0) return;

    const left = Math.min(...boxes.map((b) => b.left));
    const top = Math.min(...boxes.map((b) => b.top));
    const right = Math.max(...boxes.map((b) => b.right));
    const bottom = Math.max(...boxes.map((b) => b.bottom));

    contentBoundsRef.current = {
      left,
      top,
      right,
      bottom,
    };

    const PADDING = 8;

    const MAX_VISIBLE_WORLD_W = 1200;
    const MAX_VISIBLE_WORLD_H = 700;

    const contentW = right - left;
    const contentH = bottom - top;

    const visibleWorldW = Math.min(contentW, MAX_VISIBLE_WORLD_W);

    const visibleWorldH = Math.min(contentH, MAX_VISIBLE_WORLD_H);

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    const fitZoom = Math.min(
      (containerW - PADDING * 2) / visibleWorldW,
      (containerH - PADDING * 2) / visibleWorldH,
    );

    const newZoom = Math.min(Math.max(fitZoom, 0.1), 3);

    minZoomRef.current = newZoom;

    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;

    const newPanX = containerW / 2 - centerX * newZoom;

    const newPanY = containerH / 2 - centerY * newZoom;

    const newPan = {
      x: newPanX,
      y: newPanY,
    };

    zoomRef.current = newZoom;
    panRef.current = newPan;

    setZoom(newZoom);
    setPan(newPan);
  }

  function clampPan(nextPan: { x: number; y: number }, currentZoom: number) {
    const container = containerRef.current;
    const bounds = contentBoundsRef.current;

    if (!container || !bounds) {
      return nextPan;
    }

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    const DRAG_MARGIN = 120;

    const contentW = (bounds.right - bounds.left) * currentZoom;
    const contentH = (bounds.bottom - bounds.top) * currentZoom;

    const contentLeft = bounds.left * currentZoom + nextPan.x;
    const contentTop = bounds.top * currentZoom + nextPan.y;
    const contentRight = bounds.right * currentZoom + nextPan.x;
    const contentBottom = bounds.bottom * currentZoom + nextPan.y;

    let x = nextPan.x;
    let y = nextPan.y;

    if (contentW <= containerW) {
      const centerX =
        containerW / 2 - ((bounds.left + bounds.right) / 2) * currentZoom;

      x = centerX;
    } else {
      if (contentLeft > DRAG_MARGIN) {
        x -= contentLeft - DRAG_MARGIN;
      }

      if (contentRight < containerW - DRAG_MARGIN) {
        x += containerW - DRAG_MARGIN - contentRight;
      }
    }

    if (contentH <= containerH) {
      const centerY =
        containerH / 2 - ((bounds.top + bounds.bottom) / 2) * currentZoom;

      y = centerY;
    } else {
      if (contentTop > DRAG_MARGIN) {
        y -= contentTop - DRAG_MARGIN;
      }

      if (contentBottom < containerH - DRAG_MARGIN) {
        y += containerH - DRAG_MARGIN - contentBottom;
      }
    }

    return { x, y };
  }

  useEffect(() => {
    if (loading) return;
    if (hasInitialFitRef.current) return;

    fitToContent();
    hasInitialFitRef.current = true;
  }, [loading]);
  useEffect(() => {
    function handleResize() {
      if (!loading && !hasInitialFitRef.current) {
        fitToContent();
        hasInitialFitRef.current = true;
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [loading]);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (!isPanning) return;
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        didDragRef.current = true;
      }

      const rawPan = {
        x: panRef.current.x + dx,
        y: panRef.current.y + dy,
      };

      const newPan = clampPan(rawPan, zoomRef.current);

      panRef.current = newPan;
      setPan(newPan);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }

    function stopPan() {
      setIsPanning(false);

      setTimeout(() => {
        didDragRef.current = false;
      }, 0);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopPan);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopPan);
    };
  }, [isPanning, lastPanPoint]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();

      const rect = container!.getBoundingClientRect();

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const oldZoom = zoomRef.current;

      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;

      const MIN_USER_ZOOM = 0.35;
      const MAX_USER_ZOOM = 4;

      const newZoom = Math.min(
        Math.max(oldZoom * zoomFactor, MIN_USER_ZOOM),
        MAX_USER_ZOOM,
      );

      if (newZoom === oldZoom) return;

      const worldX = (mouseX - panRef.current.x) / oldZoom;

      const worldY = (mouseY - panRef.current.y) / oldZoom;

      const rawPan = {
        x: mouseX - worldX * newZoom,
        y: mouseY - worldY * newZoom,
      };

      const newPan = clampPan(rawPan, newZoom);

      zoomRef.current = newZoom;
      panRef.current = newPan;

      setZoom(newZoom);
      setPan(newPan);
    }

    container.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const selectedTable = (() => {
    const table = items.find(
      (i) => i.id === selectedTableId && isRestaurantTable(i),
    ) as RestaurantTable | undefined;

    if (!table) return undefined;

    return {
      ...table,
      status: getTableEffectiveStatus(table),
    };
  })();

  const nextReservation = selectedTable
    ? getNextReservation(selectedTable.id)
    : null;

const mainCustomer = selectedTable
  ? tableCustomers.find(
      (customer) =>
        String(customer.table_id) === String(selectedTable.id),
    ) ?? null
  : null;

  function getDayOfWeekFromDate(date: string) {
    if (!date) return null;

    const [year, month, day] = date.split("-").map(Number);

    const selectedDate = new Date(year, month - 1, day);

    const days = [
      "domingo",
      "segunda",
      "terca",
      "quarta",
      "quinta",
      "sexta",
      "sabado",
    ];

    return days[selectedDate.getDay()];
  }

  function getSelectedDayHours(date: string) {
    const dayOfWeek = getDayOfWeekFromDate(date);

    if (!dayOfWeek) return null;

    return (
      restaurantHours.find((hour) => hour.day_of_week === dayOfWeek) ?? null
    );
  }

  function handleReservationDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const date = e.target.value;

    setReservationDate(date);
    setReservationTime("");
    setAlert({
      message: null,
      type: "error",
    });

    const hours = getSelectedDayHours(date);

    if (!hours || !hours.enabled) {
      setAlert({
        message: "O restaurante não funciona nesse dia da semana.",
        type: "error",
      });
      return;
    }
  }

  const selectedDayHours = getSelectedDayHours(reservationDate);

  const reservationMinTime =
    selectedDayHours?.enabled && selectedDayHours.open_time
      ? selectedDayHours.open_time.slice(0, 5)
      : undefined;

  const reservationMaxTime =
    selectedDayHours?.enabled && selectedDayHours.close_time
      ? selectedDayHours.close_time.slice(0, 5)
      : undefined;

 function isReservationTimeValid() {
  if (!reservationDate || !reservationTime) {
    return false;
  }

  const hours = getSelectedDayHours(reservationDate);

  if (!hours || !hours.enabled) {
    return false;
  }

  if (!hours.open_time || !hours.close_time) {
    return false;
  }

  const openTime = hours.open_time.slice(0, 5);
  const closeTime = hours.close_time.slice(0, 5);

  const crossesMidnight = closeTime <= openTime;

  if (!crossesMidnight) {
    return reservationTime >= openTime && reservationTime <= closeTime;
  }
  return reservationTime >= openTime || reservationTime <= closeTime;
}

  async function CreateReservation() {
    if (!reservationTable) return;

    try {
      const res = await fetch(
        `/api/restaurant/${restaurantId}/garcom/reservation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: reservationName,
            date: reservationDate,
            time: reservationTime,
            tableId: reservationTable.id,
            peopleCount: Number(reservationPeopleCount),
          }),
        },
      );

      const data = await res.json();

      if (res.status === 409) {
        setAlert({
          message:
            data.error ||
            "Esta mesa já possui uma reserva próxima desse horário.",
          type: "error",
        });

        return;
      }

      if (!res.ok) {
        setAlert({
          message: data.error || "Erro ao criar reserva.",
          type: "error",
        });

        return;
      }

      setAlert({
        message: "Reserva criada com sucesso!",
        type: "success",
      });

      const reservationsRes = await fetch(
        `/api/restaurant/${restaurantId}/garcom/reservation`,
      );

      if (reservationsRes.ok) {
        const reservationsData = await reservationsRes.json();

        setReservations(reservationsData.reservations);

        setItems((currentItems) =>
          currentItems.map((item) => {
            if (!isRestaurantTable(item)) {
              return item;
            }

            const updatedTable = reservationsData.tables.find(
              (table: { id: number; status: RestaurantTable["status"] }) =>
                String(table.id) === String(item.id),
            );

            if (!updatedTable) {
              return item;
            }

            return {
              ...item,
              status: updatedTable.status,
            };
          }),
        );
      }

      setReservationModal(false);
      setReservationTable(null);

      setReservationName("");
      setReservationDate("");
      setReservationTime("");
      setReservationPeopleCount("");
      setAlert({
        message: null,
        type: "error",
      });
    } catch (error) {
      console.error("Erro inesperado ao criar reserva:", error);

      setAlert({
        message: "Não foi possível criar a reserva. Tente novamente.",
        type: "error",
      });
    }
  }

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full aspect-square rounded-2xl border border-gray-200 bg-white overflow-hidden select-none"
      style={{
        cursor: isPanning
          ? "grabbing"
          : zoom > minZoomRef.current
            ? "grab"
            : "default",
      }}
      onMouseDownCapture={(e) => {
        if (e.button !== 0 && e.button !== 2) return;

        setIsPanning(true);
        setLastPanPoint({
          x: e.clientX,
          y: e.clientY,
        });
      }}
      onMouseLeave={() => setIsPanning(false)}
    >
      {loading && (
        <div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-white/40 backdrop-blur-sm">
          <LoaderCircle className="w-8 h-8 text-(--color-primary) animate-spin" />
          <p className="text-sm font-medium text-[#1b325f] bg-white/80 px-4 py-1.5 rounded-full shadow-sm">
            Carregando salao...
          </p>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {floors.map((floor) => (
          <FloorRenderer
            key={floor.id}
            floor={floor}
            role={role}
            isSelected={false}
            isHovered={false}
            isDragging={false}
            zoom={zoom}
            onClick={() => {}}
            onMouseDown={(e: React.MouseEvent) => {
              setIsPanning(true);
              setLastPanPoint({
                x: e.clientX,
                y: e.clientY,
              });
            }}
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
            onResizeStart={() => {}}
            onDelete={() => {}}
          />
        ))}

        {walls.map((wall) => (
          <WallRenderer
            key={wall.id}
            wall={wall}
            role={role}
            flatStart={isDoorNearWallEnd(wall, "start")}
            flatEnd={isDoorNearWallEnd(wall, "end")}
            isSelected={false}
            isHovered={false}
            isDragging={false}
            zoom={zoom}
            onClick={() => {}}
            onMouseDown={() => {}}
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
            onResizeStart={() => {}}
            onDelete={() => {}}
          />
        ))}

        {items.map((item) => {
          const size = elementSize[item.type];
          const rotation = item.rotation || 0;
          const isTable = isRestaurantTable(item);

          return (
            <div
              key={item.id}
              className="absolute"
              style={{
                left: item.x,
                top: item.y,
                width: size.w,
                height: size.h,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "center center",
                cursor: isTable ? "pointer" : "default",
                zIndex: selectedTableId === item.id ? 100 : 1,
              }}
              onClick={(e) => {
                e.stopPropagation();

                if (didDragRef.current) return;

                if (!isTable) return;

                setSelectedTableId((prev) =>
                  prev === item.id ? null : item.id,
                );
              }}
            >
              {/* <div
                className={
                  selectedTableId === item.id
                    ? "relative w-full h-full ring-2 ring-(--color-primary) rounded-md"
                    : "relative w-full h-full"
                }
              >
                {renderElement(item)}
              </div> */}
              <div className="relative w-full h-full">
                {renderElement(item)}

                {selectedTableId === item.id && (
                  <div className="absolute -inset-1 border-2 border-(--color-primary) rounded-md pointer-events-none" />
                )}
              </div>
            </div>
          );
        })}

        {selectedTable &&
          (() => {
            const bounds = getItemBounds(selectedTable);
            const panelWidth = 280;
            const spaceRight = containerRef.current
              ? containerRef.current.clientWidth - (bounds.right * zoom + pan.x)
              : 0;

            const showLeft = spaceRight < panelWidth + 20;
            return (
              <div
                className="absolute z-[200]"
                style={{
                  left: showLeft ? bounds.left - 12 : bounds.right + 12,
                  top: (bounds.top + bounds.bottom) / 2,
                  transform: showLeft
                    ? "translate(-100%, -50%)"
                    : "translateY(-50%)",
                }}
              >
                <TableActionPanel
                  role={role}
                  table={selectedTable}
                  nextReservation={nextReservation}
                  mainCustomer={mainCustomer}
                  onClose={() => {
                    setOrdersModal(false);
                    setSelectedTableId(null);
                  }}
                  onOrders={() => {
                    setOrdersModal(true);
                  }}
                  onReserve={() => {
                    setReservationTable(selectedTable);

                    setReservationName("");
                    setReservationDate("");
                    setReservationTime("");
                    setReservationPeopleCount("");
                    setReservationModal(true);

                    setAlert({
                      message: null,
                      type: "error",
                    });
                  }}
                  onOccupy={() => {
                    setOccupationTable(selectedTable);
                    setOccupationName("");

                    setAlert({
                      message: null,
                      type: "error",
                    });

                    setOccupationModal(true);
                  }}
                />
              </div>
            );
          })()}
      </div>

      {reservationModal && reservationTable && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-[#19274b]">
                  Reservar Mesa {reservationTable.tableNumber}
                </h2>
                <p className="text-[15px] text-[#818598]">
                  Preencha os dados para reservar essa mesa
                </p>
              </div>

              <button
                onClick={() => {
                  setReservationModal(false);
                  setReservationTable(null);

                  setAlert({
                    message: null,
                    type: "error",
                  });
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <AnimatedAlert
              message={alert.message}
              type={alert.type}
              onClose={() =>
                setAlert((prev) => ({
                  ...prev,
                  message: null,
                }))
              }
            />
            <div className="mt-3">
              <label className="block mb-1 text-sm font-medium text-[#19274b]">
                Nome do reservante
              </label>

              <input
                value={reservationName}
                onChange={(e) => setReservationName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full h-[52px] border border-gray-200 rounded-lg px-4 text-[16px] text-[#19274b] outline-none transition focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
                maxLength={100}
              />
            </div>

            <div className="mt-5">
              <label className="block mb-1.5 text-sm font-medium text-[#19274b]">
                Quantidade de pessoas
              </label>

              <input
                type="number"
                min={1}
                max={reservationTable.capacity}
                value={reservationPeopleCount}
                onChange={(e) => {
                  setReservationPeopleCount(e.target.value);
                  setAlert({
                    message: null,
                    type: "error",
                  });
                }}
                placeholder={`Ex: 4 (máx. ${reservationTable.capacity})`}
                className="w-full h-[52px] border border-gray-200 rounded-lg px-4 text-[16px] text-[#19274b] outline-none transition focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
              />
            </div>

            <div className="mt-5">
              <label className="block mb-1.5 text-sm font-medium text-[#19274b]">
                Data da reserva
              </label>

              <div className="relative">
                <input
                  type="date"
                  value={reservationDate}
                  min={getTodayLocal()}
                  onChange={handleReservationDateChange}
                  className="
    w-full h-[52px]
    border border-gray-200
    rounded-lg
    px-4 pr-12
    text-[16px] text-[#19274b]
    outline-none
    transition
    focus:border-(--color-primary)
    focus:ring-1 focus:ring-(--color-primary)
    [&::-webkit-calendar-picker-indicator]:opacity-0
    [&::-webkit-calendar-picker-indicator]:absolute
    [&::-webkit-calendar-picker-indicator]:right-0
    [&::-webkit-calendar-picker-indicator]:w-full
    [&::-webkit-calendar-picker-indicator]:h-full
    [&::-webkit-calendar-picker-indicator]:cursor-pointer
  "
                />

                <CalendarDays
                  className="
        absolute
        right-4
        top-1/2
        -translate-y-1/2
        w-5
        h-5
        text-[#536078]
        pointer-events-none
      "
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="block mb-1.5 text-sm font-medium text-[#19274b]">
                Horário da reserva
              </label>

              <div className="relative">
                <input
                  type="time"
                  value={reservationTime}
                  min={reservationMinTime}
                  max={reservationMaxTime}
                  disabled={!selectedDayHours?.enabled}
                  onChange={(e) => {
                    setReservationTime(e.target.value);
                    setAlert({
                      message: null,
                      type: "error",
                    });
                  }}
                  className="
    w-full h-[52px]
    border border-gray-200
    rounded-lg
    px-4 pr-12
    text-[16px] text-[#19274b]
    outline-none
    transition
    disabled:bg-gray-100
    disabled:text-gray-400
    disabled:cursor-not-allowed
    focus:border-(--color-primary)
    focus:ring-1 focus:ring-(--color-primary)
    [&::-webkit-calendar-picker-indicator]:opacity-0
    [&::-webkit-calendar-picker-indicator]:absolute
    [&::-webkit-calendar-picker-indicator]:right-0
    [&::-webkit-calendar-picker-indicator]:w-full
    [&::-webkit-calendar-picker-indicator]:h-full
    [&::-webkit-calendar-picker-indicator]:cursor-pointer
  "
                />

                <Clock3
                  className="
        absolute
        right-4
        top-1/2
        -translate-y-1/2
        w-5
        h-5
        text-[#536078]
        pointer-events-none
      "
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={async () => {
                  setAlert({
                    message: null,
                    type: "error",
                  });

                  if (!reservationName.trim()) {
                    setAlert({
                      message: "Informe o nome do reservante.",
                      type: "error",
                    });
                    return;
                  }

                  const peopleCount = Number(reservationPeopleCount);

                  if (!reservationPeopleCount || peopleCount < 1) {
                    setAlert({
                      message: "Informe a quantidade de pessoas.",
                      type: "error",
                    });
                    return;
                  }

                  if (
                    reservationTable.capacity !== undefined &&
                    peopleCount > reservationTable.capacity
                  ) {
                    setAlert({
                      message: `Esta mesa comporta no máximo ${reservationTable.capacity} pessoas.`,
                      type: "error",
                    });
                    return;
                  }

                  if (!reservationDate) {
                    setAlert({
                      message: "Selecione uma data para a reserva.",
                      type: "error",
                    });
                    return;
                  }

                  const hours = getSelectedDayHours(reservationDate);

                  if (!hours || !hours.enabled) {
                    setAlert({
                      message:
                        "O restaurante não funciona neste dia da semana.",
                      type: "error",
                    });
                    return;
                  }

                  if (!reservationTime) {
                    setAlert({
                      message: "Selecione um horário para a reserva.",
                      type: "error",
                    });
                    return;
                  }

                  if (!isReservationTimeValid()) {
                    setAlert({
                      message: `O restaurante funciona das ${reservationMinTime} às ${reservationMaxTime} neste dia.`,
                      type: "error",
                    });
                    return;
                  }

                  await CreateReservation();
                }}
                className="w-full py-2 rounded-md text-white bg-(--color-primary) hover:bg-(--color-secondary) transition cursor-pointer"
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {occupationModal && occupationTable && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-[#19274b]">
                  Ocupar Mesa {occupationTable.tableNumber}
                </h2>

                <p className="text-[15px] text-[#818598]">
                  Informe o nome do cliente principal
                </p>
              </div>

              <button
                onClick={() => {
                  setOccupationModal(false);
                  setOccupationTable(null);
                  setOccupationName("");
                  setOccupationPeopleCount("");
                  setAlert({
                    message: null,
                    type: "error",
                  });
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* ALERTA */}
            <AnimatedAlert
              message={alert.message}
              type={alert.type}
              onClose={() =>
                setAlert((prev) => ({
                  ...prev,
                  message: null,
                }))
              }
            />

            {/* NOME */}
            <div>
              <label className="block mb-1 text-sm font-medium text-[#19274b]">
                Nome do cliente principal
              </label>

              <input
                autoFocus
                value={occupationName}
                onChange={(e) => setOccupationName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full h-[52px] border border-gray-200 rounded-lg px-4 text-[16px] text-[#19274b] outline-none transition focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
                maxLength={100}
              />
            </div>

            <div className="mt-5">
              <label className="block mb-1.5 text-sm font-medium text-[#19274b]">
                Quantidade de pessoas
              </label>

              <input
                type="number"
                min={1}
                max={occupationTable.capacity}
                value={occupationPeopleCount}
                onChange={(e) => {
                  setOccupationPeopleCount(e.target.value);
                  setAlert({
                    message: null,
                    type: "error",
                  });
                }}
                placeholder={`Ex: 4 (máx. ${occupationTable.capacity})`}
                className="w-full h-[52px] border border-gray-200 rounded-lg px-4 text-[16px] text-[#19274b] outline-none transition focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
              />
            </div>

            {/* BOTÕES */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={async () => {
                  setAlert({
                    message: null,
                    type: "error",
                  });

                  if (!occupationName.trim()) {
                    setAlert({
                      message: "Informe o nome do cliente principal.",
                      type: "error",
                    });

                    return;
                  }

                  const peopleCount = Number(occupationPeopleCount);

                  if (!occupationPeopleCount || peopleCount < 1) {
                    setAlert({
                      message: "Informe a quantidade de pessoas.",
                      type: "error",
                    });

                    return;
                  }

                  if (
                    occupationTable.capacity !== undefined &&
                    peopleCount > occupationTable.capacity
                  ) {
                    setAlert({
                      message: `Esta mesa comporta no máximo ${occupationTable.capacity} pessoas.`,
                      type: "error",
                    });

                    return;
                  }

                  await OccupyTable();

                  await OccupyTable();
                }}
                className="w-full py-2 rounded-md text-white bg-(--color-primary) hover:bg-(--color-secondary) transition cursor-pointer"
              >
                Ocupar mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {ordersModal && selectedTable && (
        <Pedidos
          restaurantId={restaurantId}
          tableId={String(selectedTable.id)}
          tableNumber={selectedTable.tableNumber ?? 0}
          tableType={selectedTable.type}
          tableCapacity={selectedTable.capacity}
          onClose={() => setOrdersModal(false)}
        />
      )}
    </div>
  );
}
