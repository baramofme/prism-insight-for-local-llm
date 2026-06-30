export const watchlistStocks: {
  name: string; fullName: string; price: string; change: string; positive: boolean; basePrice: number;
  prevClose?: string; open?: string; high?: string; low?: string; volume?: string; mktCap?: string;
}[] = [
  { name: "329180", fullName: "HD현대중공업", price: "₩667,000.00", change: "-2.49%", positive: false, basePrice: 667000, prevClose: "₩684,000", open: "₩680,000", high: "₩685,000", low: "₩665,000", volume: "12.4만", mktCap: "70.01조" },
  { name: "005930", fullName: "삼성전자", price: "₩354,000.00", change: "-2.34%", positive: false, basePrice: 354000, prevClose: "₩362,500", open: "₩360,000", high: "₩361,000", low: "₩352,000", volume: "1,823만", mktCap: "427조" },
  { name: "000660", fullName: "SK하이닉스", price: "₩2,764,000.00", change: "+2.94%", positive: true, basePrice: 2764000, prevClose: "₩2,685,000", open: "₩2,690,000", high: "₩2,800,000", low: "₩2,688,000", volume: "892만", mktCap: "138조" },
];
