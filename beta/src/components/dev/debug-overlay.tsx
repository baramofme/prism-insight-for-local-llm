"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BREAKPOINTS } from "@/lib/breakpoints";

function getBreakpointName(width: number): string {
  if (width < BREAKPOINTS.MOBILE) return "MOBILE";
  if (width < BREAKPOINTS.TABLET) return "TABLET";
  if (width < BREAKPOINTS.WIDE) return "DESKTOP";
  return "WIDE";
}

const TOP_LEVEL_IDS = new Set([
  "gf-root",
  "gf-header",
  "gf-left-nav",
  "gf-left-nav-mobile",
  "gf-main",
  "gf-right-panel",
  "gf-footer",
  "gf-layout",
  "gf-nav-rail",
  "gf-research-panel",
  "gf-main-content",
  "gf-mobile-portfolio",
  "gf-mobile-portfolio-detail",
]);

interface Label {
  id: string;
  left: number;
  top: number;
  width: number;
  topLevel: boolean;
}

interface BoxSide {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface BoxModel {
  margin: BoxSide;
  padding: BoxSide;
  border: BoxSide;
  rect: DOMRect;
}

function getBoxModel(id: string): BoxModel | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const parse = (v: string) => parseFloat(v) || 0;
  return {
    margin: {
      top: parse(cs.marginTop),
      right: parse(cs.marginRight),
      bottom: parse(cs.marginBottom),
      left: parse(cs.marginLeft),
    },
    padding: {
      top: parse(cs.paddingTop),
      right: parse(cs.paddingRight),
      bottom: parse(cs.paddingBottom),
      left: parse(cs.paddingLeft),
    },
    border: {
      top: parse(cs.borderTopWidth),
      right: parse(cs.borderRightWidth),
      bottom: parse(cs.borderBottomWidth),
      left: parse(cs.borderLeftWidth),
    },
    rect,
  };
}

function BoxModelOverlays({ bm, id }: { bm: BoxModel; id: string }) {
  const { margin: m, padding: p, border: b, rect: r } = bm;
  const out = (key: string, style: React.CSSProperties) => (
    <div key={`${id}-${key}`} style={{ position: "fixed", pointerEvents: "none", zIndex: 99998, ...style }} />
  );

  return (
    <>
      {m.top > 0 && out("mt", {
        left: r.left - m.left, top: r.top - m.top,
        width: r.width + m.left + m.right, height: m.top,
        background: "rgba(245, 158, 11, 0.2)",
      })}
      {m.bottom > 0 && out("mb", {
        left: r.left - m.left, top: r.bottom,
        width: r.width + m.left + m.right, height: m.bottom,
        background: "rgba(245, 158, 11, 0.2)",
      })}
      {m.left > 0 && out("ml", {
        left: r.left - m.left, top: r.top - m.top,
        width: m.left, height: r.height + m.top + m.bottom,
        background: "rgba(245, 158, 11, 0.2)",
      })}
      {m.right > 0 && out("mr", {
        left: r.right, top: r.top - m.top,
        width: m.right, height: r.height + m.top + m.bottom,
        background: "rgba(245, 158, 11, 0.2)",
      })}

      {p.top > 0 && out("pt", {
        left: r.left + b.left, top: r.top + b.top,
        width: r.width - b.left - b.right, height: p.top,
        background: "rgba(34, 197, 94, 0.15)",
      })}
      {p.bottom > 0 && out("pb", {
        left: r.left + b.left, top: r.top + r.height - b.bottom - p.bottom,
        width: r.width - b.left - b.right, height: p.bottom,
        background: "rgba(34, 197, 94, 0.15)",
      })}
      {p.left > 0 && out("pl", {
        left: r.left + b.left, top: r.top + b.top,
        width: p.left, height: r.height - b.top - b.bottom,
        background: "rgba(34, 197, 94, 0.15)",
      })}
      {p.right > 0 && out("pr", {
        left: r.left + r.width - b.right - p.right, top: r.top + b.top,
        width: p.right, height: r.height - b.top - b.bottom,
        background: "rgba(34, 197, 94, 0.15)",
      })}

      {out("outline", {
        left: r.left - m.left, top: r.top - m.top,
        width: r.width + m.left + m.right, height: r.height + m.top + m.bottom,
        border: "1.5px dashed rgba(245, 158, 11, 0.5)",
        boxSizing: "border-box",
      })}
    </>
  );
}

