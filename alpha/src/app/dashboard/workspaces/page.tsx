'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { workspacesInfoContent } from '@/config/infoconfig';

export default function WorkspacesPage() {
  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
      infoContent={workspacesInfoContent}
    >
      <Card>
        <CardContent className='text-muted-foreground p-6'>
          워크스페이스(조직) 관리는 Better Auth organizations로 연동 예정입니다.
        </CardContent>
      </Card>
    </PageContainer>
  );
}
