export const regionIndices: Record<
  string,
  {
    name: string;
    value: string;
    change: string;
    isPositive: boolean;
    basePrice: number;
  }[]
> = {
  미국: [
    { name: "다우 존스 산업평균지수", value: "51,564.70", change: "+0.14%", isPositive: true, basePrice: 51564 },
    { name: "S&P 500", value: "7,500.58", change: "+1.08%", isPositive: true, basePrice: 7500 },
    { name: "나스닥 종합주가지수", value: "26,517.93", change: "+1.91%", isPositive: true, basePrice: 26517 },
    { name: "러셀 2000 지수", value: "2,979.77", change: "+2.12%", isPositive: true, basePrice: 2979 },
    { name: "뉴욕주식시장 변동성지수", value: "16.78", change: "-9.00%", isPositive: false, basePrice: 16 },
  ],
  유럽: [
    { name: "DAX", value: "24,985.82", change: "-0.16%", isPositive: false, basePrice: 24985 },
    { name: "FTSE 100 지수", value: "10,363.27", change: "-0.35%", isPositive: false, basePrice: 10363 },
    { name: "CAC 40", value: "8,421.14", change: "-0.55%", isPositive: false, basePrice: 8421 },
    { name: "IBEX 35", value: "19,347.40", change: "-0.29%", isPositive: false, basePrice: 19347 },
    { name: "유로 스톡스50", value: "6,293.13", change: "-0.48%", isPositive: false, basePrice: 6293 },
  ],
  아시아: [
    { name: "닛케이 평균주가", value: "71,250.06", change: "+0.28%", isPositive: true, basePrice: 71250 },
    { name: "상해종합주가지수", value: "4,090.48", change: "-0.43%", isPositive: false, basePrice: 4090 },
    { name: "항셍지수", value: "23,924.81", change: "-1.59%", isPositive: false, basePrice: 23924 },
    { name: "BSE 센섹스", value: "76,802.90", change: "-0.78%", isPositive: false, basePrice: 76802 },
    { name: "니프티50", value: "24,013.10", change: "-0.64%", isPositive: false, basePrice: 24013 },
  ],
  중남미: [
    { name: "S&P Latin America 40", value: "3,483.82", change: "-0.86%", isPositive: false, basePrice: 3483 },
  ],
  통화: [
    { name: "USD/KRW", value: "1,328.50", change: "-0.08%", isPositive: false, basePrice: 1328 },
    { name: "EUR/KRW", value: "1,456.30", change: "+0.12%", isPositive: true, basePrice: 1456 },
    { name: "JPY/KRW", value: "9.12", change: "+0.34%", isPositive: true, basePrice: 9 },
  ],
  암호화폐: [
    { name: "비트코인", value: "112,345.67", change: "+2.34%", isPositive: true, basePrice: 112345 },
    { name: "이더리움", value: "3,890.12", change: "+1.56%", isPositive: true, basePrice: 3890 },
  ],
  선물: [
    { name: "나스닥 선물", value: "26,542.25", change: "+0.12%", isPositive: true, basePrice: 26542 },
    { name: "S&P 500 선물", value: "7,512.75", change: "+0.18%", isPositive: true, basePrice: 7512 },
    { name: "원유(WTI)", value: "68.45", change: "-1.23%", isPositive: false, basePrice: 68 },
    { name: "금 선물", value: "3,312.50", change: "+0.45%", isPositive: true, basePrice: 3312 },
  ],
};

export const regionTabs = ["미국", "유럽", "아시아", "중남미", "통화", "암호화폐", "선물"];
