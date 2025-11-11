# Go Link Navigator

A Chrome extension that allows you to quickly navigate to websites using short go links. Type a short link and press Enter to navigate instantly.

## Features

- **Quick Navigation**: Enter a short link (e.g., "google") and press Enter to navigate to the full URL
- **In-Place Text Editor**: Edit go links directly in the popup using a simple text format
- **Auto-focus**: Input field is automatically focused when the popup opens
- **Chrome Storage**: Go links are automatically saved to Chrome's local storage and persist across sessions
- **Keyboard Shortcuts**: Press Ctrl+S (or Cmd+S on Mac) to save your changes

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `my-first-extension` folder
5. The extension icon should now appear in your Chrome toolbar

## Usage

### Navigating with Go Links

1. Click the extension icon in your Chrome toolbar
2. Type a go link (e.g., "google" or "youtube") in the input field
3. Press Enter to navigate to the associated URL in the current tab

### Editing Go Links

1. Click the extension icon in your Chrome toolbar
2. Click the "Edit" button to open the editor
3. Edit the go links directly in the textarea using the format `key:value` (one per line)
4. Click the "Save" button (or press Ctrl+S / Cmd+S) to save your changes
5. The go links will be validated and saved to Chrome storage
6. Click "Close" to hide the editor

### Text Format

The go links are edited in a simple text format:
- Format: `key:value` (one go link per line)
- **Key** is the short go link name (e.g., "google", "youtube")
- **Value** is the full URL (e.g., "https://google.com")
- Empty lines are ignored

Example:
```
google:https://google.com
youtube:https://youtube.com
github:https://github.com
stackoverflow:https://stackoverflow.com
```

The editor automatically loads your saved go links when you open the popup, and displays them in this format.

## Default Go Links

The extension comes with these default go links:
- `google` → https://google.com
- `youtube` → https://youtube.com

These are automatically saved to Chrome storage on first use. You can edit them directly in the text editor.

## Project Structure

```
my-first-extension/
├── manifest.json      # Extension configuration
├── popup.html         # Popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup functionality
├── go-links.json      # Example JSON file (for reference)
├── go-links.txt       # Example text file (for reference)
├── icons/             # Extension icons (create your own)
└── README.md          # This file
```

## Creating Icons

You'll need to create icon files for the extension:
- `icons/icon16.png` (16x16 pixels)
- `icons/icon48.png` (48x48 pixels)
- `icons/icon128.png` (128x128 pixels)

You can use any image editor or online tool to create these icons. For now, you can use placeholder images or remove the icon references from `manifest.json` if you want to test without icons.

## Development

To modify the extension:
1. Make your changes to the files
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension card
4. Test your changes

## Permissions

This extension uses:
- `activeTab`: Allows the extension to access the currently active tab
- `tabs`: Allows the extension to update tabs and navigate to URLs
- `storage`: Allows the extension to save and load go links from Chrome's local storage

## How It Works

1. **On First Load**: The extension loads default go links and saves them to Chrome storage
2. **On Subsequent Loads**: The extension loads go links from Chrome storage and displays them in the text editor
3. **When Editing**: 
   - Edit the go links in the format `key:value` (one per line)
   - Click "Save" or press Ctrl+S (Cmd+S on Mac) to save
   - The extension validates the format and all URLs before saving
4. **Storage Persistence**: Go links persist across browser sessions and extension reloads

## Adding More Go Links

### Edit in the Text Editor

1. Open the extension popup
2. Click the "Edit" button to open the editor
3. Add your new go links using the format `key:value` (one per line)
4. Click "Save" or press Ctrl+S (Cmd+S on Mac)
5. Your changes will be validated and saved automatically
6. Click "Close" to hide the editor when done

Example - adding a new go link:
```
google:https://google.com
youtube:https://youtube.com
github:https://github.com
```

### Edit Default Links

You can edit the `defaultGoLinks` object in `popup.js` to change the default go links that are loaded on first use.

## Next Steps

You can extend this extension by:
- Adding an options page to manage go links through a UI
- Adding the ability to export go links to a JSON file
- Creating a background service worker for additional functionality
- Adding keyboard shortcuts for quick access
- Implementing go link search/autocomplete

