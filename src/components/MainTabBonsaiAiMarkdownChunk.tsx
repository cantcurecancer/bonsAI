/**
 * Title: AI markdown chunk renderer
 * Purpose: Render one assistant markdown bubble with spoiler masking and Deck Focusable routing.
 * Used for: MainTabChatTranscript for streaming and completed assistant reply bodies.
 * Solves: Nested ReactMarkdown for bonsai-spoiler fences without breaking collapse UX on Deck.
 * Does not: Stream tokens or parse strategy branches — parent supplies source string and mask flags.
 */
import type { Components } from "react-markdown";
import type { ReactNode } from "react";
import { Fragment, cloneElement, isValidElement, memo, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Focusable } from "@decky/ui";

import { focusSpoilerFence, registerSpoilerFence } from "../utils/spoilerFenceRegistry";
import { isOkDeckButtonEvent } from "../utils/focusNavigation";
import { isDrgSurvivorAppId, splitTextForDrgGlossaryTerms } from "../utils/drgGlossaryTermMatch";
import { DrgGlossaryTermChip } from "./DrgGlossaryTermChip";
import type { DrgGlossaryTerm } from "../data/drgGlossaryTerms";

/** Per-mount counter for spoiler fence ids; only needs to be unique among mounted fences. */
let spoilerFenceSeq = 0;

export type MainTabBonsaiAiMarkdownChunkProps = {
  source: string;
  /** When false, ```bonsai-spoiler bodies render inline (no collapse). */
  spoilerMaskingEnabled?: boolean;
  /** When masking is on, start expanded if the last reply had spoiler consent and Settings allow it. */
  spoilerDefaultExpanded?: boolean;
  /** Turn's game AppID. Curated DRG Survivor glossary terms only mark up when this matches. */
  appId?: string | null;
  /** Wired to onAskOllama by MainTabChatTranscript; starts a new Ask turn about the tapped term. */
  onDrgGlossaryExplainFurther?: (term: DrgGlossaryTerm) => void;
};

type MdArgs = {
  spoilerMaskingEnabled: boolean;
  spoilerDefaultExpanded: boolean;
  depth: number;
  drgGlossaryEnabled: boolean;
  onDrgGlossaryExplainFurther?: (term: DrgGlossaryTerm) => void;
};

/**
 * Wrap curated DRG Survivor glossary terms inside already-parsed markdown children with a tappable
 * chip. Recurses one level into `strong`/`em` (bold/italic prose can still carry the term); any other
 * element (links, inline code, nested block content) is left alone rather than reached into.
 */
function linkifyDrgGlossaryNode(
  node: ReactNode,
  onExplainFurther: ((term: DrgGlossaryTerm) => void) | undefined,
  depth = 0
): ReactNode {
  if (typeof node === "string") {
    const segments = splitTextForDrgGlossaryTerms(node);
    if (segments.length === 1 && segments[0].kind === "text") return node;
    return segments.map((seg, i) =>
      seg.kind === "text" ? (
        <Fragment key={i}>{seg.value}</Fragment>
      ) : (
        <DrgGlossaryTermChip
          key={i}
          term={seg.term}
          matchedText={seg.value}
          onExplainFurther={onExplainFurther}
        />
      )
    );
  }
  if (Array.isArray(node)) {
    return node.map((child, i) => (
      <Fragment key={i}>{linkifyDrgGlossaryNode(child, onExplainFurther, depth)}</Fragment>
    ));
  }
  if (
    depth < 1 &&
    isValidElement(node) &&
    (node.type === "strong" || node.type === "em")
  ) {
    const elProps = node.props as { children?: ReactNode };
    return cloneElement(
      node,
      undefined,
      linkifyDrgGlossaryNode(elProps.children, onExplainFurther, depth + 1)
    );
  }
  return node;
}

