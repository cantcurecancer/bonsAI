/**
 * Title: Thinking blurb text element builder
 * Purpose: Render thinking status copy with italic prose and upright emoji glyphs.
 * Used for: MainTabChatTranscript live Ask thinking line.
 * Solves: Keeps witty/deadpan tone on prose without slanting emoji blurbs.
 * Does not: Compose blurb copy — see composeThinkingBlurb.ts.
 */
import React from "react";
import { splitThinkingBlurbItalicSegments } from "./splitThinkingBlurbItalicSegments";

export function buildThinkingBlurbTextElement(text: string): React.ReactElement {
  const segments = splitThinkingBlurbItalicSegments(text);
  return (
    <>
      {segments.map((segment, index) => (
        <span
          key={`${index}-${segment.text}`}
          style={{ fontStyle: segment.italic ? "italic" : "normal" }}
        >
          {segment.text}
        </span>
      ))}
    </>
  );
}
