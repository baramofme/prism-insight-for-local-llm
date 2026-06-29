export interface SectorData { 
  name: string; 
  fullName: string; 
  price: string; 
  changeVal: string; 
  change: string; 
  positive: boolean; 
  basePrice: number; 
  prevClose: string; 
  open: string; 
  high: string; 
  low: string; 
  volume: string; 
  mktCap: string; 
}

export const sectorIndices: SectorData[] = [
  { name: "SIXB", fullName: "Materials", price: "1,097.08", changeVal: "-5.00", change: "-0.45%", positive: false, basePrice: 1097, prevClose: "1,102.08", open: "1,100.50", high: "1,103.20", low: "1,095.40", volume: "—", mktCap: "—" },
  { name: "SIXC", fullName: "Communications", price: "571.79", changeVal: "+1.54", change: "+0.27%", positive: true, basePrice: 571, prevClose: "570.25", open: "570.80", high: "573.10", low: "569.90", volume: "—", mktCap: "—" },
  { name: "SIXE", fullName: "Energy", price: "1,124.31", changeVal: "-19.31", change: "-1.69%", positive: false, basePrice: 1124, prevClose: "1,143.62", open: "1,140.00", high: "1,142.50", low: "1,120.80", volume: "—", mktCap: "—" },
  { name: "SIXI", fullName: "Industrials", price: "1,820.63", changeVal: "+13.01", change: "+0.72%", positive: true, basePrice: 1820, prevClose: "1,807.62", open: "1,809.00", high: "1,825.40", low: "1,806.30", volume: "—", mktCap: "—" },
  { name: "SIXM", fullName: "Financials", price: "658.84", changeVal: "-6.05", change: "-0.91%", positive: false, basePrice: 658, prevClose: "664.89", open: "663.50", high: "665.20", low: "657.10", volume: "—", mktCap: "—" },
  { name: "SIXR", fullName: "Staples", price: "837.82", changeVal: "-4.13", change: "-0.49%", positive: false, basePrice: 837, prevClose: "841.95", open: "841.00", high: "842.30", low: "836.50", volume: "—", mktCap: "—" },
  { name: "SIXRE", fullName: "Real estate", price: "214.08", changeVal: "-0.62", change: "-0.29%", positive: false, basePrice: 214, prevClose: "214.70", open: "214.50", high: "215.10", low: "213.60", volume: "—", mktCap: "—" },
  { name: "SIXT", fullName: "Technology", price: "3,853.63", changeVal: "+115.23", change: "+3.08%", positive: true, basePrice: 3853, prevClose: "3,738.40", open: "3,745.00", high: "3,860.20", low: "3,740.10", volume: "—", mktCap: "—" },
  { name: "SIXU", fullName: "Utilities", price: "901.60", changeVal: "+5.91", change: "+0.66%", positive: true, basePrice: 901, prevClose: "895.69", open: "896.50", high: "903.40", low: "895.20", volume: "—", mktCap: "—" },
  { name: "SIXV", fullName: "Health care", price: "1,505.60", changeVal: "-12.91", change: "-0.85%", positive: false, basePrice: 1505, prevClose: "1,518.51", open: "1,516.00", high: "1,519.30", low: "1,503.20", volume: "—", mktCap: "—" },
  { name: "SIXY", fullName: "Discretionary", price: "2,365.50", changeVal: "+35.24", change: "+1.51%", positive: true, basePrice: 2365, prevClose: "2,330.26", open: "2,335.00", high: "2,370.80", low: "2,332.40", volume: "—", mktCap: "—" },
];
