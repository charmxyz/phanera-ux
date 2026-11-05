/**
 * Pixel-ant sprites, rasterised from simple geometry (ellipses for body segments,
 * polylines for legs/antennae) so they stay consistent at every size.
 * Pure data: safe to import from server and client components.
 */
export type Cell = readonly [x: number, y: number];
export type Sprite = { w: number; h: number; body: Cell[]; legs: [Cell[], Cell[]]; still: Cell[] };
type Pt = [number, number];

function ellipse(cx: number, cy: number, rx: number, ry: number): Cell[] {
  const out: Cell[] = [];
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0) out.push([x, y]);
  return out;
}

function line([x0, y0]: Pt, [x1, y1]: Pt): Cell[] {
  const out: Cell[] = [];
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) out.push([Math.round(x0 + ((x1 - x0) * i) / steps), Math.round(y0 + ((y1 - y0) * i) / steps)]);
  return out;
}

const poly = (pts: Pt[]) => pts.slice(1).flatMap((p, i) => line(pts[i], p));

function uniq(cells: Cell[], exclude: Cell[] = []): Cell[] {
  const seen = new Set(exclude.map(([x, y]) => `${x},${y}`));
  return cells.filter(([x, y]) => {
    const k = `${x},${y}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Top-down ant facing up (-y). Legs alternate in a tripod gait across the two frames. */
function topAnt(): Sprite {
  const w = 25;
  const h = 27;
  const c = 12;
  const m = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [w - 1 - x, y]);
  const antenna: Pt[] = [[c - 1, 4], [c - 3, 2], [c - 5, 0]];
  const body = uniq([
    ...ellipse(c, 6, 2.4, 2.3),
    [c, 9],
    ...ellipse(c, 12, 1.6, 2.5),
    [c, 15],
    ...ellipse(c, 20.5, 3.3, 4.8),
    ...poly(antenna),
    ...poly(m(antenna)),
  ]);
  const leg = (side: "l" | "r", which: 0 | 1 | 2, d: number): Cell[] => {
    // Only the foot moves between frames, so the silhouette stays crisp.
    const shapes: Pt[][] = [
      [[c - 2, 11], [c - 5, 9], [c - 8, 8], [c - 10, 6 + d]],
      [[c - 2, 12], [c - 6, 12], [c - 9, 13], [c - 12, 14 + d]],
      [[c - 2, 13], [c - 5, 15], [c - 8, 18], [c - 10, 22 + d]],
    ];
    const pts = shapes[which];
    return poly(side === "l" ? pts : m(pts));
  };
  // Tripod gait: L-front, R-mid, L-back step together; the other three are offset.
  const frame = (p: number) =>
    uniq(
      [leg("l", 0, -p), leg("r", 1, p), leg("l", 2, -p), leg("r", 0, p), leg("l", 1, -p), leg("r", 2, p)].flat(),
      body,
    );
  return { w, h, body, legs: [frame(1), frame(-1)], still: frame(0) };
}

export const TOP_ANT = topAnt();

/** Compact SVG path: one 1×1 square per cell (scaled by `fill` for the gap between pixels). */
export function cellsToPath(cells: Cell[], fill = 0.78, dx = 0, dy = 0): string {
  const o = (1 - fill) / 2;
  return cells.map(([x, y]) => `M${+(x + dx + o).toFixed(2)} ${+(y + dy + o).toFixed(2)}h${fill}v${fill}h-${fill}z`).join("");
}
