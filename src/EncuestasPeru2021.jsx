import { useState, useMemo, useCallback, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// ── 2021 ──
const CANDIDATES_2021 = {
  castillo:    { name: "Pedro Castillo",      short: "Castillo",     color: "#DC2626" },
  fujimori:    { name: "Keiko Fujimori",      short: "Fujimori",     color: "#F97316" },
  deSoto:      { name: "Hernando de Soto",    short: "de Soto",      color: "#8B5CF6" },
  lopezAliaga: { name: "Rafael López Aliaga", short: "López Aliaga", color: "#3B82F6" },
  lescano:     { name: "Yonhy Lescano",       short: "Lescano",      color: "#EC4899" },
  mendoza:     { name: "Verónika Mendoza",    short: "Mendoza",      color: "#10B981" },
};

// day = days since Mar 1 (last day of polling window)
const pollData2021 = [
  { date: "8-11 Mar", source: "IEP",   day: 11, muestra: 1221, castillo: 3.5,  fujimori: 7.2,  lopezAliaga: 9.5, deSoto: 5.7,  lescano: 13.9, mendoza: 7   },
  { date: "10-11 Mar", source: "Ipsos", day: 11, muestra: 1216, castillo: 3,    fujimori: 8.6,  lopezAliaga: 9.3, deSoto: 4.8,  lescano: 16.8, mendoza: 8.4 },
  { date: "18-21 Mar", source: "Datum", day: 21, muestra: 1201, castillo: 3,    fujimori: 8,    lopezAliaga: 9,   deSoto: 5,    lescano: 14,   mendoza: 6   },
  { date: "22-25 Mar", source: "IEP",   day: 25, muestra: 1212, castillo: 4.3,  fujimori: 7.9,  lopezAliaga: 9.7, deSoto: 8.5,  lescano: 11.4, mendoza: 9.6 },
  { date: "27-29 Mar", source: "Datum", day: 29, muestra: 1206, castillo: 3.7,  fujimori: 7.9,  lopezAliaga: 7.2, deSoto: 6.5,  lescano: 12.1, mendoza: 5.7 },
  { date: "31 Mar",    source: "Ipsos", day: 31, muestra: 1526, castillo: 6.5,  fujimori: 9.3,  lopezAliaga: 6.8, deSoto: 11.5, lescano: 12.1, mendoza: 10.2},
  { date: "1-2 Abr",   source: "IEP",  day: 33, muestra: 1215, castillo: 6.6,  fujimori: 9.8,  lopezAliaga: 8.4, deSoto: 9.8,  lescano: 8.2,  mendoza: 7.3 },
  { date: "11 Abr",    source: "ONPE",  day: 42, muestra: null, castillo: 15.4, fujimori: 10.9, lopezAliaga: 9.6, deSoto: 9.5,  lescano: 7.4,  mendoza: 6.4 },
];

// ── 2026 ──
const CANDIDATES_2026 = {
  fujimori:    { name: "Keiko Fujimori",      short: "Fujimori",     color: "#F97316" },
  lopezAliaga: { name: "Rafael López Aliaga", short: "López Aliaga", color: "#3B82F6" },
  alvarez:     { name: "Carlos Álvarez",      short: "Álvarez",      color: "#EAB308" },
  sanchez:     { name: "Roberto Sánchez",     short: "Sánchez",      color: "#10B981" },
  nieto:       { name: "Jorge Nieto",         short: "Nieto",        color: "#8B5CF6" },
  belmont:     { name: "Ricardo Belmont",     short: "Belmont",      color: "#EC4899" },
  perezTello:  { name: "Marisol Pérez Tello", short: "Pérez Tello",  color: "#06B6D4" },
  lopezChau:   { name: "Alfonso López-Chau",  short: "López-Chau",   color: "#DC2626" },
};

// day = days since Mar 1 (last day of polling window)
const pollData2026 = [
  { date: "13-17 Mar", source: "Datum", day: 17, muestra: 1500, fujimori: 11.9, lopezAliaga: 11.7, alvarez: 5.0, sanchez: 2.0, nieto: 4.6, belmont: 2.4, perezTello: 0.5, lopezChau: 6.5 },
  { date: "21-22 Mar", source: "Ipsos", day: 22, muestra: 1189, fujimori: 12.3, lopezAliaga: 12.2, alvarez: 5.2, sanchez: 5.4, nieto: 3.8, belmont: 2.2, perezTello: null, lopezChau: 5.6 },
  { date: "25-27 Mar", source: "Datum", day: 27, muestra: 2000, fujimori: 13.2, lopezAliaga: 9.5,  alvarez: 6.3, sanchez: 5.3, nieto: 4.9, belmont: 2.0, perezTello: null, lopezChau: 4.2 },
  { date: "26-27 Mar", source: "Ipsos", day: 27, muestra: 1212, fujimori: 11,   lopezAliaga: 9,    alvarez: 7,   sanchez: 4,   nieto: 5,   belmont: 3,   perezTello: 2,    lopezChau: 4.0 },
  { date: "28-31 Mar", source: "IEP",   day: 31, muestra: 1203, fujimori: 10.0, lopezAliaga: 8.7,  alvarez: 6.9, sanchez: 6.7, nieto: 5.4, belmont: 5.2, perezTello: 2.3,  lopezChau: 6.3 },
  { date: "1-2 Abr",   source: "Ipsos", day: 33, muestra: 1192, fujimori: 13.7, lopezAliaga: 8.1,  alvarez: 9.0, sanchez: 6.7, nieto: 4.1, belmont: 3.2, perezTello: 2.8,  lopezChau: 3.3 },
  { date: "1-4 Abr",   source: "Datum", day: 35, muestra: 3000, fujimori: 13.5, lopezAliaga: 7.6,  alvarez: 8.0, sanchez: 5.2, nieto: 5.3, belmont: 4.8, perezTello: 3.5,  lopezChau: 3.4 },
  { date: "3-4 Abr",   source: "Ipsos", day: 35, muestra: 1205, fujimori: 15,   lopezAliaga: 7,    alvarez: 8,   sanchez: 5,   nieto: 4,   belmont: 6,   perezTello: 3,    lopezChau: 5.0 },
{ date: "12 Abr",    source: "ONPE",  day: 43, muestra: null, fujimori: null, lopezAliaga: null, alvarez: null, sanchez: null, nieto: null, belmont: null, perezTello: null, lopezChau: null },
];

// ── Day labels for the slider ──
const DAY_LABELS = {};
for (let d = 1; d <= 31; d++) DAY_LABELS[d] = `${d} Mar`;
for (let d = 1; d <= 30; d++) DAY_LABELS[31 + d] = `${d} Abr`;

const ALL_MIN = 8;  // 8 Mar (earliest 2021 poll)
const ALL_MAX = 43; // 12 Abr (2026 election day)

// ── Shared components ──

const CustomTooltip = ({ candidates }) => ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const src = payload[0]?.payload?.source;
  return (
    <div style={{
      background: "rgba(15,15,20,0.95)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 10,
      padding: "12px 16px",
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      minWidth: 200,
    }}>
      <p style={{ color: "#94A3B8", fontSize: 11, margin: "0 0 8px", letterSpacing: 1, textTransform: "uppercase" }}>
        {label} · {src}
      </p>
      {payload
        .filter(p => p.value != null)
        .sort((a, b) => b.value - a.value)
        .map((p) => (
          <div key={p.dataKey} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "3px 0", gap: 12,
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: p.color, fontSize: 13 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: p.color, display: "inline-block",
              }} />
              {candidates[p.dataKey]?.name}
            </span>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
              {+p.value.toFixed(1)}%
            </span>
          </div>
        ))}
    </div>
  );
};

