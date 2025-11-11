const {
  defaultGoLinks,
  parseEditorText,
  formatGoLinksToText
} = require('../src/goLinks');
const {
  loadGoLinksFromStorage,
  saveGoLinksToStorage
} = require('../src/storage');
const { navigateToGoLink } = require('../src/navigation');

describe('Integration tests', () => {
  describe('Parse -> Format roundtrip', () => {
    test('should maintain data integrity through parse and format', () => {
      const originalText = 'google:https://google.com\nyoutube:https://youtube.com';
      const parsed = parseEditorText(originalText);
      const formatted = formatGoLinksToText(parsed);
      
      // Parse again to verify
      const reparsed = parseEditorText(formatted);
      
      expect(reparsed).toEqual(parsed);
    });

    test('should handle complex go links', () => {
      const text = 'google:https://google.com\nyoutube:https://youtube.com\ngithub:https://github.com';
      const parsed = parseEditorText(text);
      const formatted = formatGoLinksToText(parsed);
      const reparsed = parseEditorText(formatted);
      
      expect(reparsed).toEqual(parsed);
      expect(Object.keys(reparsed)).toHaveLength(3);
    });
  });

  describe('Storage -> Navigation flow', () => {
    test('should load from storage and navigate successfully', async () => {
      const storedLinks = {
        google: 'https://google.com',
        youtube: 'https://youtube.com'
      };

      const mockStorage = {
        local: {
          get: jest.fn().mockResolvedValue({ goLinks: storedLinks })
        }
      };

      const mockTabs = {
        query: jest.fn().mockResolvedValue([{ id: 1 }]),
        update: jest.fn().mockResolvedValue(undefined)
      };

      // Load from storage
      const loadedLinks = await loadGoLinksFromStorage(mockStorage, defaultGoLinks);
      expect(loadedLinks).toEqual(storedLinks);

      // Navigate using loaded links
      const result = await navigateToGoLink(loadedLinks, 'google', mockTabs, {});
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://google.com');
    });

    test('should save parsed text and navigate', async () => {
      const editorText = 'github:https://github.com\nstackoverflow:https://stackoverflow.com';
      
      // Parse text
      const parsed = parseEditorText(editorText);
      
      // Save to storage
      const mockStorage = {
        local: {
          set: jest.fn().mockResolvedValue(undefined)
        }
      };
      
      await saveGoLinksToStorage(mockStorage, parsed);
      expect(mockStorage.local.set).toHaveBeenCalledWith({ goLinks: parsed });

      // Navigate
      const mockTabs = {
        query: jest.fn().mockResolvedValue([{ id: 1 }]),
        update: jest.fn().mockResolvedValue(undefined)
      };

      const result = await navigateToGoLink(parsed, 'github', mockTabs, {});
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://github.com');
    });
  });

  describe('Error handling flow', () => {
    test('should handle invalid editor text gracefully', () => {
      const invalidText = 'invalid-format';
      
      expect(() => parseEditorText(invalidText)).toThrow();
    });

    test('should handle storage errors and fallback to defaults', async () => {
      const mockStorage = {
        local: {
          get: jest.fn().mockRejectedValue(new Error('Storage error'))
        }
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await loadGoLinksFromStorage(mockStorage, defaultGoLinks);
      
      expect(result).toEqual(defaultGoLinks);
      consoleSpy.mockRestore();
    });
  });
});

