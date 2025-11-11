# Go Link Navigator

A Chrome extension that allows you to quickly navigate to websites using short go links. Type a short link and press Enter to navigate instantly.

## Features

- **Quick Navigation**: Enter a short link (e.g., "google") and press Enter to navigate to the full URL
- **Address Bar Autocomplete**: Type "go" in the address bar followed by your go link for instant suggestions and navigation with autocomplete hints
- **Add Go Links Easily**: Click the "Add" button to quickly create new go links with auto-prefilled current page URL
- **Delete Go Links**: Click the "Delete" button to select and remove multiple go links at once
- **In-Place Text Editor**: Edit go links directly in the popup using a simple text format
- **Auto-focus**: Input field is automatically focused when the popup opens
- **Chrome Storage**: Go links are automatically saved to Chrome's local storage and persist across sessions
- **Keyboard Shortcuts**: Press Ctrl+S (or Cmd+S on Mac) to save your changes in any context
- **Dark Theme**: Modern dark color scheme for comfortable viewing

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `my-first-extension` folder
5. The extension icon should now appear in your Chrome toolbar

## Usage

### Navigating with Go Links

#### Method 1: Using the Address Bar (Recommended)

1. Click in Chrome's address bar (omnibox)
2. Type `go` followed by a space and your go link (e.g., `go google` or `go youtube`)
3. You'll see autocomplete suggestions showing matching go links with their URLs
4. Press Enter or click a suggestion to navigate to the associated URL
5. Use Ctrl/Cmd+Enter to open in a new tab, Shift+Enter for background tab (standard browser behavior)

#### Method 2: Using the Extension Popup

1. Click the extension icon in your Chrome toolbar
2. Type a go link (e.g., "google" or "youtube") in the input field
3. Press Enter to navigate to the associated URL in the current tab

### Adding New Go Links

#### Quick Add via Button

1. Click the extension icon in your Chrome toolbar
2. Click the **"Add"** button to open the add form
3. The URL field is automatically pre-filled with the current page's URL (you can edit it)
4. Enter a short link name (e.g., "mysite") in the "Short link" field
5. Edit the URL if needed
6. Click **"Save"** or press Ctrl+S (Cmd+S on Mac) to save the new go link
7. The new go link is immediately available in the address bar and popup

#### Editing Multiple Go Links

1. Click the extension icon in your Chrome toolbar
2. Click the "Edit" button to open the editor
3. Edit the go links directly in the textarea using the format `key:value` (one per line)
4. Click the "Save" button (or press Ctrl+S / Cmd+S) to save your changes
5. The go links will be validated and saved to Chrome storage
6. Click "Close" to hide the editor

### Deleting Go Links

1. Click the extension icon in your Chrome toolbar
2. Click the **"Delete"** button to open the delete interface
3. You'll see a list of all your go links with their URLs
4. Check the boxes next to the go links you want to delete
5. Click **"Delete Selected"** to confirm and remove them
6. The deleted links are immediately removed and no longer available
7. Click "Cancel" to close without deleting

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

## Development

### Running Tests

This project includes comprehensive unit tests. To run them:

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The test suite includes:
- **Background Script Tests**: Omnibox suggestion and navigation logic
- **Popup UI Tests**: Add button, delete button, and form interactions
- **Go Link Tests**: Parsing, formatting, and validation
- **Storage Tests**: Chrome storage operations
- **Navigation Tests**: URL navigation functionality
- **Integration Tests**: End-to-end workflows

Total: **88+ unit tests** with comprehensive mocking of Chrome APIs

### Project Structure

```
my-first-extension/
├── manifest.json      # Extension configuration
├── popup.html         # Popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup functionality
├── background.js      # Background service worker (omnibox handler)
├── src/               # Source modules (testable code)
│   ├── goLinks.js     # Go link parsing and formatting
│   ├── storage.js     # Chrome storage operations
│   └── navigation.js  # Navigation functionality
├── tests/             # Unit tests
│   ├── setup.js       # Test setup and mocks
│   ├── goLinks.test.js
│   ├── storage.test.js
│   ├── navigation.test.js
│   └── integration.test.js
├── go-links.json      # Example JSON file (for reference)
├── go-links.txt       # Example text file (for reference)
├── icons/             # Extension icons (create your own)
└── README.md          # This file
```

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

### Quick Add via Button

1. Click the **"Add"** button in the popup
2. The URL field automatically shows the current page's URL (editable)
3. Enter your short link name
4. Edit the URL if needed
5. Press Ctrl+S / Cmd+S or click "Save"

### Edit Multiple in Text Editor

1. Click the **"Edit"** button
2. Modify the `key:value` format entries
3. Press Ctrl+S / Cmd+S or click "Save"
4. Changes validate automatically

### Delete Go Links

1. Click the **"Delete"** button
2. Check the boxes for links to remove
3. Click **"Delete Selected"** to confirm

## Keyboard Shortcuts

- **Ctrl+S / Cmd+S**: Save when editing or adding go links (works in both Edit and Add forms)
- **Enter**: Navigate to a go link in the popup or address bar
- **Ctrl/Cmd+Enter**: Open in new tab (standard browser behavior in address bar)
- **Shift+Enter**: Open in background tab (standard browser behavior in address bar)

## Testing

The project includes comprehensive unit tests covering:
- **Omnibox Integration**: Address bar suggestion matching, autocomplete, and navigation
- **Add Button**: Form toggle, URL prefill, validation, Cmd+S keyboard shortcut, and storage
- **Delete Button**: List rendering, selection, deletion, and cleanup
- **Go Link Operations**: Parsing, formatting, and validation
- **Storage Operations**: Loading, saving, and persistence
- **Navigation**: Tab updates and URL handling
- **Error Handling**: Invalid inputs, storage failures, and edge cases
- **Integration**: Multi-step workflows and end-to-end scenarios

All tests use Jest with comprehensive mocking of Chrome APIs (storage, tabs, omnibox).

## Default Go Links

The extension comes with these default go links:
- `google` → https://google.com
- `youtube` → https://youtube.com

These are automatically saved to Chrome storage on first use. You can edit, add, or delete them using the extension UI.

## Next Steps

You can extend this extension by:
- Adding an options page for advanced go link management
- Exporting/importing go links as JSON
- Creating custom keyboard shortcuts
- Adding search and filtering in the delete UI
- Implementing go link categories or groups
- Adding usage statistics or most-used go links
