#!/usr/bin/env node
/**
 * doc-anchor-guard: Interactive Live Demo
 */

import { GitHubSlugger } from '../src/slugger.js';
import { parseMarkdownDoc } from '../src/parser.js';

console.log('\n🚀 Starting doc-anchor-guard Interactive Demo...\n');

const sampleMarkdown = `
# Developer Documentation Guide (v2.1)!

See [Setup Guide](#setup-guide) and [Installation](#installing).

## Setup Guide
Follow these instructions.

## API Options
Configuration details.
`;

console.log('Sample Markdown Document:');
console.log('------------------------------------------------------------');
console.log(sampleMarkdown.trim());
console.log('------------------------------------------------------------\n');

const doc = parseMarkdownDoc(sampleMarkdown, 'docs.md');
console.log('Extracted Headings and Generated GitHub Slugs:');
doc.headings.forEach((h) => console.log(` • "${h.text}" -> #${h.slug}`));

console.log('\nValidating Document Anchors:');
for (const link of doc.links) {
  if (link.href.startsWith('#')) {
    const target = link.href.slice(1);
    const isValid = doc.definedAnchors.includes(target);
    const badge = isValid ? '✅ VALID' : '❌ BROKEN ANCHOR';
    console.log(` • Link [${link.text}](${link.href}) -> ${badge}`);
  }
}

console.log('\n🎉 Demo completed successfully!\n');

