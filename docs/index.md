---
seo:
  title: Claude Code Validator Framework
  description: An extensible, TypeScript-based validation framework for Claude Code hooks. Build custom code validators with ease using a hookable, rule-based architecture.
---

# Claude Code Validator

> An extensible validation framework for Claude Code hooks that prevents outdated code patterns and enforces best practices.

Claude Code is powerful, but sometimes it may write outdated patterns or not follow your specific conventions. This framework provides automated validation and feedback before code is written.

## Features

::u-page-grid
::u-page-feature
#title
🎯 Rule-based validation

#description
Create modular, composable validation rules that check for specific patterns
::

::u-page-feature
#title
🔍 Auto-discovery

#description
Automatically loads rules from `.claude/rules/**` - just drop files and go
::

::u-page-feature
#title
🪝 Hookable architecture

#description
Tap into validation lifecycle with custom hooks for advanced use cases
::

::u-page-feature
#title
📝 TypeScript-first

#description
Fully typed with excellent DX - autocomplete and type checking throughout
::

::u-page-feature
#title
⚡ Async support

#description
Run async validation rules seamlessly for complex validation scenarios
::

::u-page-feature
#title
🧪 Testable

#description
Easy to unit test your validation rules with standard testing frameworks
::
::

## Quick Example

Create a validation rule in `.claude/rules/my-rule.ts`:

```typescript
import { defineCodeRule } from '../claude-code-validator';

export const myRule = defineCodeRule({
  name: 'my-rule',
  description: 'Validates my specific pattern',

  shouldRun: (context) => {
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

The rule is automatically discovered and loaded. No manual registration required!

## Use Cases

- **Framework migrations** - Enforce new API patterns (e.g., Nuxt UI v3 → v4)
- **Team conventions** - Ensure consistent patterns across your codebase
- **Best practices** - Enforce security best practices and code quality
- **Deprecated APIs** - Catch usage of deprecated functions or components
- **Custom linting** - Build project-specific validation rules

## Get Started

::u-button
to: /guide
trailing-icon: i-lucide-arrow-right
Get started
::
