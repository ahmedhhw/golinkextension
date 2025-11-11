// Default go link mappings - used as fallback
const defaultGoLinks = {
  'google': 'https://google.com',
  'youtube': 'https://youtube.com'
};

// Parse text format from editor (key:value per line)
function parseEditorText(editorContent) {
  const content = editorContent.trim();
  
  if (!content) {
    throw new Error('Editor is empty');
  }
  
  const links = {};
  const lines = content.split('\n');
  
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

// Format go links to text format (key:value)
function formatGoLinksToText(goLinks) {
  const lines = Object.entries(goLinks).map(([key, value]) => `${key}:${value}`);
  return lines.join('\n');
}

// Validate go link name
function validateGoLinkName(name) {
  if (!name || typeof name !== 'string') {
    return false;
  }
  const trimmed = name.trim();
  return trimmed.length > 0;
}

// Validate URL
function validateURL(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  defaultGoLinks,
  parseEditorText,
  formatGoLinksToText,
  validateGoLinkName,
  validateURL
};

