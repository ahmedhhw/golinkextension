const { navigateToGoLink } = require('../src/navigation');

describe('navigation module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('navigateToGoLink', () => {
    test('should navigate to valid go link', async () => {
      const goLinks = {
        google: 'https://google.com',
        youtube: 'https://youtube.com'
      };

      const mockTabs = {
        query: jest.fn().mockResolvedValue([{ id: 1, url: 'https://example.com' }]),
        update: jest.fn().mockResolvedValue(undefined)
      };

      const mockWindows = {};

      const result = await navigateToGoLink(goLinks, 'google', mockTabs, mockWindows);

      expect(mockTabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true });
      expect(mockTabs.update).toHaveBeenCalledWith(1, { url: 'https://google.com' });
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://google.com');
    });

    test('should handle case-insensitive go link names', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      const mockTabs = {
        query: jest.fn().mockResolvedValue([{ id: 1 }]),
        update: jest.fn().mockResolvedValue(undefined)
      };

      const mockWindows = {};

      const result = await navigateToGoLink(goLinks, 'GOOGLE', mockTabs, mockWindows);

      expect(result.success).toBe(true);
      expect(mockTabs.update).toHaveBeenCalledWith(1, { url: 'https://google.com' });
    });

    test('should trim whitespace from go link name', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      const mockTabs = {
        query: jest.fn().mockResolvedValue([{ id: 1 }]),
        update: jest.fn().mockResolvedValue(undefined)
      };

      const mockWindows = {};

      const result = await navigateToGoLink(goLinks, '  google  ', mockTabs, mockWindows);

      expect(result.success).toBe(true);
      expect(mockTabs.update).toHaveBeenCalledWith(1, { url: 'https://google.com' });
    });

    test('should return error for empty go link name', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      const mockTabs = {};
      const mockWindows = {};

      const result = await navigateToGoLink(goLinks, '', mockTabs, mockWindows);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Please enter a go link');
    });

    test('should return error for whitespace-only go link name', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      const mockTabs = {};
      const mockWindows = {};

      const result = await navigateToGoLink(goLinks, '   ', mockTabs, mockWindows);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Please enter a go link');
    });

    test('should return error for non-existent go link', async () => {
      const goLinks = {
        google: 'https://google.com',
        youtube: 'https://youtube.com'
      };

      const mockTabs = {};
      const mockWindows = {};

      const result = await navigateToGoLink(goLinks, 'nonexistent', mockTabs, mockWindows);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
      expect(result.message).toContain('google');
      expect(result.message).toContain('youtube');
    });

    test('should return error message with "none" when no go links available', async () => {
      const goLinks = {};

      const mockTabs = {};
      const mockWindows = {};

      const result = await navigateToGoLink(goLinks, 'test', mockTabs, mockWindows);

      expect(result.success).toBe(false);
      expect(result.message).toContain('none');
    });

    test('should handle navigation error', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      const mockTabs = {
        query: jest.fn().mockResolvedValue([{ id: 1 }]),
        update: jest.fn().mockRejectedValue(new Error('Navigation failed'))
      };

      const mockWindows = {};
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await navigateToGoLink(goLinks, 'google', mockTabs, mockWindows);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Could not navigate');

      consoleSpy.mockRestore();
    });

    test('should handle tab query error', async () => {
      const goLinks = {
        google: 'https://google.com'
      };

      const mockTabs = {
        query: jest.fn().mockRejectedValue(new Error('Query failed'))
      };

      const mockWindows = {};
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await navigateToGoLink(goLinks, 'google', mockTabs, mockWindows);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Could not navigate');

      consoleSpy.mockRestore();
    });
  });
});

