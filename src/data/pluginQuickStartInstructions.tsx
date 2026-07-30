/**
 * Title: Plugin quick-start copy
 * Purpose: JSX body for the “How to use bonsAI” help modal quick-start instructions.
 * Used for: PluginHelpModal via showModal(); kept separate from README for QAM-friendly brevity.
 * Solves: Single maintained copy block aligned with README tone without duplicating the full doc.
 * Does not: Configure Ollama or run setup RPC — instructs users to visit the Ollama tab first.
 */
import React from "react";

export function PluginQuickStartInstructionsBody() {
  const itemStyle: React.CSSProperties = { marginBottom: "0.45em" };
  return (
    <>
      <p
        style={{
          margin: "0 0 12px 0",
          padding: "10px 12px",
          borderRadius: 6,
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.14)",
          fontSize: 13,
          lineHeight: 1.45,
          color: "#e8eef4",
          textAlign: "left",
        }}
      >
        <strong style={{ display: "block", marginBottom: 6, color: "#fff" }}>
          Set where Ollama runs on the Ollama tab first
        </strong>
        Ollama usually runs on your <strong>main rig</strong> (not only on the Deck). On the{" "}
        <strong>Ollama</strong> tab, under <strong>Where AI runs</strong>, enter that PC&apos;s{" "}
        <strong>LAN IP</strong> (for example{" "}
        <code style={{ fontSize: 12, color: "#b8dcc8" }}>
          192.168.1.50
        </code>
        ) or enable <strong>Ollama on this Deck</strong> for local inference.{" "}
        <strong>You must do this — if the address is empty or wrong, every ask will fail with a connection error.</strong>
      </p>
    <ul
      style={{
        margin: 0,
        paddingLeft: "1.15em",
        fontSize: 13,
        lineHeight: 1.4,
        color: "#c8d4e0",
        textAlign: "left",
      }}
    >
      <li style={itemStyle}>
        <strong>Ask</strong> from the main tab: type in the bar and send; the plugin talks to{" "}
        <strong>Ollama</strong> using the base URL on the <strong>Ollama</strong> tab.
      </li>
      <li style={itemStyle}>
        <strong>Speed / Strategy / Expert</strong> pick different model fallbacks; <strong>Strategy</strong> is tuned for
        gameplay coaching (spoilers-aware, checklist, branch choices).
      </li>
      <li style={itemStyle}>
        <strong>Preset chips</strong> above the bar suggest common prompts; tap one to fill the bar (game context is added when
        available).
      </li>
      <li style={itemStyle}>
        <strong>Screenshots:</strong> attach a Steam shot for vision asks; use <strong>Permissions</strong> if attach is
        blocked. Pick attachment quality under Settings.
      </li>
      <li style={itemStyle}>
        <strong>TDP / power</strong> tips are suggestion-first; optional <strong>Adjust power limits</strong> in Permissions is
        advanced and may become read-only later. Always verify in QAM → Performance (GPU clock lines stay recommendations only).
      </li>
      <li style={{ marginBottom: 0 }}>
        Other tabs: <strong>Ollama</strong> (connection, models, timing), <strong>Settings</strong> (voice, character),{" "}
        <strong>Permissions</strong> (gates), <strong>About</strong> (links).
      </li>
    </ul>
    </>
  );
}
