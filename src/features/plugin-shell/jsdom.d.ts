/**
 * Title: Minimal jsdom module declaration
 * Purpose: `jsdom` ships no bundled types, and this repo has no `@types/jsdom`; this covers only the
 *          `JSDOM` constructor shape the realm-crossing focus tests actually use.
 * Used for: useHiddenTabHeaderTrap.test.tsx, TabIndicatorBar.test.tsx (plan 32 bug 4 follow-up, the
 *           2026-09-04 device finding that `instanceof` checks against DOM globals fail across a
 *           realm boundary -- these tests build a genuinely separate document to reproduce that).
 * Solves: `tsc --noEmit` TS7016 ("Could not find a declaration file for module 'jsdom'") on
 *         `import { JSDOM } from "jsdom"` with no ambient declaration and no `@types/jsdom` package.
 * Does not: Describe the rest of the `jsdom` package's surface. Extend this only as more of it is
 *           used from a test; do not widen it to `any` for convenience.
 */
declare module "jsdom" {
  export class JSDOM {
    constructor(html?: string);
    readonly window: {
      readonly document: Document;
      close(): void;
    };
  }
}
