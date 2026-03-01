import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft } from "lucide-react";

// ─── Palette ──────────────────────────────────────────────────────
const C = {
  navy:     "#0D1B2A",
  blob:     "#0c2d38",
  blobAlt:  "#0a2232",
  teal:     "#2DD4BF",
  tealDark: "#25B8A4",
  green:    "#4ADE80",
  greenMid: "#52B788",
  greenDark:"#3EA370",
  greenHi:  "#6EE7B7",
  skin:     "#8B5E3C",
  skinDark: "#7A5132",
  skinDeep: "#6B4226",
  hair:     "#1c0e06",
  hairMid:  "#2a1508",
  pot:      "#C4763A",
  potLight: "#D4894A",
  potDark:  "#B86820",
  soil:     "#5C3118",
  soilMid:  "#6B3D20",
  gold:     "#FFD700",
  blue:     "#60A5FA",
};

// ─── Decorative primitives ─────────────────────────────────────────

const Star4 = ({ size = 16, color = C.gold, opacity = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill={color} style={{ opacity }}>
    <path d="M10 0L11.9 8.1L20 10L11.9 11.9L10 20L8.1 11.9L0 10L8.1 8.1Z" />
  </svg>
);

const Diamond = ({ size = 9, color = "rgba(255,255,255,0.5)" }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill={color}>
    <path d="M5 0L10 5L5 10L0 5Z" />
  </svg>
);

const Burst = ({ size = 22, color = C.gold }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none">
    <line x1="12" y1="2"    x2="12" y2="5.5" />
    <line x1="12" y1="18.5" x2="12" y2="22"  />
    <line x1="2"  y1="12"   x2="5.5"  y2="12" />
    <line x1="18.5" y1="12" x2="22"  y2="12" />
    <line x1="4.9" y1="4.9"   x2="7.2" y2="7.2"   />
    <line x1="16.8" y1="16.8" x2="19.1" y2="19.1" />
    <line x1="19.1" y1="4.9"  x2="16.8" y2="7.2"  />
    <line x1="7.2"  y1="16.8" x2="4.9"  y2="19.1" />
  </svg>
);

// ─── Character SVG illustration ────────────────────────────────────
// African complexion · flat 2D · teal palette · minimal cartoon features

function CharacterIllustration() {
  return (
    <svg viewBox="0 0 390 440" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* ── Organic blob background ── */}
      <path
        d="M195,50 C278,26 366,102 372,194 C378,286 328,368 242,388 C156,408 54,366 26,272 C-2,178 50,86 124,58 C158,44 168,62 195,50Z"
        fill={C.blob}
      />

      {/* ── Decorative sparkles ── */}
      {/* Large gold star – top right */}
      <path d="M288,80 L291.5,93 L305,96.5 L291.5,100 L288,113 L284.5,100 L271,96.5 L284.5,93Z" fill={C.gold} />
      {/* Medium star – left */}
      <path d="M82,200 L84.5,210 L95,212.5 L84.5,215 L82,225 L79.5,215 L69,212.5 L79.5,210Z" fill={C.gold} />
      {/* Small star – top left */}
      <path d="M96,106 L97.5,112 L104,113.5 L97.5,115 L96,121 L94.5,115 L88,113.5 L94.5,112Z" fill={C.gold} opacity="0.85" />
      {/* Tiny star – lower right */}
      <path d="M300,168 L301.5,174 L308,175.5 L301.5,177 L300,183 L298.5,177 L292,175.5 L298.5,174Z" fill={C.gold} opacity="0.7" />
      {/* Burst rays */}
      <g transform="translate(310,112)" stroke={C.gold} strokeWidth="2.2" strokeLinecap="round">
        <line x1="0" y1="-11" x2="0" y2="-6" />
        <line x1="0" y1="6"   x2="0" y2="11" />
        <line x1="-11" y1="0" x2="-6" y2="0" />
        <line x1="6"  y1="0"  x2="11" y2="0" />
        <line x1="-8"   y1="-8"   x2="-4.5" y2="-4.5" />
        <line x1="4.5"  y1="4.5"  x2="8"    y2="8"    />
        <line x1="8"    y1="-8"   x2="4.5"  y2="-4.5" />
        <line x1="-4.5" y1="4.5"  x2="-8"   y2="8"    />
      </g>
      {/* Diamond sparkles */}
      <path d="M276,150 L280,157 L276,164 L272,157Z" fill="rgba(255,255,255,0.5)" />
      <path d="M104,160 L108,167 L104,174 L100,167Z" fill="rgba(255,255,255,0.45)" />
      <path d="M197,70  L200,76  L197,82  L194,76Z"  fill="rgba(255,255,255,0.5)" />
      {/* Blue accent dots */}
      <circle cx="308" cy="188" r="5" fill={C.blue} opacity="0.65" />
      <circle cx="76"  cy="260" r="4" fill={C.blue} opacity="0.55" />

      {/* ── HAIR — afro, drawn FIRST so head circle renders on top ── */}
      <ellipse cx="195" cy="128" rx="77" ry="71" fill={C.hair} />
      {/* Volume highlight on afro */}
      <ellipse cx="183" cy="104" rx="50" ry="40" fill={C.hairMid} opacity="0.55" />
      {/* Soft afro top dome */}
      <ellipse cx="195" cy="68"  rx="56" ry="30" fill={C.hair} opacity="0.65" />

      {/* ── HEAD — warm brown skin ── */}
      <circle cx="195" cy="170" r="64" fill={C.skin} />

      {/* ── EARS ── */}
      <ellipse cx="131" cy="172" rx="13" ry="17" fill={C.skinDark} />
      <ellipse cx="259" cy="172" rx="13" ry="17" fill={C.skinDark} />
      <ellipse cx="131" cy="172" rx="7"  ry="10" fill={C.skinDeep} />
      <ellipse cx="259" cy="172" rx="7"  ry="10" fill={C.skinDeep} />

      {/* ── FACE FEATURES ── */}
      {/* Eyebrows — gentle arcs */}
      <path d="M167,143 Q177,138 187,143" stroke={C.hair} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M203,143 Q213,138 223,143" stroke={C.hair} strokeWidth="3.5" strokeLinecap="round" fill="none" />

      {/* Eyes — large warm dots */}
      <circle cx="177" cy="158" r="10" fill="#1a0a00" />
      <circle cx="213" cy="158" r="10" fill="#1a0a00" />
      {/* Iris */}
      <circle cx="177" cy="159" r="6" fill="#2e1608" />
      <circle cx="213" cy="159" r="6" fill="#2e1608" />
      {/* Shine */}
      <circle cx="180" cy="154" r="3"   fill="white" />
      <circle cx="216" cy="154" r="3"   fill="white" />
      <circle cx="182" cy="156" r="1.2" fill="white" opacity="0.7" />
      <circle cx="218" cy="156" r="1.2" fill="white" opacity="0.7" />

      {/* Nose — minimal flat style */}
      <path d="M192,172 L190,183 Q195,186 200,183 L198,172" stroke={C.skinDark} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M186,183 Q183,187 187,188" stroke={C.skinDark} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M204,183 Q207,187 203,188" stroke={C.skinDark} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6" />

      {/* Smile — wide, warm */}
      <path d="M178,196 Q195,212 212,196" stroke={C.skinDeep} strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Cheek blush */}
      <ellipse cx="156" cy="180" rx="15" ry="9" fill="#C47A50" opacity="0.2" />
      <ellipse cx="234" cy="180" rx="15" ry="9" fill="#C47A50" opacity="0.2" />

      {/* ── NECK ── */}
      <rect x="178" y="231" width="36" height="32" rx="14" fill={C.skin} />

      {/* ── BODY — teal shirt ── */}
      <path
        d="M86,298 Q74,268 85,256 Q120,244 162,258 L178,260 Q195,258 212,260 L228,258 Q270,244 305,256 Q316,268 304,298 L290,440 L100,440Z"
        fill={C.teal}
      />
      {/* Shirt collar */}
      <path d="M163,258 Q195,274 227,258" stroke={C.tealDark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Shirt fold/shadow */}
      <path d="M195,272 L195,380" stroke={C.tealDark} strokeWidth="2" fill="none" opacity="0.3" />

      {/* ── ARMS — behind pot ── */}
      {/* Left arm */}
      <path d="M84,275 Q64,298 68,334 Q70,354 98,364" stroke={C.teal} strokeWidth="46" fill="none" strokeLinecap="round" />
      {/* Left hand */}
      <ellipse cx="104" cy="368" rx="25" ry="22" fill={C.skin} />
      <ellipse cx="86"  cy="358" rx="12" ry="9"  fill={C.skin} transform="rotate(-25 86 358)" />
      {/* Right arm */}
      <path d="M306,275 Q326,298 322,334 Q320,354 292,364" stroke={C.teal} strokeWidth="46" fill="none" strokeLinecap="round" />
      {/* Right hand */}
      <ellipse cx="286" cy="368" rx="25" ry="22" fill={C.skin} />
      <ellipse cx="304" cy="358" rx="12" ry="9"  fill={C.skin} transform="rotate(25 304 358)" />

      {/* ── PLANT LEAVES — behind pot rim ── */}
      {/* Rear center */}
      <path d="M195,335 Q157,272 170,216 Q186,264 200,330Z" fill={C.greenDark} opacity="0.9" />
      {/* Left */}
      <path d="M188,330 Q136,260 149,202 Q172,250 194,326Z" fill={C.greenMid} />
      {/* Right */}
      <path d="M202,330 Q254,254 242,198 Q219,250 196,326Z" fill={C.greenMid} />
      {/* Front highlight */}
      <path d="M195,326 Q178,270 191,222 Q207,272 198,323Z" fill={C.greenHi} />
      {/* Leaf veins */}
      <path d="M188,326 Q154,272 157,228" stroke={C.greenDark} strokeWidth="1.2" fill="none" opacity="0.45" />
      <path d="M202,326 Q234,268 232,224" stroke={C.greenDark} strokeWidth="1.2" fill="none" opacity="0.45" />

      {/* ── PLANT POT ── */}
      {/* Pot body */}
      <path d="M122,350 L140,425 L250,425 L268,350Z" fill={C.pot} />
      {/* Pot rim */}
      <rect x="108" y="335" width="174" height="26" rx="13" fill={C.potLight} />
      {/* Rim highlight */}
      <rect x="120" y="339" width="68" height="7" rx="3.5" fill="#E09A5A" opacity="0.4" />
      {/* Decorative stripe */}
      <path d="M126,382 L264,382" stroke={C.potDark} strokeWidth="2.5" opacity="0.45" />
      {/* Pot sheen */}
      <path d="M142,356 Q150,374 145,396" stroke="rgba(255,255,255,0.11)" strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* Soil */}
      <ellipse cx="195" cy="337" rx="76" ry="13" fill={C.soil} />
      <ellipse cx="182" cy="335" rx="33" ry="6"  fill={C.soilMid} opacity="0.45" />
    </svg>
  );
}

