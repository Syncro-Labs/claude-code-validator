#!/usr/bin/env bun
import { defineCommand, runMain } from 'citty';
import { defineCodeValidator } from './core/validator';
import { loadRules } from './utils/rule-loader';
import path from 'path';

const validateCommand = defineCommand({
  meta: {
    description: 'Validate code from Claude Code hooks'
  },
  args: {
    stdin: {
      type: 'boolean',
      description: 'Read input from stdin (for hooks)',
      default: true
    },
    rulesDir: {
      type: 'string',
      description: 'Directory containing validation rules',
      default: '.claude/rules'
    }
  },
  async run({ args }) {
    const validator = defineCodeValidator();

    // Auto-discover and register rules
    const rulesPath = path.resolve(process.cwd(), args.rulesDir);
    const rules = await loadRules(rulesPath);

    if (rules.length === 0) {
      console.error(`❌ No validation rules found in ${rulesPath}`);
      console.error(`   Create rule files in ${args.rulesDir}/`);
      process.exit(1);
    }

    // Register all discovered rules
    for (const rule of rules) {
      validator.registerRule(rule);
    }

    // Get input
    let input;
    if (args.stdin) {
      try {
        const stdinText = await Bun.stdin.text();
        input = JSON.parse(stdinText);
      } catch (error) {
        console.error('❌ Failed to parse stdin input');
        console.error(error);
        process.exit(1);
      }
    } else {
      console.error('❌ --stdin is required');
      process.exit(1);
    }

    // Run validation
    const result = await validator.validate(input);

    if (!result.valid) {
      console.error(result.formatErrors());
      process.exit(2); // Exit code 2 blocks the operation in Claude Code
    }

    // Success
    process.exit(0);
  }
});

const listRulesCommand = defineCommand({
  meta: {
    description: 'List all discovered validation rules'
  },
  args: {
    rulesDir: {
      type: 'string',
      description: 'Directory containing validation rules',
      default: '.claude/rules'
    }
  },
  async run({ args }) {
    const rulesPath = path.resolve(process.cwd(), args.rulesDir);
    const rules = await loadRules(rulesPath);

    if (rules.length === 0) {
      console.log(`\n❌ No validation rules found in ${rulesPath}\n`);
      console.log(`Create rule files in ${args.rulesDir}/\n`);
      return;
    }

    console.log(`\n📋 Discovered ${rules.length} Validation Rules from ${args.rulesDir}:\n`);
    for (const rule of rules) {
      console.log(`  • ${rule.name}`);
      console.log(`    ${rule.description}\n`);
    }
  }
});

const main = defineCommand({
  meta: {
    name: 'claude-code-validator',
    description: 'Extensible validation framework for Claude Code hooks',
    version: '1.0.0'
  },
  subCommands: {
    validate: validateCommand,
    'list-rules': listRulesCommand
  }
});

runMain(main);
