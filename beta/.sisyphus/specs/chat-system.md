# AI Chat System Spec

## Component: ChatPanel

**Location:** Below center content, inside the main scrollable area (`page.tsx` line ~1700)

**Purpose:** AI-powered stock analysis chat, pre-loaded with "삼성전자 반도체 전망" conversation.

## Chat States

| State | Condition | Display |
|---|---|---|
| Empty | No messages | not applicable (always pre-loaded) |
| Active | Messages exist | Full message list |
| User input | N/A | Fixed textarea at bottom |

## Message Types

### User Message
| Property | Value |
|---|---|
| Alignment | Right side (`ml-auto`) |
| Background | `bg-[#1a73e8] text-white` |
| Border radius | `rounded-2xl rounded-br-sm` |
| Max width | `max-w-[75%]` |
| Collapse | 2+ lines: collapse button (▼) to show 1 line, expand (▲) to show all |
| Font size | `text-[14px]` |

### AI Response
| Property | Value |
|---|---|
| Alignment | Left side (`mr-auto`) |
| Avatar | Circular icon with light blue background |
| Background | `bg-[#f8f9fa] text-[#1f1f1f]` |
| Border radius | `rounded-2xl rounded-bl-sm` |
| Max width | `max-w-[85%]` (full width, no collapse) |
| Font size | `text-[14px]` |

## Chat Structure
```
[ChatContainer (flex flex-col flex-1)]

  [[Message list (flex-1 overflow-y-auto)]]
    [User message bubble (2+ lines collapsible)]
    [AI response block (full width)]
    [User message...]
    [AI response...]

  [[Input area (border-t)]]
    [Textarea (flex-1, auto-resize)]
    [Send button (Icon)]
```

## Default Conversation
- Pre-configured in `ChatPanel` state initialization
- 4 exchange messages about 삼성전자 반도체 전망
- Covers HBM 시장 점유율, 파운드리, 메모리 수요 전망

## Scrollbar
- Width: `15px` (custom scrollbar for chat history)
- Styled via `scroll-hide` class utility:
```css
.scroll-hide::-webkit-scrollbar { width: 15px; }
.scroll-hide::-webkit-scrollbar-track { background: transparent; }
.scroll-hide::-webkit-scrollbar-thumb { background: #bcbcbc; border-radius: 10px; border: 4px solid transparent; background-clip: content-box; }
.scroll-hide::-webkit-scrollbar-thumb:hover { background: #9e9e9e; border: 4px solid transparent; background-clip: content-box; }
.scroll-hide { scrollbar-width: thin; scrollbar-color: #bcbcbc transparent; }
```

## Responsive
| Property | Mobile (< 760px) | Desktop (>= 760px) |
|---|---|---|
| Width | Full center width | Same as parent |
| Padding | `px-3` | `px-4` |
| Pre-loaded messages | Visible on load | Same |
