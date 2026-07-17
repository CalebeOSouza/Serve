import { Action, LayoutItem, AllCanvasItem } from "@/app/admin/dashboard/[id]/layout/types";
import type { Wall } from "@/components/dashboard/dashboard_layout/wallRenderer";
import type { Floor } from "@/components/dashboard/dashboard_layout/floorRenderer";

export function applyAction(
  items: AllCanvasItem[],
  walls: Wall[],
  floors: Floor[],
  action: Action,
): { items: AllCanvasItem[]; walls: Wall[]; floors: Floor[] } {
  switch (action.type) {
    case "ADD":
      return { items: [...items, action.item], walls, floors };
    case "REMOVE":
      return { items: items.filter((i) => i.id !== action.id), walls, floors };
    case "MOVE":
      return {
        items: items.map((i) => (i.id === action.id ? { ...i, x: action.to.x, y: action.to.y } : i)),
        walls,
        floors,
      };
    case "ROTATE":
      return {
        items: items.map((i) => (i.id === action.id ? { ...i, rotation: action.to } : i)),
        walls,
        floors,
      };
    case "FLIP_DOOR":
      return {
        items: items.map((i) => (i.id === action.id ? { ...i, swingDirection: action.to } : i)),
        walls,
        floors,
      };
    case "ADD_WALL":
      return { items, walls: [...walls, action.wall], floors };
    case "REMOVE_WALL":
      return { items, walls: walls.filter((w) => w.id !== action.id), floors };
    case "MOVE_WALL":
      return {
        items,
        walls: walls.map((w) => (w.id === action.id ? { ...w, x: action.to.x, y: action.to.y } : w)),
        floors,
      };
    case "RESIZE_WALL":
      return {
        items,
        walls: walls.map((w) =>
          w.id === action.id ? { ...w, x: action.to.x, y: action.to.y, width: action.to.width } : w,
        ),
        floors,
      };

    case "ADD_FLOOR":
      return { items, walls, floors: [...floors, action.floor] };
    case "REMOVE_FLOOR":
      return { items, walls, floors: floors.filter((f) => f.id !== action.id) };
    case "MOVE_FLOOR":
      return {
        items,
        walls,
        floors: floors.map((f) => (f.id === action.id ? { ...f, x: action.to.x, y: action.to.y } : f)),
      };
    case "RESIZE_FLOOR":
      return {
        items,
        walls,
        floors: floors.map((f) =>
          f.id === action.id
            ? { ...f, x: action.to.x, y: action.to.y, width: action.to.width, height: action.to.height }
            : f,
        ),
      };

    case "PASTE":
      return { items: [...items, action.item], walls, floors };
    case "PASTE_WALL":
      return { items, walls: [...walls, action.wall], floors };

  case "PASTE_FLOOR":
      return { items, walls, floors: [...floors, action.floor] };

  }
  
}

export function applyInverse(
  items: AllCanvasItem[],
  walls: Wall[],
  floors: Floor[],
  action: Action,
): { items: AllCanvasItem[]; walls: Wall[]; floors: Floor[] } {
  switch (action.type) {
    case "ADD":
      return { items: items.filter((i) => i.id !== action.item.id), walls, floors };
    case "REMOVE":
      return { items: [...items, action.item], walls, floors };
    case "MOVE":
      return {
        items: items.map((i) => (i.id === action.id ? { ...i, x: action.from.x, y: action.from.y } : i)),
        walls,
        floors,
      };
    case "ROTATE":
      return {
        items: items.map((i) => (i.id === action.id ? { ...i, rotation: action.from } : i)),
        walls,
        floors,
      };
    case "FLIP_DOOR":
      return {
        items: items.map((i) => (i.id === action.id ? { ...i, swingDirection: action.from } : i)),
        walls,
        floors,
      };
    case "ADD_WALL":
      return { items, walls: walls.filter((w) => w.id !== action.wall.id), floors };
    case "REMOVE_WALL":
      return { items, walls: [...walls, action.wall], floors };
    case "MOVE_WALL":
      return {
        items,
        walls: walls.map((w) => (w.id === action.id ? { ...w, x: action.from.x, y: action.from.y } : w)),
        floors,
      };
    case "RESIZE_WALL":
      return {
        items,
        walls: walls.map((w) =>
          w.id === action.id ? { ...w, x: action.from.x, y: action.from.y, width: action.from.width } : w,
        ),
        floors,
      };

    case "ADD_FLOOR":
      return { items, walls, floors: floors.filter((f) => f.id !== action.floor.id) };
    case "REMOVE_FLOOR":
      return { items, walls, floors: [...floors, action.floor] };
    case "MOVE_FLOOR":
      return {
        items,
        walls,
        floors: floors.map((f) => (f.id === action.id ? { ...f, x: action.from.x, y: action.from.y } : f)),
      };
    case "RESIZE_FLOOR":
      return {
        items,
        walls,
        floors: floors.map((f) =>
          f.id === action.id
            ? { ...f, x: action.from.x, y: action.from.y, width: action.from.width, height: action.from.height }
            : f,
        ),
      };

    case "PASTE":
      return { items: items.filter((i) => i.id !== action.item.id), walls, floors };
    case "PASTE_WALL":
      return { items, walls: walls.filter((w) => w.id !== action.wall.id), floors };
case "PASTE_FLOOR":
      return { items, walls, floors: floors.filter((f) => f.id !== action.floor.id) };

  }
}

