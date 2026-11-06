/**
 * doc-anchor-guard: Document & Link Validator
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, dirname, resolve } from 'node:path';
import { parseMarkdownDoc } from './parser.js';

export async function validateMarkdownDocs(rootDir = process.cwd()) {
  const mdFiles = await findMarkdownFiles(rootDir);
  const parsedDocs = new Map();

  for (const file of mdFiles) {
    const content = await readFile(file, 'utf8');
    const relPath = relative(rootDir, file);
    parsedDocs.set(relPath, parseMarkdownDoc(content, relPath));
  }

  const errors = [];
  let totalLinksChecked = 0;

  for (const [docPath, doc] of parsedDocs.entries()) {
    const docDir = dirname(docPath);

    for (const link of doc.links) {
      totalLinksChecked++;
      const href = link.href;

      // Skip external links (http:// or https://)
      if (href.startsWith('http://') || href.startsWith('https://')) {
        continue;
      }

      // Case 1: Intra-document anchor: #my-section
      if (href.startsWith('#')) {
        const targetAnchor = href.slice(1).toLowerCase();
        if (!doc.definedAnchors.includes(targetAnchor)) {
          const suggestion = findClosestMatch(targetAnchor, doc.definedAnchors);
          errors.push({
            file: docPath,
            line: link.line,
            linkText: link.text,
            target: href,
            type: 'broken-anchor',
            message: `Anchor "${href}" does not exist in "${docPath}".`,
            suggestion: suggestion ? `#${suggestion}` : null
          });
        }
        continue;
      }

      // Case 2: Cross-document relative file link: ./guide.md or ./guide.md#installation
      const [relativeFilePath, targetAnchor] = href.split('#');
      const resolvedTarget = join(docDir, relativeFilePath);

      // Check if target file exists in our parsed docs or on disk
      const targetDoc = parsedDocs.get(resolvedTarget);

      if (!targetDoc) {
        // Check filesystem directly
        const absTarget = resolve(rootDir, resolvedTarget);
        try {
          await stat(absTarget);
        } catch {
          errors.push({
            file: docPath,
            line: link.line,
            linkText: link.text,
            target: href,
            type: link.isImage ? 'broken-image' : 'broken-file',
            message: `Referenced file "${relativeFilePath}" does not exist.`
          });
        }
        continue;
      }

      // If target file exists and had an anchor, verify anchor in that document
      if (targetAnchor) {
        const normalizedAnchor = targetAnchor.toLowerCase();
        if (!targetDoc.definedAnchors.includes(normalizedAnchor)) {
          const suggestion = findClosestMatch(normalizedAnchor, targetDoc.definedAnchors);
          errors.push({
            file: docPath,
            line: link.line,
            linkText: link.text,
            target: href,
            type: 'broken-cross-anchor',
            message: `Anchor "#${targetAnchor}" does not exist in target file "${resolvedTarget}".`,
            suggestion: suggestion ? `${relativeFilePath}#${suggestion}` : null
          });
        }
      }
    }
  }

  return {
    scannedFiles: mdFiles.length,
    totalLinksChecked,
    errors
  };
}

async function findMarkdownFiles(dir) {
  const results = [];
  const ignored = new Set(['node_modules', '.git', 'dist', 'build', 'coverage']);

  async function walk(current) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const e of entries) {
      if (ignored.has(e.name)) continue;
      const full = join(current, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile() && (e.name.endsWith('.md') || e.name.endsWith('.mdx'))) {
        results.push(full);
      }
    }
  }

  await walk(dir);
  return results;
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

function findClosestMatch(target, candidates) {
  let best = null;
  let minDistance = 4; // Max distance threshold

  for (const cand of candidates) {
    const dist = levenshtein(target, cand);
    if (dist < minDistance) {
      minDistance = dist;
      best = cand;
    }
  }

  return best;
}

