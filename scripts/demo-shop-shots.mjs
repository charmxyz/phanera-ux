// Renders the mock "northcart.shop" store used by the homepage demo and saves the screenshots
// the demo session replays. The store is fictional: an Amazon-style layout and palette, no
// real brand, logo or products. Screenshots are 1366×860, the agent's desktop viewport.
//   node scripts/demo-shop-shots.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const OUT = "public/demo/shop";
const W = 1366;
const H = 860;

/* ------------------------------------------------------------------ Product art (SVG) */
const charger = ({ body = "#f5f5f6", edge = "#d9dadd", ports = 3, size = 200 } = {}) => `
<svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="f${body.slice(1)}" x1="0" x2="1"><stop offset="0" stop-color="${body}"/><stop offset="1" stop-color="${edge}"/></linearGradient>
  </defs>
  <ellipse cx="100" cy="176" rx="62" ry="8" fill="#000" opacity=".08"/>
  <rect x="80" y="18" width="8" height="30" rx="2" fill="#b9bcc2"/><rect x="112" y="18" width="8" height="30" rx="2" fill="#b9bcc2"/>
  <path d="M52 52 L148 52 L160 40 L64 40 Z" fill="${edge}"/>
  <path d="M148 52 L160 40 L160 158 L148 170 Z" fill="${edge}" opacity=".9"/>
  <rect x="40" y="52" width="108" height="118" rx="14" fill="url(#f${body.slice(1)})" stroke="${edge}"/>
  ${Array.from({ length: ports }, (_, i) => `<rect x="${78}" y="${76 + i * 24}" width="32" height="10" rx="5" fill="#2b2d31"/>`).join("")}
  <text x="94" y="160" font-family="Arial" font-size="9" fill="#9a9ca1" text-anchor="middle">GaN</text>
</svg>`;

const cable = ({ color = "#2f3542", size = 200 } = {}) => `
<svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="176" rx="66" ry="8" fill="#000" opacity=".07"/>
  ${[0, 1, 2, 3].map((i) => `<ellipse cx="${100 + i * 3}" cy="${104 - i * 4}" rx="${58 - i * 2}" ry="${44 - i * 2}" fill="none" stroke="${color}" stroke-width="7"/>`).join("")}
  <path d="M150 88 C 168 70, 172 50, 160 34" fill="none" stroke="${color}" stroke-width="7"/>
  <rect x="150" y="14" width="20" height="26" rx="5" fill="#c7cad0"/><rect x="155" y="6" width="10" height="10" rx="2" fill="#8d9097"/>
  <path d="M46 118 C 30 136, 34 156, 52 164" fill="none" stroke="${color}" stroke-width="7"/>
  <rect x="50" y="154" width="26" height="20" rx="5" fill="#c7cad0"/><rect x="74" y="159" width="10" height="10" rx="2" fill="#8d9097"/>
</svg>`;

const emoji = (e, size = 96) => `<span style="font-size:${size}px;line-height:1">${e}</span>`;

