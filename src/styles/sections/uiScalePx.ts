/** Multiply base px tokens by `--bonsai-ui-scale` on `.bonsai-scope`. */
export function uiScalePx(px: number): string {
  return `calc(${px}px * var(--bonsai-ui-scale, 1))`;
}
