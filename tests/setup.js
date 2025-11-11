// Mock Chrome APIs
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    }
  },
  tabs: {
    query: jest.fn(),
    update: jest.fn()
  },
  windows: {
    getCurrent: jest.fn()
  }
};

// Mock window.close (jsdom environment already provides window)
if (global.window) {
  global.window.close = jest.fn();
}

