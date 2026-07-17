import type { Wall } from "@/components/dashboard/dashboard_layout/wallRenderer";
import type { Floor } from "@/components/dashboard/dashboard_layout/floorRenderer";

export type TableStatus = "livre" | "reservada" | "ocupada" | "indisponivel";

export type AllCanvasItem = RestaurantTable | LayoutItem;

export type RestaurantTable = {
  id: string;

  tableNumber?: number;

  capacity?: number;

  status?: TableStatus;

  type: TableType;

  x: number;
  y: number;

  rotation: number;
};

export type LayoutItem = {
  id: string;

  type: ElementType;

  x: number;
  y: number;

  rotation: number;

  swingDirection?: "left" | "right";
};

export type ElementConfig = {
  type: TableType | ElementType | "parede" | "parede_interna" | "piso";
  label: string;
  render: () => React.ReactNode;
};

export type TableType =
  | "mesa_quadrada"
  | "mesa_redonda"
  | "mesa_retangular"
  | "mesa_l";

export type ElementType = "porta";

export type Action =
  | { type: "ADD"; item: AllCanvasItem }
  | { type: "REMOVE"; id: string; item: AllCanvasItem }
  | {
      type: "MOVE";
      id: string;
      from: { x: number; y: number };
      to: { x: number; y: number };
    }
  | { type: "ROTATE"; id: string; from: number; to: number }
  | {
      type: "FLIP_DOOR";
      id: string;
      from: "left" | "right";
      to: "left" | "right";
    }

  // Parede
  | { type: "ADD_WALL"; wall: Wall }
  | { type: "REMOVE_WALL"; id: string; wall: Wall }
  | {
      type: "MOVE_WALL";
      id: string;
      from: { x: number; y: number };
      to: { x: number; y: number };
    }
  | {
      type: "RESIZE_WALL";
      id: string;
      from: { x: number; y: number; width: number };
      to: { x: number; y: number; width: number };
    }

  //Piso
  | { type: "ADD_FLOOR"; floor: Floor }
  | { type: "REMOVE_FLOOR"; id: string; floor: Floor }
  | {
      type: "MOVE_FLOOR";
      id: string;
      from: { x: number; y: number };
      to: { x: number; y: number };
    }
  | {
      type: "RESIZE_FLOOR";
      id: string;
      from: { x: number; y: number; width: number; height: number };
      to: { x: number; y: number; width: number; height: number };
    }
  | { type: "PASTE_FLOOR"; floor: Floor }
  | { type: "PASTE"; item: AllCanvasItem }
  | { type: "PASTE_WALL"; wall: Wall };

// export type LayoutItem = {
//   id: string;

//   // Número fixo da mesa
//   tableNumber?: number;

//   // Quantidade de pessoas
//   capacity?: number;

//   // Estado atual da mesa
//   status?: TableStatus;

//   type: ElementType;
//   x: number;
//   y: number;
//   rotation: number;

//   chairs?: number;

//   swingDirection?: "left" | "right";
// };
