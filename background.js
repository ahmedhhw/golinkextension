// Default go link mappings - used as fallback
const defaultGoLinks = {
  'google': 'https://google.com',
  'youtube': 'https://youtube.com'
};

// Load go links from Chrome storage
async function loadGoLinksFromStorage() {
  try {
    const result = await chrome.storage.local.get(['goLinks']);
    if (result.goLinks && Object.keys(result.goLinks).length > 0) {
      return result.goLinks;
    } else {
      // If no stored links, use defaults and save them
      await chrome.storage.local.set({ goLinks: defaultGoLinks });
      return defaultGoLinks;
    }
  } catch (error) {
    console.error('Error loading go links from storage:', error);
    return defaultGoLinks;
  }
}

// Handle omnibox input from address bar
chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  const goLinks = await loadGoLinksFromStorage();
  const trimmedText = text.trim().toLowerCase();
  
  try {
    // If input is empty, show top links
    const keys = Object.keys(goLinks || {});
    let matched = [];

    if (!trimmedText) {
      matched = keys.slice(0, 5);
    } else {
      // Prioritize startsWith matches, then includes matches
      const starts = keys.filter(key => key.startsWith(trimmedText));
      const includes = keys.filter(key => !key.startsWith(trimmedText) && key.includes(trimmedText));
      matched = starts.concat(includes).slice(0, 5);
    }

    const suggestions = matched.map(key => ({
      content: key,
      description: `${key} → ${goLinks[key]}`
    }));

    // If we have at least one suggestion, set a default suggestion so Chrome may show inline hinting
    if (suggestions.length > 0) {
      const first = suggestions[0];
      try {
        chrome.omnibox.setDefaultSuggestion({ description: `Autocomplete: ${first.description}` });
      } catch (err) {
        // setDefaultSuggestion may throw in some environments; ignore safely
        console.warn('setDefaultSuggestion failed:', err);
      }
    } else {
      // Clear default suggestion when none
      try { chrome.omnibox.setDefaultSuggestion({ description: '' }); } catch (e) {}
    }

    suggest(suggestions);
  } catch (err) {
    console.error('Error while preparing omnibox suggestions:', err);
    suggest([]);
  }
});

// Handle when user selects a suggestion or presses Enter
chrome.omnibox.onInputEntered.addListener(async (text, disposition) => {
  try {
    const goLinks = await loadGoLinksFromStorage();
    const trimmedText = text.trim().toLowerCase();
    
    // Check if the go link exists
    if (goLinks[trimmedText]) {
      const url = goLinks[trimmedText];
      
      // Determine how to open the URL based on disposition
      try {
        switch (disposition) {
          case 'currentTab':
            await chrome.tabs.update({ url: url });
            break;
          case 'newForegroundTab':
            await chrome.tabs.create({ url: url });
            break;
          case 'newBackgroundTab':
            await chrome.tabs.create({ url: url, active: false });
            break;
          default:
            await chrome.tabs.update({ url: url });
        }
      } catch (error) {
        console.error(`Error navigating to ${url}:`, error);
      }
    } else {
      // If not found, show error in console (we can't show UI from background)
      console.error(`Go link "${trimmedText}" not found. Available: ${Object.keys(goLinks).join(', ')}`);
    }
  } catch (error) {
    console.error('Error in omnibox input entered handler:', error);
  }
});

