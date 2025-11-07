/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { absolutifyURLs } from '../src/utils-snapshot';

describe('absolutifyURLs', () => {
  const baseHref = 'https://example.com/path/to/page.html';

  describe('basic URL patterns', () => {
    it.each([
      {
        input: "url('image.jpg')",
        expected: "url('https://example.com/path/to/image.jpg')",
        description: 'single-quoted relative URL',
      },
      {
        input: 'url("image.jpg")',
        expected: 'url("https://example.com/path/to/image.jpg")',
        description: 'double-quoted relative URL',
      },
      {
        input: 'url(image.jpg)',
        expected: 'url(https://example.com/path/to/image.jpg)',
        description: 'unquoted relative URL',
      },
    ])('should handle $description', ({ input, expected }) => {
      expect(absolutifyURLs(input, baseHref)).toBe(expected);
    });
  });

  describe('relative path types', () => {
    it.each([
      {
        input: "url('./image.jpg')",
        expected: "url('https://example.com/path/to/image.jpg')",
        description: 'same directory (./) path',
      },
      {
        input: "url('../image.jpg')",
        expected: "url('https://example.com/path/image.jpg')",
        description: 'parent directory (../) path',
      },
      {
        input: "url('../../image.jpg')",
        expected: "url('https://example.com/image.jpg')",
        description: 'grandparent directory (../../) path',
      },
      {
        input: "url('./assets/../image.jpg')",
        expected: "url('https://example.com/path/to/image.jpg')",
        description: 'path with ./ and ../ mixed',
      },
      {
        input: "url('subdir/image.jpg')",
        expected: "url('https://example.com/path/to/subdir/image.jpg')",
        description: 'subdirectory path',
      },
      {
        input: "url('subdir/nested/image.jpg')",
        expected: "url('https://example.com/path/to/subdir/nested/image.jpg')",
        description: 'deeply nested subdirectory',
      },
    ])('should handle $description', ({ input, expected }) => {
      expect(absolutifyURLs(input, baseHref)).toBe(expected);
    });
  });

  describe('absolute and protocol-relative URLs', () => {
    it.each([
      {
        input: "url('/images/logo.png')",
        expected: "url('https://example.com/images/logo.png')",
        description: 'absolute path from root',
      },
      {
        input: "url('https://cdn.example.com/image.jpg')",
        expected: "url('https://cdn.example.com/image.jpg')",
        description: 'full HTTPS URL',
      },
      {
        input: "url('http://other.com/image.jpg')",
        expected: "url('http://other.com/image.jpg')",
        description: 'full HTTP URL',
      },
      {
        input: "url('//cdn.example.com/image.jpg')",
        expected: "url('//cdn.example.com/image.jpg')",
        description: 'protocol-relative URL',
      },
      {
        input: "url('ftp://files.example.com/file.zip')",
        expected: "url('ftp://files.example.com/file.zip')",
        description: 'FTP protocol URL',
      },
    ])('should preserve $description', ({ input, expected }) => {
      expect(absolutifyURLs(input, baseHref)).toBe(expected);
    });
  });

  describe('data URIs', () => {
    it.each([
      {
        input: "url('data:image/png;base64,iVBORw0KGg==')",
        expected: "url('data:image/png;base64,iVBORw0KGg==')",
        description: 'base64 PNG data URI',
      },
      {
        input: 'url(data:image/svg+xml,%3Csvg%3E)',
        expected: 'url(data:image/svg+xml,%3Csvg%3E)',
        description: 'URL-encoded SVG data URI',
      },
      {
        input: 'url(data:text/plain;charset=utf-8,Hello)',
        expected: 'url(data:text/plain;charset=utf-8,Hello)',
        description: 'text data URI',
      },
    ])('should preserve $description', ({ input, expected }) => {
      expect(absolutifyURLs(input, baseHref)).toBe(expected);
    });
  });

  describe('www URLs', () => {
    it.each([
      {
        input: "url('www.example.com/image.jpg')",
        expected: "url('www.example.com/image.jpg')",
        description: 'www-prefixed URL',
      },
      {
        input: "url('www.cdn.example.com/assets/file.js')",
        expected: "url('www.cdn.example.com/assets/file.js')",
        description: 'www subdomain URL',
      },
    ])('should preserve $description', ({ input, expected }) => {
      expect(absolutifyURLs(input, baseHref)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it.each([
      {
        input: "url('')",
        expected: "url('')",
        description: 'empty single-quoted URL',
      },
      {
        input: 'url("")',
        expected: 'url("")',
        description: 'empty double-quoted URL',
      },
      {
        input: 'url()',
        expected: 'url()',
        description: 'empty unquoted URL',
      },
      {
        input: "url('path with spaces.jpg')",
        expected: "url('https://example.com/path/to/path with spaces.jpg')",
        description: 'path with spaces',
      },
      {
        input: "url('path-with_special.chars-123.jpg')",
        expected:
          "url('https://example.com/path/to/path-with_special.chars-123.jpg')",
        description: 'path with special characters',
      },
      {
        input: "url('file.jpg?query=param&other=value')",
        expected:
          "url('https://example.com/path/to/file.jpg?query=param&other=value')",
        description: 'URL with query parameters',
      },
      {
        input: "url('file.jpg#anchor')",
        expected: "url('https://example.com/path/to/file.jpg#anchor')",
        description: 'URL with fragment/anchor',
      },
    ])('should handle $description', ({ input, expected }) => {
      expect(absolutifyURLs(input, baseHref)).toBe(expected);
    });
  });

  describe('multiple URLs in CSS', () => {
    it('should process multiple url() functions in one string', () => {
      const css = `
        .class1 { background: url('img1.jpg'); }
        .class2 { background: url("img2.png"); }
        .class3 { background: url(img3.gif); }
      `;
      const result = absolutifyURLs(css, baseHref);

      expect(result).toContain("url('https://example.com/path/to/img1.jpg')");
      expect(result).toContain('url("https://example.com/path/to/img2.png")');
      expect(result).toContain('url(https://example.com/path/to/img3.gif)');
    });

    it('should handle mixed absolute and relative URLs', () => {
      const css = `
        background: url('relative.jpg'), url('https://cdn.com/absolute.jpg'), url('/root.jpg');
      `;
      const result = absolutifyURLs(css, baseHref);

      expect(result).toContain(
        "url('https://example.com/path/to/relative.jpg')",
      );
      expect(result).toContain("url('https://cdn.com/absolute.jpg')");
      expect(result).toContain("url('https://example.com/root.jpg')");
    });
  });

  describe('null/undefined handling', () => {
    it('should handle null cssText', () => {
      expect(absolutifyURLs(null, baseHref)).toBe('');
    });

    it('should handle empty string cssText', () => {
      expect(absolutifyURLs('', baseHref)).toBe('');
    });
  });

  describe('different base URLs', () => {
    it('should work with root-level base URL', () => {
      const rootHref = 'https://example.com/';
      expect(absolutifyURLs("url('image.jpg')", rootHref)).toBe(
        "url('https://example.com/image.jpg')",
      );
    });

    it('should work with deeply nested base URL', () => {
      const deepHref = 'https://example.com/a/b/c/d/e/page.html';
      expect(absolutifyURLs("url('../../../image.jpg')", deepHref)).toBe(
        "url('https://example.com/a/b/image.jpg')",
      );
    });

    it('should work with base URL containing query params', () => {
      const queryHref = 'https://example.com/page.html?foo=bar';
      expect(absolutifyURLs("url('image.jpg')", queryHref)).toBe(
        "url('https://example.com/image.jpg')",
      );
    });
  });

  describe('performance and ReDoS prevention', () => {
    it('should handle long paths efficiently', () => {
      const longPath = 'a/'.repeat(500) + 'image.jpg';
      const input = `url('${longPath}')`;

      const start = Date.now();
      const result = absolutifyURLs(input, baseHref);
      const duration = Date.now() - start;

      // Should complete in under 100ms even with long paths
      expect(duration).toBeLessThan(100);
      expect(result).toContain('image.jpg');
    });

    it('should prevent ReDoS with double-quoted URLs (CVE vulnerable pattern)', () => {
      // This specifically tests the old vulnerable regex pattern: (")(.*?)"
      // The old (.*?) would cause catastrophic backtracking with this input
      // With the fixed regex ([^"]*), this completes instantly
      const repeatedChars = 'a'.repeat(10000);
      const input = `url("${repeatedChars}.jpg")`;

      const start = Date.now();
      const result = absolutifyURLs(input, baseHref);
      const duration = Date.now() - start;

      // Should complete in under 100ms
      // Old regex with (.*?) would hang/timeout here
      expect(duration).toBeLessThan(100);
      expect(result).toContain(repeatedChars);
    });

    it('should handle many repeated characters efficiently', () => {
      // This tests for catastrophic backtracking
      const repeatedChars = 'a'.repeat(10000);
      const input = `url('${repeatedChars}.jpg')`;

      const start = Date.now();
      const result = absolutifyURLs(input, baseHref);
      const duration = Date.now() - start;

      // Should complete in under 100ms (ReDoS would hang here)
      expect(duration).toBeLessThan(100);
      expect(result).toContain(repeatedChars);
    });

    it('should handle multiple long URLs efficiently', () => {
      const longUrl = 'subdir/'.repeat(100) + 'file.jpg';
      const input = Array(50).fill(`url('${longUrl}')`).join(' ');

      const start = Date.now();
      const result = absolutifyURLs(input, baseHref);
      const duration = Date.now() - start;

      // Should complete in under 200ms
      expect(duration).toBeLessThan(200);
      expect(result.split('url(').length - 1).toBe(50);
    });

    it('should handle pathological nested url( patterns efficiently (CodeQL scenario)', () => {
      // CodeQL warns: "may run slow on strings starting with 'url(' and with many repetitions of 'url(('"
      // This tests nested/malformed url( patterns that could cause backtracking
      const nestedUrlPattern = 'url(('.repeat(1000);
      const input = nestedUrlPattern + 'file.jpg' + ')'.repeat(1000);

      const start = Date.now();
      const result = absolutifyURLs(input, baseHref);
      const duration = Date.now() - start;

      // Should complete quickly even with pathological input
      // O(n²) or worse would take much longer
      expect(duration).toBeLessThan(200);
    });

    it('should handle unquoted url( without closing parens reasonably', () => {
      // NOTE: [^)]* has theoretical O(n²) risk with pathological input like url(aaa...
      // However, changing it to [^()] breaks real CSS (data URIs, integration tests fail)
      // Modern V8 optimizes this well - completes in <100ms even with 50k chars
      // This test documents that the regex performs acceptably in practice
      const pathologicalInput = 'url(' + 'a'.repeat(50000);

      const start = Date.now();
      const result = absolutifyURLs(pathologicalInput, baseHref);
      const duration = Date.now() - start;

      // Modern JS engines handle this efficiently despite theoretical O(n²)
      expect(duration).toBeLessThan(100);
    });

    it('should handle many failed url( matches efficiently', () => {
      // Test many 'url(' patterns without proper closing
      const malformedUrls = 'url((((( '.repeat(500);

      const start = Date.now();
      const result = absolutifyURLs(malformedUrls, baseHref);
      const duration = Date.now() - start;

      // Should complete quickly - linear time, not quadratic
      expect(duration).toBeLessThan(200);
    });

    it('should handle realistic CSS file with many URLs and rules efficiently', () => {
      // Simulate a real style.css with various patterns that could trigger backtracking
      const longPath = 'assets/images/components/'.repeat(10);
      const problematicContent = 'a'.repeat(1000); // Long content that could cause backtracking

      const css = `
        /* Header styles */
        .header {
          background: url("${problematicContent}.png") no-repeat;
          border-image: url("${longPath}border.svg");
        }

        /* Navigation */
        .nav::before { content: url("${problematicContent}.svg"); }
        .nav-item { background: url("${longPath}nav-bg.jpg"); }

        /* Main content area */
        .content {
          background: url("${problematicContent}.jpg"),
                      url("${longPath}overlay.png"),
                      linear-gradient(to bottom, #fff, #000);
        }

        /* Sidebar with multiple backgrounds */
        .sidebar {
          background-image: url("${problematicContent}.webp"),
                            url("${longPath}pattern.png"),
                            url("${problematicContent}.jpg");
        }

        /* Footer */
        .footer {
          background: url("${longPath}footer-bg.png");
          list-style-image: url("${problematicContent}.svg");
        }

        /* Font faces */
        @font-face {
          font-family: "CustomFont";
          src: url("${longPath}fonts/custom.woff2") format("woff2"),
               url("${problematicContent}.woff") format("woff"),
               url("${longPath}fonts/custom.ttf") format("truetype");
        }

        /* Cursors */
        .clickable { cursor: url("${problematicContent}.cur"), pointer; }

        /* Masks and clips */
        .masked {
          mask-image: url("${longPath}mask.svg");
          -webkit-mask-image: url("${problematicContent}.png");
        }

        /* More complex patterns */
        .gallery::after {
          content: "";
          background: url("${problematicContent}.png") center / cover,
                      url("${longPath}texture.jpg") repeat;
        }
      `;

      const start = Date.now();
      const result = absolutifyURLs(css, baseHref);
      const duration = Date.now();

      // Should complete very quickly even with complex real-world CSS
      // Old regex with (.*?) could hang on this combination of long content and many URLs
      expect(duration - start).toBeLessThan(200);

      // Verify it processed all the URLs
      const urlCount = (result.match(/url\(/g) || []).length;
      expect(urlCount).toBeGreaterThan(15); // We have many URLs in the CSS

      // Verify some URLs were properly converted
      expect(result).toContain('https://example.com/path/to/');
    });
  });

  describe('real-world CSS examples', () => {
    it('should handle background shorthand with multiple images', () => {
      const css = `
        background: url('bg.jpg') no-repeat center,
                    url('../overlay.png') repeat-x top,
                    linear-gradient(to bottom, #fff, #000);
      `;
      const result = absolutifyURLs(css, baseHref);

      expect(result).toContain("url('https://example.com/path/to/bg.jpg')");
      expect(result).toContain("url('https://example.com/path/overlay.png')");
      expect(result).toContain('linear-gradient'); // should be unchanged
    });

    it('should handle @font-face src with multiple formats', () => {
      const css = `
        @font-face {
          src: url('font.woff2') format('woff2'),
               url('font.woff') format('woff'),
               url('font.ttf') format('truetype');
        }
      `;
      const result = absolutifyURLs(css, baseHref);

      expect(result).toContain("url('https://example.com/path/to/font.woff2')");
      expect(result).toContain("url('https://example.com/path/to/font.woff')");
      expect(result).toContain("url('https://example.com/path/to/font.ttf')");
    });

    it('should handle cursor with fallback', () => {
      const css = `cursor: url('cursor.cur'), url('cursor.png'), pointer;`;
      const result = absolutifyURLs(css, baseHref);

      expect(result).toContain("url('https://example.com/path/to/cursor.cur')");
      expect(result).toContain("url('https://example.com/path/to/cursor.png')");
      expect(result).toContain('pointer');
    });
  });

  describe('quote handling', () => {
    it('should preserve quote style for single quotes', () => {
      expect(absolutifyURLs("url('image.jpg')", baseHref)).toContain("url('");
      expect(absolutifyURLs("url('image.jpg')", baseHref)).toContain("')");
    });

    it('should preserve quote style for double quotes', () => {
      expect(absolutifyURLs('url("image.jpg")', baseHref)).toContain('url("');
      expect(absolutifyURLs('url("image.jpg")', baseHref)).toContain('")');
    });

    it('should preserve no quotes for unquoted URLs', () => {
      const result = absolutifyURLs('url(image.jpg)', baseHref);
      expect(result).toBe('url(https://example.com/path/to/image.jpg)');
      expect(result).not.toContain('"');
      expect(result).not.toContain("'");
    });
  });
});
