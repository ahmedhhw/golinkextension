const {
  loadGoLinksFromStorage,
  saveGoLinksToStorage
} = require('../src/storage');

describe('storage module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadGoLinksFromStorage', () => {
    test('should load go links from storage when they exist', async () => {
      const mockStorage = {
        local: {
          get: jest.fn().mockResolvedValue({
            goLinks: {
              github: 'https://github.com',
              stackoverflow: 'https://stackoverflow.com'
            }
          })
        }
      };

      const defaultGoLinks = {
        google: 'https://google.com',
        youtube: 'https://youtube.com'
      };

      const result = await loadGoLinksFromStorage(mockStorage, defaultGoLinks);

      expect(mockStorage.local.get).toHaveBeenCalledWith(['goLinks']);
      expect(result).toEqual({
        github: 'https://github.com',
        stackoverflow: 'https://stackoverflow.com'
      });
    });

    test('should return and save default go links when storage is empty', async () => {
      const mockStorage = {
        local: {
          get: jest.fn().mockResolvedValue({}),
          set: jest.fn().mockResolvedValue(undefined)
        }
      };

      const defaultGoLinks = {
        google: 'https://google.com',
        youtube: 'https://youtube.com'
      };

      const result = await loadGoLinksFromStorage(mockStorage, defaultGoLinks);

      expect(mockStorage.local.get).toHaveBeenCalledWith(['goLinks']);
      expect(mockStorage.local.set).toHaveBeenCalledWith({ goLinks: defaultGoLinks });
      expect(result).toEqual(defaultGoLinks);
    });

    test('should return default go links when storage has empty goLinks', async () => {
      const mockStorage = {
        local: {
          get: jest.fn().mockResolvedValue({ goLinks: {} }),
          set: jest.fn().mockResolvedValue(undefined)
        }
      };

      const defaultGoLinks = {
        google: 'https://google.com',
        youtube: 'https://youtube.com'
      };

      const result = await loadGoLinksFromStorage(mockStorage, defaultGoLinks);

      expect(mockStorage.local.set).toHaveBeenCalledWith({ goLinks: defaultGoLinks });
      expect(result).toEqual(defaultGoLinks);
    });

    test('should handle errors and return default go links', async () => {
      const mockStorage = {
        local: {
          get: jest.fn().mockRejectedValue(new Error('Storage error'))
        }
      };

      const defaultGoLinks = {
        google: 'https://google.com',
        youtube: 'https://youtube.com'
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await loadGoLinksFromStorage(mockStorage, defaultGoLinks);

      expect(result).toEqual(defaultGoLinks);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('saveGoLinksToStorage', () => {
    test('should save go links to storage', async () => {
      const mockStorage = {
        local: {
          set: jest.fn().mockResolvedValue(undefined)
        }
      };

      const goLinks = {
        google: 'https://google.com',
        youtube: 'https://youtube.com'
      };

      const result = await saveGoLinksToStorage(mockStorage, goLinks);

      expect(mockStorage.local.set).toHaveBeenCalledWith({ goLinks });
      expect(result).toBe(true);
    });

    test('should throw error when storage save fails', async () => {
      const mockStorage = {
        local: {
          set: jest.fn().mockRejectedValue(new Error('Save failed'))
        }
      };

      const goLinks = {
        google: 'https://google.com'
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(saveGoLinksToStorage(mockStorage, goLinks)).rejects.toThrow('Save failed');

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should save empty go links object', async () => {
      const mockStorage = {
        local: {
          set: jest.fn().mockResolvedValue(undefined)
        }
      };

      const goLinks = {};

      const result = await saveGoLinksToStorage(mockStorage, goLinks);

      expect(mockStorage.local.set).toHaveBeenCalledWith({ goLinks: {} });
      expect(result).toBe(true);
    });
  });
});

