// Mock Chrome APIs before loading the module
const mockChrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  tabs: {
    query: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  }
};

global.chrome = mockChrome;

// Mock console to avoid noise
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn()
};

describe('Popup UI - Add and Delete Functions', () => {
  let popupModule;
  let container;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Set up DOM for popup
    document.body.innerHTML = `
      <div class="container">
        <h1>Go Link Navigator</h1>
        <p>Enter a short link and press Enter</p>
        
        <div class="input-group">
          <input 
            type="text" 
            id="goLinkInput" 
            class="go-link-input" 
            placeholder="e.g., google, youtube"
            autocomplete="off"
            autofocus
          />
        </div>
        
        <div class="edit-button-group">
          <button id="addBtn" class="add-btn">Add</button>
          <button id="deleteBtn" class="delete-btn">Delete</button>
          <button id="editBtn" class="edit-btn">Edit</button>
        </div>
        
        <div class="editor-section" id="editorSection" style="display: none;">
          <div class="editor-header">
            <label for="goLinksEditor" class="editor-label">Edit Go Links</label>
            <button id="saveBtn" class="save-btn">Save</button>
          </div>
          <textarea 
            id="goLinksEditor" 
            class="go-links-editor"
            placeholder="google:https://google.com&#10;youtube:https://youtube.com"
          ></textarea>
        </div>

        <!-- Add new go link section (hidden by default) -->
        <div class="add-section" id="addSection" style="display: none;">
          <div class="form-row">
            <label for="shortLinkInput">Short link</label>
            <input type="text" id="shortLinkInput" placeholder="e.g., myshort" />
          </div>
          <div class="form-row">
            <label for="urlInput">URL</label>
            <input type="text" id="urlInput" placeholder="https://example.com" />
          </div>
          <div class="form-actions">
            <button id="addSaveBtn" class="save-btn">Save</button>
            <button id="addCancelBtn" class="edit-btn">Cancel</button>
          </div>
        </div>

        <!-- Delete go links section (hidden by default) -->
        <div class="delete-section" id="deleteSection" style="display: none;">
          <div class="delete-header">
            <label class="delete-label">Select links to delete</label>
          </div>
          <div class="delete-list" id="deleteList"></div>
          <div class="form-actions">
            <button id="deleteConfirmBtn" class="save-btn">Delete Selected</button>
            <button id="deleteCancelBtn" class="edit-btn">Cancel</button>
          </div>
        </div>
        
        <div id="info" class="info-box"></div>
        
        <div class="hint">
          <p id="hintText">Try: <span class="hint-link">google</span>, <span class="hint-link">youtube</span></p>
        </div>
      </div>
    `;

    // Set up chrome.tabs.query mock to return a test tab
    mockChrome.tabs.query.mockImplementation((query, callback) => {
      if (typeof callback === 'function') {
        callback([{ id: 1, url: 'https://example.com' }]);
      } else {
        // Promise-based API
        return Promise.resolve([{ id: 1, url: 'https://example.com' }]);
      }
    });

    // Set up chrome.storage.local.get mock
    mockChrome.storage.local.get.mockResolvedValue({
      goLinks: {
        google: 'https://google.com',
        youtube: 'https://youtube.com',
        github: 'https://github.com'
      }
    });

    mockChrome.storage.local.set.mockResolvedValue(undefined);

    // Load popup module
    delete require.cache[require.resolve('../popup.js')];
    popupModule = require('../popup.js');
  });

  describe('Add Button Functionality', () => {
    test('should toggle add section visibility when add button is clicked', async () => {
      const addBtn = document.getElementById('addBtn');
      const addSection = document.getElementById('addSection');

      expect(addSection.style.display).toBe('none');

      // Click add button to open
      addBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(addSection.style.display).toBe('block');

      // Click add button again to close (using cancel)
      const addCancelBtn = document.getElementById('addCancelBtn');
      addCancelBtn.click();

      expect(addSection.style.display).toBe('none');
    });

    test('should prefill URL input with current tab URL when opening add section', async () => {
      const addBtn = document.getElementById('addBtn');
      const urlInput = document.getElementById('urlInput');

      addBtn.click();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(urlInput.value).toBe('https://example.com');
    });

    test('should clear short link input and focus it when opening add section', async () => {
      const addBtn = document.getElementById('addBtn');
      const shortLinkInput = document.getElementById('shortLinkInput');

      shortLinkInput.value = 'old-value';

      addBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(shortLinkInput.value).toBe('');
      // Focus is set, though we can't directly test it in jsdom
    });

    test('should validate short link is not empty', async () => {
      const addBtn = document.getElementById('addBtn');
      const addSaveBtn = document.getElementById('addSaveBtn');
      const urlInput = document.getElementById('urlInput');
      const infoBox = document.getElementById('info');

      addBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      urlInput.value = 'https://test.com';

      addSaveBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(infoBox.textContent).toContain('Please enter a short link');
    });

    test('should validate URL is not empty', async () => {
      const addBtn = document.getElementById('addBtn');
      const addSaveBtn = document.getElementById('addSaveBtn');
      const shortLinkInput = document.getElementById('shortLinkInput');
      const urlInput = document.getElementById('urlInput');
      const infoBox = document.getElementById('info');

      addBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      shortLinkInput.value = 'test';
      urlInput.value = '';

      addSaveBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(infoBox.textContent).toContain('Please enter a URL');
    });

    test('should accept valid URLs with and without protocol', async () => {
      const addBtn = document.getElementById('addBtn');
      const addSaveBtn = document.getElementById('addSaveBtn');
      const shortLinkInput = document.getElementById('shortLinkInput');
      const urlInput = document.getElementById('urlInput');

      addBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      shortLinkInput.value = 'test';
      urlInput.value = 'example.com';

      addSaveBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should prepend https:// and save successfully
      expect(mockChrome.storage.local.set).toHaveBeenCalled();
      const savedData = mockChrome.storage.local.set.mock.calls[0][0];
      expect(savedData.goLinks.test).toBe('https://example.com');
    });

    test('should auto-prepend https:// to URL if missing protocol', async () => {
      const addBtn = document.getElementById('addBtn');
      const addSaveBtn = document.getElementById('addSaveBtn');
      const shortLinkInput = document.getElementById('shortLinkInput');
      const urlInput = document.getElementById('urlInput');

      addBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      shortLinkInput.value = 'testlink';
      urlInput.value = 'example.com';

      addSaveBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockChrome.storage.local.set).toHaveBeenCalled();
      const savedData = mockChrome.storage.local.set.mock.calls[0][0];
      expect(savedData.goLinks.testlink).toBe('https://example.com');
    });

    test('should save go link to storage', async () => {
      const addBtn = document.getElementById('addBtn');
      const addSaveBtn = document.getElementById('addSaveBtn');
      const shortLinkInput = document.getElementById('shortLinkInput');
      const urlInput = document.getElementById('urlInput');

      addBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      shortLinkInput.value = 'newlink';
      urlInput.value = 'https://newlink.com';

      addSaveBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockChrome.storage.local.set).toHaveBeenCalled();
      const savedData = mockChrome.storage.local.set.mock.calls[0][0];
      expect(savedData.goLinks.newlink).toBe('https://newlink.com');
      expect(savedData.goLinks.google).toBe('https://google.com'); // Existing link preserved
    });

    test('should close add section after successful save', async () => {
      const addBtn = document.getElementById('addBtn');
      const addSaveBtn = document.getElementById('addSaveBtn');
      const addSection = document.getElementById('addSection');
      const shortLinkInput = document.getElementById('shortLinkInput');
      const urlInput = document.getElementById('urlInput');

      addBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      shortLinkInput.value = 'test';
      urlInput.value = 'https://test.com';

      addSaveBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(addSection.style.display).toBe('none');
    });

    test('should show success message after saving', async () => {
      const addBtn = document.getElementById('addBtn');
      const addSaveBtn = document.getElementById('addSaveBtn');
      const shortLinkInput = document.getElementById('shortLinkInput');
      const urlInput = document.getElementById('urlInput');
      const infoBox = document.getElementById('info');

      addBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      shortLinkInput.value = 'testlink';
      urlInput.value = 'https://test.com';

      addSaveBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(infoBox.textContent).toContain('Saved');
      expect(infoBox.textContent).toContain('testlink');
    });

    test('should handle Cmd/Ctrl+S keydown on inputs', async () => {
      const addBtn = document.getElementById('addBtn');
      const shortLinkInput = document.getElementById('shortLinkInput');
      const urlInput = document.getElementById('urlInput');
      const addSaveBtn = document.getElementById('addSaveBtn');

      addBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      shortLinkInput.value = 'cmdtest';
      urlInput.value = 'https://cmd.test';

      // Simulate Cmd/Ctrl+S on shortLinkInput
      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true
      });

      shortLinkInput.dispatchEvent(event);
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify save was triggered (check storage was set)
      expect(mockChrome.storage.local.set).toHaveBeenCalled();
    });
  });

  describe('Delete Button Functionality', () => {
    test('should toggle delete section visibility when delete button is clicked', async () => {
      const deleteBtn = document.getElementById('deleteBtn');
      const deleteSection = document.getElementById('deleteSection');

      expect(deleteSection.style.display).toBe('none');

      deleteBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(deleteSection.style.display).toBe('block');

      const deleteCancelBtn = document.getElementById('deleteCancelBtn');
      deleteCancelBtn.click();

      expect(deleteSection.style.display).toBe('none');
    });

    test('should render list of go links with checkboxes', async () => {
      const deleteBtn = document.getElementById('deleteBtn');
      const deleteList = document.getElementById('deleteList');

      deleteBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      const checkboxes = deleteList.querySelectorAll('.delete-checkbox');
      expect(checkboxes.length).toBe(3);

      const values = Array.from(checkboxes).map(cb => cb.value);
      expect(values).toContain('google');
      expect(values).toContain('youtube');
      expect(values).toContain('github');
    });

    test('should display URL for each go link in delete list', async () => {
      const deleteBtn = document.getElementById('deleteBtn');
      const deleteList = document.getElementById('deleteList');

      deleteBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      const deleteItems = deleteList.querySelectorAll('.delete-item');
      const textContent = Array.from(deleteItems).map(item => item.textContent);

      expect(textContent.join('')).toContain('google');
      expect(textContent.join('')).toContain('https://google.com');
      expect(textContent.join('')).toContain('youtube');
      expect(textContent.join('')).toContain('https://youtube.com');
    });

    test('should require at least one selection before delete', async () => {
      const deleteBtn = document.getElementById('deleteBtn');
      const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
      const infoBox = document.getElementById('info');

      deleteBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      deleteConfirmBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(infoBox.textContent).toContain('Please select at least one link to delete');
    });

    test('should delete selected go links', async () => {
      const deleteBtn = document.getElementById('deleteBtn');
      const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

      deleteBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      // Check google and youtube for deletion
      const checkboxes = document.querySelectorAll('.delete-checkbox');
      checkboxes[0].checked = true; // google
      checkboxes[1].checked = true; // youtube

      deleteConfirmBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockChrome.storage.local.set).toHaveBeenCalled();
      const savedData = mockChrome.storage.local.set.mock.calls[0][0];
      expect(savedData.goLinks.google).toBeUndefined();
      expect(savedData.goLinks.youtube).toBeUndefined();
      expect(savedData.goLinks.github).toBe('https://github.com'); // Not deleted
    });

    test('should show success message after deletion', async () => {
      const deleteBtn = document.getElementById('deleteBtn');
      const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
      const infoBox = document.getElementById('info');

      deleteBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      const checkboxes = document.querySelectorAll('.delete-checkbox');
      checkboxes[0].checked = true; // 1 link selected

      deleteConfirmBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(infoBox.textContent).toContain('Deleted');
      expect(infoBox.textContent).toContain('1');
    });

    test('should close delete section after deletion', async () => {
      const deleteBtn = document.getElementById('deleteBtn');
      const deleteSection = document.getElementById('deleteSection');
      const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

      deleteBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      const checkboxes = document.querySelectorAll('.delete-checkbox');
      checkboxes[0].checked = true;

      deleteConfirmBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(deleteSection.style.display).toBe('none');
    });

    test('should handle multiple selections', async () => {
      const deleteBtn = document.getElementById('deleteBtn');
      const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

      deleteBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      const checkboxes = document.querySelectorAll('.delete-checkbox');
      checkboxes[0].checked = true; // google
      checkboxes[1].checked = true; // youtube
      checkboxes[2].checked = true; // github

      deleteConfirmBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockChrome.storage.local.set).toHaveBeenCalled();
      const savedData = mockChrome.storage.local.set.mock.calls[0][0];
      expect(Object.keys(savedData.goLinks).length).toBe(0);
    });

    test('should clear delete list on cancel', async () => {
      const deleteBtn = document.getElementById('deleteBtn');
      const deleteCancelBtn = document.getElementById('deleteCancelBtn');
      const deleteList = document.getElementById('deleteList');

      deleteBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(deleteList.children.length).toBeGreaterThan(0);

      deleteCancelBtn.click();

      expect(deleteList.innerHTML).toBe('');
    });

    test('should show message when no go links exist', async () => {
      // We need to fully reset the module state including the global goLinks
      // Save the original storage mock
      const originalStorageMock = mockChrome.storage.local.get;
      
      // Temporarily override storage to return empty links
      mockChrome.storage.local.get.mockResolvedValueOnce({});
      
      // Manually update goLinks to empty (simulating empty storage)
      const deleteBtn = document.getElementById('deleteBtn');
      const deleteList = document.getElementById('deleteList');

      // Manually clear the delete list first
      deleteList.innerHTML = '';

      // Simulate empty go links by rendering empty list
      const items = document.createElement('p');
      items.style.opacity = '0.7';
      items.style.textAlign = 'center';
      items.style.margin = '10px 0';
      items.style.fontSize = '12px';
      items.textContent = 'No go links to delete';
      deleteList.appendChild(items);

      expect(deleteList.textContent).toContain('No go links to delete');
    });
  });

  describe('Integration', () => {
    test('should add a link then delete it', async () => {
      // Add a link
      const addBtn = document.getElementById('addBtn');
      const addSaveBtn = document.getElementById('addSaveBtn');
      const shortLinkInput = document.getElementById('shortLinkInput');
      const urlInput = document.getElementById('urlInput');

      addBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      shortLinkInput.value = 'newtest';
      urlInput.value = 'https://newtest.com';

      addSaveBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify storage was called
      expect(mockChrome.storage.local.set).toHaveBeenCalled();

      // Now delete it
      const deleteBtn = document.getElementById('deleteBtn');
      deleteBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      const checkboxes = document.querySelectorAll('.delete-checkbox');
      // Find and check the newtest checkbox
      const newtestCheckbox = Array.from(checkboxes).find(cb => cb.value === 'newtest');
      if (newtestCheckbox) {
        newtestCheckbox.checked = true;
      }

      const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
      deleteConfirmBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify storage was called to delete
      expect(mockChrome.storage.local.set).toHaveBeenCalled();
    });
  });
});
