/**
 * Portfolio Calculator — 단위 테스트
 * 
 * Tests for weighted average price calculation, profit/loss, and trade history processing.
 */
import {
  calculateNewAvgPriceOnBuy,
  calculateNewAvgPriceOnSell,
  calculateProfitLoss,
  calculateRateOfReturn,
  calculateTotalValue,
  calculateCostBasis,
  processTradeHistory,
  validateSellOrder,
} from "@/lib/portfolio-calculator";

// ─── calculateNewAvgPriceOnBuy tests ──────────────────────────────────────

describe("calculateNewAvgPriceOnBuy", () => {
  test("첫 매수 시 매수 가격이 평단 가격이어야 함", () => {
    const result = calculateNewAvgPriceOnBuy("0", 0, "50000", 10);
    expect(result).toBe("50000.00");
  });

  test("이미 보유한 상태에서의 추가 매수로 가중 평균 계산", () => {
    // 첫 매수: 10주 @ 50,000원 → 평단 50,000원
    // 두 번째 매수: 10주 @ 60,000원 → 평단 (50000×10 + 60000×10) / 20 = 55,000원
    const firstBuy = calculateNewAvgPriceOnBuy("0", 0, "50000", 10);
    expect(firstBuy).toBe("50000.00");

    const secondBuy = calculateNewAvgPriceOnBuy(firstBuy, 10, "60000", 10);
    expect(secondBuy).toBe("55000.00");
  });

  test("다른 비율로 매수 시 정확한 가중 평균 계산", () => {
    // 첫 매수: 100주 @ 10,000원
    // 두 번째 매수: 50주 @ 12,000원
    // 평단: (10000 × 100 + 12000 × 50) / 150 = 1,600,000 / 150 = 10,666.67원
    const firstBuy = calculateNewAvgPriceOnBuy("0", 0, "10000", 100);
    const secondBuy = calculateNewAvgPriceOnBuy(firstBuy, 100, "12000", 50);
    expect(secondBuy).toBe("10666.67");
  });

  test("새 매수량이 0 이하일 경우 평단 변경 없음", () => {
    const result = calculateNewAvgPriceOnBuy("50000", 10, "60000", 0);
    expect(result).toBe("50000");
  });

  test("소수점 반올림 정확히 동작", () => {
    // (50000 × 3 + 60000 × 1) / 4 = 210000 / 4 = 52500
    const result = calculateNewAvgPriceOnBuy("50000", 3, "60000", 1);
    expect(result).toBe("52500.00");
  });
});

// ─── calculateNewAvgPriceOnSell tests ─────────────────────────────────────

describe("calculateNewAvgPriceOnSell", () => {
  test("FIFO 방식: 매도 시 평단 가격 유지", () => {
    const avgPrice = "55000.00";
    const result = calculateNewAvgPriceOnSell(avgPrice, 20, 5);
    expect(result).toBe("55000.00");
  });

  test("전량 매도 시 '0' 반환", () => {
    const result = calculateNewAvgPriceOnSell("55000.00", 10, 10);
    expect(result).toBe("0");
  });

  test("초과 매도 시 '0' 반환", () => {
    const result = calculateNewAvgPriceOnSell("55000.00", 10, 15);
    expect(result).toBe("0");
  });

  test("매도량이 0 이하일 경우 평단 변경 없음", () => {
    const result = calculateNewAvgPriceOnSell("55000.00", 10, 0);
    expect(result).toBe("55000.00");
  });
});

// ─── calculateProfitLoss tests ────────────────────────────────────────────

describe("calculateProfitLoss", () => {
  test("이익 발생 시 양수 PnL 계산", () => {
    // 현재가 70,000원, 평단 50,000원, 10주 → (70000 - 50000) × 10 = 200,000
    const result = calculateProfitLoss("70000", "50000", 10);
    expect(result).toBe("200000.00");
  });

  test("손실 발생 시 음수 PnL 계산", () => {
    // 현재가 40,000원, 평단 50,000원, 10주 → (40000 - 50000) × 10 = -100,000
    const result = calculateProfitLoss("40000", "50000", 10);
    expect(result).toBe("-100000.00");
  });

  test("손익 없음 경우", () => {
    const result = calculateProfitLoss("50000", "50000", 10);
    expect(result).toBe("0.00");
  });

  test("소수점 반올림", () => {
    // (50123.456 - 50000) × 3 = 123.456 × 3 = 370.368 → 370.37
    const result = calculateProfitLoss("50123.456", "50000", 3);
    expect(result).toBe("370.37");
  });
});

// ─── calculateRateOfReturn tests ──────────────────────────────────────────

