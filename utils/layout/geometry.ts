 export function getAngle(cx: number, cy: number, mx: number, my: number) {
    return Math.atan2(my - cy, mx - cx) * (180 / Math.PI);
  }

    export function getOBB(px: number, py: number, w: number, h: number, rot: number) {
      const rad = (rot * Math.PI) / 180;
      const cx = px + w / 2;
      const cy = py + h / 2;
      const corners = [
        { x: -w / 2, y: -h / 2 },
        { x: w / 2, y: -h / 2 },
        { x: w / 2, y: h / 2 },
        { x: -w / 2, y: h / 2 },
      ].map(({ x: dx, y: dy }) => ({
        x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
        y: cy + dx * Math.sin(rad) + dy * Math.cos(rad),
      }));
      const xs = corners.map((c) => c.x);
      const ys = corners.map((c) => c.y);
      return {
        left: Math.min(...xs),
        right: Math.max(...xs),
        top: Math.min(...ys),
        bottom: Math.max(...ys),
        cx,
        cy,
      };
    }

    

    