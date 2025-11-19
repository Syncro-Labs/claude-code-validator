import { glob } from 'glob';
import type { ValidationRule } from '../types';

/**
 * Auto-discover and load validation rules from a directory
 * @param rulesDir - Directory containing rule files (e.g., '.claude/rules')
 * @returns Array of loaded validation rules
 */
export async function loadRules(rulesDir: string): Promise<ValidationRule[]> {
  const rules: ValidationRule[] = [];

  try {
    // Find all .ts and .js files in the rules directory
    const ruleFiles = await glob(`${rulesDir}/**/*.{ts,js}`, {
      absolute: true,
      ignore: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**']
    });

    // Load each rule file
    for (const file of ruleFiles) {
      try {
        const module = await import(file);

        // Look for exported rules
        // Support both default export and named exports
        const exports = Object.values(module);

        for (const exp of exports) {
          if (isValidationRule(exp)) {
            rules.push(exp as ValidationRule);
          }
        }
      } catch (error) {
        console.warn(`Failed to load rule from ${file}:`, error);
      }
    }

    return rules;
  } catch (error) {
    console.error('Error loading rules:', error);
    return [];
  }
}

/**
 * Type guard to check if an object is a ValidationRule
 */
function isValidationRule(obj: any): obj is ValidationRule {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.shouldRun === 'function' &&
    typeof obj.validate === 'function'
  );
}
