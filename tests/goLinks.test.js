const {
  defaultGoLinks,
  parseEditorText,
  formatGoLinksToText,
  validateGoLinkName,
  validateURL
} = require('../src/goLinks');

describe('goLinks module', () => {
  describe('defaultGoLinks', () => {
    test('should have default go links', () => {
      expect(defaultGoLinks).toHaveProperty('google');
      expect(defaultGoLinks).toHaveProperty('youtube');
      expect(defaultGoLinks.google).toBe('https://google.com');
      expect(defaultGoLinks.youtube).toBe('https://youtube.com');
    });
  });

  describe('parseEditorText', () => {
    test('should parse valid text format', () => {
      const text = 'google:https://google.com\nyoutube:https://youtube.com';
      const result = parseEditorText(text);
      
      expect(result).toEqual({
        google: 'https://google.com',
        youtube: 'https://youtube.com'
      });
    });

    test('should convert keys to lowercase', () => {
      const text = 'GOOGLE:https://google.com\nYouTube:https://youtube.com';
      const result = parseEditorText(text);
      
      expect(result).toHaveProperty('google');
      expect(result).toHaveProperty('youtube');
    });

    test('should skip empty lines', () => {
      const text = 'google:https://google.com\n\nyoutube:https://youtube.com';
      const result = parseEditorText(text);
      
      expect(result).toEqual({
        google: 'https://google.com',
        youtube: 'https://youtube.com'
      });
    });

    test('should trim whitespace from keys and values', () => {
      const text = '  google  :  https://google.com  \n  youtube  :  https://youtube.com  ';
      const result = parseEditorText(text);
      
      expect(result).toEqual({
        google: 'https://google.com',
        youtube: 'https://youtube.com'
      });
    });

    test('should throw error for empty editor', () => {
      expect(() => parseEditorText('')).toThrow('Editor is empty');
      expect(() => parseEditorText('   ')).toThrow('Editor is empty');
    });

    test('should throw error for missing colon', () => {
      const text = 'google https//google.com';
      expect(() => parseEditorText(text)).toThrow('missing colon separator');
    });

    test('should throw error for missing key', () => {
      const text = ':https://google.com';
      expect(() => parseEditorText(text)).toThrow('missing key');
    });

    test('should throw error for missing URL', () => {
      const text = 'google:';
      expect(() => parseEditorText(text)).toThrow('missing URL');
    });

    test('should throw error for invalid URL', () => {
      const text = 'google:not-a-url';
      expect(() => parseEditorText(text)).toThrow('Invalid URL');
    });


    test('should handle multiple go links', () => {
      const text = 'google:https://google.com\nyoutube:https://youtube.com\ngithub:https://github.com';
      const result = parseEditorText(text);
      
      expect(Object.keys(result)).toHaveLength(3);
      expect(result.github).toBe('https://github.com');
    });
  });

  describe('formatGoLinksToText', () => {
    test('should format go links to text format', () => {
      const goLinks = {
        google: 'https://google.com',
        youtube: 'https://youtube.com'
      };
      const result = formatGoLinksToText(goLinks);
      
      expect(result).toBe('google:https://google.com\nyoutube:https://youtube.com');
    });

    test('should handle empty object', () => {
      const goLinks = {};
      const result = formatGoLinksToText(goLinks);
      
      expect(result).toBe('');
    });

    test('should handle single go link', () => {
      const goLinks = {
        google: 'https://google.com'
      };
      const result = formatGoLinksToText(goLinks);
      
      expect(result).toBe('google:https://google.com');
    });

    test('should preserve order of entries', () => {
      const goLinks = {
        z: 'https://z.com',
        a: 'https://a.com',
        m: 'https://m.com'
      };
      const result = formatGoLinksToText(goLinks);
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('z:https://z.com');
      expect(lines[1]).toBe('a:https://a.com');
      expect(lines[2]).toBe('m:https://m.com');
    });
  });

  describe('validateGoLinkName', () => {
    test('should validate correct go link names', () => {
      expect(validateGoLinkName('google')).toBe(true);
      expect(validateGoLinkName('youtube')).toBe(true);
      expect(validateGoLinkName('test123')).toBe(true);
      expect(validateGoLinkName('  google  ')).toBe(true);
    });

    test('should reject invalid go link names', () => {
      expect(validateGoLinkName('')).toBe(false);
      expect(validateGoLinkName('   ')).toBe(false);
      expect(validateGoLinkName(null)).toBe(false);
      expect(validateGoLinkName(undefined)).toBe(false);
      expect(validateGoLinkName(123)).toBe(false);
      expect(validateGoLinkName({})).toBe(false);
    });
  });

  describe('validateURL', () => {
    test('should validate correct URLs', () => {
      expect(validateURL('https://google.com')).toBe(true);
      expect(validateURL('http://example.com')).toBe(true);
      expect(validateURL('https://subdomain.example.com/path?query=1')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(validateURL('not-a-url')).toBe(false);
      expect(validateURL('')).toBe(false);
      expect(validateURL('   ')).toBe(false);
      expect(validateURL(null)).toBe(false);
      expect(validateURL(undefined)).toBe(false);
      expect(validateURL(123)).toBe(false);
    });
  });
});

