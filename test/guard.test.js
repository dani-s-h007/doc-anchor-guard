import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GitHubSlugger } from '../src/slugger.js';
import { parseMarkdownDoc } from '../src/parser.js';

describe('doc-anchor-guard', () => {
  describe('GitHubSlugger', () => {
    it('generates standard GitHub slug from headings with punctuation', () => {
      const slugger = new GitHubSlugger();
      assert.equal(slugger.slug('Getting Started (v2.0)!'), 'getting-started-v20');
      assert.equal(slugger.slug('What is `hyper-mock`?'), 'what-is-hyper-mock');
    });

    it('handles collision suffixes', () => {
      const slugger = new GitHubSlugger();
      assert.equal(slugger.slug('Configuration'), 'configuration');
      assert.equal(slugger.slug('Configuration'), 'configuration-1');
      assert.equal(slugger.slug('Configuration'), 'configuration-2');
    });
  });

  describe('parseMarkdownDoc', () => {
    it('extracts headings, anchors, and internal links', () => {
      const markdown = `
# Welcome to Project

See [Installation Guide](#installation) and [Options](#options-1).

## Installation
Run \`npm install\`.

## Options
Option A.

## Options
Option B.

<a id="custom-target"></a>
Anchor here.
      `;

      const parsed = parseMarkdownDoc(markdown, 'test.md');
      assert.equal(parsed.headings.length, 4);
      assert.ok(parsed.definedAnchors.includes('welcome-to-project'));
      assert.ok(parsed.definedAnchors.includes('installation'));
      assert.ok(parsed.definedAnchors.includes('options'));
      assert.ok(parsed.definedAnchors.includes('options-1'));
      assert.ok(parsed.definedAnchors.includes('custom-target'));

      assert.equal(parsed.links.length, 2);
      assert.equal(parsed.links[0].href, '#installation');
    });
  });
});

