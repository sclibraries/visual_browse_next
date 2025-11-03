# Collections Page - CSS Reference for Developers

## New CSS Classes Added

### Layout & Structure

#### `.sidebarCol`
```css
border-right: 1px solid #e9ecef;
transition: all 0.3s ease;
```
- Applied to the sidebar column
- Smooth transition when showing/hiding
- Visual separator from main content

#### `.stickyHeader`
```css
position: sticky;
top: 0;
background-color: #f8f9fa;
z-index: 10;
box-shadow: 0 2px 4px rgba(0,0,0,0.05);
```
- Keeps table header visible while scrolling
- Elevated z-index to stay above content
- Subtle shadow for depth

### Selection & Actions

#### `.selectionBar`
```css
background: linear-gradient(135deg, #e7f3ff 0%, #f0f8ff 100%);
border: 1px solid #b6d7ff;
border-radius: 8px;
padding: 16px;
margin-bottom: 16px;
box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
```
- Eye-catching gradient background
- Clear visual separation from table
- Indicates active selection state

#### `.selectionBadge`
```css
font-size: 0.95rem;
padding: 8px 14px;
font-weight: 600;
```
- Larger, more prominent than before
- Easy to read selection count
- Professional styling

### Sorting & Controls

#### `.sortingControls`
```css
background-color: #f8f9fa;
border: 1px solid #e9ecef;
border-radius: 8px;
padding: 12px 16px;
margin-bottom: 16px;
```
- Neutral background to avoid visual competition
- Compact but clear
- Consistent with overall design language

#### `.changesBadge`
```css
font-size: 0.85rem;
padding: 6px 12px;
animation: pulse 2s ease-in-out infinite;
```
- Animated to draw attention
- Warning color (yellow) to indicate unsaved state
- Subtle pulse animation

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

#### `.applyButton`
```css
font-weight: 600;
box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
transition: all 0.2s ease;
```
- Primary action styling
- Green color for positive action
- Elevated with hover effect

```css
.applyButton:hover {
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
  transform: translateY(-1px);
}
```

### Table Improvements

#### `.tableContainer`
```css
margin-top: 0;
overflow-x: auto;
border-radius: 8px;
border: 1px solid #e9ecef;
background-color: white;
```
- Clean container with rounded corners
- Horizontal scroll on small screens
- Professional border treatment

#### `.recordsTable`
```css
width: 100%;
border-collapse: separate;
border-spacing: 0;
font-size: 0.9rem;
margin-bottom: 0;
```
- Optimized spacing
- Better typography
- Clean edges

#### Table Cell Improvements
```css
.recordsTable th {
  padding: 12px 8px !important;
  font-size: 0.85rem;
  white-space: nowrap;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.recordsTable td {
  padding: 10px 8px !important;
  vertical-align: middle;
  border-bottom: 1px solid #f0f0f0;
}
```
- Increased padding from 0.4rem to 10px
- More breathing room
- Better alignment

#### Row States

**Default Row:**
```css
.recordsTable tbody tr {
  transition: all 0.15s ease;
}

.recordsTable tbody tr:hover {
  background-color: #f8f9fa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
```

**Selected Row (NEW):**
```css
.tableRow.selected {
  background-color: #e7f3ff !important;
  border-left: 3px solid #007bff;
}
```
- Clear blue left border
- Light blue background
- Highly visible

**Dragging Row:**
```css
.tableRow.dragging {
  opacity: 0.5;
  background-color: #e9ecef;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}
```
- Slightly transparent
- Elevated appearance
- Slight scale for feedback

**Drag Target:**
```css
.tableRow.dragTarget {
  border: 2px dashed #007bff !important;
  background-color: rgba(0, 123, 255, 0.08) !important;
  position: relative;
  animation: dragPulse 1.5s ease-in-out infinite alternate;
}

@keyframes dragPulse {
  from {
    background-color: rgba(0, 123, 255, 0.05);
    border-color: #007bff;
  }
  to {
    background-color: rgba(0, 123, 255, 0.12);
    border-color: #0056b3;
  }
}
```
- Animated dashed border
- Clear drop zone indication
- Pulsing effect guides user

### Drag Handle Improvements

#### `.dragHandle`
```css
display: flex;
align-items: center;
justify-content: center;
color: #adb5bd;
cursor: grab;
padding: 6px;
border-radius: 4px;
transition: all 0.2s ease;
font-size: 1rem;
```

