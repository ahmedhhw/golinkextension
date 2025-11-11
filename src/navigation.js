// Function to navigate to go link
async function navigateToGoLink(goLinks, shortLink, chromeTabs, chromeWindows) {
  const trimmedLink = shortLink.trim().toLowerCase();
  
  if (!trimmedLink) {
    return { success: false, message: 'Please enter a go link' };
  }
  
  // Check if the go link exists
  if (goLinks[trimmedLink]) {
    try {
      // Get the active tab
      const [tab] = await chromeTabs.query({ active: true, currentWindow: true });
      
      // Navigate to the URL
      await chromeTabs.update(tab.id, { url: goLinks[trimmedLink] });
      
      return { success: true, url: goLinks[trimmedLink] };
    } catch (error) {
      console.error('Error:', error);
      return { success: false, message: `Error: Could not navigate to ${goLinks[trimmedLink]}` };
    }
  } else {
    const availableLinks = Object.keys(goLinks).join(', ');
      return { 
      success: false, 
      message: `Go link "${trimmedLink}" not found. Available: ${availableLinks || 'none'}` 
    };
  }
}

module.exports = {
  navigateToGoLink
};

