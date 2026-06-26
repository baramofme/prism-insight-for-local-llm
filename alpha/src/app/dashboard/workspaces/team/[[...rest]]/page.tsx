'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { teamInfoContent } from '@/config/infoconfig';

export default function TeamPage() {
  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription='Manage your workspace team, members, roles, security and more.'
      infoContent={teamInfoContent}
    >
      <Card>
        <CardContent className='text-muted-foreground p-6'>
          팀/멤버 관리는 Better Auth organizations로 연동 예정입니다.
        </CardContent>
      </Card>
    </PageContainer>
  );
}