function IdLabels({ show }: { show: boolean }) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const boxModels = useRef<Map<string, BoxModel>>(new Map());

  useEffect(() => {
    if (!show) {
      setSelectedIds(new Set());
      boxModels.current.clear();
    }
  }, [show]);

  const update = useCallback(() => {
    if (!show) {
      setLabels([]);
      return;
    }
    const result: Label[] = [];
    document.querySelectorAll<HTMLElement>('[id^="gf-"]').forEach((el) => {
      if (!el.id || el.id === "gf-root") return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      result.push({
        id: el.id,
        left: r.left,
        top: r.top,
        width: r.width,
        topLevel: TOP_LEVEL_IDS.has(el.id),
      });
    });
    setLabels(result);

    const newModels = new Map(boxModels.current);
    for (const id of selectedIds) {
      const bm = getBoxModel(id);
      if (bm) newModels.set(id, bm);
      else newModels.delete(id);
    }
    boxModels.current = newModels;
  }, [show, selectedIds]);

  useEffect(() => {
    update();
    window.addEventListener("scroll", update, { capture: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        boxModels.current.delete(id);
      } else {
        next.add(id);
        const bm = getBoxModel(id);
        if (bm) {
          boxModels.current.set(id, bm);
          const { margin: m, padding: p, border: b, rect: r } = bm;
          console.log(
            `#${id}`,
            `w:${Math.round(r.width)} h:${Math.round(r.height)}`,
            `m:[T${m.top} R${m.right} B${m.bottom} L${m.left}]`,
            `p:[T${p.top} R${p.right} B${p.bottom} L${p.left}]`,
            `b:[T${b.top} R${b.right} B${b.bottom} L${b.left}]`,
          );
        }
      }
      return next;
    });
  };

  if (!show) return null;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99999 }}>
      {[...selectedIds].map((id) => {
        const bm = boxModels.current.get(id);
        return bm ? <BoxModelOverlays key={id} bm={bm} id={id} /> : null;
      })}

      {labels.map((l, i) => {
        const selected = selectedIds.has(l.id);
        return (
          <div
            key={`${l.id}-${i}`}
            onClick={() => toggleId(l.id)}
            style={{
              position: "fixed",
              left: l.left + l.width / 2,
              top: l.top,
              transform: "translateX(-50%)",
              cursor: "pointer",
              pointerEvents: "auto",
              background: selected
                ? "#e8e8e8"
                : l.topLevel
                  ? "linear-gradient(135deg, #2a1f1a 0%, #2d1e28 100%)"
                  : "rgba(30, 30, 35, 0.88)",
              color: selected ? "#1a1a1a" : "#e0e0e0",
              fontSize: 11,
              padding: "2px 8px 2px 6px",
              borderRadius: "0 4px 4px 0",
              borderLeft: "12px solid" + (selected
                ? " #f59e0b"
                : l.topLevel
                  ? " #f59e0b"
                  : " #5b8def"),
              whiteSpace: "nowrap",
              fontFamily: "ui-monospace, monospace",
              fontWeight: 600,
              letterSpacing: "0.3px",
              lineHeight: 1.4,
              transition: "all 0.15s",
            }}
          >
            #{l.id}
          </div>
        );
      })}
    </div>
  );
}

export function DebugOverlay() {
  const [showIds, setShowIds] = useState(false);
  const [vp, setVp] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 });

  useEffect(() => {
    setPos({ x: window.innerWidth - 220, y: window.innerHeight - 50 });
    setVp(window.innerWidth);
    const handleResize = () => setVp(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setPos({
        x: dragStart.current.left + e.clientX - dragStart.current.x,
        y: dragStart.current.top + e.clientY - dragStart.current.y,
      });
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const breakpoint = getBreakpointName(vp);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, left: pos.x, top: pos.y };
  };

  return (
    <>
      <IdLabels show={showIds} />
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          zIndex: 999999,
          background: "rgba(15, 15, 15, 0.88)",
          backdropFilter: "blur(8px)",
          color: "#e5e7eb",
          padding: "8px 14px",
          borderRadius: 10,
          fontSize: 13,
          fontFamily: "ui-monospace, monospace",
          display: "flex",
          alignItems: "center",
          gap: 10,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          userSelect: "none",
          cursor: "grab",
        }}
      >
        <span style={{ fontWeight: 600, color: "#60a5fa" }}>{breakpoint}</span>
        <span style={{ color: "#6b7280" }}>|</span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{vp}px</span>
        <span style={{ color: "#6b7280" }}>|</span>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setShowIds((v) => !v)}
          style={{
            padding: "3px 10px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            background: showIds ? "#22c55e" : "#4b5563",
            color: showIds ? "#052e16" : "#d1d5db",
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "ui-monospace, monospace",
            transition: "all 0.15s",
          }}
        >
          ID {showIds ? "ON" : "OFF"}
        </button>
      </div>
    </>
  );
}