// ─── Feature slide illustrations ──────────────────────────────────

function FeatureIllustration({ slide }) {
  return (
    <div className="relative w-full" style={{ height: 278 }}>
      {/* Blob */}
      <svg viewBox="0 0 400 420" className="absolute inset-0 w-full h-full"
        style={{ filter: "drop-shadow(0 10px 36px rgba(0,0,0,0.5))" }}>
        <path d={slide.blob} fill={slide.blobColor} />
      </svg>

      {/* Stars */}
      {slide.deco.stars.map((s, i) => (
        <div key={i} className="absolute pointer-events-none" style={s.pos}>
          <Star4 size={s.size} color={s.color ?? C.gold} opacity={s.op ?? 1} />
        </div>
      ))}
      {/* Burst */}
      {slide.deco.bursts?.map((b, i) => (
        <div key={i} className="absolute pointer-events-none" style={b.pos}>
          <Burst size={b.size ?? 22} />
        </div>
      ))}
      {/* Diamonds */}
      {slide.deco.diamonds.map((d, i) => (
        <div key={i} className="absolute pointer-events-none" style={d.pos}>
          <Diamond size={d.size} />
        </div>
      ))}

      {/* Main emoji */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <span className="text-[68px] drop-shadow-xl block leading-none select-none">{slide.emoji}</span>
          {slide.subEmoji && (
            <span
              className="text-[42px] absolute drop-shadow-lg leading-none opacity-85 select-none"
              style={slide.subEmoji.style}
            >
              {slide.subEmoji.icon}
            </span>
          )}
        </div>
      </div>

      {/* Floating label pills */}
      {slide.labels.map((l, i) => (
        <div key={i} className="absolute pointer-events-none" style={l.pos}>
          <div className={`px-3 py-1.5 rounded-full text-[12px] font-[700] shadow-lg whitespace-nowrap ${
            l.accent ? "bg-[#FF6B9D] text-white" : "bg-white text-gray-800"
          }`}>
            {l.text}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Capacity picker slide ─────────────────────────────────────────

const CAPACITY_PRESETS = [8, 16, 24, 32, 40];

function CapacitySlide({ value, onChange }) {
  const dec = () => onChange(Math.max(8,  value - 4));
  const inc = () => onChange(Math.min(40, value + 4));

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 w-full">
      {/* Icon */}
      <div
        className="w-[90px] h-[90px] rounded-[28px] flex items-center justify-center"
        style={{ background: "rgba(45,212,191,0.12)", border: "1.5px solid rgba(45,212,191,0.25)" }}
      >
        <span className="text-[44px] leading-none select-none">🏗️</span>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-5">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={dec}
          disabled={value <= 8}
          className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-[24px] transition-opacity"
          style={{
            background: value <= 8 ? "rgba(255,255,255,0.07)" : C.teal,
            color:       value <= 8 ? "rgba(255,255,255,0.3)" : C.navy,
          }}
        >
          −
        </motion.button>

        <div className="text-center w-[120px]">
          <AnimatePresence mode="wait">
            <motion.span
              key={value}
              initial={{ y: -14, opacity: 0 }}
              animate={{ y: 0,   opacity: 1 }}
              exit={{    y:  14, opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="block text-white font-extrabold tabular-nums leading-none"
              style={{ fontSize: 52 }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
          <span className="text-[15px] font-semibold mt-1 block" style={{ color: "rgba(255,255,255,0.45)" }}>
            slots
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={inc}
          disabled={value >= 40}
          className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-[24px] transition-opacity"
          style={{
            background: value >= 40 ? "rgba(255,255,255,0.07)" : C.teal,
            color:       value >= 40 ? "rgba(255,255,255,0.3)" : C.navy,
          }}
        >
          +
        </motion.button>
      </div>

      {/* Quick presets */}
      <div className="flex gap-2">
        {CAPACITY_PRESETS.map((p) => (
          <motion.button
            key={p}
            whileTap={{ scale: 0.93 }}
            onClick={() => onChange(p)}
            className="px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-colors"
            style={{
              background: value === p ? C.teal             : "rgba(255,255,255,0.08)",
              color:      value === p ? C.navy             : "rgba(255,255,255,0.55)",
              border:     value === p ? "none"             : "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {p}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Slide data ────────────────────────────────────────────────────

const BLOBS = [
  "M200,48 C282,24 364,102 370,194 C376,286 324,364 238,384 C152,404 54,362 26,268 C-2,174 52,84 124,58 C158,44 172,60 200,48Z",
  "M198,50 C280,28 362,104 368,196 C374,288 320,366 234,386 C148,406 52,362 28,266 C4,170 56,82 126,56 C160,42 168,62 198,50Z",
  "M202,46 C284,22 366,100 372,192 C378,284 326,366 240,386 C154,406 52,364 26,270 C0,176 54,86 126,58 C160,44 174,58 202,46Z",
  "M196,52 C278,28 362,106 368,198 C374,290 322,368 236,388 C150,408 50,364 26,268 C2,172 56,82 128,56 C162,42 166,64 196,52Z",
];

const SLIDES = [
  {
    key:       "identify",
    blob:      BLOBS[0],
    blobColor: "#0c2d38",
    emoji:     "📱",
    subEmoji:  { icon: "🌿", style: { bottom: "-8px", right: "-24px" } },
    deco: {
      stars:    [
        { size: 22, pos: { top: "9%",  right: "13%" } },
        { size: 12, pos: { bottom: "22%", left: "7%" } },
        { size: 9,  pos: { bottom: "18%", right: "22%" }, op: 0.8 },
      ],
      bursts:   [{ pos: { top: "15%", right: "18%" }, size: 25 }],
      diamonds: [
        { pos: { top: "26%", left: "13%" } },
        { pos: { bottom: "34%", right: "17%" } },
        { size: 7, pos: { top: "16%", left: "40%" } },
      ],
    },
    labels: [
      { text: "rubber plant", pos: { bottom: "26%", left: "4%" }, accent: false },
      { text: "sunburn",      pos: { top: "21%",   right: "4%" }, accent: true  },
    ],
    title: "Identify any plants\nand their diseases",
  },
  {
    key:       "water",
    blob:      BLOBS[1],
    blobColor: "#0a1e2c",
    emoji:     "💧",
    subEmoji:  { icon: "🧪", style: { bottom: "-6px", right: "-22px" } },
    deco: {
      stars:    [
        { size: 24, pos: { top: "8%",  right: "16%" } },
        { size: 11, pos: { bottom: "20%", right: "10%" } },
        { size: 9,  pos: { bottom: "30%", left: "8%" }, op: 0.75 },
      ],
      bursts:   [{ pos: { top: "17%", right: "18%" }, size: 27 }],
      diamonds: [
        { pos: { top: "22%", left: "11%" } },
        { pos: { bottom: "26%", left: "33%" } },
        { size: 7, pos: { top: "30%", right: "29%" } },
      ],
    },
    labels: [
      { text: "pH 6.2",   pos: { bottom: "28%", left: "4%" }, accent: false },
      { text: "EC 1.8 ✓", pos: { top: "22%",   right: "4%" }, accent: true  },
    ],
    title: "Track water chemistry\nin real time",
  },
  {
    key:       "tower",
    blob:      BLOBS[2],
    blobColor: "#0c2d38",
    emoji:     "🌱",
    subEmoji:  { icon: "🗼", style: { bottom: "-8px", right: "-26px" } },
    deco: {
      stars:    [
        { size: 20, pos: { top: "10%", right: "15%" } },
        { size: 12, pos: { bottom: "24%", left: "8%" } },
        { size: 9,  pos: { bottom: "18%", right: "24%" }, op: 0.8 },
      ],
      bursts:   [{ pos: { top: "14%", right: "20%" }, size: 24 }],
      diamonds: [
        { pos: { top: "24%", left: "15%" } },
        { pos: { bottom: "30%", right: "19%" } },
        { size: 7, pos: { top: "18%", left: "43%" } },
      ],
    },
    labels: [
      { text: "40 slots",      pos: { bottom: "26%", left: "4%" }, accent: false },
      { text: "harvest ready", pos: { top: "21%",   right: "4%" }, accent: true  },
    ],
    title: "Manage your hydro\ntower effortlessly",
  },
  {
    key:       "rewards",
    blob:      BLOBS[3],
    blobColor: "#1a1a08",
    emoji:     "🏆",
    subEmoji:  { icon: "⭐", style: { bottom: "-6px", right: "-20px" } },
    deco: {
      stars:    [
        { size: 24, pos: { top: "9%",  left: "17%" } },
        { size: 12, pos: { bottom: "22%", right: "9%" } },
        { size: 9,  pos: { top: "28%", right: "27%" }, op: 0.75 },
      ],
      bursts:   [{ pos: { top: "14%", right: "17%" }, size: 26 }],
      diamonds: [
        { pos: { top: "22%", right: "15%" } },
        { pos: { bottom: "30%", left: "21%" } },
        { size: 7, pos: { top: "14%", right: "39%" } },
      ],
    },
    labels: [
      { text: "+50 XP",  pos: { bottom: "26%", left: "4%" }, accent: true  },
      { text: "Level 3!", pos: { top: "21%",   right: "4%" }, accent: false },
    ],
    title: "Level up and\nearn achievements",
  },
  {
    key:         "capacity",
    title:       "How big is your\ntower?",
    interactive: true,
  },
];

// ─── Splash screen ─────────────────────────────────────────────────

function SplashScreen({ onContinue }) {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: C.navy }}>
      {/* Character fills the top portion */}
      <div className="flex-1 flex items-end justify-center pb-0 px-4 min-h-0">
        <div style={{ width: "100%", maxWidth: 340, aspectRatio: "390/440" }}>
          <CharacterIllustration />
        </div>
      </div>

      {/* Bottom content — left-aligned like Plantin */}
      <div className="px-7 pb-10 flex flex-col gap-5 flex-shrink-0">
        <div>
          <h1
            className="text-white leading-[1.08] tracking-tight"
            style={{ fontSize: 38, fontWeight: 800 }}
          >
            Welcome to<br />Power Plant!
          </h1>
          <p className="mt-2 font-semibold" style={{ fontSize: 15, color: C.green }}>
            Grow smarter. Grow greener.
          </p>
        </div>

        <div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onContinue}
            className="w-full rounded-full font-bold text-gray-900 shadow-lg"
            style={{ background: C.green, paddingTop: 16, paddingBottom: 16, fontSize: 16 }}
          >
            Continue
          </motion.button>
          <p
            className="text-center mt-3 leading-relaxed"
            style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}
          >
            By continuing you accept our{" "}
            <span style={{ color: C.green }}>Privacy Policy</span>,{" "}
            <span style={{ color: C.green }}>Terms & Conditions</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────

export default function OnboardingFlow({ onComplete }) {
  const [phase, setPhase]                   = useState("splash");
  const [slideIndex, setSlideIndex]         = useState(0);
  const [dir, setDir]                       = useState(1);
  const [selectedCapacity, setSelectedCapacity] = useState(24);

  const Frame = ({ children }) => (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0a1220" }}
    >
      <div
        className="w-full max-w-[430px] h-screen max-h-[932px] rounded-none sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
        style={{ background: C.navy }}
      >
        {children}
      </div>
    </div>
  );

  if (phase === "splash") {
    return (
      <Frame>
        <SplashScreen onContinue={() => setPhase("slides")} />
      </Frame>
    );
  }

  const slide  = SLIDES[slideIndex];
  const isLast = slideIndex === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) { onComplete({ capacity: selectedCapacity }); return; }
    setDir(1);
    setSlideIndex((i) => i + 1);
  };

  const goBack = () => {
    if (slideIndex === 0) { setPhase("splash"); return; }
    setDir(-1);
    setSlideIndex((i) => i - 1);
  };

  return (
    <Frame>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2 flex-shrink-0">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <ChevronLeft size={20} color="white" />
        </button>
        <button
          onClick={() => onComplete({ capacity: selectedCapacity })}
          className="text-[14px] font-semibold px-2 py-1 active:opacity-60 transition-opacity"
          style={{ color: C.green }}
        >
          Skip
        </button>
      </div>

      {/* Slide */}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={slide.key}
          custom={dir}
          initial={{ opacity: 0, x: dir * 55 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -55 }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="flex-1 flex flex-col min-h-0"
        >
          {/* Illustration or interactive content */}
          <div className="flex-1 flex items-center justify-center px-8 min-h-0">
            {slide.interactive ? (
              <CapacitySlide value={selectedCapacity} onChange={setSelectedCapacity} />
            ) : (
              <FeatureIllustration slide={slide} />
            )}
          </div>

          {/* Title */}
          <div className="px-8 pb-4">
            <h2
              className="text-white text-center whitespace-pre-line leading-tight"
              style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.3px" }}
            >
              {slide.title}
            </h2>
            {slide.interactive && (
              <p className="text-center mt-1.5" style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
                You can change this any time in the Tower tab
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <div className="px-6 pb-10 flex-shrink-0">
        {/* Pill-style progress dots */}
        <div className="flex justify-center items-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width:           i === slideIndex ? 24 : 8,
                backgroundColor: i === slideIndex ? C.green : "rgba(255,255,255,0.15)",
              }}
              transition={{ duration: 0.3 }}
              style={{ height: 8, borderRadius: 4 }}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={goNext}
          className="w-full rounded-full font-bold text-gray-900 shadow-lg"
          style={{ background: C.green, paddingTop: 16, paddingBottom: 16, fontSize: 16 }}
        >
          {isLast ? "Let's grow! 🌱" : "Next"}
        </motion.button>
      </div>
    </Frame>
  );
}
