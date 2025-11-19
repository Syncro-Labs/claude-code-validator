/**
 * Context passed to validation rules containing information about the file being validated
 */
export interface ValidationContext {
  /** The name of the tool being used (e.g., 'Edit', 'Write') */
  toolName: string;
  /** The path to the file being validated */
  filePath: string;
  /** The new/current content of the file */
  content: string;
  /** The old content (for Edit operations) */
  oldContent?: string;
  /** The type of operation being performed */
  operation: 'edit' | 'write';
}

/**
 * Result returned by the validator
 */
export interface ValidationResult {
  /** Whether validation passed (no errors) */
  valid: boolean;
  /** Array of error messages */
  errors: string[];
  /** Format errors for display to the user */
  formatErrors: () => string;
}

/**
 * A validation rule that can be registered with the validator
 */
export interface ValidationRule {
  /** Unique name for this rule */
  name: string;
  /** Human-readable description of what this rule validates */
  description: string;
  /** Determine if this rule should run for the given context */
  shouldRun: (context: ValidationContext) => boolean;
  /** Perform validation and return array of error messages */
  validate: (context: ValidationContext) => Promise<string[]> | string[];
}

/**
 * A simple pattern-based validation rule
 */
export interface PatternRule {
  /** Regular expression to match against */
  regex: RegExp;
  /** Error message to show when pattern is found */
  message: string;
  /** Optional suggested replacement */
  replacement?: string;
}

/**
 * Input from Claude Code hooks
 */
export interface ClaudeCodeHookInput {
  tool_name: string;
  tool_input: {
    file_path?: string;
    content?: string;
    new_string?: string;
    old_string?: string;
    [key: string]: any;
  };
}

/**
 * Define a code validation rule
 * Follows ecosystem naming conventions like defineComponent, defineNuxtConfig, etc.
 */
export function defineCodeRule(rule: ValidationRule): ValidationRule {
  return rule;
}
