Task 3 review package

Status: new untracked file addition for `src/components/HandaBottomSheet.tsx` and focused style additions in `src/globals.css`

Added file snapshot: `src/components/HandaBottomSheet.tsx`

```tsx
import React, { useEffect, useId, useRef, useState } from "react"

export type SheetState = "minimized" | "mid" | "expanded"

export type HandaBottomSheetProps = {
  state: SheetState
  onStateChange: (state: SheetState) => void
  title: string
  subtitle: string
  children: React.ReactNode
}

const SNAP_TRANSLATE_Y: Record<SheetState, string> = {
  minimized: "calc(100% - 112px)",
  mid: "calc(100% - 420px)",
  expanded: "48px",
}

function getNextState(deltaY: number, current: SheetState): SheetState {
  if (deltaY < -80) return current === "minimized" ? "mid" : "expanded"
  if (deltaY > 80) return current === "expanded" ? "mid" : "minimized"
  return current
}

function getSnapOffset(state: SheetState, viewportHeight: number): number {
  if (state === "expanded") return 48
  if (state === "mid") return Math.max(viewportHeight - 420, 48)
  return Math.max(viewportHeight - 112, 48)
}

export function HandaBottomSheet({ state, onStateChange, title, subtitle, children }: HandaBottomSheetProps) {
  const titleId = useId()
  const dragStateRef = useRef<{ pointerId: number; startY: number; startOffset: number } | null>(null)
  const [dragOffset, setDragOffset] = useState<number | null>(null)

  useEffect(() => {
    if (!dragStateRef.current) return

    function handlePointerMove(event: PointerEvent) {
      const dragState = dragStateRef.current

      if (!dragState || event.pointerId !== dragState.pointerId) return

      const expandedOffset = getSnapOffset("expanded", window.innerHeight)
      const minimizedOffset = getSnapOffset("minimized", window.innerHeight)
      const nextOffset = dragState.startOffset + (event.clientY - dragState.startY)

      setDragOffset(Math.min(minimizedOffset, Math.max(expandedOffset, nextOffset)))
    }

    function handlePointerUp(event: PointerEvent) {
      const dragState = dragStateRef.current

      if (!dragState || event.pointerId !== dragState.pointerId) return

      dragStateRef.current = null
      setDragOffset(null)
      onStateChange(getNextState(event.clientY - dragState.startY, state))
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointercancel", handlePointerUp)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
    }
  }, [onStateChange, state])

  const translateY = dragOffset ?? getSnapOffset(state, window.innerHeight)

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragStateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startOffset: getSnapOffset(state, window.innerHeight),
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    setDragOffset(getSnapOffset(state, window.innerHeight))
  }

  return (
    <section
      aria-labelledby={titleId}
      className="handa-sheet"
      style={{
        transform: `translateY(${translateY}px)`,
        transition: dragOffset === null ? "transform 220ms ease" : "none",
      }}
    >
      <div className="handa-sheet__handle" onPointerDown={handlePointerDown}>
        <span className="handa-sheet__grabber" aria-hidden="true" />
        <div className="handa-sheet__eyebrow">HANDA</div>
        <h2 id={titleId} className="handa-sheet__title">{title}</h2>
        <p className="handa-sheet__subtitle">{subtitle}</p>
      </div>

      <div className="handa-sheet__controls hando-sheet__controls">
        <button type="button" onClick={() => onStateChange("minimized")}>Minimize</button>
        <button type="button" onClick={() => onStateChange("mid")}>Summary</button>
        <button type="button" onClick={() => onStateChange("expanded")}>Expand</button>
      </div>

      <div className="handa-sheet__content">{children}</div>
    </section>
  )
}

export { SNAP_TRANSLATE_Y, getNextState }
```

Added style snapshot: `src/globals.css` additions

```css
.handa-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 55;
  display: flex;
  max-height: calc(100dvh - 48px);
  flex-direction: column;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), #ffffff);
  border: 1px solid var(--line);
  border-bottom: 0;
  border-radius: 28px 28px 0 0;
  box-shadow: 0 -12px 40px rgba(15, 23, 42, 0.16);
  will-change: transform;
}

.handa-sheet__handle {
  padding: 14px 20px 10px;
  text-align: center;
  touch-action: none;
  cursor: grab;
  user-select: none;
}

.handa-sheet__handle:active {
  cursor: grabbing;
}

.handa-sheet__grabber {
  display: block;
  width: 48px;
  height: 5px;
  margin: 0 auto 12px;
  border-radius: 999px;
  background: var(--line-strong);
}

.handa-sheet__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--blue-primary);
}

.handa-sheet__title {
  margin-top: 6px;
  font-size: 1.125rem;
  line-height: 1.3;
}

.handa-sheet__subtitle {
  margin-top: 4px;
  font-size: 0.875rem;
  color: var(--muted-text);
}

.handa-sheet__controls,
.hando-sheet__controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 0 16px 16px;
}

.handa-sheet__controls button,
.hando-sheet__controls button {
  min-height: 40px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--card-bg);
  color: var(--ink-secondary);
  font-size: 0.8125rem;
  font-weight: 600;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

.handa-sheet__controls button:hover,
.hando-sheet__controls button:hover {
  border-color: var(--blue-primary);
  background: var(--blue-soft);
  color: var(--blue-primary);
}

.handa-sheet__controls button:focus-visible,
.hando-sheet__controls button:focus-visible {
  outline: 2px solid rgba(6, 70, 244, 0.3);
  outline-offset: 2px;
}

.handa-sheet__content {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px calc(16px + env(safe-area-inset-bottom, 0px));
}
```
