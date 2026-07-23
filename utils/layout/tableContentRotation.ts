export function normalizeRotation(rotation: number) {
  return ((rotation % 360) + 360) % 360;
}

// Vertical
export function isRectTableVertical(rotation: number) {
  const normalized = normalizeRotation(rotation);

  return normalized === 90 || normalized === 270;
}

// Horizontal invertida
export function isRectTableHorizontalFlipped(rotation: number) {
  const normalized = normalizeRotation(rotation);

  return normalized === 180;
}

// Vertical invertida
export function isRectTableVerticalFlipped(rotation: number) {
  const normalized = normalizeRotation(rotation);

  return normalized === 270;
}

export function getLTableCorner(rotation: number) {
  const normalized = normalizeRotation(rotation);

  switch (normalized) {
    case 0:
      return "top-left";

    case 90:
      return "top-right";

    case 180:
      return "bottom-right";

    case 270:
      return "bottom-left";

    default:
      return "top-left";
  }
}