export interface LinkError {
  file: string;
  line: number;
  linkText: string;
  target: string;
  type: 'broken-anchor' | 'broken-file' | 'broken-image' | 'broken-cross-anchor';
  message: string;
  suggestion?: string | null;
}

export interface ValidationReport {
  scannedFiles: number;
  totalLinksChecked: number;
  errors: LinkError[];
}

export declare class GitHubSlugger {
  reset(): void;
  slug(rawHeading: string): string;
}

export declare function validateMarkdownDocs(rootDir?: string): Promise<ValidationReport>;
export declare function parseMarkdownDoc(content: string, filePath?: string): {
  filePath: string;
  headings: Array<{ text: string; slug: string; line: number }>;
  links: Array<{ text: string; href: string; line: number; isImage: boolean }>;
  definedAnchors: string[];
};

