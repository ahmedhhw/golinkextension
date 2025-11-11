// Mock Chrome APIs before requiring the module
const mockChrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  tabs: {
    update: jest.fn(),
    create: jest.fn()
  },
  omnibox: {
    onInputChanged: {
      addListener: jest.fn()
    },
    onInputEntered: {
      addListener: jest.fn()
    }
  }
};

global.chrome = mockChrome;

// Mock console methods
global.console = {
  ...console,
  error: jest.fn(),
  log: jest.fn()
};

describe('Background Service Worker (Omnibox)', () => {
  let backgroundModule;
  let onInputChangedCallback;
  let onInputEnteredCallback;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Set up listeners to capture callbacks
    mockChrome.omnibox.onInputChanged.addListener.mockImplementation((callback) => {
      onInputChangedCallback = callback;
    });
    
    mockChrome.omnibox.onInputEntered.addListener.mockImplementation((callback) => {
      onInputEnteredCallback = callback;
    });

    // Load the background module
    delete require.cache[require.resolve('../background.js')];
    backgroundModule = require('../background.js');
  });

  describe('Omnibox Input Changed (Suggestions)', () => {
    test('should register input changed listener', () => {
      expect(mockChrome.omnibox.onInputChanged.addListener).toHaveBeenCalled();
      expect(onInputChangedCallback).toBeDefined();
    });

    test('should provide suggestions for matching go links', async () => {
      const goLinks = {
        google: 'https://google.com',
        github: 'https://github.com',
        gmail: 'https://gmail.com',
        youtube: 'https://youtube.com',
        stackoverflow: 'https://stackoverflow.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });

      const suggest = jest.fn();
      await onInputChangedCallback('g', suggest);

      expect(mockChrome.storage.local.get).toHaveBeenCalledWith(['goLinks']);
      expect(suggest).toHaveBeenCalled();
      
      const suggestions = suggest.mock.calls[0][0];
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.every(s => s.content.startsWith('g'))).toBe(true);
    });

    test('should limit suggestions to 5 items', async () => {
      const goLinks = {
        g1: 'https://g1.com',
        g2: 'https://g2.com',
        g3: 'https://g3.com',
        g4: 'https://g4.com',
        g5: 'https://g5.com',
        g6: 'https://g6.com',
        g7: 'https://g7.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });

      const suggest = jest.fn();
      await onInputChangedCallback('g', suggest);

      const suggestions = suggest.mock.calls[0][0];
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });

    test('should provide suggestions with correct format', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });

      const suggest = jest.fn();
      await onInputChangedCallback('goog', suggest);

      const suggestions = suggest.mock.calls[0][0];
      expect(suggestions[0]).toHaveProperty('content');
      expect(suggestions[0]).toHaveProperty('description');
      expect(suggestions[0].content).toBe('google');
      expect(suggestions[0].description).toContain('google');
      expect(suggestions[0].description).toContain('https://google.com');
    });

    test('should handle case-insensitive matching', async () => {
      // Note: In practice, go links are stored with lowercase keys
      // This test verifies that lowercase input matches regardless of key case
      const goLinks = {
        google: 'https://google.com',
        github: 'https://github.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });

      const suggest = jest.fn();
      await onInputChangedCallback('G', suggest);

      const suggestions = suggest.mock.calls[0][0];
      expect(suggestions.length).toBeGreaterThan(0);
    });

    test('should return empty suggestions when no matches', async () => {
      const goLinks = {
        youtube: 'https://youtube.com',
        github: 'https://github.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });

      const suggest = jest.fn();
      await onInputChangedCallback('xyz', suggest);

      const suggestions = suggest.mock.calls[0][0];
      expect(suggestions.length).toBe(0);
    });

    test('should use default go links when storage is empty', async () => {
      mockChrome.storage.local.get.mockResolvedValue({});
      mockChrome.storage.local.set.mockResolvedValue(undefined);

      const suggest = jest.fn();
      await onInputChangedCallback('go', suggest);

      expect(mockChrome.storage.local.set).toHaveBeenCalled();
      const suggestions = suggest.mock.calls[0][0];
      expect(suggestions.length).toBeGreaterThan(0);
    });

    test('should handle storage errors gracefully', async () => {
      mockChrome.storage.local.get.mockRejectedValue(new Error('Storage error'));

      const suggest = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await onInputChangedCallback('g', suggest);

      expect(consoleSpy).toHaveBeenCalled();
      // Should still provide suggestions using defaults
      expect(suggest).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should trim whitespace from input', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });

      const suggest = jest.fn();
      await onInputChangedCallback('  goog  ', suggest);

      const suggestions = suggest.mock.calls[0][0];
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Omnibox Input Entered (Navigation)', () => {
    test('should register input entered listener', () => {
      expect(mockChrome.omnibox.onInputEntered.addListener).toHaveBeenCalled();
      expect(onInputEnteredCallback).toBeDefined();
    });

    test('should navigate to go link in current tab', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });
      mockChrome.tabs.update.mockResolvedValue(undefined);

      await onInputEnteredCallback('google', 'currentTab');

      expect(mockChrome.storage.local.get).toHaveBeenCalledWith(['goLinks']);
      expect(mockChrome.tabs.update).toHaveBeenCalledWith({ url: 'https://google.com' });
    });

    test('should navigate to go link in new foreground tab', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });
      mockChrome.tabs.create.mockResolvedValue(undefined);

      await onInputEnteredCallback('google', 'newForegroundTab');

      expect(mockChrome.tabs.create).toHaveBeenCalledWith({ url: 'https://google.com' });
    });

    test('should navigate to go link in new background tab', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });
      mockChrome.tabs.create.mockResolvedValue(undefined);

      await onInputEnteredCallback('google', 'newBackgroundTab');

      expect(mockChrome.tabs.create).toHaveBeenCalledWith({ 
        url: 'https://google.com', 
        active: false 
      });
    });

    test('should default to current tab for unknown disposition', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });
      mockChrome.tabs.update.mockResolvedValue(undefined);

      await onInputEnteredCallback('google', 'unknownDisposition');

      expect(mockChrome.tabs.update).toHaveBeenCalledWith({ url: 'https://google.com' });
    });

    test('should handle case-insensitive go link names', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });
      mockChrome.tabs.update.mockResolvedValue(undefined);

      await onInputEnteredCallback('GOOGLE', 'currentTab');

      expect(mockChrome.tabs.update).toHaveBeenCalledWith({ url: 'https://google.com' });
    });

    test('should trim whitespace from go link name', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });
      mockChrome.tabs.update.mockResolvedValue(undefined);

      await onInputEnteredCallback('  google  ', 'currentTab');

      expect(mockChrome.tabs.update).toHaveBeenCalledWith({ url: 'https://google.com' });
    });

    test('should log error when go link not found', async () => {
      const goLinks = {
        google: 'https://google.com',
        youtube: 'https://youtube.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await onInputEnteredCallback('nonexistent', 'currentTab');

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('not found');
      expect(consoleSpy.mock.calls[0][0]).toContain('Available:');
      expect(mockChrome.tabs.update).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should use default go links when storage is empty', async () => {
      mockChrome.storage.local.get.mockResolvedValue({});
      mockChrome.storage.local.set.mockResolvedValue(undefined);
      mockChrome.tabs.update.mockResolvedValue(undefined);

      await onInputEnteredCallback('google', 'currentTab');

      expect(mockChrome.storage.local.set).toHaveBeenCalled();
      expect(mockChrome.tabs.update).toHaveBeenCalledWith({ url: 'https://google.com' });
    });

    test('should handle storage errors gracefully', async () => {
      mockChrome.storage.local.get.mockRejectedValue(new Error('Storage error'));
      mockChrome.tabs.update.mockResolvedValue(undefined);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await onInputEnteredCallback('google', 'currentTab');

      expect(consoleSpy).toHaveBeenCalled();
      // Should still navigate using defaults
      expect(mockChrome.tabs.update).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should handle navigation errors gracefully', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });
      mockChrome.tabs.update.mockRejectedValue(new Error('Navigation failed'));

      // The function should not throw, even if navigation fails
      await expect(onInputEnteredCallback('google', 'currentTab')).resolves.not.toThrow();

      expect(mockChrome.tabs.update).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    test('should handle full flow: suggestions then navigation', async () => {
      const goLinks = {
        google: 'https://google.com',
        github: 'https://github.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });
      mockChrome.tabs.update.mockResolvedValue(undefined);

      // First, get suggestions
      const suggest = jest.fn();
      await onInputChangedCallback('go', suggest);

      const suggestions = suggest.mock.calls[0][0];
      expect(suggestions.length).toBeGreaterThan(0);

      // Then, navigate using one of the suggestions
      const selectedLink = suggestions[0].content;
      await onInputEnteredCallback(selectedLink, 'currentTab');

      expect(mockChrome.tabs.update).toHaveBeenCalledWith({ 
        url: goLinks[selectedLink] 
      });
    });

    test('should handle multiple go links with same prefix', async () => {
      const goLinks = {
        google: 'https://google.com',
        gmail: 'https://gmail.com',
        github: 'https://github.com',
        gdrive: 'https://drive.google.com'
      };

      mockChrome.storage.local.get.mockResolvedValue({ goLinks });

      const suggest = jest.fn();
      await onInputChangedCallback('g', suggest);

      const suggestions = suggest.mock.calls[0][0];
      expect(suggestions.length).toBeLessThanOrEqual(5);
      expect(suggestions.every(s => s.content.startsWith('g'))).toBe(true);
    });
  });
});

