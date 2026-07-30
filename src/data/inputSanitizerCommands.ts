/**
 * Title: Input sanitizer commands
 * Purpose: Magic composer strings that enable or disable backend input sanitization.
 * Used for: Developer workflows and parity tests with input_sanitizer_service.py.
 * Solves: Stable command tokens kept in sync with backend trim + casefold equality checks.
 * Does not: Implement sanitization rules — backend service owns pattern matching and toggles.
 */
export const INPUT_SANITIZER_COMMAND_DISABLE = "bonsai:disable-sanitize";
export const INPUT_SANITIZER_COMMAND_ENABLE = "bonsai:enable-sanitize";
