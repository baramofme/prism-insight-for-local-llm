import PageContainer from '@/components/layout/page-container';
import { getStockDetail } from '@/features/finance/data/mock';
import { FinanceView } from '@/features/finance/finance-view';

export const metadata = { title: '종목 상세 | Finance' };

export default async function FinanceSymbolPage({
  params
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const detail = getStockDetail(decodeURIComponent(symbol));
  return (
    <PageContainer>
      <FinanceView detail={detail} />
    </PageContainer>
  );
}