const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#fff" : "none"} stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const SideLegend = ({ candidates, hidden, toggle, focused, setFocused, highlight }) => (
  <div style={{
    display: "flex", flexDirection: "column", gap: 2,
    padding: "8px 0", minWidth: 190,
  }}>
    {Object.entries(candidates).map(([key, c]) => {
      const isVisible = !hidden.has(key);
      const isHighlight = key === highlight;
      const isFocused = focused.has(key);
      return (
        <div
          key={key}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            opacity: isVisible ? 1 : 0.35,
            transition: "opacity 0.2s",
            padding: "4px 8px",
          }}
        >
          {/* Checkbox */}
          <button
            onClick={() => toggle(key)}
            style={{
              width: 14, height: 14, borderRadius: 4, flexShrink: 0,
              border: `2px solid ${isVisible ? c.color : "rgba(255,255,255,0.2)"}`,
              background: isVisible ? c.color : "transparent",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s", cursor: "pointer", padding: 0,
            }}
          >
            {isVisible && (
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Name */}
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12, flex: 1,
            color: isHighlight ? "#fff" : "#CBD5E1",
            fontWeight: isHighlight ? 700 : 400,
            lineHeight: 1.3,
          }}>
            {c.name}
          </span>

          {/* Star */}
          <button
            onClick={() => setFocused(key)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "0 2px", display: "flex", alignItems: "center",
              opacity: isFocused ? 1 : 0.3,
              transition: "opacity 0.2s",
            }}
          >
            <StarIcon filled={isFocused} />
          </button>
        </div>
      );
    })}
  </div>
);

