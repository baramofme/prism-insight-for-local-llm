export const searchStockSuggestions = [
  { ticker: "005930", name: "삼성전자", price: "₩354,000", change: "-2.34%", positive: false },
  { ticker: "000660", name: "SK하이닉스", price: "₩2,764,000", change: "+2.94%", positive: true },
  { ticker: "329180", name: "HD현대중공업", price: "₩667,000", change: "-2.49%", positive: false },
  { ticker: "006800", name: "미래에셋증권", price: "₩48,750", change: "-3.85%", positive: false },
  { ticker: "009150", name: "삼성전기", price: "₩2,270,000", change: "+3.18%", positive: true },
  { ticker: "AAPL", name: "Apple Inc.", price: "$218.45", change: "+1.23%", positive: true },
  { ticker: "NVDA", name: "NVIDIA", price: "$210.69", change: "+2.95%", positive: true },
  { ticker: "TSLA", name: "Tesla", price: "$412.50", change: "-1.82%", positive: false },
  { ticker: "MSFT", name: "Microsoft", price: "$542.30", change: "+0.87%", positive: true },
  { ticker: "GOOGL", name: "Alphabet", price: "$178.92", change: "+1.45%", positive: true },
];

export const searchAiPrompts = [
  { icon: "Globe", label: "Deep Search", description: "웹 검색으로 시장 분석" },
  { icon: "Brain", label: "AI 리포트 생성", description: "종목 AI 분석 리포트" },
  { icon: "TrendingUp", label: "시장 현황 분석", description: "오늘 시장 동향 요약" },
  { icon: "BarChart3", label: "포트폴리오 분석", description: "내 투자 포트폴리오 점검" },
];

export const footerTickerSuggestions = [
  { id: "005930", label: "삼성전자", exchange: "KRX", price: "₩354,000.00", change: "-2.34%", positive: false, type: "stock" },
  { id: "000660", label: "SK하이닉스", exchange: "KRX", price: "₩2,764,000.00", change: "+2.94%", positive: true, type: "stock" },
  { id: "SPY", label: "S&P 500", exchange: "NYSE", price: "$542.50", change: "-0.35%", positive: false, type: "index" },
  { id: "NVDA", label: "NVIDIA", exchange: "NASDAQ", price: "$210.69", change: "+2.95%", positive: true, type: "stock" },
  { id: "QQQ", label: "Invesco QQQ", exchange: "NASDAQ", price: "$485.20", change: "+1.12%", positive: true, type: "index" },
  { id: "KOSPI", label: "코스피", exchange: "KRX", price: "2,745.83", change: "-0.45%", positive: false, type: "index" },
  { id: "TSLA", label: "Tesla", exchange: "NASDAQ", price: "$348.50", change: "+4.23%", positive: true, type: "stock" },
  { id: "005380", label: "현대차", exchange: "KRX", price: "₩245,000", change: "+1.03%", positive: true, type: "stock" },
];
