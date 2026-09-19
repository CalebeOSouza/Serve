import {
  GRID_SIZE_WALL,
  HALF_GRID_SIZE_WALL,
  WALL_THICKNESS,
  WALL_THICKNESS_INTERNA,
} from "./constants";

const QUARTER_GRID_SIZE_WALL = GRID_SIZE_WALL / 4;

export function snapInternalWallEdge(raw: number): number {
  const columnSnap =
    Math.round(raw / QUARTER_GRID_SIZE_WALL) * QUARTER_GRID_SIZE_WALL;

  const nearestGridLine = Math.round(raw / GRID_SIZE_WALL) * GRID_SIZE_WALL;
  const borderCenterSnap = nearestGridLine - WALL_THICKNESS_INTERNA / 2;

  const distToColumn = Math.abs(raw - columnSnap);
  const distToBorderCenter = Math.abs(raw - borderCenterSnap);

  return distToBorderCenter < distToColumn ? borderCenterSnap : columnSnap;
}

export function getInternalWallAnchorPoint(worldX: number, worldY: number) {
  return {
    x: snapInternalWallEdge(worldX),
    y: snapInternalWallEdge(worldY),
  };
}

export function snapToGrid(val: number): number {
  return Math.round(val / GRID_SIZE_WALL) * GRID_SIZE_WALL;
}

export function snapToHalfGrid(val: number): number {
  return Math.round(val / HALF_GRID_SIZE_WALL) * HALF_GRID_SIZE_WALL;
}

export function isWallTooSmall(ax: number, ay: number, bx: number, by: number) {
  const dx = Math.abs(bx - ax);
  const dy = Math.abs(by - ay);

  return Math.max(dx, dy) < GRID_SIZE_WALL;
}

function snapExternalWallColumn(raw: number): number {
  const nearestLine = Math.round(raw / GRID_SIZE_WALL) * GRID_SIZE_WALL;
  const side: "near" | "far" = raw >= nearestLine ? "far" : "near";
  return side === "near" ? nearestLine - WALL_THICKNESS : nearestLine;
}

export function snapExternalWallEdge(raw: number): number {
  const columnSnap = snapExternalWallColumn(raw); // comportamento atual
  const nearestGridLine = Math.round(raw / GRID_SIZE_WALL) * GRID_SIZE_WALL;
  const borderCenterSnap = nearestGridLine - WALL_THICKNESS / 2; // novo: centralizado na fronteira

  const distToColumn = Math.abs(raw - columnSnap);
  const distToBorderCenter = Math.abs(raw - borderCenterSnap);

  return distToBorderCenter < distToColumn ? borderCenterSnap : columnSnap;
}

export type WallAnchorQuadrant =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export function getWallAnchorPoint(worldX: number, worldY: number) {
   return {
    x: snapExternalWallEdge(worldX),
    y: snapExternalWallEdge(worldY),
  };
}


// import {
//   GRID_SIZE_WALL,
//   HALF_GRID_SIZE_WALL,
//   WALL_THICKNESS,
//   WALL_THICKNESS_INTERNA,
// } from "./constants";

// const QUARTER_GRID_SIZE_WALL = GRID_SIZE_WALL / 4;

// export function snapInternalWallEdge(raw: number): number {
//   const columnSnap =
//     Math.round(raw / QUARTER_GRID_SIZE_WALL) * QUARTER_GRID_SIZE_WALL;

//   const nearestGridLine = Math.round(raw / GRID_SIZE_WALL) * GRID_SIZE_WALL;
//   const borderCenterSnap = nearestGridLine - WALL_THICKNESS_INTERNA / 2;

//   const distToColumn = Math.abs(raw - columnSnap);
//   const distToBorderCenter = Math.abs(raw - borderCenterSnap);

//   return distToBorderCenter < distToColumn ? borderCenterSnap : columnSnap;
// }

// export function getInternalWallAnchorPoint(worldX: number, worldY: number) {
//   return {
//     x: snapInternalWallEdge(worldX),
//     y: snapInternalWallEdge(worldY),
//   };
// }

// export function snapToGrid(val: number): number {
//   return Math.round(val / GRID_SIZE_WALL) * GRID_SIZE_WALL;
// }

// export function snapToHalfGrid(val: number): number {
//   return Math.round(val / HALF_GRID_SIZE_WALL) * HALF_GRID_SIZE_WALL;
// }

// export function isWallTooSmall(ax: number, ay: number, bx: number, by: number) {
//   const dx = Math.abs(bx - ax);
//   const dy = Math.abs(by - ay);

//   return Math.max(dx, dy) < GRID_SIZE_WALL;
// }

// export type WallAnchorQuadrant =
//   | "top-left"
//   | "top-right"
//   | "bottom-left"
//   | "bottom-right";

// export function getWallAnchorPoint(worldX: number, worldY: number) {
//   const cellX = Math.floor(worldX / GRID_SIZE_WALL) * GRID_SIZE_WALL;
//   const cellY = Math.floor(worldY / GRID_SIZE_WALL) * GRID_SIZE_WALL;

//   const localX = worldX - cellX;
//   const localY = worldY - cellY;

//   const half = GRID_SIZE_WALL / 2;

//   let quadrant: WallAnchorQuadrant;

//   if (localX < half && localY < half) {
//     quadrant = "top-left";
//   } else if (localX >= half && localY < half) {
//     quadrant = "top-right";
//   } else if (localX < half && localY >= half) {
//     quadrant = "bottom-left";
//   } else {
//     quadrant = "bottom-right";
//   }

//   const anchorMap = {
//     "top-left": {
//       x: cellX,
//       y: cellY,
//     },

//     "top-right": {
//       x: cellX + half,
//       y: cellY,
//     },

//     "bottom-left": {
//       x: cellX,
//       y: cellY + half,
//     },

//     "bottom-right": {
//       x: cellX + half,
//       y: cellY + half,
//     },
//   };

//   return {
//     quadrant,
//     x: anchorMap[quadrant].x,
//     y: anchorMap[quadrant].y,
//   };
// }