function buildMdComponents(args: MdArgs): Components {
  const { spoilerMaskingEnabled, spoilerDefaultExpanded, depth, drgGlossaryEnabled, onDrgGlossaryExplainFurther } =
    args;
  const linkify = (children: ReactNode): ReactNode =>
    drgGlossaryEnabled ? linkifyDrgGlossaryNode(children, onDrgGlossaryExplainFurther) : children;

  const base: Components = {
    /*
     * A glossary term chip is a Decky `Focusable`, which renders a `<div>` (@decky/ui's own type:
     * `RefAttributes<HTMLDivElement>`) — invalid inside `<p>`, whose content model is phrasing
     * content only. `<li>` has no such restriction (flow content), so only `p` needs this; when
     * glossary markup is off (`drgGlossaryEnabled` false, i.e. every non-DRG-Survivor reply) this
     * renders a real `<p>` exactly as before. `.bonsai-md-p` is a class-only selector
     * (section-6.ts:108) so the swap changes nothing visually.
     */
    p: ({ children }) => {
      const Tag = drgGlossaryEnabled ? "div" : "p";
      return <Tag className="bonsai-md-p">{linkify(children)}</Tag>;
    },
    ul: ({ children }) => <ul className="bonsai-md-ul">{children}</ul>,
    ol: ({ children }) => <ol className="bonsai-md-ol">{children}</ol>,
    li: ({ children }) => <li className="bonsai-md-li">{linkify(children)}</li>,
    pre: ({ children }) => {
      /*
       * react-markdown wraps every fenced code block's `code` output in `pre` regardless of what
       * `code` actually rendered, so a masked spoiler fence — a Decky `Focusable` with a real button
       * inside — ends up nested inside a `<pre class="bonsai-md-fenced-pre">` meant for monospace
       * text (confirmed by rendering: `.bonsai-spoiler-reveal-target` sits under `PRE.bonsai-md-
       * fenced-pre` in the DOM). `overflow-x: auto` on that class establishes a scroll/formatting
       * context around the fence that a `<pre>` was never designed to hold an interactive control
       * inside, and is the kind of cross-file coupling — between this `pre:` renderer and the `code:`
       * renderer's spoiler branch below — that a per-file review of the fence's own registry would
       * never surface. Render the fence directly, without the `<pre>`, so its geometry is exactly
       * what its own styles say it is.
       */
      const only = Array.isArray(children) ? children[0] : children;
      const onlyClassName =
        isValidElement(only) && only.props && typeof only.props === "object"
          ? (only.props as { className?: unknown }).className
          : undefined;
      const wrapsMaskedSpoiler =
        typeof onlyClassName === "string" &&
        onlyClassName.split(/\s+/).includes("language-bonsai-spoiler") &&
        spoilerMaskingEnabled &&
        depth === 0;
      if (wrapsMaskedSpoiler) {
        return <>{children}</>;
      }
      return <pre className="bonsai-md-fenced-pre">{children}</pre>;
    },
    code: ({ className, children, ...rest }) => {
      const isSpoiler =
        typeof className === "string" && className.split(/\s+/).includes("language-bonsai-spoiler");
      if (isSpoiler && depth === 0 && !spoilerMaskingEnabled) {
        const raw = String(children).replace(/\n$/, "");
        return (
          <ReactMarkdown
            components={buildMdComponents({
              spoilerMaskingEnabled: false,
              spoilerDefaultExpanded: true,
              depth: 1,
              drgGlossaryEnabled,
              onDrgGlossaryExplainFurther,
            })}
          >
            {raw}
          </ReactMarkdown>
        );
      }
      if (isSpoiler && depth === 0 && spoilerMaskingEnabled) {
        const raw = String(children).replace(/\n$/, "");
        return (
          <BonsaiSpoilerFence
            body={raw}
            defaultExpanded={spoilerDefaultExpanded}
            innerComponents={buildMdComponents({
              spoilerMaskingEnabled,
              spoilerDefaultExpanded,
              depth: depth + 1,
              drgGlossaryEnabled,
              onDrgGlossaryExplainFurther,
            })}
          />
        );
      }
      if (isSpoiler && (!spoilerMaskingEnabled || depth > 0)) {
        return (
          <pre className="bonsai-md-fenced-pre">
            <code className="bonsai-md-fenced-code language-bonsai-spoiler">{children}</code>
          </pre>
        );
      }
      const isBlock = typeof className === "string" && className.includes("language-");
      return (
        <code
          className={isBlock ? `bonsai-md-fenced-code ${className || ""}`.trim() : "bonsai-md-inline-code"}
          {...rest}
        >
          {children}
        </code>
      );
    },
    blockquote: ({ children }) => <blockquote className="bonsai-md-blockquote">{children}</blockquote>,
    a: ({ children, href }) => (
      <a className="bonsai-md-a" href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="bonsai-md-strong">{children}</strong>,
    em: ({ children }) => <em className="bonsai-md-em">{children}</em>,
  };

  return base;
}

function BonsaiSpoilerFence(props: {
  body: string;
  defaultExpanded: boolean;
  innerComponents: Components;
}) {
  const { body, defaultExpanded, innerComponents } = props;
  const [open, setOpen] = useState(defaultExpanded);
  // Stable per-mount id so this fence can be registered and de-registered without a DOM lookup.
  const fenceIdRef = useRef<string>("");
  if (!fenceIdRef.current) {
    spoilerFenceSeq += 1;
    fenceIdRef.current = `spoiler-${spoilerFenceSeq}`;
  }
  useEffect(
    () => () => registerSpoilerFence(fenceIdRef.current, null),
    [],
  );

  /** The masked fence's node and the expanded header's node, for handing the ring across a toggle. */
  const revealElRef = useRef<HTMLElement | null>(null);
  const collapseElRef = useRef<HTMLElement | null>(null);
  /*
   * Set only by the gamepad toggle paths, never by a touch tap: toggling unmounts the Focusable
   * the ring is sitting on, and Steam then leaves the ring unowned or drops it somewhere
   * arbitrary — measured on device 2026-08-28 (SPOILER-B-01 run: A on the masked fence moved
   * focus to "nothing"; the chip's B fix earlier caught the same drop landing on QAM chrome).
   * The counterpart Focusable mounts in the same render, so once React commits, hand the ring to
   * it with `focusSpoilerFence` — a plain `.focus()` on these nodes moves Steam's ring, measured
   * on device 2026-08-04.
   */
  const restoreRingRef = useRef(false);
  useEffect(() => {
    if (!restoreRingRef.current) return;
    restoreRingRef.current = false;
    focusSpoilerFence(open ? collapseElRef.current : revealElRef.current);
  }, [open]);
  const gamepadReveal = () => {
    restoreRingRef.current = true;
    registerSpoilerFence(fenceIdRef.current, null);
    setOpen(true);
  };
  const gamepadCollapse = () => {
    restoreRingRef.current = true;
    setOpen(false);
  };

  if (!open) {
    // Mirror ContextChipLadder: Deck Focusable owns A / D-pad; native button is click-only.
    return (
      <Focusable
        className="bonsai-spoiler-reveal-target"
        // Registered only while masked: once revealed there is nothing left to navigate to, and a
        // stale entry would make D-pad Down park on a fence that no longer hides anything.
        ref={(el: HTMLElement | null) => {
          revealElRef.current = el;
          registerSpoilerFence(fenceIdRef.current, el);
        }}
        onActivate={gamepadReveal}
        onButtonDown={(evt: unknown) => {
          /* A only. `onButtonDown` fires for every button, so anything else has to fall through to
             navigation — otherwise the press meant to move focus past a spoiler reveals it, and a
             spoiler you did not want to see cannot be skipped. Blacklisting the directions was not
             enough: the argument is a GamepadEvent, so the direction predicates never matched it. */
          if (!isOkDeckButtonEvent(evt)) return false;
          gamepadReveal();
          return true;
        }}
        style={{
          margin: "8px 0",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid rgba(150, 187, 223, 0.45)",
          background: "rgba(24, 40, 58, 0.55)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            textAlign: "left",
            cursor: "pointer",
            font: "inherit",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(220, 232, 245, 0.92)",
              lineHeight: 1.35,
            }}
          >
            Spoiler — tap to show
          </div>
          <div style={{ fontSize: 11, color: "rgba(190, 205, 220, 0.75)", marginTop: 4 }}>
            Hidden until you reveal (Strategy Guide).
          </div>
        </button>
      </Focusable>
    );
  }

  return (
    <div
      className="bonsai-spoiler-expanded"
      style={{
        margin: "8px 0",
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid rgba(120, 160, 200, 0.35)",
        background: "rgba(20, 36, 52, 0.42)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Focusable
        className="bonsai-spoiler-collapse-target"
        ref={(el: HTMLElement | null) => {
          collapseElRef.current = el;
        }}
        onActivate={gamepadCollapse}
        onButtonDown={(evt: unknown) => {
          /* Same rule as the masked fence: A collapses, every other button navigates. */
          if (!isOkDeckButtonEvent(evt)) return false;
          gamepadCollapse();
          return true;
        }}
        /*
         * B re-hides the spoiler instead of backing out of the pane — and only `onCancelButton`
         * can deliver that, per the glossary chip's on-device instrumentation (2026-08-28,
         * DrgGlossaryTermChip.tsx): `onButtonDown` receives B but returning true does not stop
         * Steam's back-out, while `onCancelButton` + preventDefault consumes it; the handler's
         * mere presence also eats B even when it does nothing. Attaching it here is safe without
         * the chip's conditional-spread dance because this Focusable only exists while the
         * spoiler is expanded — once collapsed it unmounts and B backs out as Steam intends.
         */
        {...({
          onCancelButton: (e: unknown) => {
            gamepadCollapse();
            (e as { preventDefault?: () => void })?.preventDefault?.();
          },
        } as Record<string, unknown>)}
        style={{ marginBottom: 8 }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            minHeight: 0,
            fontSize: 11,
            color: "rgba(170, 200, 230, 0.85)",
            fontWeight: 600,
            cursor: "pointer",
            font: "inherit",
          }}
        >
          Spoiler — tap to hide
        </button>
      </Focusable>
      <ReactMarkdown components={innerComponents}>{body}</ReactMarkdown>
    </div>
  );
}

/**
 * Memoised because `ReactMarkdown` parses in render and the streaming reveal re-renders its parent
 * on every RAF tick: without this, each tick re-parses every already-closed block in the bubble,
 * not just the growing tail. Every prop is a primitive, so the default shallow compare is correct —
 * a closed block's `source` string is stable, so it re-renders only when its own text changes.
 * `BonsaiSpoilerFence` keeps its open/closed `useState` either way; skipping a render cannot reset it.
 */
export const MainTabBonsaiAiMarkdownChunk = memo(function MainTabBonsaiAiMarkdownChunk(
  props: MainTabBonsaiAiMarkdownChunkProps
) {
  const masking = props.spoilerMaskingEnabled !== false;
  const defaultEx = props.spoilerDefaultExpanded === true;
  const drgGlossaryEnabled = isDrgSurvivorAppId(props.appId);
  const onDrgGlossaryExplainFurther = props.onDrgGlossaryExplainFurther;
  const components = useMemo(
    () =>
      buildMdComponents({
        spoilerMaskingEnabled: masking,
        spoilerDefaultExpanded: defaultEx,
        depth: 0,
        drgGlossaryEnabled,
        onDrgGlossaryExplainFurther,
      }),
    // `onDrgGlossaryExplainFurther` should be a stable callback from the caller (useCallback keyed
    // on onAskOllama) — see the memoisation note above this component. A fresh function identity
    // per render would defeat that memo for every DRG Survivor reply, not just correctness here.
    [masking, defaultEx, drgGlossaryEnabled, onDrgGlossaryExplainFurther]
  );

  return <ReactMarkdown components={components}>{props.source}</ReactMarkdown>;
});
