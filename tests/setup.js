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
    update: jest.fn(),
    create: jest.fn()
  },
  windows: {
    getCurrent: jest.fn()
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

// Mock window.close (jsdom environment already provides window)
if (global.window) {
  global.window.close = jest.fn();
}