describe("calculateRateOfReturn", () => {
  test("수익률 양수 계산", () => {
    // 현재가 60,000원, 평단 50,000원 → ((60000-50000)/50000) × 100 = 20%
    const result = calculateRateOfReturn("60000", "50000");
    expect(result).toBe("20.00");
  });

  test("수익률 음수 계산", () => {
    // 현재가 45,000원, 평단 50,000원 → ((45000-50000)/50000) × 100 = -10%
    const result = calculateRateOfReturn("45000", "50000");
    expect(result).toBe("-10.00");
  });

  test("평단이 0일 경우 0 반환", () => {
    const result = calculateRateOfReturn("50000", "0");
    expect(result).toBe("0");
  });

  test("손익 없음 경우 0%", () => {
    const result = calculateRateOfReturn("50000", "50000");
    expect(result).toBe("0.00");
  });
});

// ─── calculateTotalValue tests ────────────────────────────────────────────

describe("calculateTotalValue", () => {
  test("총 자산 가치 계산", () => {
    // 100주 × 55,000원 = 5,500,000원
    const result = calculateTotalValue(100, "55000");
    expect(result).toBe("5500000.00");
  });

  test("소수점 포함 가격", () => {
    // 50주 × 12,345.67원 = 617,283.50원
    const result = calculateTotalValue(50, "12345.67");
    expect(result).toBe("617283.50");
  });
});

// ─── calculateCostBasis tests ─────────────────────────────────────────────

describe("calculateCostBasis", () => {
  test("매수 비용 기준 계산", () => {
    // 100주 × 50,000원 = 5,000,000원
    const result = calculateCostBasis(100, "50000");
    expect(result).toBe("5000000.00");
  });

  test("평단 가격이 소수점일 경우", () => {
    // 150주 × 10,666.67원 = 1,600,000.50원
    const result = calculateCostBasis(150, "10666.67");
    expect(result).toBe("1600000.50");
  });
});

// ─── processTradeHistory tests ────────────────────────────────────────────

describe("processTradeHistory", () => {
  test("매수만 있는 경우", () => {
    const result = processTradeHistory(0, "0", [
      { type: "buy", quantity: 10, price: "50000" },
      { type: "buy", quantity: 10, price: "60000" },
    ]);
    expect(result.quantity).toBe(20);
    expect(result.avgPrice).toBe("55000.00");
  });

  test("매수 후 일부 매도", () => {
    // 매수: 100주 @ 10,000원 → 평단 10,000원
    // 매도: 30주 → 평단 유지, 잔고 70주
    const result = processTradeHistory(0, "0", [
      { type: "buy", quantity: 100, price: "10000" },
      { type: "sell", quantity: 30, price: "12000" },
    ]);
    expect(result.quantity).toBe(70);
    expect(result.avgPrice).toBe("10000.00");
  });

  test("매수 → 매도 → 재매수 시나리오", () => {
    const result = processTradeHistory(0, "0", [
      { type: "buy", quantity: 50, price: "30000" },
      { type: "sell", quantity: 20, price: "35000" },
      { type: "buy", quantity: 30, price: "40000" },
    ]);
    // 첫 매수: 50주 @ 30,000원 → 평단 30,000원
    // 매도: 20주 → 잔고 30주, 평단 30,000원 유지
    // 재매수: 30주 @ 40,000원
    // 새 평단: (30000 × 30 + 40000 × 30) / 60 = 2100000 / 60 = 35,000원
    expect(result.quantity).toBe(60);
    expect(result.avgPrice).toBe("35000.00");
  });

  test("보유량 초과 매도는 무시됨", () => {
    const result = processTradeHistory(0, "0", [
      { type: "buy", quantity: 10, price: "50000" },
      { type: "sell", quantity: 50, price: "60000" }, // 10주만 보유 가능
    ]);
    expect(result.quantity).toBe(0);
    expect(result.avgPrice).toBe("0");
  });

  test("빈 거래 목록은 초기 상태 유지", () => {
    const result = processTradeHistory(100, "25000", []);
    expect(result.quantity).toBe(100);
    expect(result.avgPrice).toBe("25000");
  });
});

// ─── validateSellOrder tests ──────────────────────────────────────────────

describe("validateSellOrder", () => {
  test("정상적인 매도 주문 시 에러 없음", () => {
    expect(() => validateSellOrder(100, 50)).not.toThrow();
  });

  test("음수 매도량일 경우 에러 발생", () => {
    expect(() => validateSellOrder(100, -10)).toThrow("Sell quantity must be positive");
  });

  test("보유량 초과 매도 시 에러 발생", () => {
    expect(() => validateSellOrder(100, 150)).toThrow(
      "Insufficient holdings: requested 150, available 100"
    );
  });

  test("정확히 보유량만큼 매도는 정상", () => {
    expect(() => validateSellOrder(100, 100)).not.toThrow();
  });
});
