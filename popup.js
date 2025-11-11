// Default go link mappings - used as fallback
const defaultGoLinks = {
  'google': 'https://google.com',
  'youtube': 'https://youtube.com'
};

// Current go links (loaded from storage)
let goLinks = { ...defaultGoLinks };

// Get references to DOM elements
const goLinkInput = document.getElementById('goLinkInput');
const infoBox = document.getElementById('info');
const goLinksEditor = document.getElementById('goLinksEditor');
const saveBtn = document.getElementById('saveBtn');
const editBtn = document.getElementById('editBtn');
const editorSection = document.getElementById('editorSection');
const hintText = document.getElementById('hintText');
const addBtn = document.getElementById('addBtn');
const addSection = document.getElementById('addSection');
const shortLinkInput = document.getElementById('shortLinkInput');
const urlInput = document.getElementById('urlInput');
const addSaveBtn = document.getElementById('addSaveBtn');
const addCancelBtn = document.getElementById('addCancelBtn');
const deleteBtn = document.getElementById('deleteBtn');
const deleteSection = document.getElementById('deleteSection');
const deleteList = document.getElementById('deleteList');
const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
const deleteCancelBtn = document.getElementById('deleteCancelBtn');

// Load go links from Chrome storage on startup
async function loadGoLinksFromStorage() {
  try {
    const result = await chrome.storage.local.get(['goLinks']);
    if (result.goLinks && Object.keys(result.goLinks).length > 0) {
      goLinks = result.goLinks;
      updateEditor();
      updateHintText();
      console.log('Go links loaded from storage:', goLinks);
    } else {
      // If no stored links, use defaults and save them
      goLinks = { ...defaultGoLinks };
      await chrome.storage.local.set({ goLinks: goLinks });
      updateEditor();
      updateHintText();
    }
  } catch (error) {
    console.error('Error loading go links from storage:', error);
    goLinks = { ...defaultGoLinks };
    updateEditor();
    updateHintText();
  }
}

// Update the editor with current go links in text format (key:value)
function updateEditor() {
  const lines = Object.entries(goLinks).map(([key, value]) => `${key}:${value}`);
  goLinksEditor.value = lines.join('\n');
}

// Update hint text to show available go links
function updateHintText() {
  const linkKeys = Object.keys(goLinks);
  if (linkKeys.length > 0) {
    const hintLinks = linkKeys.slice(0, 3).map(key => 
      `<span class="hint-link">${key}</span>`
    ).join(', ');
    hintText.innerHTML = `Try: ${hintLinks}${linkKeys.length > 3 ? '...' : ''}`;
  }
}

// Save go links to Chrome storage
async function saveGoLinksToStorage(links) {
  try {
    await chrome.storage.local.set({ goLinks: links });
    goLinks = links;
    updateHintText();
    console.log('Go links saved to storage:', links);
  } catch (error) {
    console.error('Error saving go links to storage:', error);
    throw error;
  }
}

// Parse text format from editor (key:value per line)
function parseEditorText() {
  const editorContent = goLinksEditor.value.trim();
  
  if (!editorContent) {
    throw new Error('Editor is empty');
  }
  
  const links = {};
  const lines = editorContent.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      continue;
    }
    
    // Parse format: key:value
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      throw new Error(`Invalid format on line ${i + 1}: missing colon separator`);
    }
    
    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();
    
    if (!key) {
      throw new Error(`Invalid format on line ${i + 1}: missing key`);
    }
    
    if (!value) {
      throw new Error(`Invalid format on line ${i + 1}: missing URL`);
    }
    
    // Validate URL
    try {
      new URL(value);
    } catch {
      throw new Error(`Invalid URL on line ${i + 1}: "${value}"`);
    }
    
    links[key.toLowerCase()] = value;
  }
  
  if (Object.keys(links).length === 0) {
    throw new Error('No valid go links found');
  }
  
  return links;
}

// Toggle editor visibility
function toggleEditor() {
  const isVisible = editorSection.style.display !== 'none';
  if (isVisible) {
    editorSection.style.display = 'none';
    editBtn.textContent = 'Edit';
  } else {
    editorSection.style.display = 'block';
    editBtn.textContent = 'Close';
    updateEditor(); // Refresh editor content when opening
  }
}

// Edit button click handler
editBtn.addEventListener('click', () => {
  toggleEditor();
});

// Toggle add section visibility
function toggleAddSection(show = null) {
  const isVisible = addSection.style.display !== 'none';
  const shouldShow = show === null ? !isVisible : !!show;
  if (shouldShow) {
    addSection.style.display = 'block';
    // Prefill the URL with the current active tab's URL
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs && tabs[0];
        if (tab && tab.url) {
          urlInput.value = tab.url;
        } else {
          urlInput.value = '';
        }
      });
    } catch (err) {
      // Fallback for environments where callback API isn't available
      try {
        (async () => {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          urlInput.value = tab ? tab.url || '' : '';
        })();
      } catch (e) {
        urlInput.value = '';
      }
    }
    shortLinkInput.value = '';
    shortLinkInput.focus();
  } else {
    addSection.style.display = 'none';
  }
}

addBtn.addEventListener('click', () => {
  toggleAddSection(true);
});

addCancelBtn.addEventListener('click', () => {
  toggleAddSection(false);
});

// Save button click handler
saveBtn.addEventListener('click', async () => {
  try {
    const parsedLinks = parseEditorText();
    await saveGoLinksToStorage(parsedLinks);
    updateEditor(); // Refresh editor to show saved format
    showInfo(`Successfully saved ${Object.keys(parsedLinks).length} go link(s)!`);
  } catch (error) {
    console.error('Error saving go links:', error);
    showInfo(`Error: ${error.message}`);
  }
});