const TopLegend = ({ candidates, hidden, toggle, focused, setFocused, highlight }) => (
  <div className="top-legend" style={{
    flexWrap: "wrap", gap: 4,
    padding: "0 0 10px",
  }}>
    {Object.entries(candidates).map(([key, c]) => {
      const isVisible = !hidden.has(key);
      const isHighlight = key === highlight;
      const isFocused = focused.has(key);
      return (
        <div key={key} style={{
          display: "flex", alignItems: "center", gap: 4,
          opacity: isVisible ? 1 : 0.35,
          transition: "opacity 0.2s",
          padding: "3px 12px",
          minHeight: 32,
          background: "rgba(255,255,255,0.03)",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <button
            onClick={() => toggle(key)}
            style={{
              width: 12, height: 12, borderRadius: 3, flexShrink: 0,
              border: `2px solid ${isVisible ? c.color : "rgba(255,255,255,0.2)"}`,
              background: isVisible ? c.color : "transparent",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s", cursor: "pointer", padding: 0,
            }}
          >
            {isVisible && (
              <svg width="7" height="5" viewBox="0 0 8 6" fill="none">
                <path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            color: isHighlight ? "#fff" : "#CBD5E1",
            fontWeight: isHighlight ? 700 : 400,
            whiteSpace: "nowrap",
          }}>
            {c.short || c.name}
          </span>
          <button
            onClick={() => setFocused(key)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "0 1px", display: "flex", alignItems: "center",
              opacity: isFocused ? 1 : 0.3,
              transition: "opacity 0.2s",
            }}
          >
            <StarIcon filled={isFocused} />
          </button>
        </div>
      );
    })}
  </div>
);

const XTick = (isMobile) => ({ x, y, payload }) => {
  const value = payload.value;
  if (!isMobile) {
    return (
      <text x={x} y={y + 6} textAnchor="middle" fill="#64748B" fontSize={10} fontFamily="'Space Mono', monospace">
        {value}
      </text>
    );
  }
  const lastSpace = value.lastIndexOf(" ");
  const day = value.slice(0, lastSpace);
  const month = value.slice(lastSpace + 1);
  return (
    <text x={x} y={y} textAnchor="middle" fill="#64748B" fontSize={9} fontFamily="'Space Mono', monospace">
      <tspan x={x} dy="0.8em">{day}</tspan>
      <tspan x={x} dy="1.2em">{month}</tspan>
    </text>
  );
};

const rangeTrackStyle = {
  WebkitAppearance: "none",
  appearance: "none",
  position: "absolute",
  width: "100%",
  height: 6,
  background: "transparent",
  pointerEvents: "none",
  outline: "none",
};

const RangeSlider = ({ min, max, valueMin, valueMax, onChange }) => {
  const pctMin = ((valueMin - min) / (max - min)) * 100;
  const pctMax = ((valueMax - min) / (max - min)) * 100;

  return (
    <div style={{ padding: "0 0 8px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 10,
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 12, color: "#A5B4FC", fontWeight: 700,
        }}>
          {DAY_LABELS[valueMin]}
        </span>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10, color: "#475569",
        }}>
          Rango de fechas
        </span>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 12, color: "#A5B4FC", fontWeight: 700,
        }}>
          {DAY_LABELS[valueMax]}
        </span>
      </div>

      <div style={{ position: "relative", height: 6 }}>
        {/* Track background */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 6,
          borderRadius: 3,
          background: "rgba(255,255,255,0.08)",
        }} />
        {/* Active range */}
        <div style={{
          position: "absolute", top: 0, height: 6,
          left: `${pctMin}%`,
          width: `${pctMax - pctMin}%`,
          borderRadius: 3,
          background: "linear-gradient(90deg, #6366F1, #818CF8)",
        }} />

        {/* Min thumb */}
        <input
          type="range"
          min={min} max={max} value={valueMin}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), valueMax - 1);
            onChange(v, valueMax);
          }}
          style={rangeTrackStyle}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min} max={max} value={valueMax}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), valueMin + 1);
            onChange(valueMin, v);
          }}
          style={rangeTrackStyle}
        />
      </div>
    </div>
  );
};

