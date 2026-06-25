"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, Brain, Newspaper, BarChart3, ChevronRight, AlertCircle, Star, Activity, Target, Shield, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StocksPage() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: search stocks
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">종목 검색 및 분석</h1>
        <p className="text-muted-foreground mt-1">US / 한국 주식을 검색하고 AI 분석 리포트를 확인하세요</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="티커 또는 종목명 입력 (예: AAPL, 005930, 삼성전자)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Button type="submit" size="lg">검색</Button>
      </form>

      {/* Placeholder: before any stock is selected */}
      <div className="text-center py-16 text-muted-foreground">
        <Search className="h-16 w-16 mx-auto mb-4 opacity-10" />
        <p className="text-lg">종목을 검색하여 AI 분석을 시작하세요</p>
        <p className="text-sm mt-1">AAPL, MSFT, 005930 등 티커 또는 종목명 입력</p>
      </div>

      <div className="hidden space-y-6">
        {/* Stock header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold">AAPL</h2>
              <span className="text-lg text-muted-foreground">Apple Inc.</span>
              <Badge variant="secondary">NASDAQ</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-3xl font-bold">$218.45</span>
              <span className="flex items-center gap-1 text-green-500">
                <TrendingUp className="h-4 w-4" />+1.23%
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button><Brain className="h-4 w-4 mr-2" />AI 분석</Button>
            <Button variant="outline">+ Watchlist</Button>
          </div>
        </div>

        {/* Analysis Tabs */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-2" />개요</TabsTrigger>
            <TabsTrigger value="technical"><TrendingUp className="h-4 w-4 mr-2" />기술적 분석</TabsTrigger>
            <TabsTrigger value="financial"><BarChart3 className="h-4 w-4 mr-2" />재무 분석</TabsTrigger>
            <TabsTrigger value="news"><Newspaper className="h-4 w-4 mr-2" />뉴스</TabsTrigger>
            <TabsTrigger value="report"><Brain className="h-4 w-4 mr-2" />AI 리포트</TabsTrigger>
            <TabsTrigger value="ai-analysis"><Brain className="h-4 w-4 mr-2" />AI 보유분석</TabsTrigger>
            <TabsTrigger value="trading"><Activity className="h-4 w-4 mr-2" />거래 내역</TabsTrigger>
            <TabsTrigger value="watchlist"><Star className="h-4 w-4 mr-2" />관심 종목</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "시가총액", value: "$3.42T" },
                { label: "PER", value: "28.5" },
                { label: "배당수익률", value: "0.52%" },
                { label: "52주 최고", value: "$237.23" },
              ].map((item) => (
                <Card key={item.label}>
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{item.label}</CardTitle></CardHeader>
                  <CardContent><div className="text-lg font-bold">{item.value}</div></CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="technical" className="mt-4">
            <Card><CardContent className="py-8 text-center text-muted-foreground">기술적 분석 차트 영역 (TradingView)</CardContent></Card>
          </TabsContent>

          <TabsContent value="financial" className="mt-4">
            <Card><CardContent className="py-8 text-center text-muted-foreground">재무 데이터 영역</CardContent></Card>
          </TabsContent>

          <TabsContent value="news" className="mt-4">
            <Card><CardContent className="py-8 text-center text-muted-foreground">뉴스 분석 영역 (Vane + crw)</CardContent></Card>
          </TabsContent>

          <TabsContent value="report" className="mt-4 space-y-4">
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle>AI 분석 리포트</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  AI 기반 13개 분석 에이전트가 기술적/재무/뉴스/시장을 분석한 종합 리포트입니다.
                  분석에는 약 3~5분이 소요됩니다.
                </p>
                <Button className="w-full"><Brain className="h-4 w-4 mr-2" />AI 분석 시작</Button>
              </CardContent>
            </Card>

            {/* Report preview placeholder */}
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">기술적 분석</CardTitle></CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">재무 분석</CardTitle></CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-analysis" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Brain className="h-4 w-4" />
                    총 분석
                  </div>
                  <div className="text-2xl font-bold mt-1">12건</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Target className="h-4 w-4" />
                    조정필요
                  </div>
                  <div className="text-2xl font-bold mt-1">3건</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Activity className="h-4 w-4" />
                    분석종목수
                  </div>
                  <div className="text-2xl font-bold mt-1">5개</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">최근 분석 결과</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">삼성전자</span>
                      <Badge variant="secondary">005930</Badge>
                      <Badge variant="outline" className="text-green-600 border-green-600">보유유지</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>확신도: 85%</span>
                      <span>•</span>
                      <span>2026.06.19</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">분석시점</div>
                      <div className="font-medium">₩72,500</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">매수가</div>
                      <div className="font-medium">₩68,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">목표가</div>
                      <div className="font-medium text-blue-600">₩82,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">손절가</div>
                      <div className="font-medium text-red-600">₩63,000</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="h-4 w-4" />
                      수익률 +6.6%
                    </div>
                    <div className="text-muted-foreground">손익비 2.4</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="font-medium text-foreground mb-1">AI 판단 근거</div>
                    기술적 추세 상승 지속, 거래량 증가 동반, 시장 영향 양호. 20일선 위 유지 중이며 섹터 내 대형주 수급 안정적.
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">SK하이닉스</span>
                      <Badge variant="secondary">000660</Badge>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">매도권고</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>확신도: 72%</span>
                      <span>•</span>
                      <span>2026.06.18</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">분석시점</div>
                      <div className="font-medium">₩2,722,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">매수가</div>
                      <div className="font-medium">₩2,500,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">목표가</div>
                      <div className="font-medium text-blue-600">₩3,275,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">손절가</div>
                      <div className="font-medium text-red-600">₩2,538,000</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="h-4 w-4" />
                      수익률 +8.9%
                    </div>
                    <div className="text-muted-foreground">손익비 2.9</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="font-medium text-foreground mb-1">AI 판단 근거</div>
                    목표가 대비 80% 도달, 기술적 저항선 근접. trailing stop 전환 고려 시점. 거래량 감소 추세로 모멘텀 약화 가능성.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">조정 알림</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-orange-700 dark:text-orange-400">손절가 변경 필요</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      SK하이닉스 손절가가 현재가 대비 -6.7%로 좁음. 추세 약화 시 빠른 손실 가능성. 손절가 하향 조정 검토.
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">긴급도: 중간 • 2026.06.18</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-700 dark:text-blue-400">목표가 도달 알림</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      삼성전자 목표가 ₩82,000 대비 96% 도달.익절 마일스톤 확인 필요.
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">긴급도: 낮음 • 2026.06.19</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading" className="mt-4 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Activity className="h-4 w-4" />
                    총 거래
                  </div>
                  <div className="text-2xl font-bold mt-1">8건</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <TrendingUp className="h-4 w-4" />
                    승률
                  </div>
                  <div className="text-2xl font-bold mt-1">50%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <ArrowUpRight className="h-4 w-4" />
                    평균 수익률
                  </div>
                  <div className="text-2xl font-bold mt-1 text-green-600">+12.8%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <ArrowDownRight className="h-4 w-4" />
                    평균 손실률
                  </div>
                  <div className="text-2xl font-bold mt-1 text-red-600">-6.0%</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">거래 상세 내역</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">삼성전자</span>
                      <Badge variant="secondary">005930</Badge>
                      <Badge variant="outline">단기</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">2026.05.20 → 2026.06.01</span>
                      <span className="text-muted-foreground">(11일 보유)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">매수가</div>
                      <div className="font-medium">₩68,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">매도가</div>
                      <div className="font-medium">₩82,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">AI 목표가</div>
                      <div className="font-medium text-blue-600">₩85,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">목표 달성률</div>
                      <div className="font-medium">96%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <ArrowUpRight className="h-4 w-4" />
                      +20.6%
                    </div>
                    <div className="text-muted-foreground">수익 거래</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="font-medium text-foreground mb-1">AI 투자 근거</div>
                    F1~F4 모두 통과, 거래량 급증 트리거, 전기·전자 섹터 강세. 20일선 위 추세 유지, 기관 매수세 유입.
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">SK하이닉스</span>
                      <Badge variant="secondary">000660</Badge>
                      <Badge variant="outline">중기</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">2026.04.15 → 2026.05.10</span>
                      <span className="text-muted-foreground">(25일 보유)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">매수가</div>
                      <div className="font-medium">₩2,400,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">매도가</div>
                      <div className="font-medium">₩2,650,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">AI 목표가</div>
                      <div className="font-medium text-blue-600">₩3,000,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">목표 달성률</div>
                      <div className="font-medium">83%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <ArrowUpRight className="h-4 w-4" />
                      +10.4%
                    </div>
                    <div className="text-muted-foreground">수익 거래</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="font-medium text-foreground mb-1">AI 투자 근거</div>
                    메모리 가격 개선, AI 수요 증가, 반도체 섹터 강세. 거래량 평균 이상 유지, 외국인 매수세 유입.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist" className="mt-4 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Star className="h-4 w-4" />
                    전체 종목
                  </div>
                  <div className="text-2xl font-bold mt-1">90개</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Target className="h-4 w-4" />
                    최고 점수
                  </div>
                  <div className="text-2xl font-bold mt-1">9점</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <BarChart3 className="h-4 w-4" />
                    평균 점수
                  </div>
                  <div className="text-2xl font-bold mt-1">3.1점</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="h-4 w-4" />
                    최근 7일
                  </div>
                  <div className="text-2xl font-bold mt-1">23개</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">섹터별 분포 TOP 3</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">1</div>
                      <span>전기·전자</span>
                    </div>
                    <span className="font-medium">43개</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">2</div>
                      <span>Unknown</span>
                    </div>
                    <span className="font-medium">18개</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">3</div>
                      <span>기계·장비</span>
                    </div>
                    <span className="font-medium">6개</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">2026년 6월 19일</CardTitle>
                  <Badge variant="secondary">5개 분석</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">삼성전기우</span>
                      <Badge variant="secondary">009155</Badge>
                      <Badge variant="outline">전기·전자</Badge>
                      <Badge variant="outline">단기</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">8</span>
                      <span className="text-sm text-muted-foreground">/4점</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">현재가</div>
                      <div className="font-medium">₩785,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">목표가</div>
                      <div className="font-medium text-blue-600">₩833,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">손절가</div>
                      <div className="font-medium text-red-600">₩731,000</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-muted-foreground">손익비 <span className="font-medium">0.9</span></div>
                    <div className="text-muted-foreground">목표 수익 <span className="text-green-600">+6.0%</span></div>
                    <div className="text-muted-foreground">예상 손실 <span className="text-red-600">-7.0%</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600">Enter</Badge>
                    <span className="text-sm text-muted-foreground">(진입 체크리스트: 6/6)</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    AI 판단: Enter • 섹터 집중 (전기·전자)
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">삼성전기</span>
                      <Badge variant="secondary">009150</Badge>
                      <Badge variant="outline">전기·전자</Badge>
                      <Badge variant="outline">단기</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">9</span>
                      <span className="text-sm text-muted-foreground">/4점</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">현재가</div>
                      <div className="font-medium">₩2,315,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">목표가</div>
                      <div className="font-medium text-blue-600">₩2,400,000</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">손절가</div>
                      <div className="font-medium text-red-600">₩2,200,000</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-muted-foreground">손익비 <span className="font-medium">0.7</span></div>
                    <div className="text-muted-foreground">목표 수익 <span className="text-green-600">+3.6%</span></div>
                    <div className="text-muted-foreground">예상 손실 <span className="text-red-600">-5.0%</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600">Enter</Badge>
                    <span className="text-sm text-muted-foreground">(진입 체크리스트: 6/6)</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    AI 판단: Enter • 섹터 집중 (전기·전자)
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
