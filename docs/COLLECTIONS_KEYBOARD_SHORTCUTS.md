# Collections Page - Keyboard Shortcuts Guide

## Overview
The collections management page now includes comprehensive keyboard navigation for both browsing collections and reordering records within them.

## Collection Navigation (Sidebar)

### Shortcuts
- **↑ (Arrow Up)**: Move focus to previous collection
- **↓ (Arrow Down)**: Move focus to next collection  
- **Enter**: Select the focused collection and load its records

### How to Use
1. Click anywhere in the collections sidebar to activate keyboard navigation
2. Use arrow keys to navigate through your collections
3. Press Enter to select and view a collection's records
4. Visual indicator shows "(↑↓ + Enter)" in the sidebar header

### Notes
- Arrow keys won't work when typing in search boxes or text inputs
- Focus automatically scrolls to keep the selected collection visible
- Works seamlessly with collection search/filtering

## Record Reordering (Table)

### Shortcuts
- **Shift + ↑ (Shift + Arrow Up)**: Move selected record(s) up one position
- **Shift + ↓ (Shift + Arrow Down)**: Move selected record(s) down one position

### How to Use
1. Select one or more records using checkboxes
2. Press Shift + Up/Down arrows to adjust positions
3. Visual indicator shows "(Shift + ↑↓)" in the selection bar
4. Works on multiple selected records simultaneously

### Notes
- Must have at least one record selected
- Won't work when typing in search boxes or text inputs
- Complements the mouse-based drag-and-drop functionality
- Button tooltips also show keyboard shortcuts: "Move selected up (Shift+↑)"

## Sidebar Resizing

### Mouse Control
- **Drag**: Click and drag the blue resize handle between sidebar and table
- **Visual Feedback**: Cursor changes to ⟷ (col-resize) during drag

### Keyboard Control
- **← (Left Arrow)**: Decrease sidebar width by 5%
- **→ (Right Arrow)**: Increase sidebar width by 5%
- **Focus Required**: Click the resize handle button first

### Constraints
- Minimum width: 15%
- Maximum width: 45%
- Defaults to: 25%

## Combined Workflow Example

```
1. User opens collections page
   ├─→ Press ↓ to browse collections
   ├─→ Press Enter to select "My Favorites"
   └─→ Records load automatically

2. User wants to reorder records
   ├─→ Click checkboxes to select records #5, #6, #7
   ├─→ Press Shift+↑ three times
   └─→ Records move to positions #2, #3, #4

3. User needs more sidebar space
   ├─→ Click resize handle (or press Tab until focused)
   ├─→ Press → arrow key 2 times
   └─→ Sidebar expands from 25% to 35%
```

## Accessibility Features

- **Keyboard-only navigation**: All features work without a mouse
- **Visual indicators**: Clear labels show available shortcuts
- **Focus management**: Auto-scroll keeps focused items visible
- **ARIA attributes**: Resize handle has proper role and labels
- **Tooltip hints**: Buttons show keyboard shortcuts on hover

## Technical Implementation

### Event Handling
- Single `keydown` listener on document
- Respects input/textarea focus (doesn't interfere with typing)
- Uses `preventDefault()` to avoid browser scroll conflicts
- Conditional logic based on active element location

### State Management
- `focusedCollectionIndex`: Tracks which collection has keyboard focus
- `selectedRecords`: Array of record IDs for batch operations
- `sidebarWidth`: Percentage width for responsive resizing
- `isResizing`: Boolean flag for resize drag mode

### Performance
- Debounced resize calculations
- useCallback for event handlers
- Conditional rendering prevents unnecessary updates
- Refs for DOM access without re-renders

## Browser Compatibility

- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ⚠️ Mobile: Touch-based alternatives (no keyboard)

## Future Enhancements

Potential additions based on user feedback:
- **Ctrl+A**: Select all records
- **Escape**: Clear selection
- **Home/End**: Jump to first/last collection
- **Page Up/Down**: Navigate records table
- **Tab**: Cycle through sidebar → resize → table
- **Ctrl+Z**: Undo last reorder operation

## Related Documentation

- `COLLECTIONS_LAYOUT_IMPROVEMENTS.md` - Overall UI enhancements
- `COLLECTIONS_BUGFIXES.md` - Fixed issues and solutions
- `COLLECTIONS_QUICK_GUIDE.md` - Visual user guide
- `COLLECTIONS_LONG_LISTS_IMPROVEMENTS.md` - Infinite scroll implementation
