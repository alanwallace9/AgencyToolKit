# Feature 14: Login Designer

## Status: In Progress (Polish Phase)

## Overview
Canvas-based drag-drop designer for customizing GHL login pages.

---

## Polish Items

### 1. Form Element Auto-Switch Tab
- When clicking on the login-form element in canvas, auto-switch left panel to "Form" tab
- Currently user has to manually switch tabs to edit form styles

### 2. Upload File Button Not Working
- The FileUpload component's upload button doesn't trigger file selection
- Check `/api/upload` route and FileUpload component wiring
- May need to create Supabase Storage bucket "assets" with public access

### 3. Resize Font Scaling
- When resizing elements, font sizes don't scale proportionally
- Example: "user@example.com" text overflows input field when form is made smaller
- Need to scale font sizes based on element dimensions

### 4. Delete Key Support
- Highlighting an element and pressing Delete/Backspace should delete it
- Currently only the trash icon works
- Add keyboard event listener for delete action

### 5. Resize Handle Anchoring
- When dragging a corner handle, the OPPOSITE corner should stay anchored
- Currently resizing seems to happen from the center
- Example: Dragging bottom-right should keep top-left fixed

### 6. Preset Form Positioning
- When loading presets like "Split Left" or "Split Right", form should position correctly
- Currently form stays centered instead of moving to the appropriate side
- Center X/Y buttons should respect split layout context (center within form zone, not entire canvas)

---

## Files Reference
- `components/shared/file-upload.tsx` - Upload component
- `app/api/upload/route.ts` - Upload API
- `app/(dashboard)/login/_components/canvas.tsx` - Canvas & resize handles
- `app/(dashboard)/login/_components/login-designer.tsx` - Main component
- `app/(dashboard)/login/_components/preset-picker.tsx` - Presets
- `app/(dashboard)/login/_components/properties-panel.tsx` - Element properties
- `app/(dashboard)/login/_components/form-style-panel.tsx` - Form styling
