# Claude Code Validator Framework

An extensible, TypeScript-based validation framework designed for Claude Code hooks. Build custom code validators with ease using a hookable, rule-based architecture.

## Features

- 🎯 **Rule-based validation** - Create modular, composable validation rules
- 🪝 **Hookable architecture** - Tap into validation lifecycle with custom hooks
- 📝 **TypeScript-first** - Fully typed for excellent DX
- 🔌 **Claude Code integration** - Built specifically for Claude Code hooks
- ⚡ **Async support** - Run async validation rules seamlessly
- 🧪 **Testable** - Easy to unit test your validation rules
- 🔍 **Auto-discovery** - Automatically loads rules from `.claude/rules/**`
- 🛠️ **CLI included** - Command-line interface for validation and rule management

## Installation

This framework is designed to be used within a Claude Code project:

```bash
cd .claude/claude-code-validator
bun install
```

## Quick Start

### 1. Create a Validation Rule

Create a rule file in `.claude/rules/`:

```typescript
// .claude/rules/my-rule.ts
import { defineCodeRule } from '../claude-code-validator';

export const myRule = defineCodeRule({
  name: 'my-rule',
  description: 'Validates my specific pattern',

  shouldRun: (context) => {
    // Only run on TypeScript files
    return context.filePath.endsWith('.ts');
  },

  validate(context) {
    const errors: string[] = [];

    if (context.content.includes('bad-pattern')) {
      errors.push(
        `❌ Found bad pattern\n` +
        `   → Suggested fix here\n` +
        `   📄 File: ${context.filePath}`
      );
    }

    return errors;
  }
});
```

### 2. Test Auto-Discovery

List all discovered rules:

```bash
bun .claude/claude-code-validator/src/cli.ts list-rules --rulesDir=.claude/rules
```

### 3. Integrate with Claude Code Hooks

Configure in `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{
          "type": "command",
          "command": "bun ${CLAUDE_PROJECT_DIR}/.claude/claude-code-validator/src/cli.ts validate --stdin",
          "timeout": 10
        }]
      },
      {
        "matcher": "Write",
        "hooks": [{
          "type": "command",
          "command": "bun ${CLAUDE_PROJECT_DIR}/.claude/claude-code-validator/src/cli.ts validate --stdin",
          "timeout": 10
        }]
      }
    ]
  }
}
```

## CLI Usage

The framework includes a command-line interface for validation and rule management.

### Validate Command

Validates code from Claude Code hooks via stdin:

```bash
bun .claude/claude-code-validator/src/cli.ts validate --stdin
```

Options:
- `--stdin` - Read input from stdin (default: true)
- `--rulesDir` - Directory containing rules (default: `.claude/rules`)

Example with custom rules directory:
```bash
bun .claude/claude-code-validator/src/cli.ts validate --stdin --rulesDir=custom/rules
```

### List Rules Command

Lists all discovered validation rules:

```bash
bun .claude/claude-code-validator/src/cli.ts list-rules
```

Options:
- `--rulesDir` - Directory containing rules (default: `.claude/rules`)

Example output:
```
📋 Discovered 2 Validation Rules from .claude/rules:

  • nuxt-ui
    Validate Nuxt UI component usage and patterns

  • define-model
    Enforce use of defineModel() macro instead of modelValue prop + emit pattern
```

## Core Concepts

### ValidationContext

Every validation rule receives a context object:

```typescript
interface ValidationContext {
  toolName: string;      // 'Edit' | 'Write' | etc.
  filePath: string;      // Path to the file
  content: string;       // Current/new content
  oldContent?: string;   // Previous content (Edit only)
  operation: 'edit' | 'write';
}
```

### ValidationRule

A rule defines what to check and when:

```typescript
interface ValidationRule {
  name: string;
  description: string;
  shouldRun: (context: ValidationContext) => boolean;
  validate: (context: ValidationContext) => Promise<string[]> | string[];
}
```

### ValidationResult

The validator returns a result with errors and formatting:

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  formatErrors: () => string;
}
```

## Advanced Usage

### Custom Hooks

Tap into the validation lifecycle:

```typescript
const validator = createValidator();
const hooks = validator.getHooks();

// Before validation starts
hooks.hook('validate:before', (context) => {
  console.log('Validating:', context.filePath);
});

// After validation completes
hooks.hook('validate:after', (context, errors) => {
  console.log(`Found ${errors.length} errors`);
});

// Hook into specific rule
hooks.hook('validate:my-rule', (context) => {
  // Custom logic for this rule
});
```

### Async Validation

Rules can be async for complex validation:

```typescript
import { defineCodeRule } from '../claude-code-validator';

