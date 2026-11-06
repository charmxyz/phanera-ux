/**
 * Isometric line-art primitives (SVG): tiles, a laptop, a phone, badges, connectors and a
 * faint grid. World units are px; x runs down-right, y down-left, z up.
 * Pure markup: safe in server components. Motion is CSS (see .iso-* in globals.css).
 */
import { TOP_ANT, cellsToPath } from "@/components/ants/sprites";

export const C = Math.cos(Math.PI / 6);
export const S = 0.5;
export type Pt = [number, number];

/** World (x, y, z) → screen. */
export const P = (x: number, y: number, z = 0): Pt => [(x - y) * C, (x + y) * S - z];
const pts = (...ps: Pt[]) => ps.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
/** Matrix that lays flat 2D artwork (u right, v down) onto the floor/top plane at `origin`. */
const flat = ([ox, oy]: Pt, s = 1) => `matrix(${C * s} ${S * s} ${-C * s} ${S * s} ${ox} ${oy})`;

export const INK = "#16161a";
export const LINE = "#d4d4d9";
export const EDGE = "#a8a8b0";
const FACE = { top: "#ffffff", right: "#efeff2", front: "#e6e6ea" };

/** Bilinear point on a quad given as A (u0v0), B (u1v0), C (u1v1), D (u0v1). */
function onQuad(A: Pt, B: Pt, Cc: Pt, D: Pt) {
  return (u: number, v: number): Pt => {
    const bx = A[0] + (B[0] - A[0]) * u, by = A[1] + (B[1] - A[1]) * u;
    const tx = D[0] + (Cc[0] - D[0]) * u, ty = D[1] + (Cc[1] - D[1]) * u;
    return [bx + (tx - bx) * v, by + (ty - by) * v];
  };
}

/* ------------------------------------------------------------------ grid */

export function IsoGrid({ id, x0, x1, y0, y1, step = 40 }: { id: string; x0: number; x1: number; y0: number; y1: number; step?: number }) {
  const lines: string[] = [];
  for (let x = x0; x <= x1; x += step) lines.push(`M${pts(P(x, y0))}L${pts(P(x, y1))}`);
  for (let y = y0; y <= y1; y += step) lines.push(`M${pts(P(x0, y))}L${pts(P(x1, y))}`);
  const [cx, cy] = P((x0 + x1) / 2, (y0 + y1) / 2);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-fade`} cx={cx} cy={cy} r={Math.max(x1 - x0, y1 - y0) * 0.75} gradientUnits="userSpaceOnUse">
          <stop offset="0.35" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-mask`}><rect x="-5000" y="-5000" width="10000" height="10000" fill={`url(#${id}-fade)`} /></mask>
      </defs>
      <path d={lines.join("")} stroke="#e7e7ea" strokeWidth={1} fill="none" mask={`url(#${id}-mask)`} />
    </g>
  );
}

/* ----------------------------------------------------------------- tiles */

export function Tile({
  x, y, w, d, h = 14, z = 0, active = false, dark = false, screws = true,
}: { x: number; y: number; w: number; d: number; h?: number; z?: number; active?: boolean; dark?: boolean; screws?: boolean }) {
  const t = z + h;
  const stroke = active ? INK : EDGE;
  const i = Math.min(w, d) * 0.06;
  const faces = dark ? { top: "#1d1d22", right: "#111114", front: "#0b0b0e" } : FACE;
  const s = (px: number, py: number) => P(px, py, t);
  return (
    <g strokeLinejoin="round" strokeWidth={active ? 1.4 : 1}>
      <polygon points={pts(P(x, y + d, t), P(x + w, y + d, t), P(x + w, y + d, z), P(x, y + d, z))} fill={faces.front} stroke={stroke} />
      <polygon points={pts(P(x + w, y, t), P(x + w, y + d, t), P(x + w, y + d, z), P(x + w, y, z))} fill={faces.right} stroke={stroke} />
      <polygon points={pts(s(x, y), s(x + w, y), s(x + w, y + d), s(x, y + d))} fill={faces.top} stroke={stroke} />
      <polygon points={pts(s(x + i, y + i), s(x + w - i, y + i), s(x + w - i, y + d - i), s(x + i, y + d - i))} fill="none" stroke={dark ? "#2c2c33" : LINE} />
      {screws &&
        [[x + i / 2, y + i / 2], [x + w - i / 2, y + i / 2], [x + w - i / 2, y + d - i / 2], [x + i / 2, y + d - i / 2]].map(([sx, sy], k) => {
          const [cx, cy] = s(sx, sy);
          return <ellipse key={k} cx={cx} cy={cy} rx={2.2} ry={1.3} fill="none" stroke={dark ? "#3a3a42" : LINE} />;
        })}
    </g>
  );
}

