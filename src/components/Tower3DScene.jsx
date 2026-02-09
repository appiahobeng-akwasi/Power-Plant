import React, { useRef, useEffect, useCallback, useState } from "react";

// ── Constants ─────────────────────────────────────────────────────
const LIGHT_ANGLE = 30;
const LAYER_GAP = 44;
const BASE_R = 44;
const BASE_H = 30;
const BASE_SIDES = 20;
const LID_R = 48;
const COL_R = 4.5;
const COL_SIDES = 12;
const POD_RADIUS = 52;
const POD_W = 30;
const POD_H = 24;
const POD_D = 10;
const TIER_R = 14;
const CAP_R = 8;
const NUB_R = 3;
const NUB_H = 9;
const NUB_SIDES = 8;
const WATER_R = 36;
const SHADOW_R = 50;

function panelBrightness(angleIdx, totalSides) {
  const panelAngle = (angleIdx / totalSides) * 360;
  const diff = Math.abs(((panelAngle - LIGHT_ANGLE + 180) % 360) - 180);
  return 0.7 + 0.3 * Math.cos((diff * Math.PI) / 180);
}

// ── Cylinder3D ────────────────────────────────────────────────────
function Cylinder3D({ radius, height, sides, color, y = 0, wireframe }) {
  const panels = [];
  const circumference = 2 * Math.PI * radius;
  const panelWidth = circumference / sides;

  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * 360;
    const brightness = panelBrightness(i, sides);
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const z = Math.sin(rad) * radius;

    panels.push(
      <div
        key={i}
        className="absolute"
        style={{
          width: panelWidth + 1,
          height,
          left: "50%",
          top: "50%",
          marginLeft: -panelWidth / 2,
          marginTop: -height / 2,
          transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${angle}deg)`,
          backgroundColor: wireframe ? "transparent" : color,
          filter: wireframe ? "none" : `brightness(${brightness})`,
          border: wireframe ? "1px solid rgba(74,222,128,.45)" : "none",
          backfaceVisibility: "hidden",
        }}
      />
    );
  }

  return <>{panels}</>;
}

// ── Disc3D ────────────────────────────────────────────────────────
function Disc3D({ radius, y = 0, color, opacity = 1, wireframe, pulse, gradient }) {
  return (
    <div
      className="absolute rounded-full"
      style={{
        width: radius * 2,
        height: radius * 2,
        left: "50%",
        top: "50%",
        marginLeft: -radius,
        marginTop: -radius,
        transform: `translate3d(0, ${y}px, 0) rotateX(90deg)`,
        background: gradient || (wireframe ? "transparent" : color),
        opacity,
        border: wireframe ? "1px solid rgba(74,222,128,.45)" : "none",
        animation: pulse ? "twrWater 3s ease-in-out infinite" : "none",
      }}
    />
  );
}

// ── Pod3D ─────────────────────────────────────────────────────────
function Pod3D({ slot, angle, layerY, onTap, wireframe }) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * POD_RADIUS;
  const z = Math.sin(rad) * POD_RADIUS;
  const planted = slot.crop !== null;
  const healthColor =
    slot.health >= 80 ? "#22c55e" : slot.health >= 60 ? "#f59e0b" : "#ef4444";

  const faces = [
    { name: "front", transform: `translateZ(${POD_D / 2}px)` },
    { name: "back", transform: `translateZ(${-POD_D / 2}px) rotateY(180deg)` },
    { name: "left", transform: `translateX(${-POD_W / 2}px) rotateY(-90deg)` },
    { name: "right", transform: `translateX(${POD_W / 2}px) rotateY(90deg)` },
    { name: "top", transform: `translateY(${-POD_H / 2}px) rotateX(90deg)` },
    { name: "bottom", transform: `translateY(${POD_H / 2}px) rotateX(-90deg)` },
  ];

  return (
    <div
      className="absolute"
      style={{
        transform: `translate3d(${x}px, ${layerY}px, ${z}px) rotateY(${-angle}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Arm connecting to center */}
      <div
        className="absolute"
        style={{
          width: POD_RADIUS - 15,
          height: 2,
          left: "50%",
          top: "50%",
          marginLeft: -(POD_RADIUS - 15),
          marginTop: -1,
          backgroundColor: wireframe
            ? "rgba(74,222,128,.3)"
            : "#d1d5db",
          transform: `rotateY(180deg) translateX(${-(POD_RADIUS - 15) / 2}px)`,
        }}
      />

      {/* Pod body — uses data attribute for tap detection */}
      <div
        data-pod-id={slot.id}
        className="absolute cursor-pointer"
        style={{
          width: POD_W,
          height: POD_H,
          marginLeft: -POD_W / 2,
          marginTop: -POD_H / 2,
          transformStyle: "preserve-3d",
        }}
      >
        {faces.map(({ name, transform }) => (
          <div
            key={name}
            data-pod-id={slot.id}
            className="absolute flex items-center justify-center"
            style={{
              width: name === "left" || name === "right" ? POD_D : POD_W,
              height: name === "top" || name === "bottom" ? POD_D : POD_H,
              transform,
              backgroundColor: wireframe
                ? "transparent"
                : name === "front"
                ? "#fff"
                : "#f3f4f6",
              border: wireframe
                ? "1px solid rgba(74,222,128,.45)"
                : "1px solid #e5e7eb",
              borderRadius: 4,
              backfaceVisibility: "hidden",
              pointerEvents: "auto",
            }}
          >
            {name === "front" && (
              <div className="text-center leading-tight" data-pod-id={slot.id}>
                {planted ? (
                  <>
                    <span
                      className="block"
                      style={{ fontSize: 13 }}
                      data-pod-id={slot.id}
                    >
                      {slot.crop.icon}
                    </span>
                    <span
                      className="block"
                      style={{
                        fontSize: 7,
                        color: wireframe ? "#4ade80" : healthColor,
                        fontWeight: 700,
                      }}
                      data-pod-id={slot.id}
                    >
                      {slot.health}%
                    </span>
                  </>
                ) : (
                  <span
                    style={{
                      fontSize: 8,
                      color: wireframe ? "#4ade80" : "#9ca3af",
                      fontWeight: 600,
                    }}
                    data-pod-id={slot.id}
                  >
                    {slot.id + 1}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stem + leaf for planted pods */}
      {planted && !wireframe && (
        <div
          className="absolute"
          style={{
            left: "50%",
            bottom: POD_H / 2,
            width: 2,
            height: 10,
            marginLeft: -1,
            backgroundColor: "#4ade80",
            transform: `translateY(-${POD_H / 2 + 10}px)`,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 2,
              width: 7,
              height: 5,
              borderRadius: "50% 50% 50% 0",
              backgroundColor: "#86efac",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Main Tower3DScene ─────────────────────────────────────────────
export default function Tower3DScene({
  slots,
  plantCapacity,
  onPodTap,
  mini = false,
  wireframe = false,
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rotY = useRef(0);
  const rotX = useRef(mini ? -16 : -20);
  const velY = useRef(mini ? 0.28 : 0.18);
  const velX = useRef(0);
  const isDragging = useRef(false);
  const dragDistance = useRef(0);
  const lastPointer = useRef({ x: 0, y: 0 });
  const animFrame = useRef(null);
  const [containerH, setContainerH] = useState(0);

  const activeSlots = slots.slice(0, plantCapacity);
  const layers = Math.ceil(plantCapacity / 4);
  const totalH = BASE_H + layers * LAYER_GAP + 30;

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerH(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = mini
    ? Math.min(0.38, (180 * 0.85) / totalH)
    : containerH > 0
    ? Math.min(0.75, (containerH * 0.65) / totalH)
    : 0.5;

  // Animation loop
  useEffect(() => {
    const loop = () => {
      if (!isDragging.current) {
        rotY.current += velY.current;
        rotX.current += velX.current;
        rotX.current = Math.max(-55, Math.min(-5, rotX.current));

        velY.current *= 0.965;
        velX.current *= 0.92;

        if (Math.abs(velY.current) < 0.08) {
          velY.current = mini ? 0.28 : 0.18;
        }
      }

      if (sceneRef.current) {
        sceneRef.current.style.transform = `rotateX(${rotX.current}deg) rotateY(${rotY.current}deg)`;
      }

      animFrame.current = requestAnimationFrame(loop);
    };
    animFrame.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame.current);
  }, [mini]);

  // Drag vs tap detection: track total pointer movement
  const handlePointerDown = useCallback((e) => {
    if (mini) return;
    isDragging.current = true;
    dragDistance.current = 0;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    velY.current = 0;
    velX.current = 0;
  }, [mini]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current || mini) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    dragDistance.current += Math.abs(dx) + Math.abs(dy);
    rotY.current += dx * 0.4;
    rotX.current += dy * 0.22;
    rotX.current = Math.max(-55, Math.min(-5, rotX.current));
    velY.current = dx * 0.4;
    velX.current = dy * 0.22;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  }, [mini]);

  const tappedRef = useRef(false);

  const handlePointerUp = useCallback((e) => {
    tappedRef.current = false;
    // Try pod tap via pointer events (works on touch devices)
    if (isDragging.current && dragDistance.current < 30 && onPodTap) {
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const podId = hit?.getAttribute?.("data-pod-id") ??
        hit?.closest?.("[data-pod-id]")?.getAttribute("data-pod-id");
      if (podId !== null && podId !== undefined) {
        onPodTap(parseInt(podId, 10));
        tappedRef.current = true; // prevent duplicate from click
      }
    }
    isDragging.current = false;
  }, [onPodTap]);

  // Click handler — uses elementFromPoint for 3D hit testing
  // dragDistance guards against accidental taps after drags
  const handleClick = useCallback((e) => {
    if (mini || !onPodTap || tappedRef.current) return;
    if (dragDistance.current > 30) return;
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const podId = hit?.getAttribute?.("data-pod-id") ??
      hit?.closest?.("[data-pod-id]")?.getAttribute("data-pod-id");
    if (podId !== null && podId !== undefined) {
      onPodTap(parseInt(podId, 10));
    }
  }, [mini, onPodTap]);

  // Center the tower vertically.
  // The tower base is at y=0, it extends upward to y = -(BASE_H + layers*LAYER_GAP + NUB_H).
  // To center the tower in the container, offset = half the total tower height * scale.
  // Positive marginTop moves the scene origin down, which visually pushes the tower center to viewport center.
  const towerVisualH = BASE_H + layers * LAYER_GAP + NUB_H + 10;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        perspective: mini ? 500 : 800,
        cursor: mini ? "default" : "grab",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onMouseDown={() => { if (!mini) { dragDistance.current = 0; } }}
      onClick={handleClick}
    >
      {/* CSS keyframes */}
      <style>{`
        @keyframes twrWater {
          0%, 100% { transform: translate3d(0, 0, 0) rotateX(90deg) scale(1); opacity: 0.6; }
          50% { transform: translate3d(0, 0, 0) rotateX(90deg) scale(1.05); opacity: 0.8; }
        }
        @keyframes twrParticle {
          0% { opacity: 0.7; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
        @keyframes twrShimmer {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div
        ref={sceneRef}
        className="absolute left-1/2 top-1/2"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotX.current}deg) rotateY(${rotY.current}deg)`,
          scale,
          marginLeft: 0,
          marginTop: mini ? 20 : (towerVisualH * scale) / 3.5,
        }}
      >
        {/* Shadow disc */}
        <Disc3D
          radius={SHADOW_R}
          y={BASE_H / 2 + 2}
          color="rgba(0,0,0,0.15)"
          wireframe={wireframe}
        />

        {/* Reservoir */}
        <Cylinder3D
          radius={BASE_R}
          height={BASE_H}
          sides={BASE_SIDES}
          color={wireframe ? "transparent" : "#383838"}
          wireframe={wireframe}
        />
        <Disc3D
          radius={BASE_R}
          y={-BASE_H / 2}
          color="#484848"
          wireframe={wireframe}
        />
        <Disc3D
          radius={BASE_R}
          y={BASE_H / 2}
          color="#303030"
          wireframe={wireframe}
        />

        {/* Water shimmer */}
        <Disc3D
          radius={WATER_R}
          y={-BASE_H / 2 + 2}
          gradient="radial-gradient(circle, rgba(56,189,248,0.4), rgba(56,189,248,0.1))"
          pulse
          wireframe={wireframe}
        />

        {/* Lid ring */}
        <Disc3D
          radius={LID_R}
          y={-BASE_H / 2 - 2}
          color="#F0F0F0"
          wireframe={wireframe}
        />

        {/* Central column */}
        <Cylinder3D
          radius={COL_R}
          height={layers * LAYER_GAP + 20}
          sides={COL_SIDES}
          color={wireframe ? "transparent" : "#8FA89B"}
          y={-(layers * LAYER_GAP) / 2 - BASE_H / 2}
          wireframe={wireframe}
        />

        {/* Layers with pods */}
        {Array.from({ length: layers }).map((_, layerIdx) => {
          const layerY = -BASE_H / 2 - (layerIdx + 1) * LAYER_GAP;
          const angleOffset = layerIdx % 2 === 0 ? 0 : 45;

          return (
            <React.Fragment key={layerIdx}>
              {/* Tier ring */}
              <Disc3D
                radius={TIER_R}
                y={layerY}
                color="#d1d5db"
                wireframe={wireframe}
              />

              {/* 4 pods per layer */}
              {[0, 1, 2, 3].map((podIdx) => {
                const slotIdx = layerIdx * 4 + podIdx;
                if (slotIdx >= plantCapacity) return null;
                const angle = podIdx * 90 + angleOffset;
                return (
                  <Pod3D
                    key={slotIdx}
                    slot={activeSlots[slotIdx] || { id: slotIdx, crop: null, health: 0, scanHistory: [] }}
                    angle={angle}
                    layerY={layerY}
                    onTap={onPodTap || (() => {})}
                    wireframe={wireframe}
                  />
                );
              })}
            </React.Fragment>
          );
        })}

        {/* Top cap */}
        <Disc3D
          radius={CAP_R}
          y={-BASE_H / 2 - layers * LAYER_GAP - 10}
          color="#8FA89B"
          wireframe={wireframe}
        />

        {/* Nub */}
        <Cylinder3D
          radius={NUB_R}
          height={NUB_H}
          sides={NUB_SIDES}
          color={wireframe ? "transparent" : "#7d9b88"}
          y={-BASE_H / 2 - layers * LAYER_GAP - 10 - NUB_H / 2}
          wireframe={wireframe}
        />

        {/* Wireframe scan lines */}
        {wireframe &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`scan-${i}`}
              className="absolute"
              style={{
                width: 120,
                height: 1,
                left: "50%",
                top: "50%",
                marginLeft: -60,
                transform: `translateY(${-BASE_H / 2 - i * LAYER_GAP * (layers / 6)}px)`,
                background: "rgba(74,222,128,.3)",
                animation: `twrShimmer ${2 + i * 0.3}s ease-in-out infinite`,
              }}
            />
          ))}
      </div>

      {/* Floating particles */}
      {!wireframe && !mini &&
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              backgroundColor: i < 2 ? "rgba(56,189,248,0.5)" : "rgba(74,222,128,0.5)",
              left: `${30 + i * 15}%`,
              bottom: `${20 + i * 10}%`,
              animation: `twrParticle ${3 + i * 0.5}s ease-out infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
    </div>
  );
}