const DataTable = ({ data, candidates, label, tableOpen, setTableOpen, highlight }) => {
  const cols = [
    { key: "source", label: "Encuestadora" },
    { key: "date", label: "Fecha" },
    { key: "muestra", label: "Muestra" },
    ...Object.entries(candidates).map(([key, c]) => ({ key, label: c.name, color: c.color })),
  ];
  return (
    <div style={{
      marginTop: 16,
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      overflow: "hidden",
    }}>
      <button
        onClick={() => setTableOpen(!tableOpen)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          background: "rgba(255,255,255,0.03)",
          border: "none", cursor: "pointer",
          color: "#94A3B8",
          fontFamily: "'Space Mono', monospace",
          fontSize: 12, letterSpacing: 0.5,
        }}
      >
        <span>{label} ({data.length} registros)</span>
        <span style={{
          transform: tableOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.25s ease",
          fontSize: 16, lineHeight: 1,
        }}>▾</span>
      </button>

      {tableOpen && (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%", borderCollapse: "collapse",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12, minWidth: 680,
          }}>
            <thead>
              <tr>
                {cols.map((col) => (
                  <th key={col.key} style={{
                    padding: "10px 12px",
                    textAlign: col.key === "source" || col.key === "date" ? "left" : "right",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    color: col.color || "#64748B",
                    fontWeight: 600, fontSize: 11, letterSpacing: 0.3,
                    whiteSpace: "nowrap",
                    background: "rgba(255,255,255,0.02)",
                  }}>
                    {col.color ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: col.color, display: "inline-block",
                          boxShadow: col.key === highlight ? `0 0 6px ${col.color}` : "none",
                        }} />
                        {col.label}
                      </span>
                    ) : col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const isONPE = row.source === "ONPE";
                return (
                  <tr key={i} style={{
                    background: isONPE ? "rgba(220,38,38,0.06)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                  }}>
                    {cols.map((col) => {
                      const val = row[col.key];
                      const isHL = col.key === highlight;
                      const isTextCol = col.key === "source" || col.key === "date";
                      const isMuestra = col.key === "muestra";
                      return (
                        <td key={col.key} style={{
                          padding: "8px 12px",
                          textAlign: isTextCol ? "left" : "right",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          color: isONPE && isHL ? "#FCA5A5" : isHL ? "#F87171" : (isTextCol || isMuestra) ? "#CBD5E1" : "#94A3B8",
                          fontWeight: isHL ? 700 : isONPE ? 500 : 400,
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                          fontFamily: isTextCol ? "'DM Sans', sans-serif" : "'Space Mono', monospace",
                          fontSize: isTextCol ? 12 : 11,
                        }}>
                          {isTextCol
                            ? (isONPE && col.key === "source" ? "🗳️ ONPE" : val)
                            : isMuestra
                              ? (val != null ? val.toLocaleString() : "—")
                              : val != null ? `${val}%` : "—"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Slider thumb CSS (injected once) ──
const sliderCSS = `
  @media (max-width: 640px) {
    .chart-section {
      flex-direction: column !important;
    }
    .side-legend {
      display: none !important;
    }
    .top-legend {
      display: flex !important;
    }
  }
  @media (min-width: 641px) {
    .top-legend {
      display: none !important;
    }
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #818CF8;
    border: 2px solid #312E81;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 0 8px rgba(99,102,241,0.5);
  }
  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #818CF8;
    border: 2px solid #312E81;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 0 8px rgba(99,102,241,0.5);
  }
`;

// ── Main ──

export default function EncuestasPeru() {
  // Shared day range
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const [dayMin, setDayMin] = useState(ALL_MIN);
  const [dayMax, setDayMax] = useState(ALL_MAX);

  const onRangeChange = useCallback((newMin, newMax) => {
    setDayMin(newMin);
    setDayMax(newMax);
  }, []);

  const SOURCES = ["Ipsos", "Datum", "IEP"];
  const [activeSources, setActiveSources] = useState(new Set(SOURCES));
const toggleSource = (s) => {
    setActiveSources((prev) => {
      const next = new Set(prev);
      if (next.has(s)) {
        if (next.size === 1) return prev;
        next.delete(s);
      } else {
        next.add(s);
      }
      return next;
    });
  };

  // 2021
  const [hidden2021, setHidden2021] = useState(new Set());
  const [focused2021, setFocused2021] = useState(new Set());
  const [table2021Open, setTable2021Open] = useState(false);

  // 2026
  const [hidden2026, setHidden2026] = useState(new Set());
  const [focused2026, setFocused2026] = useState(new Set());
  const [table2026Open, setTable2026Open] = useState(false);

  const makeToggle = (setter) => (key) => {
    setter((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filtered2021 = useMemo(
    () => pollData2021.filter((d) => d.day >= dayMin && d.day <= dayMax && (activeSources.has(d.source) || d.source === "ONPE")),
    [dayMin, dayMax, activeSources]
  );

  const filtered2026 = useMemo(
    () => pollData2026.filter((d) => d.day >= dayMin && d.day <= dayMax && (activeSources.has(d.source) || d.source === "ONPE")),
    [dayMin, dayMax, activeSources]
  );


  const Tooltip2021 = useMemo(() => CustomTooltip({ candidates: CANDIDATES_2021 }), []);
  const Tooltip2026 = useMemo(() => CustomTooltip({ candidates: CANDIDATES_2026 }), []);

  const showResultLine2021 = dayMax >= 42;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(170deg, #0B0F19 0%, #111827 40%, #0F172A 100%)",
      padding: "32px 16px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{sliderCSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <p style={{
            fontSize: 11, letterSpacing: 3, textTransform: "uppercase",
            color: "#64748B", margin: "0 0 8px",
            fontFamily: "'Space Mono', monospace",
          }}>
            Encuestas · Primera Vuelta
          </p>
          <h1 style={{
            fontSize: 26, fontWeight: 800, color: "#F1F5F9",
            margin: "0 0 6px", lineHeight: 1.15,
            letterSpacing: -0.5,
          }}>
            Elecciones Presidenciales  ·  Perú 🇵🇪
          </h1>
          <p style={{
            fontSize: 13, color: "#94A3B8", margin: "8px 0 0",
            maxWidth: 520, marginLeft: "auto", marginRight: "auto",
            lineHeight: 1.5,
          }}>
            Evolución de preferencia de voto según encuestas de{" "}
            <span style={{ color: "#CBD5E1", fontWeight: 500 }}>Ipsos</span>,{" "}
            <span style={{ color: "#CBD5E1", fontWeight: 500 }}>Datum</span> e{" "}
            <span style={{ color: "#CBD5E1", fontWeight: 500 }}>IEP</span>
          </p>
        </div>

        {/* Shared filters */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
        }}>
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <RangeSlider
              min={ALL_MIN}
              max={ALL_MAX}
              valueMin={dayMin}
              valueMax={dayMax}
              onChange={onRangeChange}
            />
          </div>
          <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}>
            {SOURCES.map((s) => {
              const isOn = activeSources.has(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSource(s)}
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 11, letterSpacing: 0.5,
                    padding: "6px 14px", borderRadius: 8,
                    border: isOn ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
                    background: isOn ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                    color: isOn ? "#E2E8F0" : "#475569",
                    cursor: "pointer", transition: "all 0.2s",
                    fontWeight: isOn ? 700 : 400,
                    whiteSpace: "nowrap",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ 2026 Chart ═══ */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            fontSize: 18, fontWeight: 700, color: "#E2E8F0",
            margin: "0 0 12px", textAlign: "center",
          }}>
            2026
          </h2>

          <TopLegend
            candidates={CANDIDATES_2026}
            hidden={hidden2026}
            toggle={makeToggle(setHidden2026)}
            focused={focused2026}
            setFocused={makeToggle(setFocused2026)}
          />
          <div className="chart-section" style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
            <div style={{
              flex: 1,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "16px 4px 8px 0",
              minWidth: 0,
            }}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={filtered2026} margin={{ top: 12, right: 8, left: 4, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={XTick(isMobile)}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    tickLine={false}
                    height={isMobile ? 36 : 20}
                  />
                  <YAxis
                    tick={{ fill: "#64748B", fontSize: 10, fontFamily: "'Space Mono', monospace" }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 18]} dx={-4} width={36}
                  />
                  <Tooltip content={<Tooltip2026 />} />
                  {dayMax >= 43 && (
                    <ReferenceLine
                      x="12 Abr"
                      stroke="rgba(255,255,255,0.15)"
                      strokeDasharray="4 4"
                      label={{
                        value: "Resultado oficial",
                        fill: "#475569", fontSize: 9,
                        fontFamily: "'Space Mono', monospace",
                        position: "insideTopRight",
                      }}
                    />
                  )}
                  {Object.entries(CANDIDATES_2026).map(([key, c]) => {
                    const dimmed = focused2026.size > 0 && !focused2026.has(key);
                    const renderDot = (props) => {
                      const { cx, cy, payload } = props;
                      if (cx == null || cy == null) return null;
                      return (
                        <circle
                          key={`${key}-${payload?.date}`}
                          cx={cx} cy={cy} r={3}
                          fill={c.color}
                          stroke={c.color}
                          strokeWidth={0}
                          opacity={dimmed ? 0.1 : 1}
                        />
                      );
                    };
                    return (
                      <Line
                        key={key} type="monotone" dataKey={key}
                        stroke={c.color} strokeWidth={2}
                        dot={renderDot}
                        activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2, fill: c.color }}
                        opacity={dimmed ? 0.1 : 1}
                        hide={hidden2026.has(key)}
                        connectNulls={false}
                        animationDuration={800} animationEasing="ease-in-out"
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="side-legend" style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "12px 8px",
              display: "flex", alignItems: "center",
            }}>
              <SideLegend
                candidates={CANDIDATES_2026}
                hidden={hidden2026}
                toggle={makeToggle(setHidden2026)}
                focused={focused2026}
                setFocused={makeToggle(setFocused2026)}
              />
            </div>
          </div>
        </div>

        {/* ═══ 2021 Chart ═══ */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            fontSize: 18, fontWeight: 700, color: "#E2E8F0",
            margin: "0 0 12px", textAlign: "center",
          }}>
            2021
          </h2>

          <TopLegend
            candidates={CANDIDATES_2021}
            hidden={hidden2021}
            toggle={makeToggle(setHidden2021)}
            focused={focused2021}
            setFocused={makeToggle(setFocused2021)}
            highlight="castillo"
          />
          <div className="chart-section" style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
            <div style={{
              flex: 1,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "16px 4px 8px 0",
              minWidth: 0,
            }}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={filtered2021} margin={{ top: 12, right: 8, left: 4, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={XTick(isMobile)}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    tickLine={false}
                    height={isMobile ? 36 : 20}
                  />
                  <YAxis
                    tick={{ fill: "#64748B", fontSize: 10, fontFamily: "'Space Mono', monospace" }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 18]} dx={-4} width={36}
                  />
                  <Tooltip content={<Tooltip2021 />} />
                  {showResultLine2021 && (
                    <ReferenceLine
                      x="11 Abr"
                      stroke="rgba(255,255,255,0.15)"
                      strokeDasharray="4 4"
                      label={{
                        value: "Resultado oficial",
                        fill: "#475569", fontSize: 9,
                        fontFamily: "'Space Mono', monospace",
                        position: "insideTopRight",
                      }}
                    />
                  )}
                  {Object.entries(CANDIDATES_2021).map(([key, c]) => {
                    const isHL = key === "castillo";
                    const dimmed = focused2021.size > 0 && !focused2021.has(key);
                    return (
                      <Line
                        key={key} type="monotone" dataKey={key}
                        stroke={c.color}
                        strokeWidth={isHL ? 4 : 2}
                        dot={{ r: isHL ? 5 : 3, fill: c.color, stroke: isHL ? "#fff" : c.color, strokeWidth: isHL ? 2 : 0 }}
                        activeDot={{ r: isHL ? 8 : 5, stroke: "#fff", strokeWidth: 2, fill: c.color }}
                        opacity={dimmed ? 0.1 : 1}
                        hide={hidden2021.has(key)}
                        connectNulls
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="side-legend" style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "12px 8px",
              display: "flex", alignItems: "center",
            }}>
              <SideLegend
                candidates={CANDIDATES_2021}
                hidden={hidden2021}
                toggle={makeToggle(setHidden2021)}
                focused={focused2021}
                setFocused={makeToggle(setFocused2021)}
                highlight="castillo"
              />
            </div>
          </div>
        </div>

        {/* ═══ Data Tables ═══ */}
        <DataTable
          data={pollData2021}
          candidates={CANDIDATES_2021}
          label="Base de datos 2021"
          tableOpen={table2021Open}
          setTableOpen={setTable2021Open}
          highlight="castillo"
        />

        <DataTable
          data={pollData2026}
          candidates={CANDIDATES_2026}
          label="Base de datos 2026"
          tableOpen={table2026Open}
          setTableOpen={setTable2026Open}
        />

        {/* Sources */}
        <div style={{
          marginTop: 16, padding: "12px 14px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.04)",
        }}>
          <p style={{
            fontSize: 10, color: "#475569", margin: 0,
            lineHeight: 1.6,
            fontFamily: "'Space Mono', monospace",
          }}>
            Fuentes: Ipsos Perú, Datum, IEP. Datos de preferencia de voto.
            Haz clic en un candidato para aislarlo.
          </p>
        </div>
      </div>
    </div>
  );
}
