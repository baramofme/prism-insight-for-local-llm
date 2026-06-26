'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { billingInfoContent } from '@/config/infoconfig';

export default function BillingPage() {
  return (
    <PageContainer
      infoContent={billingInfoContent}
      pageTitle='Billing & Plans'
      pageDescription='Manage your subscription and usage limits'
    >
      <div className='space-y-6'>
        <Alert>
          <Icons.info className='h-4 w-4' />
          <AlertDescription>
            결제는 Better Auth + Stripe 구독 플러그인으로 연동 예정입니다.
          </AlertDescription>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>준비 중</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground'>Stripe 구독 UI는 추후 연동합니다.</div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