**Hover State:**
```css
.dragHandle:hover {
  color: #007bff;
  background-color: #e7f3ff;
  transform: scale(1.15);
}
```
- Changes from gray to blue
- Light blue background appears
- Scales up 15% for feedback

**Active State:**
```css
.dragHandle:active {
  cursor: grabbing;
  color: #0056b3;
  background-color: #cfe2ff;
}
```
- Darker blue when actively dragging
- Cursor changes to "grabbing"
- Deeper background color

### Interactive Elements

#### `.checkboxCell`
```css
width: 40px;
text-align: center;
```

```css
.checkboxCell input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #007bff;
}
```
- Larger hit area (18px vs default 13px)
- Blue accent color for brand consistency
- Better click target on mobile

## Responsive Breakpoints

### Mobile (<768px)
```css
@media (max-width: 768px) {
  .sidebarCol {
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }
  
  .collectionsListCard,
  .collectionContentCard {
    height: auto;
    min-height: 400px;
  }
  
  .selectionBar {
    padding: 12px;
  }
  
  .sortingControls {
    padding: 10px;
  }
}
```

## Print Styles
```css
@media print {
  .dragHandleCell,
  .precisionArrowsCell,
  .checkboxCell,
  .selectionBar,
  .sortingControls {
    display: none !important;
  }
}
```
- Hides interactive controls when printing
- Clean, professional printed output
- Only essential information shown

## Custom Properties Available

You can customize the following by overriding CSS variables:

### Colors
- Primary action: `#007bff` → Change for custom brand color
- Success: `#28a745` → Save button color
- Warning: `#ffc107` → Unsaved changes badge
- Background: `#f8f9fa` → Header/control backgrounds
- Border: `#e9ecef` → Subtle borders

### Spacing
- Table padding: `10px 8px`
- Control padding: `12px 16px`
- Border radius: `8px`

### Animations
- Transition duration: `0.2s ease`
- Pulse animation: `2s ease-in-out infinite`
- Drag pulse: `1.5s ease-in-out infinite alternate`

## Integration Notes

### Required Bootstrap Classes
- `table-hover` - Row hover effects
- `table-sm` - Compact table sizing
- Responsive grid (`Row`, `Col`)

### Font Awesome Icons Used
- `faGripVertical` - Drag handle
- `faChevronUp/Down` - Movement controls
- `faArrowUp/Down` - Quick positioning
- `faCheck` - Save confirmation
- `faUndo` - Reset action
- `faExclamationTriangle` - Warning badge

### Z-Index Layers
1. Base content: `0`
2. Sticky header: `10`
3. Dropdowns/tooltips: `1050` (Bootstrap default)
4. Modals: `1055` (Bootstrap default)

## Performance Considerations

### GPU-Accelerated Properties
- `transform` - Used for scale and translate effects
- `opacity` - Used for fade effects
- `box-shadow` - Minimal performance impact

### Avoiding Layout Thrashing
- Width properties set on table cells
- Fixed heights for predictable layout
- CSS containment where appropriate

## Browser-Specific Notes

### Safari
- Sticky positioning fully supported in Safari 13+
- Drag and drop works natively

### Firefox
- All animations and transitions work smoothly
- Drag handles may appear slightly different

### Chrome/Edge
- Best performance for drag operations
- Full support for all features

## Customization Examples

### Change Primary Color
```css
.dragHandle:hover {
  color: #your-color;
  background-color: #your-color-light;
}

.selectionBar {
  background: linear-gradient(135deg, #your-color-light 0%, #your-color-lighter 100%);
  border: 1px solid #your-color-border;
}
```

### Adjust Spacing
```css
.recordsTable td {
  padding: 15px 12px !important; /* More spacious */
}

.selectionBar {
  padding: 20px; /* Larger selection bar */
}
```

### Disable Animations (Accessibility)
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

## Testing Checklist

- [ ] Sticky header stays visible while scrolling
- [ ] Drag handles change color on hover
- [ ] Selected rows have blue border
- [ ] Selection bar appears when items selected
- [ ] Unsaved changes badge pulses
- [ ] Save button has hover effect
- [ ] Sidebar collapses/expands smoothly
- [ ] Table is scrollable horizontally on mobile
- [ ] Print view hides interactive controls
- [ ] All animations are smooth (60fps)