/* ------------------------------------------------------------------ Shared chrome */
const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, Helvetica, sans-serif; color: #0f1111; font-size: 14px; line-height: 20px; background: #fff; width: ${W}px; }
a { color: #2162a1; text-decoration: none; }
.link { color: #2162a1; }
.muted { color: #565959; }
.green { color: #007600; }
.hdr { background: #131921; height: 60px; display: flex; align-items: center; gap: 4px; padding: 0 10px; color: #fff; }
.hdr .wm { font-size: 25px; font-weight: 700; letter-spacing: -0.6px; padding: 6px 10px 8px; }
.hdr .slot { padding: 8px 9px; line-height: 15px; }
.hdr .slot small { display: block; color: #ccc; font-size: 12px; }
.hdr .slot b { font-size: 14px; }
.search { flex: 1; display: flex; height: 40px; border-radius: 5px; overflow: hidden; margin: 0 10px; }
.search .cat { background: #e6e6e6; color: #555; font-size: 12px; padding: 0 10px; display: flex; align-items: center; gap: 4px; border-right: 1px solid #cdcdcd; }
.search .q { flex: 1; background: #fff; color: #0f1111; font-size: 15px; display: flex; align-items: center; padding: 0 10px; }
.search .q.ph { color: #888; }
.search .go { width: 45px; background: #febd69; display: flex; align-items: center; justify-content: center; }
.cart { display: flex; align-items: flex-end; gap: 2px; padding: 8px 9px; position: relative; font-weight: 700; }
.cart .n { position: absolute; left: 22px; top: 2px; color: #f08804; font-size: 16px; font-weight: 700; width: 20px; text-align: center; }
.sub { background: #232f3e; height: 39px; display: flex; align-items: center; gap: 2px; padding: 0 10px; color: #fff; font-size: 14px; }
.sub span { padding: 6px 9px; white-space: nowrap; }
.sub .right { margin-left: auto; font-weight: 700; }
.stars { color: #de7921; letter-spacing: 1px; font-size: 15px; }
.price { display: inline-flex; align-items: flex-start; font-size: 28px; line-height: 28px; }
.price sup { font-size: 13px; line-height: 13px; position: relative; top: 2px; }
.price.sm { font-size: 21px; line-height: 21px; }
.price.sm sup { font-size: 11px; line-height: 11px; }
.btn { display: block; text-align: center; border-radius: 100px; padding: 8px 10px; font-size: 13px; color: #0f1111; }
.btn.y { background: #ffd814; border: 1px solid #fcd200; }
.btn.o { background: #ffa41c; border: 1px solid #ff8f00; }
.card { background: #fff; }
.chk { width: 14px; height: 14px; border: 1px solid #888c8c; border-radius: 3px; display: inline-block; vertical-align: -2px; background: #fff; }
.chk.on { background: #2162a1; border-color: #2162a1; position: relative; }
.chk.on::after { content: ""; position: absolute; left: 4px; top: 1px; width: 4px; height: 8px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); }
hr { border: 0; border-top: 1px solid #ddd; margin: 14px 0; }
`;

const ICON_SEARCH = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.4"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>`;
const ICON_CART = `<svg width="38" height="30" viewBox="0 0 38 30" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"><path d="M2 4h6l4 17h20l4-12H11"/><circle cx="15" cy="26" r="2.2" fill="#fff"/><circle cx="29" cy="26" r="2.2" fill="#fff"/></svg>`;
const ICON_PIN = `<svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="#fff" stroke-width="1.6"><path d="M7 15s5-5.2 5-9A5 5 0 0 0 2 6c0 3.8 5 9 5 9Z"/><circle cx="7" cy="6" r="1.8"/></svg>`;

function header({ query = "", items = 0 } = {}) {
  return `
  <div class="hdr">
    <div class="wm">northcart</div>
    <div class="slot" style="display:flex;gap:4px;align-items:flex-end">${ICON_PIN}<div><small>Deliver to Dana</small><b>Columbus 43215</b></div></div>
    <div class="search">
      <div class="cat">All <span style="font-size:9px">▼</span></div>
      <div class="q ${query ? "" : "ph"}">${query || "Search Northcart"}</div>
      <div class="go">${ICON_SEARCH}</div>
    </div>
    <div class="slot"><small>&nbsp;</small><b>EN <span style="font-size:9px;color:#aaa">▼</span></b></div>
    <div class="slot"><small>Hello, Dana</small><b>Account &amp; Lists <span style="font-size:9px;color:#aaa">▼</span></b></div>
    <div class="slot"><small>Returns</small><b>&amp; Orders</b></div>
    <div class="cart">${ICON_CART}<span class="n">${items}</span><span style="padding-bottom:2px">Cart</span></div>
  </div>
  <div class="sub">
    <span style="font-weight:700">☰&nbsp; All</span><span>Today's Deals</span><span>Customer Service</span><span>Registry</span><span>Gift Cards</span><span>Sell</span><span>Electronics</span><span>Home &amp; Kitchen</span>
    <span class="right">Tech Essentials Week: up to 40% off</span>
  </div>`;
}

const page = (body, extraCss = "") => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}${extraCss}</style></head><body>${body}</body></html>`;
const price = (v, cls = "") => {
  const [d, c] = v.toFixed(2).split(".");
  return `<span class="price ${cls}"><sup>$</sup>${d}<sup>${c}</sup></span>`;
};

/* ------------------------------------------------------------------ Home */
const tile = (art, label) => `<div><div style="height:116px;background:#f7f7f7;display:flex;align-items:center;justify-content:center;overflow:hidden">${art}</div><div style="font-size:12px;margin-top:4px">${label}</div></div>`;
const homeCard = (title, tiles, more = "See more") => `
  <div class="card" style="padding:20px 20px 15px;display:flex;flex-direction:column;height:420px">
    <h2 style="font-size:21px;line-height:27px;font-weight:700;margin-bottom:10px">${title}</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px 15px;flex:1">${tiles.join("")}</div>
    <a style="font-size:13px;margin-top:10px">${more}</a>
  </div>`;

const HOME = page(`
  ${header()}
  <div style="background:#e3e6e6;position:relative">
    <div style="height:600px;background:linear-gradient(105deg,#cfe9f1 0%,#e9f4ee 45%,#f7e7c9 100%);position:relative;overflow:hidden">
      <div style="position:absolute;left:150px;top:46px;width:520px">
        <div style="font-size:14px;font-weight:700;letter-spacing:.5px;color:#0b5566">TECH ESSENTIALS WEEK</div>
        <div style="font-size:44px;line-height:48px;font-weight:700;margin-top:8px;color:#0f1111">Charge everything,<br>faster.</div>
        <div style="font-size:20px;margin-top:10px;color:#333">Up to 40% off chargers, cables and power banks</div>
      </div>
      <div style="position:absolute;right:170px;top:20px;display:flex;align-items:flex-end;gap:10px">${charger({ size: 210 })}${cable({ size: 180, color: "#0b5566" })}${charger({ size: 150, body: "#3a3d44", edge: "#22252a", ports: 2 })}</div>
      <div style="position:absolute;left:0;top:0;height:250px;width:80px;display:flex;align-items:center;justify-content:center;font-size:56px;color:#333;font-weight:300">‹</div>
      <div style="position:absolute;right:0;top:0;height:250px;width:80px;display:flex;align-items:center;justify-content:center;font-size:56px;color:#333;font-weight:300">›</div>
      <div style="position:absolute;inset:auto 0 0 0;height:340px;background:linear-gradient(to bottom,rgba(227,230,230,0),#e3e6e6)"></div>
    </div>
    <div style="position:absolute;left:20px;right:20px;top:270px;display:grid;grid-template-columns:repeat(4,1fr);gap:20px">
      ${homeCard("Deals on tech accessories", [tile(charger({ size: 104 }), "Wall chargers"), tile(cable({ size: 104 }), "Cables"), tile(emoji("🔋", 70), "Power banks"), tile(emoji("🎧", 70), "Headphones")], "See all deals")}
      ${homeCard("Refresh your desk", [tile(emoji("⌨️", 70), "Keyboards"), tile(emoji("🖱️", 70), "Mice"), tile(emoji("💡", 70), "Lamps"), tile(emoji("🪴", 70), "Plants")], "Shop the desk edit")}
      ${homeCard("Kitchen favorites under $30", [tile(emoji("☕", 70), "Mugs"), tile(emoji("🍳", 70), "Pans"), tile(emoji("🫖", 70), "Kettles"), tile(emoji("🥣", 70), "Bowls")])}
      ${homeCard("Get fit at home", [tile(emoji("👟", 70), "Shoes"), tile(emoji("⌚", 70), "Trackers"), tile(emoji("🥤", 70), "Bottles"), tile(emoji("🧘", 70), "Yoga")], "Explore more")}
    </div>
    <div style="height:560px"></div>
  </div>`);

/* ------------------------------------------------------------------ Search results */
const RESULTS = [
  { t: "Voltaro 65W USB-C Charger, 3-Port GaN Fast Charger, Foldable Wall Charger for Laptops, Phones and Tablets", r: "4.6", n: "12,408", b: "5K+", p: 29.99, l: 39.99, badge: "Best Seller", art: charger({ size: 190 }) },
  { t: "Lumacell 100W 4-Port GaN Charging Station with 2 USB-C and 2 USB-A, Desktop Charger", r: "4.5", n: "3,921", b: "1K+", p: 49.99, l: 59.99, art: charger({ size: 190, body: "#3a3d44", edge: "#22252a", ports: 4 }) },
  { t: "Brightpath 20W USB-C Wall Charger, 2-Pack, Compact Fast Charging Plug", r: "4.4", n: "28,113", b: "10K+", p: 12.99, art: charger({ size: 170, ports: 1 }) },
  { t: "Kordwell 45W Super Fast Charger, USB-C PD Wall Plug with 5 ft Cable", r: "4.3", n: "6,072", b: "2K+", p: 21.99, l: 26.99, art: charger({ size: 180, body: "#e8eef6", edge: "#c3cedd", ports: 1 }) },
  { t: "Voltaro 35W Dual USB-C Charger, Compact Foldable GaN Plug", r: "4.6", n: "4,580", b: "3K+", p: 19.99, art: charger({ size: 170, ports: 2 }) },
  { t: "Anvo 30W USB-C Charger with Retractable Cable, Travel Size", r: "4.2", n: "1,214", b: "500+", p: 17.49, l: 22.99, art: charger({ size: 170, body: "#f3e9dc", edge: "#d8c8b2", ports: 1 }) },
  { t: "Lumacell 67W Compact Charger, 2 USB-C + 1 USB-A, Black", r: "4.5", n: "2,307", b: "1K+", p: 32.99, art: charger({ size: 180, body: "#3a3d44", edge: "#22252a", ports: 3 }) },
  { t: "Brightpath 65W USB-C Charger, Slim Design, with 6 ft Cable", r: "4.1", n: "988", b: "400+", p: 26.99, l: 34.99, art: charger({ size: 180, ports: 1 }) },
];
const resultCard = (x) => `
  <div style="display:flex;flex-direction:column;border:1px solid #e7e7e7;border-radius:6px;overflow:hidden">
    <div style="height:240px;background:#f7f7f7;display:flex;align-items:center;justify-content:center;position:relative">
      ${x.badge ? `<span style="position:absolute;left:0;top:0;background:#cc6600;color:#fff;font-size:12px;padding:3px 8px 3px 6px;border-bottom-right-radius:4px">${x.badge}</span>` : ""}${x.art}
    </div>
    <div style="padding:10px 12px 14px;display:grid;gap:5px">
      <div style="font-size:15px;line-height:21px;font-weight:500;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${x.t}</div>
      <div style="display:flex;gap:6px;align-items:center"><span style="font-size:14px">${x.r}</span><span class="stars">★★★★★</span><a style="font-size:13px">(${x.n})</a></div>
      <div class="muted" style="font-size:12px">${x.b} bought in past month</div>
      <div style="display:flex;gap:6px;align-items:flex-end">${price(x.p)}${x.l ? `<span class="muted" style="font-size:12px">List: <s>$${x.l}</s></span>` : ""}</div>
      <div style="font-size:13px">FREE delivery <b>Thu, Nov 12</b></div>
      <div class="btn y" style="width:110px;margin-top:4px">Add to cart</div>
    </div>
  </div>`;
const filt = (h, rows) => `<div style="margin-bottom:16px"><div style="font-weight:700;font-size:14px;margin-bottom:6px">${h}</div>${rows.map((r) => `<div style="font-size:14px;line-height:24px">${r}</div>`).join("")}</div>`;

const SEARCH = page(`
  ${header({ query: "usb-c charger" })}
  <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 20px;box-shadow:0 2px 4px rgba(0,0,0,.1);font-size:14px">
    <span>1-16 of over 2,000 results for <span style="color:#c45500;font-weight:700">"usb-c charger"</span></span>
    <span style="background:#f0f2f2;border:1px solid #d5d9d9;border-radius:8px;padding:4px 10px;font-size:13px;box-shadow:0 2px 5px rgba(15,17,17,.15)">Sort by: Featured ▾</span>
  </div>
  <div style="display:flex;gap:24px;padding:16px 20px">
    <aside style="width:220px;flex-shrink:0">
      ${filt("Delivery Day", ['<span class="chk"></span> Get It by Tomorrow'])}
      ${filt("Customer Reviews", ['<span class="stars">★★★★</span><span style="color:#ddd">★</span> &amp; Up'])}
      ${filt("Brands", ["Voltaro", "Lumacell", "Brightpath", "Kordwell", "Anvo"].map((b) => `<span class="chk"></span> ${b}`))}
      ${filt("Price", ["Up to $15", "$15 to $25", "$25 to $50", "$50 &amp; above"])}
      ${filt("Total Power Output", ["20 Watts &amp; Below", "30 to 45 Watts", "65 Watts &amp; Above"].map((b) => `<span class="chk"></span> ${b}`))}
    </aside>
    <main style="flex:1">
      <h2 style="font-size:20px;font-weight:700">Results</h2>
      <div class="muted" style="font-size:12px;margin-bottom:12px">Check each product page for other buying options.</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">${RESULTS.map(resultCard).join("")}</div>
    </main>
  </div>`);

/* ------------------------------------------------------------------ Product */
const spec = (k, v) => `<tr><td style="font-weight:700;padding:3px 0;width:150px;font-size:14px">${k}</td><td style="font-size:14px">${v}</td></tr>`;
const PRODUCT = page(`
  ${header({ query: "usb-c charger" })}
  <div style="padding:10px 20px 0;font-size:12px" class="muted">Electronics › Accessories &amp; Supplies › Chargers &amp; Adapters › <span class="link">Wall Chargers</span></div>
  <div style="display:grid;grid-template-columns:52px 480px 1fr 250px;gap:20px;padding:16px 20px">
    <div style="display:grid;gap:8px;align-content:start">
      ${[charger({ size: 40 }), charger({ size: 40, body: "#3a3d44", edge: "#22252a" }), cable({ size: 40 }), emoji("📦", 28)].map((a, i) => `<div style="width:42px;height:50px;border:1px solid ${i ? "#bbb" : "#e77600"};border-radius:6px;display:flex;align-items:center;justify-content:center;${i ? "" : "box-shadow:0 0 3px 2px rgba(228,121,17,.5)"}">${a}</div>`).join("")}
    </div>
    <div style="height:520px;display:flex;align-items:center;justify-content:center">${charger({ size: 440 })}</div>
    <div>
      <h1 style="font-size:24px;line-height:32px;font-weight:400">Voltaro 65W USB-C Charger, 3-Port GaN Fast Charger, Foldable Wall Charger for Laptops, Phones and Tablets</h1>
      <a style="font-size:14px">Visit the Voltaro Store</a>
      <div style="display:flex;gap:8px;align-items:center;margin-top:4px"><span>4.6</span><span class="stars">★★★★★</span><a>12,408 ratings</a></div>
      <div style="font-size:14px;margin-top:2px"><b>5K+ bought</b> <span class="muted">in past month</span></div>
      <hr>
      <div style="display:flex;align-items:flex-start;gap:8px"><span style="color:#cc0c39;font-size:28px;line-height:30px;font-weight:300">-25%</span>${price(29.99)}</div>
      <div class="muted" style="font-size:12px;margin-top:4px">List Price: <s>$39.99</s></div>
      <div style="margin-top:14px;font-size:14px">Color: <b>White</b></div>
      <div style="display:flex;gap:8px;margin-top:6px">
        <div style="width:52px;height:52px;border:2px solid #2162a1;border-radius:6px;display:flex;align-items:center;justify-content:center">${charger({ size: 44 })}</div>
        <div style="width:52px;height:52px;border:1px solid #ccc;border-radius:6px;display:flex;align-items:center;justify-content:center">${charger({ size: 44, body: "#3a3d44", edge: "#22252a" })}</div>
      </div>
      <table style="margin-top:16px;border-collapse:collapse">
        ${spec("Brand", "Voltaro")}${spec("Connector Type", "USB Type C")}${spec("Total Power Output", "65 Watts")}${spec("Number of Ports", "3")}${spec("Special Feature", "Foldable plug, GaN")}
      </table>
      <hr>
      <h3 style="font-size:16px;font-weight:700;margin-bottom:6px">About this item</h3>
      <ul style="padding-left:18px;font-size:14px;line-height:20px;display:grid;gap:4px">
        <li>65W from one port charges most laptops at full speed; shares power across all three ports.</li>
        <li>GaN design about half the size of a standard laptop charger, with a foldable plug for travel.</li>
        <li>Built-in protection against over-heating, over-current and short circuits.</li>
      </ul>
    </div>
    <div style="border:1px solid #d5d9d9;border-radius:8px;padding:18px;align-self:start;display:grid;gap:10px">
      ${price(29.99)}
      <div style="font-size:14px">FREE delivery <b>Thursday, November 12</b>. Order within <span class="green">6 hrs 12 mins</span></div>
      <div style="font-size:12px" class="link">📍 Deliver to Dana - Columbus 43215</div>
      <div class="green" style="font-size:18px;line-height:24px">In Stock</div>
      <div style="background:#f0f2f2;border:1px solid #d5d9d9;border-radius:8px;padding:5px 10px;font-size:13px;box-shadow:0 2px 5px rgba(15,17,17,.15)">Quantity: 1 <span style="float:right">▾</span></div>
      <div class="btn y">Add to Cart</div>
      <div class="btn o">Buy Now</div>
      <table style="font-size:12px;line-height:18px">
        <tr><td class="muted" style="width:80px">Ships from</td><td>Northcart</td></tr>
        <tr><td class="muted">Sold by</td><td class="link">Voltaro Direct</td></tr>
        <tr><td class="muted">Returns</td><td class="link">30-day refund</td></tr>
      </table>
      <hr style="margin:2px 0">
      <div style="font-size:14px"><span class="chk"></span> Add a gift receipt</div>
    </div>
  </div>
  <div style="padding:0 20px"><hr style="margin:4px 0 20px"></div>
  <section style="padding:0 20px 24px">
    <h2 style="font-size:21px;font-weight:700;margin-bottom:14px">Frequently bought together</h2>
    <div style="display:flex;gap:40px;align-items:center">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:170px;height:170px;border:1px solid #e7e7e7;border-radius:8px;display:flex;align-items:center;justify-content:center">${charger({ size: 140 })}</div>
        <span style="font-size:28px;color:#565959">+</span>
        <div style="width:170px;height:170px;border:1px solid #e7e7e7;border-radius:8px;display:flex;align-items:center;justify-content:center">${cable({ size: 140 })}</div>
      </div>
      <div style="display:grid;gap:10px;width:260px">
        <div style="font-size:16px">Total price: <b>$41.98</b></div>
        <div class="btn y" style="font-size:14px">Add both to Cart</div>
        <div class="muted" style="font-size:12px">One of these items ships sooner than the other.</div>
      </div>
    </div>
    <div style="margin-top:18px;display:grid;gap:8px;font-size:14px">
      <div><span class="chk on"></span> <b>This item:</b> Voltaro 65W USB-C Charger, 3-Port GaN Fast Charger <b style="margin-left:6px">$29.99</b></div>
      <div><span class="chk on"></span> <a>Kordwell USB-C to USB-C Cable, 6 ft, 2-Pack, Nylon Braided 100W Fast Charging</a> <b style="margin-left:6px">$11.99</b></div>
    </div>
  </section>
  <div style="padding:0 20px"><hr style="margin:4px 0 20px"></div>
  <section style="padding:0 20px 40px">
    <h2 style="font-size:21px;font-weight:700;margin-bottom:14px">Products related to this item</h2>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:16px">
      ${[[charger({ size: 120, ports: 2 }), "Voltaro 35W Dual USB-C Charger", 19.99], [emoji("🔋", 80), "Anvo 10,000mAh Power Bank, 22.5W", 24.99], [cable({ size: 120, color: "#a33" }), "Kordwell USB-C Cable 3 ft, 3-Pack", 9.99], [charger({ size: 120, body: "#3a3d44", edge: "#22252a" }), "Lumacell 67W Compact Charger", 32.99], [emoji("🧳", 80), "Travel Case for Chargers and Cables", 14.99], [emoji("🔌", 80), "Brightpath Travel Adapter, 4 Plug Types", 17.99]].map(([a, t, p]) => `<div><div style="height:150px;background:#f7f7f7;border-radius:6px;display:flex;align-items:center;justify-content:center">${a}</div><div class="link" style="font-size:13px;margin-top:6px">${t}</div><div style="margin-top:4px">${price(p, "sm")}</div></div>`).join("")}
    </div>
  </section>`);

/* ------------------------------------------------------------------ Cart (three states) */
const qtyPill = (q, focused) => `
  <div style="display:inline-flex;align-items:center;border:3px solid #ffd814;border-radius:100px;height:32px;overflow:hidden">
    <span style="width:34px;text-align:center;font-size:20px;line-height:26px;${focused ? "background:#ffe680;box-shadow:inset 0 0 0 2px #2162a1;border-radius:100px" : ""}">−</span>
    <span style="min-width:30px;text-align:center;font-weight:700;font-size:15px">${q}</span>
    <span style="width:34px;text-align:center;font-size:20px;line-height:26px">+</span>
  </div>`;
const cartItem = ({ art, title, by, note, p, q, focused }) => `
  <div style="display:flex;gap:16px;padding:16px 0;border-bottom:1px solid #ddd">
    <span class="chk on" style="margin-top:70px"></span>
    <div style="width:180px;height:180px;display:flex;align-items:center;justify-content:center;background:#f7f7f7;border-radius:6px">${art}</div>
    <div style="flex:1;display:grid;gap:3px;align-content:start">
      <div style="font-size:18px;line-height:24px">${title}</div>
      <div class="green" style="font-size:12px">In Stock</div>
      <div class="muted" style="font-size:12px">Eligible for FREE delivery</div>
      <div style="font-size:12px"><b>Sold by:</b> ${by}</div>
      ${note ? `<div style="font-size:12px"><b>Includes:</b> ${note}</div>` : ""}
      <div style="display:flex;gap:12px;align-items:center;margin-top:8px;font-size:12px">
        ${qtyPill(q, focused)}
        <span style="color:#ddd">|</span><a>Delete</a><span style="color:#ddd">|</span><a>Save for later</a><span style="color:#ddd">|</span><a>Compare with similar items</a><span style="color:#ddd">|</span><a>Share</a>
      </div>
    </div>
    <div style="font-size:18px;font-weight:700">$${p.toFixed(2)}</div>
  </div>`;

function cartPage({ cableQty, focused }) {
  const count = 1 + cableQty;
  const total = 29.99 + 11.99 * cableQty;
  const sub = `Subtotal (${count} item${count === 1 ? "" : "s"}): <b>$${total.toFixed(2)}</b>`;
  return page(`
  ${header({ query: "usb-c charger", items: count })}
  <div style="background:#eaeded;min-height:${H}px;padding:20px;display:flex;gap:20px;align-items:flex-start">
    <div class="card" style="flex:1;padding:20px 20px 12px">
      <h1 style="font-size:28px;line-height:36px;font-weight:400">Shopping Cart</h1>
      <div style="display:flex;justify-content:space-between;font-size:14px;border-bottom:1px solid #ddd;padding-bottom:4px"><a>Deselect all items</a><span class="muted">Price</span></div>
      ${cartItem({ art: charger({ size: 150 }), title: "Voltaro 65W USB-C Charger, 3-Port GaN Fast Charger, Foldable Wall Charger for Laptops, Phones and Tablets", by: "Voltaro Direct", note: "1 m USB-C to USB-C cable", p: 29.99, q: 1 })}
      ${cartItem({ art: cable({ size: 150 }), title: "Kordwell USB-C to USB-C Cable, 6 ft, 2-Pack, Nylon Braided 100W Fast Charging", by: "Kordwell", p: 11.99, q: cableQty === -1 ? "−1" : cableQty, focused })}
      <div style="text-align:right;font-size:18px;padding-top:10px">${sub}</div>
    </div>
    <div style="width:300px;display:grid;gap:20px">
      <div class="card" style="padding:20px;display:grid;gap:10px">
        <div class="green" style="font-size:12px;line-height:16px">✓ Your order qualifies for FREE Shipping. <span class="muted">Choose this option at checkout.</span></div>
        <div style="font-size:18px;line-height:24px">${sub}</div>
        <div style="font-size:14px"><span class="chk"></span> This order contains a gift</div>
        <div class="btn y" style="font-size:14px">Proceed to checkout</div>
      </div>
      <div class="card" style="padding:16px;display:grid;gap:12px">
        <div style="font-size:16px;font-weight:700">Customers who bought items in your cart also bought</div>
        ${[[emoji("🔋", 50), "Anvo 10,000mAh Power Bank", 24.99], [emoji("🧳", 50), "Travel Case for Chargers", 14.99], [cable({ size: 70, color: "#a33" }), "Kordwell USB-C Cable 3 ft, 3-Pack", 9.99]].map(([a, t, p]) => `<div style="display:flex;gap:10px"><div style="width:72px;height:72px;background:#f7f7f7;display:flex;align-items:center;justify-content:center;border-radius:4px;flex-shrink:0">${a}</div><div style="display:grid;gap:2px;align-content:start"><a style="font-size:13px">${t}</a><span class="stars" style="font-size:12px">★★★★☆</span><b style="font-size:13px;color:#b12704">$${p}</b><div class="btn y" style="padding:2px 10px;font-size:11px;width:90px">Add to cart</div></div></div>`).join("")}
      </div>
    </div>
  </div>`);
}

/* ------------------------------------------------------------------ Checkout */
const coLine = (art, title, p, q) => `
  <div style="display:flex;gap:14px;padding:12px 0">
    <div style="width:90px;height:90px;background:#f7f7f7;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${art}</div>
    <div style="display:grid;gap:3px;align-content:start;font-size:14px">
      <b>${title}</b>
      <span style="color:#b12704;font-weight:700">$${p.toFixed(2)}</span>
      <span>Qty: <b>${q}</b></span>
      <span class="muted" style="font-size:12px">Sold by: Northcart Services</span>
    </div>
  </div>`;
const coRow = (k, v, strong) => `<div style="display:flex;justify-content:space-between;font-size:${strong ? 18 : 12}px;line-height:${strong ? 26 : 19}px;${strong ? "color:#b12704;font-weight:700" : ""}"><span>${k}</span><span>${v}</span></div>`;
const CHECKOUT = page(`
  <div style="background:#131921;height:60px;display:flex;align-items:center;padding:0 24px;color:#fff">
    <div style="font-size:25px;font-weight:700;letter-spacing:-.6px">northcart</div>
    <div style="margin:0 auto;font-size:24px;display:flex;align-items:center;gap:10px">Secure checkout <span style="font-size:18px">🔒</span></div>
    <div style="display:flex;align-items:flex-end;gap:4px;font-weight:700">${ICON_CART} Cart</div>
  </div>
  <div style="max-width:1150px;margin:0 auto;padding:22px 20px;display:flex;gap:24px;align-items:flex-start">
    <div style="flex:1;display:grid;gap:16px">
      <div style="border:1px solid #d5d9d9;border-radius:8px;padding:16px 20px;display:flex;justify-content:space-between">
        <div><div style="font-size:18px;font-weight:700;margin-bottom:4px">Delivering to Dana Reyes</div><div style="font-size:14px">1420 Oak Street, COLUMBUS, OH, 43215, United States</div><a style="font-size:13px">Add delivery instructions</a></div><a style="font-size:13px">Change</a>
      </div>
      <div style="border:1px solid #d5d9d9;border-radius:8px;padding:16px 20px;display:flex;justify-content:space-between">
        <div><div style="font-size:18px;font-weight:700;margin-bottom:4px">Paying with Visa 1881</div><a style="font-size:13px">Use a gift card, voucher or promo code</a></div><a style="font-size:13px">Change</a>
      </div>
      <div style="border:1px solid #d5d9d9;border-radius:8px;padding:16px 20px">
        <div style="font-size:18px;font-weight:700;color:#007600">Arriving Nov 12, 2026</div>
        <div class="muted" style="font-size:12px">If you order in the next 5 hours and 58 minutes</div>
        <div style="display:grid;grid-template-columns:1fr 280px;gap:20px">
          <div>
            ${coLine(charger({ size: 80 }), "Voltaro 65W USB-C Charger, 3-Port GaN Fast Charger", 29.99, "1")}
            ${coLine(cable({ size: 80 }), "Kordwell USB-C to USB-C Cable, 6 ft, 2-Pack", 11.99, "−1")}
          </div>
          <div style="font-size:14px;padding-top:12px;display:grid;gap:8px;align-content:start">
            <b>Choose your delivery option:</b>
            <div><span style="display:inline-block;width:14px;height:14px;border-radius:50%;border:4px solid #2162a1;vertical-align:-2px"></span> <b class="green">Thursday, Nov 12</b><div class="muted" style="font-size:12px;padding-left:20px">FREE Standard Delivery</div></div>
            <div><span style="display:inline-block;width:14px;height:14px;border-radius:50%;border:1px solid #888;vertical-align:-2px"></span> <b>Tomorrow, Nov 11</b><div class="muted" style="font-size:12px;padding-left:20px">$5.99 Express Delivery</div></div>
          </div>
        </div>
      </div>
    </div>
    <div style="width:300px;border:1px solid #d5d9d9;border-radius:8px;padding:16px 18px;display:grid;gap:10px">
      <div class="btn y" style="font-size:14px">Place your order</div>
      <div class="muted" style="font-size:11px;line-height:15px;text-align:center">By placing your order, you agree to Northcart's privacy notice and conditions of use.</div>
      <hr style="margin:2px 0">
      <div style="font-size:18px;font-weight:700">Order Summary</div>
      ${coRow("Items:", "$18.00")}${coRow("Shipping &amp; handling:", "$0.00")}
      <div style="border-top:1px solid #ddd;margin-left:auto;width:60px"></div>
      ${coRow("Total before tax:", "$18.00")}${coRow("Estimated tax to be collected:", "$1.35")}
      <hr style="margin:2px 0">
      ${coRow("Order total:", "$19.35", true)}
      <hr style="margin:2px 0">
      <a style="font-size:12px">How are delivery costs calculated?</a>
    </div>
  </div>`);

/* ------------------------------------------------------------------ Render */
const SHOTS = [
  ["home", HOME, 0],
  ["search", SEARCH, 0],
  ["product", PRODUCT, 0],
  ["product-scrolled", PRODUCT, 600],
  ["cart", cartPage({ cableQty: 1 }), 0],
  ["cart-zero", cartPage({ cableQty: 0, focused: true }), 0],
  ["cart-negative", cartPage({ cableQty: -1, focused: true }), 0],
  ["checkout", CHECKOUT, 0],
];

await mkdir(OUT, { recursive: true });
await writeFile(
  `${OUT}/favicon.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#131921"/><path d="M14 20h7l5 20h20l5-14H24" fill="none" stroke="#febd69" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="29" cy="48" r="3.5" fill="#febd69"/><circle cx="43" cy="48" r="3.5" fill="#febd69"/></svg>\n`,
);

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: W, height: H } });
for (const [name, html, y] of SHOTS) {
  await tab.setContent(html, { waitUntil: "load" });
  await tab.screenshot({ path: `${OUT}/${name}.jpg`, type: "jpeg", quality: 85, fullPage: true, clip: { x: 0, y, width: W, height: H } });
  console.log("saved", `${OUT}/${name}.jpg`);
}
await browser.close();
