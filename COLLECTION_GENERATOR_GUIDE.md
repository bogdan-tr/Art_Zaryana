# Collection Generator Usage Guide

## Overview
The `generate-collections.js` script makes creating and managing art collections easy. It automatically moves artworks from the main gallery to dedicated collection pages.

## Features
- ✅ Create new collections with custom names and descriptions
- ✅ Add existing artworks to collections (automatically removes from main gallery)
- ✅ Customizable backgrounds and overlay colors for each collection
- ✅ Uses consistent styling with `collections.css`
- ✅ Automatic backup protection for `index.html`
- ✅ Collection tracking in `collections.json`

## Usage

### Run the Script
```bash
node generate-collections.js
```

### Options
1. **Create a new collection** - Set up a brand new collection
2. **Add artworks to existing collection** - Move artworks from main gallery to collection
3. **List existing collections** - View all created collections
4. **Exit** - Close the script

### Creating a New Collection
1. Select option 1
2. Enter collection name
3. Enter collection description
4. Specify HTML filename (without .html)
5. Choose background image (default: `collection_bgs/stole-3419985_1920.jpg`)
6. Choose background overlay color (default: `rgba(64, 0, 109, 0.8)`)
7. Optionally add artworks immediately

### Adding Artworks to Collections
1. Select option 2
2. Choose from existing collections
3. Select artworks by number (comma-separated)
4. Script automatically:
   - Adds artworks to collection HTML
   - Removes artworks from main gallery (`index.html`)
   - Updates collection data

## File Structure
```
collections/
├── collection-name.html          # Collection pages
├── collections.css               # Shared styling
├── collection_bgs/              # Background images
│   └── stole-3419985_1920.jpg
└── collections.json             # Collection metadata
```

## Background Images
Place custom background images in `collections/collection_bgs/`. Supported formats: JPG, PNG, WEBP

## Safety Features
- Automatic backup of `index.html` before any changes
- Validation that artwork files exist
- Confirmation prompts before overwriting existing files
- Error handling with clear messages

## Example Workflow
1. Run script: `node generate-collections.js`
2. Create new collection: "Abstract Nature Series"
3. Add 3 existing artworks to the collection
4. Artworks automatically moved from main gallery to collection
5. Collection appears as new page at `collections/abstract-nature-series.html`

## Notes
- All collections use the same CSS for consistency
- Background styles are customizable per collection
- Artwork paths are automatically corrected for collection pages
- The script validates all file operations before execution