"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Plus,
  TrendingUp,
  TrendingDown,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { usePortfolioStore, type Holding, type TradeRecord } from "@/stores/portfolio-store";

export default function PortfolioPage() {
  const {
    portfolios,
    selectedPortfolio,
    holdings,
    trades,
    isLoading,
    error,
    fetchPortfolios,
    createPortfolio,
    selectPortfolio,
    deletePortfolio,
    addHolding,
    fetchTrades,
  } = usePortfolioStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [stockCode, setStockCode] = useState("");
  const [stockName, setStockName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  // Load portfolios on mount
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) return;
    
    const portfolio = await createPortfolio({ name: newPortfolioName });
    if (portfolio) {
      setNewPortfolioName("");
      setShowCreateModal(false);
      selectPortfolio(portfolio);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (window.confirm("정말 이 포트폴리오를 삭제하시겠습니까?")) {
      await deletePortfolio(id);
    }
  };

  const handleTradeSubmit = async () => {
    if (!selectedPortfolio || !stockCode || !quantity || !price) return;

    const result = await addHolding({
      stockCode,
      stockName: stockName || stockCode,
      quantity: parseInt(quantity),
      price,
      type: tradeType,
    });

    if (result) {
      setStockCode("");
      setStockName("");
      setQuantity("");
      setPrice("");
      setShowTradeModal(false);
      
      // Refresh trades
      if (selectedPortfolio.id) {
        fetchTrades({ portfolioId: selectedPortfolio.id });
      }
    }
  };

  const formatCurrency = (value: string | number): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(num);
  };

  const calculateTotalValue = (): number => {
    return holdings.reduce((total, h) => {
      const qty = parseFloat(h.quantity.toString()) || 0;
      const price = parseFloat(h.currentPrice || "0");
      return total + qty * price;
    }, 0);
  };

  const calculateTotalProfitLoss = (): number => {
    return holdings.reduce((total, h) => {
      const qty = parseFloat(h.quantity.toString()) || 0;
      const currentPrice = parseFloat(h.currentPrice || "0");
      const avgPrice = parseFloat(h.avgPrice || "0");
      return total + (currentPrice - avgPrice) * qty;
    }, 0);
  };

  const calculateProfitRate = (): number => {
    const totalValue = calculateTotalValue();
    if (totalValue === 0) return 0;
    
    const totalCost = holdings.reduce((sum, h) => {
      const qty = parseFloat(h.quantity.toString()) || 0;
      const avgPrice = parseFloat(h.avgPrice || "0");
      return sum + qty * avgPrice;
    }, 0);
    
    return ((totalValue - totalCost) / totalCost) * 100;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">포트폴리오</h1>
          <p className="text-muted-foreground mt-1">매매 시뮬레이션 및 포트폴리오 관리</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />포트폴리오 생성
          </Button>
          {selectedPortfolio && (
            <Button onClick={() => setShowTradeModal(true)}>
              <Plus className="h-4 w-4 mr-2" />매수/매도
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>새 포트폴리오 생성</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="포트폴리오 이름"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreatePortfolio()}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  취소
                </Button>
                <Button onClick={handleCreatePortfolio}>생성</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trade Modal */}
      {showTradeModal && selectedPortfolio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>{tradeType === "buy" ? "매수" : "매도"} 주문</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={tradeType === "buy" ? "default" : "outline"}
                  onClick={() => setTradeType("buy")}
                >
                  매수
                </Button>
                <Button
                  variant={tradeType === "sell" ? "default" : "outline"}
                  onClick={() => setTradeType("sell")}
                >
                  매도
                </Button>
              </div>
              
              <Input
                placeholder="종목코드 (예: 005930)"
                value={stockCode}
                onChange={(e) => setStockCode(e.target.value)}
              />
              <Input
                placeholder="종목명 (선택사항)"
                value={stockName}
                onChange={(e) => setStockName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="수량"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <Input
                type="number"
                placeholder="단가"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              
              {quantity && price && (
                <p className="text-sm text-muted-foreground">
                  예상 총액: {formatCurrency(parseInt(quantity || "0") * parseFloat(price || "0"))}
                </p>
              )}
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowTradeModal(false)}>
                  취소
                </Button>
                <Button onClick={handleTradeSubmit}>
                  {tradeType === "buy" ? "매수" : "매도"} 확인
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Portfolio Selection */}
      {!selectedPortfolio ? (
        <Card>
          <CardHeader>
            <CardTitle>포트폴리오 선택</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8">로딩 중...</p>
            ) : portfolios.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <Briefcase className="h-12 w-12 mx-auto opacity-20" />
                <p>포트폴리오가 없습니다</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />첫 번째 포트폴리오 생성하기
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {portfolios.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => selectPortfolio(p)}
                  >
                    <div>
                      <h3 className="font-medium">{p.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        총 투자액: {formatCurrency(p.totalInvestment)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      <Button
                        variant="ghost"
                        size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePortfolio(p.id);
                          }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4">{selectedPortfolio.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">총 자산</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(calculateTotalValue())}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">총 수익/손실</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      calculateTotalProfitLoss() >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {calculateTotalProfitLoss() >= 0 ? "+" : ""}
                    {formatCurrency(calculateTotalProfitLoss())}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">수익률</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      calculateProfitRate() >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {calculateProfitRate().toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="holdings">
            <TabsList>
              <TabsTrigger value="holdings">보유 종목</TabsTrigger>
              <TabsTrigger value="history">거래 내역</TabsTrigger>
              <TabsTrigger value="performance">성과 분석</TabsTrigger>
            </TabsList>

            {/* Holdings Tab */}
            <TabsContent value="holdings" className="mt-4">
              <Card>
                <CardContent className="py-4">
                  {holdings.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>보유한 종목이 없습니다</p>
                      <p className="text-sm mt-1">
                        "{selectedPortfolio.name}"에 종목을 추가하세요
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {holdings.map((holding) => {
                        const qty = parseFloat(holding.quantity.toString()) || 0;
                        const currentPrice = parseFloat(holding.currentPrice || "0");
                        const avgPrice = parseFloat(holding.avgPrice || "0");
                        const totalValue = qty * currentPrice;
                        const profitLoss = (currentPrice - avgPrice) * qty;
                        const profitRate = ((currentPrice - avgPrice) / avgPrice) * 100;

                        return (
                          <div
                            key={holding.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <h3 className="font-medium">{holding.stockName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {holding.stockCode} · 평균가: {formatCurrency(avgPrice)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(totalValue)}</div>
                              <div
                                className={`text-sm ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}
                              >
                                {profitLoss >= 0 ? "+" : ""}{formatCurrency(profitLoss)} ({profitRate.toFixed(2)}%)
                              </div>
                              <div className="text-xs text-muted-foreground">
                                보유: {qty}주
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardContent className="py-4">
                  {trades.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      거래 내역이 없습니다
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trades.map((trade) => (
                        <div
                          key={trade.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                trade.type === "buy"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {trade.type === "buy" ? "매수" : "매도"}
                            </span>
                            <div>
                              <p className="font-medium">{trade.stockName}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(trade.tradedAt).toLocaleString("ko-KR")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(parseFloat(trade.totalAmount))}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {parseFloat(trade.quantity)}주 ×{" "}
                              {formatCurrency(parseFloat(trade.price))}
                            </p>
                            {trade.memo && (
                              <p className="text-xs text-muted-foreground mt-1">{trade.memo}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="mt-4">
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  성과 데이터가 없습니다. 보유 종목을 추가하면 여기에서 성과를 분석할 수 있습니다.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
