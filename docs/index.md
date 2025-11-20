---
seo:
  title: Claude Code Validator - Teach Claude Your Coding Rules
  description: Prevent mistakes before they happen. Validate code patterns automatically as Claude writes, blocking deprecated APIs and enforcing your team's best practices.
---

# Claude Code Validator

> Teach Claude your project's coding rules and best practices

**Stop fixing the same mistakes.** Claude Code Validator checks code patterns **before** Claude writes them, blocking outdated APIs, security issues, and style violations automatically.

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

Install the package:

```bash
npm install -D @syncrolabs/claude-code-validator
```

Create `.claude/rules/no-console.ts`:

```typescript
import { defineCodeRule } from "@syncrolabs/claude-code-validator";

export const noConsole = defineCodeRule({
  name: "no-console",
  description: "Block console.log in production",
  shouldRun: (context) => context.filePath.endsWith(".ts"),
  validate(context) {
    if (context.content.includes("console.log")) {
      return ["❌ Use proper logging instead of console.log"];
    }
    return [];
  },
});
```

**That's it!** The rule is automatically discovered. When Claude tries to write `console.log`, it sees the error and uses proper logging instead.

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
