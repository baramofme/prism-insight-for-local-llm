import type { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { MarketOverview } from '@/features/finance/components/market-overview';

export const metadata: Metadata = { title: 'Market Overview | Finance' };

export default function FinancePage() {
  return (
    <PageContainer pageTitle='Finance' pageDescription='Market Overview'>
      <MarketOverview />
    </PageContainer>
  );
}
