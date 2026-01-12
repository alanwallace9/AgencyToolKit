# File Upload Button Fix Plan

## Problem
The "Upload File" button in the FileUpload component doesn't open the file picker when clicked.

## Investigation Steps

### Step 1: Test Plain Visible Input
First, verify file inputs work at all in this context by rendering a plain visible input:
```tsx
<input type="file" accept="image/*" />
```
If this doesn't work, something is blocking file inputs entirely.

### Step 2: Add Debug Logging
Add console.log to verify:
1. Is onClick firing?
2. Is inputRef.current defined?
3. Is click() being called?

```tsx
onClick={() => {
  console.log('Button clicked');
  console.log('inputRef.current:', inputRef.current);
  inputRef.current?.click();
  console.log('click() called');
}}
```

### Step 3: Test Outside DndContext
Move FileUpload outside the DndContext temporarily to see if dnd-kit is the cause.

### Step 4: Use Plain HTML Button
Replace shadcn Button with plain HTML button to eliminate component interference:
```tsx
<button type="button" onClick={() => inputRef.current?.click()}>
  Upload File
</button>
```

### Step 5: Check CSS Blocking
Look for:
- `pointer-events: none` in parent elements
- z-index issues
- Overlaying invisible elements

## Root Cause Hypothesis

Most likely causes (in order):
1. **shadcn Button component** may have event handling that interferes
2. **ref not attached** when click is called (timing issue)
3. **CSS/layout issue** blocking the click
4. **DndContext sensors** capturing events despite distance constraint

## Solution Approach

After diagnosis, implement the simplest working solution:
1. Use plain `<button>` element if shadcn Button is the issue
2. Use `useEffect` to ensure ref is attached before allowing clicks
3. Add explicit `pointer-events: auto` if CSS is blocking
4. Move FileUpload outside DndContext if that's the blocker

## Supabase Storage Setup

Once upload works:
1. Create "assets" bucket in Supabase Storage
2. Configure public access policies
3. Update API route to use this bucket
