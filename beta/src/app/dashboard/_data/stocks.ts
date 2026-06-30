export const mostActiveStocks: {
  rank: number;
  name: string;
  ticker: string;
  price: string;
  change: string;
  isPositive: boolean;
  basePrice: number;
  volume: string;
}[] = [
  {
    rank: 1,
    name: "JW신약",
    ticker: "(067290)",
    price: "₩2,335",
    change: "+13.08%",
    isPositive: true,
    basePrice: 2335,
    volume: "82.3M",
  },
  {
    rank: 2,
    name: "GW바이오텍",
    ticker: "(036180)",
    price: "₩2",
    change: "-60.00%",
    isPositive: false,
    basePrice: 2,
    volume: "71.8M",
  },
  {
    rank: 3,
    name: "삼성전자",
    ticker: "(005930)",
    price: "₩354,000",
    change: "-2.34%",
    isPositive: false,
    basePrice: 354000,
    volume: "65.2M",
  },
  {
    rank: 4,
    name: "우리로",
    ticker: "(046970)",
    price: "₩7,350",
    change: "-9.82%",
    isPositive: false,
    basePrice: 7350,
    volume: "42.1M",
  },
];

export const gainers: {
  rank: number;
  name: string;
  ticker: string;
  price: string;
  change: string;
  isPositive: boolean;
  basePrice: number;
}[] = [
  {
    rank: 1,
    name: "삼익제약",
    ticker: "(014950)",
    price: "₩8,410",
    change: "+29.98%",
    isPositive: true,
    basePrice: 8410,
  },
  {
    rank: 2,
    name: "한울반도체",
    ticker: "(320000)",
    price: "₩17,820",
    change: "+29.98%",
    isPositive: true,
    basePrice: 17820,
  },
  {
    rank: 3,
    name: "다스코",
    ticker: "(058730)",
    price: "₩3,470",
    change: "+29.96%",
    isPositive: true,
    basePrice: 3470,
  },
  {
    rank: 4,
    name: "시지메드텍",
    ticker: "(056090)",
    price: "₩1,618",
    change: "+29.96%",
    isPositive: true,
    basePrice: 1618,
  },
];

export const losers: {
  rank: number;
  name: string;
  ticker: string;
  price: string;
  change: string;
  isPositive: boolean;
  basePrice: number;
}[] = [
  {
    rank: 1,
    name: "에이디칩스",
    ticker: "(054630)",
    price: "₩15",
    change: "-84.04%",
    isPositive: false,
    basePrice: 15,
  },
  {
    rank: 2,
    name: "국보",
    ticker: "(001140)",
    price: "₩14",
    change: "-83.53%",
    isPositive: false,
    basePrice: 14,
  },
  {
    rank: 3,
    name: "선샤인푸드케어",
    ticker: "(217620)",
    price: "₩5",
    change: "-78.26%",
    isPositive: false,
    basePrice: 5,
  },
  {
    rank: 4,
    name: "푸른소나무",
    ticker: "(057880)",
    price: "₩6",
    change: "-68.42%",
    isPositive: false,
    basePrice: 6,
  },
];
