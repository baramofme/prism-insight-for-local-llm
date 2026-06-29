
## [2026-06-27] T1+T3: Domain types + AppMode store
- types.ts: NewsItem extended with summary/url, Sector/MarketIndex/MarketMover/WatchlistItem added (98 lines total)
- stores/app-mode.ts: Zustand store with mode/setMode/toggleMode created
- stores/app-mode.test.ts: TDD tests (initial value, setMode, toggleMode)
- Build passes, lsp_diagnostics clean
- Subagent (Sisyphus-Junior) successfully handled both T1 and T3 in one session

## [2026-06-27] T5+T7: VersionSwitcher + ResearchChatPanel
- version-switcher.tsx: shadcn sidebar-02 style DropdownMenu with Dashboard/Finance mode switching via useAppMode().setMode()
- research-chat-panel.tsx: AI chat UI shell with title, suggested prompts, input field, send button (disabled when empty), disclaimer
- Both components are 'use client' with @/ alias imports, Icons from centralized registry
- Test pattern: source file read + string assertions (bun:test), matches footer.test.ts / header.test.ts convention
- Build clean (0 errors), 29 tests pass across both test files
- LSP bun:test false positives expected (same as existing layout tests)

## [2026-06-27] FinanceSidebar component
- finance-sidebar.tsx: Client component with Select dropdown toggling between "Equity Sectors" (11 sectors) and "Watchlist" (5 items) views
- Pattern: SidebarContent + SidebarGroup + SidebarMenu structure matching app-sidebar.tsx conventions
- Data sources: getAllSectors() returns MOCK_SECTORS (11 Sector[]), getWatchlist() returns MOCK_WATCHLIST (5 WatchlistItem[])
- Navigation: Each item links to /dashboard/finance/{ticker} or /dashboard/finance/{symbol} via Link
- Icons: Icons.trendingUp for sectors, Icons.search for watchlist (both from centralized @/components/icons registry)
- Auth: Uses authClient.useSession() pattern identical to app-sidebar.tsx for UserAvatarProfile in SidebarFooter
- Colors: text-green-600 for positive changePercent, text-red-600 for negative
- Empty state: "No stocks in your watchlist" placeholder when watchlist is empty
- Test: 17 tests all pass (bun:test string assertions on source file), build clean (0 errors)
- LSP bun:test false positives expected per existing test file convention

## [2026-06-27] T10: Market Overview landing page
- market-overview.tsx: Client component with 3 sections — Markets (index cards grid), Market Movers (Most Active/Gainers/Losers 3-col grid), Market News (news list)
- page.tsx: Server Component wrapping MarketOverview in PageContainer with pageTitle/pageDescription props
- RegionBadge helper: color-coded badges (KR/blue, US/emerald, JP/orange, EU/purple) for index cards
- Styling: cn() utility, Icons.trendingUp/trendingDown from @/components/icons, border+rounded-lg+p-4 card pattern
- Links: MoverRow items link to /dashboard/finance/{symbol} via next/link Link
- Test: 10 tests (component export + data assertions for all sections), matches existing bun:test patterns
- No new dependencies added; no existing files modified
- Build passes (0 errors), all 20 finance tests pass across 3 test files
- LSP diagnostics clean on all 3 new files (bun:test false positive on test file is expected per convention)
