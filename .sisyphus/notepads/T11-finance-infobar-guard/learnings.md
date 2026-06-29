
## T11 - FinanceView infobar guard (2026-06-27)
- `useAppMode().mode`를 사용하여 finance/main 모드를 구분
- finance 모드에서 `setContent(null)` early return으로 InfoSidebar 중복 콘텐츠 방지
- useEffect dependency array 순서: [mode, setContent, detail]
