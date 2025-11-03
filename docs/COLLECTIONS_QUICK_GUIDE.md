# Collections Page - Quick Reference Guide

## Layout Improvements at a Glance

### Sidebar Toggle
```
┌─────────────────────────────────────────────┐
│ Before: Fixed 25% width sidebar             │
│ After:  25-33% readable, collapsible sidebar│
│                                             │
│ Click [←] to collapse for full-width view  │
│ Click [→] to expand sidebar back           │
│                                             │
│ Collection names are now fully visible!    │
└─────────────────────────────────────────────┘
```

### New Collection (Now Modal!)
```
Click "New Collection" button:

┌─────────────────────────────────────────────┐
│ Create New Collection                    [X]│
├─────────────────────────────────────────────┤
│                                             │
│  Name: [___________________________]        │
│  Description: [___________________]         │
│  Public: [Private ▼]                        │
│  Subjects: [_________________] [+ Add]      │
│                                             │
│               [Cancel]  [Create]            │
└─────────────────────────────────────────────┘

✓ Close with X button
✓ Close with Cancel button
✓ Closes automatically after creation
```

### Selection Bar (When Items Selected)

**Before:**
```
[3 selected] [Clear] [Top] [Bottom] [↑] [↓] [Move after: ▼]
Tip: You can also drag and drop...
```

**After:**
```
┌──────────────────────────────────────────────────────────────┐
│ 3 selected [Clear Selection]                                 │
│                                                               │
│ Move to: [↑ Top] [↓ Bottom] | Adjust: [↑ Up] [↓ Down] |     │
│ [After specific item... ▼]                                   │
│                                                               │
│ 🔹 Drag items or use checkboxes to select multiple...        │
└──────────────────────────────────────────────────────────────┘
```

### Sorting Controls

**Before:**
```
Sort by: [Default Order ▼]        3 selected   ⚠️ Unsaved changes [Reset] [Apply Changes]
```

**After:**
```
┌────────────────────────────────────────────────────────────┐
│ Sort: [Default Order ▼]    ⚠️ Unsaved changes [Reset] [✓ Save Order] │
└────────────────────────────────────────────────────────────┘
```

### Table Header (Now Sticky!)

**Before:** Header scrolls away
```
□  Drag  Move  Cover  Title  Author  Type  Year  Actions  Cover
```

**After:** Header stays at top while scrolling
```
╔═══════════════════════════════════════════════════════════╗
║ ☑  🔹  Move  Cover  Title  Author  Type  Year  Actions   ║
╠═══════════════════════════════════════════════════════════╣
║ Stays visible while you scroll through items!             ║
╚═══════════════════════════════════════════════════════════╝
```

### Row Appearance

**Before:**
- Minimal padding
- Small checkboxes
- Gray drag handles

**After:**
- Generous padding (10px instead of 4px)
- Larger checkboxes (18px × 18px)
- Blue drag handles that scale on hover
- Selected rows have blue left border
- Smooth hover effects

### Drag Handle Feedback

**Before:**
```
🔹 (gray, small, subtle)
```

**After:**
```
🔹 → 🔹 (gray → blue on hover, scales up 1.15×)
   ↓
   🔹 (blue background when dragging)
```

## Keyboard & Mouse Workflows

### Workflow 1: Reorder a Few Items
1. Drag item by the 🔹 handle
2. Drop in new position
3. Click "Save Order"

### Workflow 2: Move Many Items to Top
1. Click checkboxes for multiple items
2. Click "Top" button in selection bar
3. Click "Save Order"

### Workflow 3: Precise Positioning
1. Select items with checkboxes
2. Use "After specific item..." dropdown
3. Click "Save Order"

### Workflow 4: Sort Then Fine-Tune
1. Use "Sort by" dropdown (e.g., "Author A-Z")
2. Drag individual items to adjust
3. Click "Save Order"

### Workflow 5: Maximum Workspace
1. Click [←] to collapse sidebar
2. Full width for table
3. Reorder as needed
4. Click [→] to show sidebar again

## Color Legend

- 🔵 Blue highlight = Selected row
- 🟢 Green button = Save Order (primary action)
- 🟡 Yellow badge = Unsaved changes (warning)
- 🔘 Gray = Inactive/neutral controls
- 🔷 Blue drag handle (hover) = Ready to drag

## Responsive Behavior

### Desktop (>1200px)
- Sidebar: 16.6% width
- Table: 83.4% width
- All controls visible

### Tablet (768px - 1200px)
- Sidebar: 25% width
- Table: 75% width
- Collapsible sidebar available

### Mobile (<768px)
- Sidebar stacks above table
- Touch-optimized controls
- Larger hit areas for drag handles

## Pro Tips

✨ **Speed up bulk operations**: Select all with checkbox in header, then deselect the ones you don't want

✨ **Use sort + drag**: Sort to get items roughly in order, then drag a few items to perfect the arrangement

✨ **Collapse while reordering**: Hide the sidebar for maximum focus on the table

✨ **Watch the badge**: The "Unsaved changes" badge pulses to remind you to save

✨ **Keyboard navigation**: Tab through checkboxes, Space to toggle, Enter to select from dropdowns

## Common Tasks

### Move 10 items from bottom to top
```
1. Scroll to bottom
2. Check last 10 items
3. Click "Top" in selection bar
4. Click "Save Order"
   ⏱️ Time: ~10 seconds
```

### Alphabetize by author
```
1. Click "Sort: [Default Order ▼]"
2. Select "Author (A-Z)"
3. Click "Save Order"
   ⏱️ Time: ~5 seconds
```

### Insert item after specific position
```
1. Check item(s) to move
2. Open "After specific item..." dropdown
3. Select target position
4. Click "Save Order"
   ⏱️ Time: ~8 seconds
```

## Troubleshooting

**Q: Drag isn't working**
A: Make sure you're grabbing the 🔹 icon, not the row

**Q: Can't see Save button**
A: Make changes first - it only appears when you have unsaved changes

**Q: Selected items disappeared**
A: Click "Clear Selection" if you want to start over, or check if you scrolled

**Q: Table header disappeared**
A: It should be sticky! Try refreshing the page if there's an issue

**Q: How do I save?**
A: Look for the green "✓ Save Order" button in the top right of the sorting controls