export const asyncRule = defineCodeRule({
  name: 'async-rule',
  description: 'Performs async validation',

  shouldRun: () => true,

  async validate(context) {
    // Fetch external data, run linters, etc.
    const result = await someAsyncOperation(context.content);

    if (!result.valid) {
      return [result.error];
    }

    return [];
  }
});
```

### Pattern-Based Rules

For simple regex-based validation:

```typescript
import { defineCodeRule } from '../claude-code-validator';
import type { PatternRule } from '../claude-code-validator';

const patterns: PatternRule[] = [
  {
    regex: /OldAPI/,
    message: '❌ OldAPI is deprecated',
    replacement: 'NewAPI'
  }
];

export const patternRule = defineCodeRule({
  name: 'pattern-rule',
  description: 'Pattern-based validation',
  shouldRun: (context) => context.filePath.endsWith('.ts'),
  validate(context) {
    const errors: string[] = [];

    for (const { regex, message, replacement } of patterns) {
      if (regex.test(context.content)) {
        let error = message;
        if (replacement) {
          error += `\n   → Use: ${replacement}`;
        }
        errors.push(error);
      }
    }

    return errors;
  }
});
```

## Architecture

```
.claude/
├── claude-code-validator/    # Framework (not in end user projects)
│   ├── src/
│   │   ├── core/
│   │   │   └── validator.ts      # Core validation engine with defineCodeValidator()
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces + defineCodeRule()
│   │   ├── utils/
│   │   │   └── rule-loader.ts    # Auto-discovery utility with loadRules()
│   │   ├── cli.ts                # CLI interface (validate, list-rules)
│   │   └── index.ts              # Main exports
│   ├── package.json              # Dependencies (hookable, citty, glob)
│   └── README.md
│
└── rules/                        # User-defined rules (auto-discovered)
    ├── nuxt-ui.ts                # Nuxt UI validation rules
    ├── define-model.ts           # Vue defineModel enforcement
    └── my-custom-rule.ts         # Your custom rules
```

The framework is designed to be:
- **Minimal** - Only core validation logic
- **Extensible** - Add rules and hooks easily
- **Reusable** - Use across different validation scenarios
- **Auto-discovering** - Automatically finds and loads rules from `.claude/rules/`

## API Reference

### defineCodeValidator()

Creates a new validator instance (ecosystem naming convention).

```typescript
import { defineCodeValidator } from '../claude-code-validator';

const validator = defineCodeValidator();
```

Returns a `Validator` with methods:
- `registerRule(rule)` - Register a validation rule
- `validate(input)` - Validate Claude Code hook input
- `parseInput(input)` - Parse hook input to ValidationContext
- `getRules()` - Get all registered rules
- `getHooks()` - Get hookable instance for custom hooks

### defineCodeRule()

Define a validation rule with type safety and auto-completion.

```typescript
import { defineCodeRule } from '../claude-code-validator';

export const myRule = defineCodeRule({
  name: 'my-rule',
  description: 'Description of the rule',
  shouldRun: (context) => true,
  validate: (context) => []
});
```

### loadRules()

Auto-discovers and loads validation rules from a directory.

```typescript
import { loadRules } from '../claude-code-validator';

const rules = await loadRules('.claude/rules');
```

Returns `Promise<ValidationRule[]>`

### createValidator() (deprecated)

Legacy alias for `defineCodeValidator()`. Prefer using `defineCodeValidator()` for consistency with ecosystem naming conventions.

### Exit Codes

When using with Claude Code hooks:
- `0` - Validation passed
- `2` - Validation failed (blocks the operation)
- `1` - Error running validator

## Examples

See the `docs/4.examples/` directory for real-world examples:
- Nuxt UI validation - Validate Nuxt UI component usage and v4 migration
- Vue defineModel - Enforce Vue 3 defineModel() usage
- Security rules - Security pattern validation
- Code quality rules - Code quality enforcement

## Testing

The framework is designed to be easily testable:

```typescript
import { describe, it, expect } from 'vitest';
import { myRule } from './my-rule';

describe('My Rule', () => {
  it('should detect bad pattern', () => {
    const context = {
      toolName: 'Write',
      filePath: 'test.ts',
      content: 'bad-pattern here',
      operation: 'write' as const
    };

    const errors = myRule.validate(context);
    expect(errors).toHaveLength(1);
  });
});
```

## Contributing

To add new validation rules:

1. Create your rule in `.claude/rules/your-rule.ts`
2. Rules are automatically discovered - no manual registration needed
3. Add tests in `tests/your-rule.test.ts` (optional, but recommended)
4. Run `bun run typecheck` to verify TypeScript types
5. Test manually using `bun run list-rules` to verify auto-discovery

## Scripts

The following npm scripts are available:

- `bun run validate` - Run validation from stdin
- `bun run list-rules` - List all discovered validation rules
- `bun run typecheck` - Run TypeScript type checking
- `bun run test` - Run tests (requires test runner setup)

## License

MIT - See [LICENSE](LICENSE) for details.
