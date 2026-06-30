"use client";

import { useState, useEffect, useRef, useMemo, useId, useCallback, Fragment } from "react";
import {
  Search, Settings, ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, Menu, PenSquare,
  Mic, Info, Edit3, Plus, Minus, Globe, Newspaper, Clock, X, Maximize2, Minimize2, ScrollText, ArrowLeft,
  Brain, TrendingUp, BarChart3, MessageSquare,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Chart, AreaSeries, LineSeries } from 'lightweight-charts-react-components';
import { ColorType } from 'lightweight-charts';
import { SectionHeader, SimpleStockNav, ListNavigation } from "./navigation-list";
import { BREAKPOINTS } from "@/lib/breakpoints";
import { regionIndices } from "../_data/indices";
import { marketSummaries, newsItems } from "../_data/news";
import { mostActiveStocks, gainers, losers } from "../_data/stocks";
import { sectorIndices } from "../_data/sectors";
import { watchlistStocks } from "../_data/watchlist";
import { searchStockSuggestions, searchAiPrompts, footerTickerSuggestions } from "../_data/search";
import { formatPrice, getSparklineColor, generateSparklineData, useDeterministicSparkline } from "../_lib/format";
import { SHAPE_TYPES, type ShapeType, type ShapeRenderer, SHAPE_SVG, AssetSymbol, getAssetShape } from "../_lib/shapes";

// ─── Re-export extracted components (used externally by page.tsx, navigation-list.tsx) ──
import { MiniChart } from "../_components/overview/mini-chart";
export { IndexCard } from "../_components/overview/index-card";
export { StockTableRow } from "../_components/overview/stock-table-row";
export { MarketSummaryCard } from "../_components/overview/market-summary-card";
export { NewsItem } from "../_components/overview/news-item";

// ─── Re-export extracted component ──
export { MobilePortfolioDetail } from '../_components/portfolio/mobile-portfolio-detail';

export { MobilePortfolio } from "../_components/portfolio/mobile-portfolio";
export { StockDetail } from "../_components/stock/stock-detail";

// ─── Re-export extracted components ──
export { NavigationPanel } from "../_components/nav/navigation-panel";
export { ResearchPanel } from "../_components/research/research-panel";
export { FooterInput } from "../_components/footer/footer-input";
