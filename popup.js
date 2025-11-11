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

