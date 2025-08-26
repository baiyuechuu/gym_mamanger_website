# Scripts Structure

This directory contains all JavaScript files organized into clean, simple modules.

## File Structure

```
scripts/
├── app.js                      # Main application entry point
├── theme-manager.js            # Theme switching functionality
├── core/
│   └── router.js              # Core routing and navigation
└── features/
    ├── data-manager.js        # Data loading and management
    ├── search-manager.js      # Search functionality
    ├── pagination-manager.js  # Pagination controls
    ├── modal-manager.js       # Add member modal
    ├── overview-manager.js    # Overview page logic
    └── user-detail-manager.js # User detail page logic
```

## Module Responsibilities

### Core Modules
- **app.js**: Application initialization and global setup
- **theme-manager.js**: Dark/light theme switching
- **core/router.js**: URL routing and page navigation

### Feature Modules
- **data-manager.js**: Handles all data operations (load, save, filter)
- **search-manager.js**: Search input handling and filtering
- **pagination-manager.js**: Page navigation controls
- **modal-manager.js**: Add member form and validation
- **overview-manager.js**: Overview page coordination
- **user-detail-manager.js**: User detail page display

## Design Principles

1. **Single Responsibility**: Each file has one clear purpose
2. **Small Files**: Easy to read and maintain
3. **Clear Dependencies**: Modules depend on each other logically
4. **Simple Structure**: No complex inheritance or patterns
5. **Reusable Components**: Managers can be used independently

## Loading Order

Files are loaded in dependency order in `index.html`:
1. Data and utility modules first
2. Feature modules next
3. Core router
4. Theme manager
5. Main app last