// Add Save handler - saves a single go link
addSaveBtn.addEventListener('click', async () => {
  const shortKey = (shortLinkInput.value || '').trim().toLowerCase();
  let urlValue = (urlInput.value || '').trim();

  if (!shortKey) {
    showInfo('Please enter a short link name');
    return;
  }

  if (!urlValue) {
    showInfo('Please enter a URL');
    return;
  }

  // Ensure URL is valid. If missing protocol, try to prepend https://
  try {
    new URL(urlValue);
  } catch (e) {
    // try adding https://
    try {
      urlValue = 'https://' + urlValue;
      new URL(urlValue);
    } catch (err) {
      showInfo('Invalid URL');
      return;
    }
  }

  try {
    // Merge into current goLinks and persist
    const newLinks = { ...goLinks };
    newLinks[shortKey] = urlValue;
    await saveGoLinksToStorage(newLinks);
    updateEditor();
    showInfo(`Saved ${shortKey} → ${urlValue}`);
    toggleAddSection(false);
  } catch (error) {
    console.error('Error saving new go link:', error);
    showInfo('Error saving new go link');
  }
});

// Allow Cmd/Ctrl+S to trigger Save when focus is in the add form inputs
try {
  // If inputs exist, attach keydown listeners
  if (shortLinkInput && urlInput) {
    [shortLinkInput, urlInput].forEach((el) => {
      el.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === 's') {
          e.preventDefault();
          addSaveBtn.click();
        }
      });
    });
  }
} catch (err) {
  // Silently ignore in test environments if DOM elements are not present
  console.warn('Could not attach Cmd/Ctrl+S handler for add form:', err);
}

// Toggle delete section visibility and render go links list
function toggleDeleteSection(show = null) {
  const isVisible = deleteSection.style.display !== 'none';
  const shouldShow = show === null ? !isVisible : !!show;
  
  if (shouldShow) {
    deleteSection.style.display = 'block';
    renderDeleteList();
  } else {
    deleteSection.style.display = 'none';
    deleteList.innerHTML = '';
  }
}

// Render the list of go links with checkboxes in the delete section
function renderDeleteList() {
  deleteList.innerHTML = '';
  const links = Object.entries(goLinks);
  
  if (links.length === 0) {
    deleteList.innerHTML = '<p style="opacity: 0.7; text-align: center; margin: 10px 0; font-size: 12px;">No go links to delete</p>';
    return;
  }
  
  links.forEach(([key, url]) => {
    const item = document.createElement('div');
    item.className = 'delete-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = key;
    checkbox.className = 'delete-checkbox';
    
    const label = document.createElement('label');
    label.className = 'delete-item-label';
    label.innerHTML = `<strong>${key}</strong><br><span class="delete-url">${url}</span>`;
    
    item.appendChild(checkbox);
    item.appendChild(label);
    deleteList.appendChild(item);
  });
}

deleteBtn.addEventListener('click', () => {
  toggleDeleteSection(true);
});

deleteCancelBtn.addEventListener('click', () => {
  toggleDeleteSection(false);
});

deleteConfirmBtn.addEventListener('click', async () => {
  const checkboxes = Array.from(document.querySelectorAll('.delete-checkbox'));
  const selectedKeys = checkboxes.filter(cb => cb.checked).map(cb => cb.value);
  
  if (selectedKeys.length === 0) {
    showInfo('Please select at least one link to delete');
    return;
  }
  
  try {
    // Create new links object without deleted keys
    const newLinks = { ...goLinks };
    selectedKeys.forEach(key => {
      delete newLinks[key];
    });
    
    await saveGoLinksToStorage(newLinks);
    updateEditor();
    showInfo(`Deleted ${selectedKeys.length} go link(s)`);
    toggleDeleteSection(false);
  } catch (error) {
    console.error('Error deleting go links:', error);
    showInfo('Error deleting go links');
  }
});

// Initialize: Load go links from storage when popup opens
loadGoLinksFromStorage();

// Auto-save on Ctrl+S or Cmd+S
goLinksEditor.addEventListener('keydown', async (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveBtn.click();
  }
});

// Function to navigate to go link
async function navigateToGoLink(shortLink) {
  const trimmedLink = shortLink.trim().toLowerCase();
  
  if (!trimmedLink) {
    showInfo('Please enter a go link');
    return;
  }
  
  // Check if the go link exists
  if (goLinks[trimmedLink]) {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Navigate to the URL
      await chrome.tabs.update(tab.id, { url: goLinks[trimmedLink] });
      
      // Close the popup
      window.close();
    } catch (error) {
      console.error('Error:', error);
      showInfo(`Error: Could not navigate to ${goLinks[trimmedLink]}`);
    }
  } else {
    const availableLinks = Object.keys(goLinks).join(', ');
    showInfo(`Go link "${trimmedLink}" not found. Available: ${availableLinks || 'none'}`);
  }
}

// Listen for Enter key press
goLinkInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    navigateToGoLink(goLinkInput.value);
  }
});

// Function to display information in the info box
function showInfo(message) {
  infoBox.innerHTML = `<p>${message}</p>`;
  infoBox.classList.add('show');
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    infoBox.classList.remove('show');
  }, 3000);
}

// Initialize: Load go links from storage when popup opens
loadGoLinksFromStorage();

