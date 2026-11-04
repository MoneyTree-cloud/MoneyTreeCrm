import React from "react";
// same image as public/favicon.png – preloaded in index.html so it shows instantly
const treeImg = "/favicon.png";

const ScreenLoader = () => (
  <>
    <style>{`
      @keyframes sl-cw   { to { transform: rotate(360deg);  } }
      @keyframes sl-ccw  { to { transform: rotate(-360deg); } }

      @keyframes sl-pulse-tree {
        0%, 100% {
          transform: scale(1);
          filter: drop-shadow(0 0 6px rgba(var(--mt-glow-rgb), 0.55))
                  drop-shadow(0 0 14px rgba(var(--mt-glow-rgb), 0.30));
        }
        50% {
          transform: scale(1.13);
          filter: drop-shadow(0 0 18px rgba(var(--mt-glow-rgb), 0.90))
                  drop-shadow(0 0 36px rgba(var(--mt-glow-rgb), 0.50))
                  drop-shadow(0 0 60px rgba(var(--mt-glow-rgb), 0.25));
        }
      }

      @keyframes sl-glow-disc {
        0%, 100% { opacity: 0.30; transform: scale(0.95); }
        50%       { opacity: 0.70; transform: scale(1.10); }
      }

      @keyframes sl-dash-spin {
        to { stroke-dashoffset: -100; }
      }

      @keyframes sl-text-shine {
        0%   { background-position: -200% center; }
        100% { background-position: 200%  center; }
      }

      @keyframes sl-dot-pop {
        0%, 80%, 100% { transform: scale(0.55); opacity: 0.25; }
        40%            { transform: scale(1.30); opacity: 1.00; }
      }

      @keyframes sl-fadein {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      @keyframes sl-radar {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
    `}</style>

    {/* ── Dark premium backdrop ── */}
    <div style={{
      position: "fixed",
      top: 0, right: 0, bottom: 0, left: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(var(--mt-backdrop-rgb), 0.93)",
      // background: "rgba(10, 40, 35, 0.55)",   
      /* near-black tinted with the theme colour */
      backdropFilter: "blur(14px) saturate(140%)",
      WebkitBackdropFilter: "blur(18px)",
      zIndex: 9999,
      animation: "sl-fadein 0.25s ease",
    }}>

      {/* ════════════════════════════════
          Spinner ring stack  (240×240)
      ════════════════════════════════ */}
      <div style={{ position: "relative", width: 240, height: 240 }}>

        {/* Outermost dashed slow ring */}
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
          borderRadius: "50%",
          border: "1.5px dashed rgba(var(--mt-glow-rgb), 0.22)",
          animation: "sl-cw 14s linear infinite",
        }} />

        {/* Arc 1 — teal, clockwise */}
        <div style={{
          position: "absolute", top: 8, right: 8, bottom: 8, left: 8,
          borderRadius: "50%",
          border: "3px solid transparent",
          borderTopColor: "var(--mt-primary-light)",
          borderRightColor: "var(--mt-primary-light)",
          animation: "sl-cw 1.9s ease-in-out infinite",
        }} />

        {/* Arc 2 — gold, counter-clockwise */}
        <div style={{
          position: "absolute", top: 28, right: 28, bottom: 28, left: 28,
          borderRadius: "50%",
          border: "2.5px solid transparent",
          borderTopColor: "#c9a52a",
          borderLeftColor: "#c9a52a",
          animation: "sl-ccw 2.6s ease-in-out infinite",
        }} />

        {/* Arc 3 — aqua, fast clockwise */}
        <div style={{
          position: "absolute", top: 48, right: 48, bottom: 48, left: 48,
          borderRadius: "50%",
          border: "2px solid transparent",
          borderBottomColor: "rgba(var(--mt-glow-rgb), 0.75)",
          borderRightColor: "rgba(var(--mt-glow-rgb), 0.75)",
          animation: "sl-cw 1.1s linear infinite",
        }} />

        {/* Radar sweep (conic gradient rotating) */}
        <div style={{
          position: "absolute", top: 66, right: 66, bottom: 66, left: 66,
          borderRadius: "50%",
          background: "conic-gradient(from 0deg, rgba(var(--mt-glow-rgb), 0.20), rgba(var(--mt-glow-rgb), 0.0) 60%, transparent 100%)",
          animation: "sl-radar 2.5s linear infinite",
        }} />

        {/* Central glow disc */}
        <div style={{
          position: "absolute", top: 70, right: 70, bottom: 70, left: 70,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(var(--mt-glow-rgb), 0.28) 0%, transparent 72%)",
          animation: "sl-glow-disc 2.2s ease-in-out infinite",
        }} />

        {/* ── Orbiting dots — inner ring (3 teal, r=82px) ── */}
        {[0, 120, 240].map((startDeg, i) => (
          <div key={`ti${i}`} style={{
            position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
            animation: `sl-cw ${2.4 + i * 0.18}s linear infinite`,
            transform: `rotate(${startDeg}deg)`,
          }}>
            <div style={{
              position: "absolute",
              top: "calc(50% - 82px)",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 9, height: 9,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgb(var(--mt-glow-rgb)) 30%, var(--mt-primary-light) 100%)",
              boxShadow: "0 0 8px rgb(var(--mt-glow-rgb)), 0 0 18px rgba(var(--mt-glow-rgb), 0.50)",
            }} />
          </div>
        ))}

        {/* ── Orbiting dots — outer ring (2 gold, r=108px) ── */}
        {[45, 225].map((startDeg, i) => (
          <div key={`go${i}`} style={{
            position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
            animation: `sl-ccw ${3.8 + i * 0.4}s linear infinite`,
            transform: `rotate(${startDeg}deg)`,
          }}>
            <div style={{
              position: "absolute",
              top: "calc(50% - 108px)",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 7, height: 7,
              borderRadius: "50%",
              background: "radial-gradient(circle, #f0c040 30%, #c9852a 100%)",
              boxShadow: "0 0 7px #f0c040, 0 0 14px rgba(240,192,64,0.45)",
            }} />
          </div>
        ))}

        {/* ── Tree image — center ── */}
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <img
            src={treeImg}
            alt=""
            style={{
              width: 82,
              height: 82,
              objectFit: "contain",
              animation: "sl-pulse-tree 2.6s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* ── Brand name shimmer ── */}
      <p style={{
        margin: "26px 0 0",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: "1.1rem",
        fontWeight: 800,
        letterSpacing: "3.5px",
        background: "linear-gradient(90deg, var(--mt-primary-light) 0%, rgb(var(--mt-glow-rgb)) 25%, #c9a52a 50%, rgb(var(--mt-glow-rgb)) 75%, var(--mt-primary-light) 100%)",
        backgroundSize: "250% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: "sl-text-shine 2.8s linear infinite",
      }}>
        MoneyTree
      </p>

      <p style={{
        margin: "3px 0 0",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: "0.68rem",
        color: "rgba(255,255,255,0.28)",
        letterSpacing: "4px",
      }}>
        Realty
      </p>

      {/* ── Bouncing dots ── */}
      <div style={{ display: "flex", marginTop: 18 }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} style={{
            display: "inline-block",
            width: 7, height: 7,
            margin: "0 3.5px", // flex "gap" is ignored by Safari < 14.1
            borderRadius: "50%",
            background: i === 1 ? "#c9a52a" : "rgb(var(--mt-glow-rgb))",
            boxShadow: i === 1
              ? "0 0 6px rgba(201,165,42,0.7)"
              : "0 0 6px rgba(var(--mt-glow-rgb), 0.7)",
            animation: `sl-dot-pop 1.3s ${delay}s ease-in-out infinite`,
          }} />
        ))}
      </div>

    </div>
  </>
);

export default ScreenLoader;
