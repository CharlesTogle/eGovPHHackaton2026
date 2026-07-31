### Task 3: Extract a persistent draggable HANDA bottom sheet component

**Files:**
- Create: `src/components/HandaBottomSheet.tsx`
- Modify: `src/globals.css`

**Interfaces:**
- Consumes:
  - `sheetState: "minimized" | "mid" | "expanded"`
  - `onSheetStateChange(nextState: "minimized" | "mid" | "expanded"): void`
  - resident alert, check-in, translation, and AI content as `children`
- Produces:
  - reusable persistent bottom sheet with drag snapping and non-dismissible behavior

- [ ] **Step 1: Create the bottom sheet component API**

```ts
type SheetState = "minimized" | "mid" | "expanded"

type HandaBottomSheetProps = {
  state: SheetState
  onStateChange: (state: SheetState) => void
  title: string
  subtitle: string
  children: React.ReactNode
}
```

- [ ] **Step 2: Implement minimal drag snapping with pointer events**

```ts
const SNAP_TRANSLATE_Y: Record<SheetState, string> = {
  minimized: "calc(100% - 112px)",
  mid: "calc(100% - 420px)",
  expanded: "48px",
}
```

```ts
function getNextState(deltaY: number, current: SheetState): SheetState {
  if (deltaY < -80) return current === "minimized" ? "mid" : "expanded"
  if (deltaY > 80) return current === "expanded" ? "mid" : "minimized"
  return current
}
```

- [ ] **Step 3: Render persistent controls so the sheet can minimize or expand but never close**

```tsx
<div className="hando-sheet__controls">
  <button type="button" onClick={() => onStateChange("minimized")}>Minimize</button>
  <button type="button" onClick={() => onStateChange("mid")}>Summary</button>
  <button type="button" onClick={() => onStateChange("expanded")}>Expand</button>
</div>
```

- [ ] **Step 4: Add focused CSS for the bottom sheet shell**

```css
.handa-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 55;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), #ffffff);
  border-radius: 28px 28px 0 0;
  border: 1px solid var(--line);
  box-shadow: 0 -12px 40px rgba(15, 23, 42, 0.16);
}
```

- [ ] **Step 5: Verify the component compiles in isolation once imported**

Run: `npm run build`

Expected: TypeScript completes or reports only unrelated existing repo issues outside this task.
