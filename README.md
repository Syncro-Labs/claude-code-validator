# Claude Code Validator

> Teach Claude your project's coding rules and best practices

## What is this?

Claude Code Validator helps you prevent common mistakes by checking code **before** Claude writes it. Instead of fixing errors after they happen, you define rules that block outdated patterns automatically.

**Example use cases:**
- Prevent deprecated component usage during framework migrations
- Enforce your team's coding conventions
- Block security anti-patterns
- Ensure consistent code quality

## Why use it?

- ✅ **Automatic** - Rules are discovered and applied automatically
- ✅ **Fast** - Validates in milliseconds before code is written
- ✅ **Simple** - Write rules in TypeScript with clear examples
- ✅ **Flexible** - Works with any file type or coding pattern
- ✅ **Zero config** - Drop rule files in `.claude/rules/` and they just work

## Quick Start

### Step 1: Install

```bash
# Navigate to the validator directory
cd .claude/claude-code-validator

# Install dependencies
bun install
```

### Step 2: Create your first rule

Create `.claude/rules/no-console.ts`:

```typescript
import { defineCodeRule } from '../claude-code-validator';

export const noConsole = defineCodeRule({
  name: 'no-console',
  description: 'Prevent console.log in production code',

  shouldRun: (context) => context.filePath.endsWith('.ts'),

  validate(context) {
    if (context.content.includes('console.log')) {
      return ['❌ Found console.log - use proper logging instead'];
    }
    return [];
  }
});
```

That's it! The rule is automatically discovered.

### Step 3: Enable validation hooks

Create `.claude/settings.local.json`:

```bash
cp .claude/claude-code-validator/.claude/settings.example.json .claude/settings.local.json
```

This enables validation on every code change before Claude writes it.

## How It Works

When Claude Code tries to write or edit a file:

1. **Your rules are checked** - Only rules matching the file type run
2. **Errors block the operation** - If validation fails, Claude sees the error
3. **Claude fixes it** - Claude can see what's wrong and try again with the correct pattern

**Example:** If Claude tries to use `<UFormGroup>` (deprecated in Nuxt UI v4), your rule blocks it and suggests `<UFormField>` instead.

## Configuration Reference

Your `.claude/settings.local.json` should look like this:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{
          "type": "command",
          "command": "bunx claude-code-validator validate",
          "timeout": 10
        }]
      },
      {
        "matcher": "Write",
        "hooks": [{
          "type": "command",
          "command": "bunx claude-code-validator validate",
          "timeout": 10
        }]
      }
    ]
  }
}
```

## Common Commands

```bash
# List all discovered rules
bunx claude-code-validator list-rules

# Manually validate from stdin (for testing)
echo '{"tool_name":"Write","tool_input":{"file_path":"test.ts","content":"test"}}' | \
  bunx claude-code-validator validate
```

## Writing Rules

Every rule has three parts:

### 1. Name and Description
```typescript
name: 'my-rule',
description: 'What this rule checks for',
```

### 2. When to Run
```typescript
shouldRun: (context) => {
  return context.filePath.endsWith('.vue'); // Only check Vue files
}
```

### 3. What to Check
```typescript
validate(context) {
  if (context.content.includes('bad-thing')) {
    return ['❌ Error message explaining what's wrong'];
  }
  return []; // Empty array = validation passed
}
```

The `context` object gives you:
- `context.filePath` - The file being edited
- `context.content` - The new code being written
- `context.oldContent` - The previous code (for edits only)

## More Examples

### Check for Multiple Patterns

```typescript
export const securityRule = defineCodeRule({
  name: 'security',
  description: 'Block common security issues',
  shouldRun: () => true,

  validate(context) {
    const errors = [];

    if (context.content.includes('eval(')) {
      errors.push('❌ eval() is dangerous - use safer alternatives');
    }

    if (context.content.match(/password.*=.*['"].*['"]/i)) {
      errors.push('❌ Hardcoded password detected');
    }

    return errors;
  }
});
```

### Use Regular Expressions

```typescript
export const componentRule = defineCodeRule({
  name: 'deprecated-components',
  description: 'Block deprecated components',
  shouldRun: (context) => context.filePath.endsWith('.vue'),

  validate(context) {
    const deprecated = ['OldButton', 'OldInput', 'OldForm'];
    const errors = [];

    for (const component of deprecated) {
      const pattern = new RegExp(`<${component}`);
      if (pattern.test(context.content)) {
        errors.push(`❌ <${component}> is deprecated - use the new component`);
      }
    }

    return errors;
  }
});
```

### Async Rules (Advanced)

```typescript
export const asyncRule = defineCodeRule({
  name: 'async-check',
  description: 'Fetch validation data asynchronously',
  shouldRun: () => true,

  async validate(context) {
    // Make API calls, read files, etc.
    const bannedWords = await fetchBannedWords();

    for (const word of bannedWords) {
      if (context.content.includes(word)) {
        return [`❌ Banned word detected: ${word}`];
      }
    }

    return [];
  }
});
```

## Project Structure

```
your-project/
└── .claude/
    ├── rules/                    # Your validation rules (put rules here)
    │   ├── no-console.ts
    │   ├── security.ts
    │   └── your-custom-rule.ts
    │
    ├── claude-code-validator/    # The framework
    │   ├── src/                  # Framework code
    │   └── package.json
    │
    └── settings.local.json       # Claude Code hook configuration
```

**Where to put things:**
- ✅ Your rules → `.claude/rules/`
- ✅ Framework → `.claude/claude-code-validator/` (already there)
- ✅ Configuration → `.claude/settings.local.json`

## API Quick Reference

Most users only need `defineCodeRule()`:

```typescript
import { defineCodeRule } from '../claude-code-validator';

export const myRule = defineCodeRule({
  name: 'rule-name',
  description: 'What it checks',
  shouldRun: (context) => /* when to run */,
  validate: (context) => /* what to check */
});
```

**Advanced users** can access:
- `defineCodeValidator()` - Create custom validator instances
- `loadRules(dir)` - Manually load rules from a directory
- Full TypeScript types for ValidationContext, ValidationRule, etc.

## Real-World Examples

Check `docs/4.examples/` for production-ready validation rules:
- **Nuxt UI** - Enforce v4 migration patterns
- **Vue defineModel** - Replace old prop patterns
- **Security** - Block common vulnerabilities
- **Code quality** - Maintain code standards

## Testing Your Rules (Optional)

```typescript
// Test your rule like any other function
const context = {
  toolName: 'Write',
  filePath: 'test.ts',
  content: 'console.log("test")',
  operation: 'write' as const
};

const errors = myRule.validate(context);
console.log(errors); // ['❌ Found console.log...']
```

## Troubleshooting

**Rules not being discovered?**
- Make sure files are in `.claude/rules/`
- Run `bun run list-rules` to see what's found
- Check that you're exporting the rule (`export const myRule = ...`)

**Validation not running?**
- Verify `.claude/settings.local.json` exists
- Check that the SessionStart hook ran successfully
- Ensure dependencies are installed (`bun install`)

**Type errors?**
- Run `bun run typecheck` to see detailed errors
- Make sure you imported from the correct path

## License

MIT - See [LICENSE](LICENSE) for details.
