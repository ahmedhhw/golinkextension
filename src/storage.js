// Load go links from Chrome storage
async function loadGoLinksFromStorage(chromeStorage, defaultGoLinks) {
  try {
    const result = await chromeStorage.local.get(['goLinks']);
    if (result.goLinks && Object.keys(result.goLinks).length > 0) {
      return result.goLinks;
    } else {
      // If no stored links, use defaults and save them
      await chromeStorage.local.set({ goLinks: defaultGoLinks });
      return defaultGoLinks;
    }
  } catch (error) {
    console.error('Error loading go links from storage:', error);
    return defaultGoLinks;
  }
}

// Save go links to Chrome storage
async function saveGoLinksToStorage(chromeStorage, links) {
  try {
    await chromeStorage.local.set({ goLinks: links });
    return true;
  } catch (error) {
    console.error('Error saving go links to storage:', error);
    throw error;
  }
}

module.exports = {
  loadGoLinksFromStorage,
  saveGoLinksToStorage
};

