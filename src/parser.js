/**
 * doc-anchor-guard: Markdown Document Extractor
 */

import { GitHubSlugger } from './slugger.js';

export function parseMarkdownDoc(content, filePath = 'README.md') {
  const lines = content.split('\n');
  const slugger = new GitHubSlugger();

  const headings = []; // { text, slug, line }
  const links = [];    // { text, href, line, isImage }
  const definedAnchors = new Set();

  let insideCodeFence = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const lineNum = i + 1;

    // Toggle multi-line code fence
    if (rawLine.trim().startsWith('```') || rawLine.trim().startsWith('~~~')) {
      insideCodeFence = !insideCodeFence;
      continue;
    }

    if (insideCodeFence) continue;

    // 1. Detect ATX headings: # Heading
    const headingMatch = rawLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const headingText = headingMatch[2].trim();
      const slug = slugger.slug(headingText);
      headings.push({ text: headingText, slug, line: lineNum });
      definedAnchors.add(slug);
    }

    // 2. Detect explicit HTML anchor tags: <a id="custom-anchor"> or <a name="custom-anchor">
    const htmlAnchorMatch = rawLine.matchAll(/<a\s+(?:[^>]*?\s+)?(?:id|name)=["']([^"']+)["']/gi);
    for (const m of htmlAnchorMatch) {
      definedAnchors.add(m[1].toLowerCase());
    }

    // 3. Detect standard markdown links [text](href) and images ![alt](src)
    const linkMatch = rawLine.matchAll(/(?<isImage>!)?\[(?<text>[^\]]*)\]\((?<href>[^)]+)\)/g);
    for (const m of linkMatch) {
      const href = (m.groups.href || '').trim();
      // Skip empty or mailto links
      if (!href || href.startsWith('mailto:')) continue;

      links.push({
        text: m.groups.text,
        href,
        line: lineNum,
        isImage: Boolean(m.groups.isImage)
      });
    }
  }

  return {
    filePath,
    headings,
    links,
    definedAnchors: Array.from(definedAnchors)
  };
}

