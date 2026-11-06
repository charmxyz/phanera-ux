import { AppWindowIcon, GlobeIcon, HandIcon, MonitorIcon, MousePointerClickIcon, SmartphoneIcon } from "lucide-react";
import { Badge, C, FlatAnt, INK, IsoGrid, Laptop, Link, P, Phone, S, Tile, WalkingAnts, type Pt } from "./iso";

const TICKET = ["#dc2626", "#d97706", "#a1a1aa"];

/** How it works: Phanera → personas on their devices → a ranked report. */
export function HowItWorksIso({ className }: { className?: string }) {
  const plats = [
    { x: 200, who: "Priya · Found pricing", tone: "ok" as const, device: "laptop-dark" },
    { x: 430, who: "Atlas · Read the docs", tone: "ok" as const, device: "laptop" },
    { x: 660, who: "Tom · Stuck at sign-up", tone: "bad" as const, device: "phone" },
  ];
  const mid = 60; // the chain's centre line (world y)
  return (
    <svg viewBox="-150 -60 1060 640" className={className} role="img" aria-label="Phanera sends personas to your site on their own devices, then collects what they found into a ranked report.">
      <IsoGrid id="hiw" x0={-160} x1={1120} y0={-200} y1={320} />
      <WalkingAnts path={[[-60, mid], [1040, mid]]} count={4} dur={11} />

      {/* Hub: Phanera */}
      <Tile x={0} y={0} w={120} d={120} h={16} active />
      <Tile x={22} y={22} w={76} d={76} h={6} z={16} dark screws={false} />
      <FlatAnt at={P(60, 60, 22)} size={1.5} color="#fff" />
      <Link from={[120, mid]} to={[200, mid]} />

      {plats.map((p, i) => (
        <g key={p.x}>
          <Tile x={p.x} y={-15} w={170} d={150} h={14} active />
          {p.device === "phone" ? (
            <Phone x={p.x + 57} y={30} z={14} rows={[{ tone: "ok", len: 0.45 }, { tone: "bad", len: 0.4 }, { len: 0.3 }]} />
          ) : (
            <Laptop x={p.x + 30} y={22} z={14} darkKeys={p.device === "laptop-dark"} rows={[{ tone: "ok" }, { tone: "ok", len: 0.45 }, { tone: i === 1 ? "ok" : undefined, len: 0.5 }]} />
          )}
          <Link from={[p.x + 170, mid]} to={[i === plats.length - 1 ? 890 : plats[i + 1].x, mid]} />
        </g>
      ))}

      {/* Report: ranked tickets */}
      <Tile x={890} y={0} w={140} d={120} h={14} active />
      {TICKET.map((c, k) => {
        const z = 14 + k * 9;
        return (
          <g key={c}>
            <Tile x={914 + k * 3} y={22 - k * 3} w={92} d={74} h={7} z={z} screws={false} />
            <polygon
              points={[P(924 + k * 3, 30 - k * 3, z + 7), P(932 + k * 3, 30 - k * 3, z + 7), P(932 + k * 3, 88 - k * 3, z + 7), P(924 + k * 3, 88 - k * 3, z + 7)].map((q) => q.join(",")).join(" ")}
              fill={c}
            />
          </g>
        );
      })}

      {/* Badges on top */}
      {plats.map((p, i) => (
        <Badge key={p.x} at={P(p.x + 85, 0, p.device === "phone" ? 150 : 160)} label={p.who} tone={p.tone} step={i} />
      ))}
      <Badge at={P(960, 0, 110)} label="3 issues, ranked" tone="info" step={3} />
    </svg>
  );
}

/** A lucide icon laid flat on a tile top. */
function FlatIcon({ Icon, at, size = 26 }: { Icon: typeof GlobeIcon; at: Pt; size?: number }) {
  return (
    <g transform={`matrix(${C} ${S} ${-C} ${S} ${at[0]} ${at[1]})`}>
      <Icon x={-size / 2} y={-size / 2} width={size} height={size} color={INK} strokeWidth={1.6} />
    </g>
  );
}

function Satellite({ x, y, Icon }: { x: number; y: number; Icon: typeof GlobeIcon }) {
  return (
    <g>
      <Tile x={x} y={y} w={70} d={70} h={10} />
      <FlatIcon Icon={Icon} at={P(x + 35, y + 35, 10)} />
    </g>
  );
}

/** One environment card's scene: the device on its platform plus three satellite tiles. */
export function EnvironmentIso({ kind, className }: { kind: "desktop" | "mobile"; className?: string }) {
  const sats =
    kind === "desktop"
      ? [{ x: -150, y: 20, Icon: AppWindowIcon }, { x: 60, y: -150, Icon: MonitorIcon }, { x: 290, y: 90, Icon: MousePointerClickIcon }]
      : [{ x: -150, y: 20, Icon: AppWindowIcon }, { x: 60, y: -150, Icon: SmartphoneIcon }, { x: 290, y: 90, Icon: HandIcon }];
  return (
    <svg viewBox="-228 -80 484 352" className={className} role="img" aria-label={kind === "desktop" ? "A desktop browser on a laptop-sized screen." : "A phone-sized screen with touch input."}>
      <IsoGrid id={`env-${kind}`} x0={-220} x1={420} y0={-220} y1={300} />
      {/* Links run centre to centre under the tiles, so only the gap between them shows. */}
      {sats.map((s) => <Link key={`${s.x}-${s.y}`} from={[s.x + 35, s.y + 35]} to={[105, 95]} />)}
      {sats.filter((s) => s.y < 0 || s.x < 0).map((s) => <Satellite key={`${s.x}`} {...s} />)}
      <Tile x={0} y={0} w={210} d={190} h={16} active />
      {kind === "desktop" ? (
        <Laptop x={50} y={60} z={16} rows={[{ tone: "ok" }, { tone: "ok", len: 0.45 }, { len: 0.5 }]} />
      ) : (
        <Phone x={78} y={70} z={16} rows={[{ tone: "ok", len: 0.45 }, { tone: "ok", len: 0.38 }, { len: 0.3 }]} />
      )}
      {sats.filter((s) => !(s.y < 0 || s.x < 0)).map((s) => <Satellite key={`${s.x}`} {...s} />)}
    </svg>
  );
}

