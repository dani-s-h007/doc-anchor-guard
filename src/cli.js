/**
 * doc-anchor-guard: CLI Interface
 */

import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { validateMarkdownDocs } from './validator.js';

export async function runCli(argv = process.argv.slice(2)) {
  const options = {
    help: { type: 'boolean', short: 'h', default: false },
    version: { type: 'boolean', short: 'v', default: false },
    strict: { type: 'boolean', short: 's', default: false },
    json: { type: 'boolean', default: false }
  };

  let parsed;
  try {
    parsed = parseArgs({ args: argv, options, allowPositionals: true });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  const { values, positionals } = parsed;

  if (values.help) {
    printHelp();
    return 0;
  }

  if (values.version) {
    console.log('doc-anchor-guard v1.0.0');
    return 0;
  }

  const targetDir = resolve(positionals[0] || '.');
  const report = await validateMarkdownDocs(targetDir);

  if (values.json) {
    console.log(JSON.stringify(report, null, 2));
    if (values.strict && report.errors.length > 0) process.exit(1);
    return 0;
  }

  console.log('\n📖 doc-anchor-guard - Markdown Anchor & Link Integrity Scanner');
  console.log('========================================================================');
  console.log(`Scanned Markdown Files: ${report.scannedFiles}`);
  console.log(`Internal Links Checked: ${report.totalLinksChecked}`);
  console.log(`Broken Links / Anchors: ${report.errors.length}\n`);

  if (report.errors.length === 0) {
    console.log('✅ All internal links, anchors, and images are 100% valid!');
    console.log('========================================================================\n');
    return 0;
  }

  for (const err of report.errors) {
    console.log(`❌ ${err.file}:${err.line}`);
    console.log(`   Link:   [${err.linkText}](${err.target})`);
    console.log(`   Error:  ${err.message}`);
    if (err.suggestion) {
      console.log(`   👉 Did you mean: ${err.suggestion}?`);
    }
    console.log('');
  }

  console.log('========================================================================\n');

  if (values.strict) {
    process.exit(1);
  }

  return 0;
}

function printHelp() {
  console.log(`
doc-anchor-guard - Markdown Anchor & Relative Link Integrity Validator

USAGE:
  $ doc-anchor-guard [flags] [directory]

FLAGS:
  -s, --strict      Exit with code 1 if broken anchors are found (ideal for CI)
      --json        Output report as JSON
  -v, --version     Show version
  -h, --help        Show help

EXAMPLES:
  # Scan documentation in current repository:
  $ doc-anchor-guard

  # Run in CI workflow to block PRs with broken headings:
  $ doc-anchor-guard --strict
`);
}

