import { createHooks } from 'hookable';
import type {
  ValidationRule,
  ValidationContext,
  ValidationResult,
  ClaudeCodeHookInput
} from '../types';

/**
 * Create a new validator instance
 */
export function createValidator() {
  const hooks = createHooks();
  const rules: ValidationRule[] = [];

  return {
    /**
     * Register a validation rule
     */
    registerRule(rule: ValidationRule) {
      rules.push(rule);

      // Register as a hookable event
      hooks.hook(`validate:${rule.name}`, async (context: ValidationContext) => {
        return await rule.validate(context);
      });
    },

    /**
     * Validate input from Claude Code hooks
     */
    async validate(input: ClaudeCodeHookInput): Promise<ValidationResult> {
      // Parse Claude Code hook input
      const context = this.parseInput(input);

      // Run before validation hook
      await hooks.callHook('validate:before', context);

      const errors: string[] = [];

      // Run all validation rules
      for (const rule of rules) {
        if (rule.shouldRun(context)) {
          const result = await hooks.callHook(`validate:${rule.name}`, context);

          if (result && result.length > 0) {
            errors.push(...result);
          }
        }
      }

      // Run after validation hook
      await hooks.callHook('validate:after', context, errors);

      return {
        valid: errors.length === 0,
        errors,
        formatErrors: () => {
          if (errors.length === 0) return '';
          return '\n⚠️  VALIDATION ERRORS:\n\n' + errors.map(e => `${e}`).join('\n\n');
        }
      };
    },

    /**
     * Parse input from Claude Code hook format
     */
    parseInput(input: ClaudeCodeHookInput): ValidationContext {
      const toolName = input.tool_name;
      const toolInput = input.tool_input;

      return {
        toolName,
        filePath: toolInput.file_path || '',
        content: toolInput.content || toolInput.new_string || '',
        oldContent: toolInput.old_string || '',
        operation: toolName === 'Edit' ? 'edit' : 'write'
      };
    },

    /**
     * Get all registered rules
     */
    getRules() {
      return rules;
    },

    /**
     * Get the underlying hooks instance for custom hooks
     */
    getHooks() {
      return hooks;
    }
  };
}

export type Validator = ReturnType<typeof createValidator>;

/**
 * Define a code validator (alias for createValidator)
 * Follows ecosystem naming conventions like defineComponent, defineNuxtConfig, etc.
 */
export const defineCodeValidator = createValidator;