//  import { Action, LayoutItem, AllCanvasItem } from "@/app/admin/dashboard/[id]/layout/types";
// import type { Wall } from "@/components/dashboard/dashboard_layout/wallRenderer";
 
//  export function applyAction(
//     items: AllCanvasItem[],
//     walls: Wall[],
//     action: Action,
//   ): { items: AllCanvasItem[]; walls: Wall[] } {
//     switch (action.type) {
//       case "ADD":
//         return { items: [...items, action.item], walls };
//       case "REMOVE":
//         return { items: items.filter((i) => i.id !== action.id), walls };
//       case "MOVE":
//         return {
//           items: items.map((i) =>
//             i.id === action.id ? { ...i, x: action.to.x, y: action.to.y } : i,
//           ),
//           walls,
//         };
//       case "ROTATE":
//         return {
//           items: items.map((i) =>
//             i.id === action.id ? { ...i, rotation: action.to } : i,
//           ),
//           walls,
//         };

        
// case "FLIP_DOOR":
//   return {
//     items: items.map((i) =>
//       i.id === action.id
//         ? {
//             ...i,
//             swingDirection: action.to,
//           }
//         : i,
//     ),
//     walls,
//   };

//       case "ADD_WALL":
//         return { items, walls: [...walls, action.wall] };
//       case "REMOVE_WALL":
//         return { items, walls: walls.filter((w) => w.id !== action.id) };
//       case "MOVE_WALL":
//         return {
//           items,
//           walls: walls.map((w) =>
//             w.id === action.id ? { ...w, x: action.to.x, y: action.to.y } : w,
//           ),
//         };
//       case "RESIZE_WALL":
//         return {
//           items,
//           walls: walls.map((w) =>
//             w.id === action.id
//               ? {
//                   ...w,
//                   x: action.to.x,
//                   y: action.to.y,
//                   width: action.to.width,
//                 }
//               : w,
//           ),
//         };

//       case "PASTE":
//         return {
//           items: [...items, action.item],
//           walls,
//         };

//       case "PASTE_WALL":
//         return {
//           items,
//           walls: [...walls, action.wall],
//         };
        
//     }
//   }

//    export function applyInverse(
//     items: AllCanvasItem[],
//     walls: Wall[],
//     action: Action,
//   ): { items: AllCanvasItem[]; walls: Wall[] } {
//     switch (action.type) {
//       case "ADD":
//         return { items: items.filter((i) => i.id !== action.item.id), walls };
//       case "REMOVE":
//         return { items: [...items, action.item], walls };
//       case "MOVE":
//         return {
//           items: items.map((i) =>
//             i.id === action.id
//               ? { ...i, x: action.from.x, y: action.from.y }
//               : i,
//           ),
//           walls,
//         };
//       case "ROTATE":
//         return {
//           items: items.map((i) =>
//             i.id === action.id ? { ...i, rotation: action.from } : i,
//           ),
//           walls,
//         };

// case "FLIP_DOOR":
//   return {
//     items: items.map((i) =>
//       i.id === action.id
//         ? {
//             ...i,
//             swingDirection: action.from,
//           }
//         : i,
//     ),
//     walls,
//   };

//       case "ADD_WALL":
//         return { items, walls: walls.filter((w) => w.id !== action.wall.id) };
//       case "REMOVE_WALL":
//         return { items, walls: [...walls, action.wall] };
//       case "MOVE_WALL":
//         return {
//           items,
//           walls: walls.map((w) =>
//             w.id === action.id
//               ? { ...w, x: action.from.x, y: action.from.y }
//               : w,
//           ),
//         };
//       case "RESIZE_WALL":
//         return {
//           items,
//           walls: walls.map((w) =>
//             w.id === action.id
//               ? {
//                   ...w,
//                   x: action.from.x,
//                   y: action.from.y,
//                   width: action.from.width,
//                 }
//               : w,
//           ),
//         };
//       case "PASTE":
//         return {
//           items: items.filter((i) => i.id !== action.item.id),
//           walls,
//         };

//       case "PASTE_WALL":
//         return {
//           items,
//           walls: walls.filter((w) => w.id !== action.wall.id),
//         };
//     }
//   }