/** The Phanera pixel ant, laid flat on a surface. */
export function FlatAnt({ at, size = 1, color = INK, rotate = 0 }: { at: Pt; size?: number; color?: string; rotate?: number }) {
  const w = TOP_ANT.w, h = TOP_ANT.h;
  return (
    <g transform={flat(at, size)}>
      <g transform={`rotate(${rotate}) translate(${-w / 2} ${-h / 2})`}>
        <path d={cellsToPath([...TOP_ANT.body, ...TOP_ANT.still])} fill={color} />
      </g>
    </g>
  );
}

/* --------------------------------------------------------------- devices */

type ScreenRow = { tone?: "ok" | "warn" | "bad" | "idle"; len?: number };
const TONE = { ok: "#16a34a", warn: "#d97706", bad: "#dc2626", idle: "#b9b9c0" };

function ScreenContent({ q, rows, tight = false }: { q: (u: number, v: number) => Pt; rows: ScreenRow[]; tight?: boolean }) {
  return (
    <g>
      {rows.map((r, k) => {
        const v = 0.74 - k * (tight ? 0.17 : 0.21);
        const [cx, cy] = q(tight ? 0.2 : 0.14, v);
        const a = q(tight ? 0.34 : 0.25, v);
        const b = q((tight ? 0.34 : 0.25) + (r.len ?? 0.55), v);
        const tone = TONE[r.tone ?? "idle"];
        return (
          <g key={k}>
            <circle cx={cx} cy={cy} r={tight ? 3.4 : 4} fill={r.tone && r.tone !== "idle" ? tone : "#fff"} stroke={tone} strokeWidth={1.2} />
            <path d={`M${pts(a)}L${pts(b)}`} stroke={r.tone === "idle" || !r.tone ? "#d9d9de" : "#c9c9cf"} strokeWidth={tight ? 4 : 5} strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
}

/** Laptop on a surface at height z; footprint ~110 × 80, screen facing the viewer. */
export function Laptop({ x, y, z, rows, darkKeys = false }: { x: number; y: number; z: number; rows: ScreenRow[]; darkKeys?: boolean }) {
  const w = 110, d = 78;
  const zb = z + 5;
  const keys: string[] = [];
  const kx0 = x + 14, kx1 = x + w - 14, ky0 = y + 12, ky1 = y + 42;
  for (let k = 0; k <= 5; k++) { const yy = ky0 + ((ky1 - ky0) * k) / 5; keys.push(`M${pts(P(kx0, yy, zb))}L${pts(P(kx1, yy, zb))}`); }
  for (let k = 0; k <= 14; k++) { const xx = kx0 + ((kx1 - kx0) * k) / 14; keys.push(`M${pts(P(xx, ky0, zb))}L${pts(P(xx, ky1, zb))}`); }
  // Screen hinged on the back edge, leaning back.
  const H = 82, lean = 18, hx0 = x + 6, hx1 = x + w - 6, hy = y + 3;
  const A = P(hx0, hy, zb), B = P(hx1, hy, zb), Cc = P(hx1, hy - lean, zb + H), D = P(hx0, hy - lean, zb + H);
  const q = onQuad(A, B, Cc, D);
  const inner = [q(0.05, 0.07), q(0.95, 0.07), q(0.95, 0.93), q(0.05, 0.93)] as Pt[];
  const off: Pt = [3 * C, -3 * S]; // screen thickness toward the back
  return (
    <g strokeLinejoin="round">
      <Tile x={x} y={y} w={w} d={d} h={5} z={z} screws={false} />
      <polygon points={pts(P(kx0, ky0, zb), P(kx1, ky0, zb), P(kx1, ky1, zb), P(kx0, ky1, zb))} fill={darkKeys ? "#232329" : "#f4f4f6"} stroke={darkKeys ? INK : LINE} />
      <path d={keys.join("")} stroke={darkKeys ? "#4a4a52" : LINE} strokeWidth={0.8} />
      <polygon points={pts(P(x + 38, y + 50, zb), P(x + 72, y + 50, zb), P(x + 72, y + 68, zb), P(x + 38, y + 68, zb))} fill="#f6f6f8" stroke={LINE} />
      <polygon points={pts(B, Cc, [Cc[0] + off[0], Cc[1] + off[1]], [B[0] + off[0], B[1] + off[1]])} fill="#d6d6db" stroke={EDGE} />
      <polygon points={pts(A, B, Cc, D)} fill={INK} stroke={INK} />
      <polygon points={pts(...inner)} fill="#fff" />
      <ScreenContent q={onQuad(inner[0], inner[1], inner[2], inner[3])} rows={rows} />
    </g>
  );
}

/** Phone standing on a small stand at height z. */
export function Phone({ x, y, z, rows }: { x: number; y: number; z: number; rows: ScreenRow[] }) {
  const zb = z + 4;
  const px0 = x + 10, px1 = x + 44, py = y + 18, H = 92, lean = 10;
  const A = P(px0, py, zb), B = P(px1, py, zb), Cc = P(px1, py - lean, zb + H), D = P(px0, py - lean, zb + H);
  const off: Pt = [4 * C, -4 * S];
  const q = onQuad(A, B, Cc, D);
  const inner = [q(0.1, 0.05), q(0.9, 0.05), q(0.9, 0.93), q(0.1, 0.93)] as Pt[];
  return (
    <g strokeLinejoin="round">
      <Tile x={x} y={y + 4} w={56} d={36} h={4} z={z} screws={false} />
      <polygon points={pts(B, Cc, [Cc[0] + off[0], Cc[1] + off[1]], [B[0] + off[0], B[1] + off[1]])} fill="#dcdce1" stroke={EDGE} />
      <polygon points={pts(A, B, Cc, D)} fill={INK} stroke={INK} />
      <polygon points={pts(...inner)} fill="#fff" />
      <ScreenContent q={onQuad(inner[0], inner[1], inner[2], inner[3])} rows={rows} tight />
    </g>
  );
}

/* ------------------------------------------------------------ connectors */

/** Floor-level dashed link between two world points; `flow` animates the dashes. */
export function Link({ from, to, active = true, flow = true }: { from: [number, number]; to: [number, number]; active?: boolean; flow?: boolean }) {
  return (
    <path
      d={`M${pts(P(...from))}L${pts(P(...to))}`}
      stroke={active ? INK : EDGE}
      strokeWidth={1.4}
      strokeDasharray="5 7"
      strokeLinecap="round"
      fill="none"
      className={flow ? "iso-flow" : undefined}
    />
  );
}

/* ---------------------------------------------------------------- badges */

/** `step` (0–3) makes the badge pop in at that point of the shared animation cycle. */
export function Badge({ at, label, tone = "ok", step }: { at: Pt; label: string; tone?: "ok" | "warn" | "bad" | "info"; step?: number }) {
  const w = label.length * 7.1 + 40;
  const color = tone === "info" ? INK : TONE[tone];
  return (
    <g transform={`translate(${at[0]} ${at[1]})`}>
      <g className={step != null ? "iso-pop" : undefined} style={step != null ? { animationName: `iso-pop-${step}` } : undefined}>
        <rect x={-w / 2} y={-14} width={w} height={28} rx={14} fill="#fff" stroke={LINE} />
        <circle cx={-w / 2 + 16} cy={0} r={7.5} fill={color} />
        {tone === "ok" || tone === "info" ? (
          <path d={`M${-w / 2 + 12.4},0.2 l2.6,2.6 l4.6,-5`} stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d={`M${-w / 2 + 16},-3.6 v4 M${-w / 2 + 16},3.4 v0.2`} stroke="#fff" strokeWidth={1.9} strokeLinecap="round" />
        )}
        <text x={-w / 2 + 29} y={4.6} fontSize={13} fontWeight={500} fill={INK} style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>{label}</text>
      </g>
    </g>
  );
}

/** Ants walking a floor path (screen-space waypoints) on a loop; hidden for reduced motion. */
export function WalkingAnts({ path, count = 3, dur = 9, size = 0.42 }: { path: [number, number][]; count?: number; dur?: number; size?: number }) {
  const d = path.map((p, i) => `${i ? "L" : "M"}${pts(P(...p))}`).join("");
  return (
    <g className="iso-ants">
      {Array.from({ length: count }, (_, i) => (
        <g key={i}>
          <FlatAnt at={[0, 0]} size={size} rotate={90} />
          <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${-(dur / count) * i}s`} path={d} />
        </g>
      ))}
    </g>
  );
}
