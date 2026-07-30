/**
 * Title: Answer bubble navigation registry
 * Purpose: Hold the active live-turn answer bubble scroll controller for D-pad Up/Down.
 * Used for: Main-tab Strategy reply line-by-line scroll before hopping to branches/feedback.
 * Solves: Parent focus graph cannot call into bubble chunk scroll without a mount-time ref bridge.
 * Does not: Render the bubble, split markdown, or own focus graph wiring — only invoke registered moves.
 */

type AnswerBubbleNav = {
  moveDown: () => boolean;
  moveUp: () => boolean;
  resetChunkIndex: () => void;
};

let activeAnswerBubbleNav: AnswerBubbleNav | null = null;

export function registerAnswerBubbleNav(nav: AnswerBubbleNav | null): void {
  activeAnswerBubbleNav = nav;
}

export function invokeAnswerBubbleMoveDown(): boolean {
  return activeAnswerBubbleNav?.moveDown() ?? false;
}

export function invokeAnswerBubbleMoveUp(): boolean {
  return activeAnswerBubbleNav?.moveUp() ?? false;
}

export function resetAnswerBubbleChunkIndex(): void {
  activeAnswerBubbleNav?.resetChunkIndex();
}

export function isAnswerBubbleNavActive(): boolean {
  return activeAnswerBubbleNav != null;
}
