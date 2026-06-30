# Drawing Tools System Spec

## Package
- Source: `difurious/lightweight-charts-line-tools-core` (GitHub)
- Import: dynamic `await import('lightweight-charts-line-tools-core')` inside `useEffect` to avoid CJS/ESM SSR issues
- API: `mod.createLineToolsPlugin(chartApi)` → returns plugin instance

## State Management
```typescript
const [currentTool, setCurrentTool] = useState<string | null>(null);
const lineToolsRef = useRef<any>(null);
const [drawingLocked, setDrawingLocked] = useState(false);
```

## Toolbar Layout
Positioned on the **left side** of the chart (below period filter bar, above chart).

### Button Group
```
[╱] [―] [Fib] [✕] [🔒]
```

| Button | Tool | Action |
|---|---|---|
| ╱ | TrendLine | Enable trend line drawing mode |
| ― | HorizontalLine | Enable horizontal line drawing mode |
| Fib | FibRetracement | Enable Fibonacci retracement drawing mode |
| ✕ | Clear All | Remove all line tools from chart |
| 🔒 | Lock/Unlock | Toggle `chartApi.applyOptions({handleScroll: !locked, handleScale: !locked})` |

### Button States
- **Active tool**: `bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8]`
- **Inactive**: `text-[#5f6368] border-transparent`
- **Locked active**: `bg-[#fce8e6] text-[#d93025] border-[#d93025]`

### Button Style
```css
className: "w-8 h-8 flex items-center justify-center text-[13px] border rounded-md transition-colors"
tooltip: "text-[11px] text-[#5f6368] ml-1" (tooltip label to right of button)
```

## Plugin Lifecycle

### Init
```typescript
const mod = await import('lightweight-charts-line-tools-core');
lineToolsRef.current = mod.createLineToolsPlugin(chartApiRef.current);
```

### Tool Activation
```typescript
if (currentTool === 'TrendLine') lineToolsRef.current.startDrawing('TrendLine');
else if (currentTool === 'HorizontalLine') lineToolsRef.current.startDrawing('HorizontalLine');
else if (currentTool === 'FibRetracement') lineToolsRef.current.startDrawing('FibRetracement');
else lineToolsRef.current.stopDrawing();
```

### Clear
```typescript
lineToolsRef.current.removeAllTools();
```

## Serialization (localStorage)

### Save
- Triggered on every tool edit via `lineToolsRef.current.subscribe('edit', handler)`
- `handler`: `() => localStorage.setItem('prism_insight_line_tools', JSON.stringify(lineToolsRef.current.exportLineTools()))`

### Restore
- On mount (after plugin init): read from localStorage → `lineToolsRef.current.importLineTools(savedData)`
- Key: `prism_insight_line_tools`

## Lock Behavior
When locked:
```typescript
chartApiRef.current.applyOptions({ handleScroll: false, handleScale: false });
```
- Prevents pan/zoom
- Drawing tools still visible and interactive for selection/deletion
- When unlocked: `{ handleScroll: true, handleScale: true }`
