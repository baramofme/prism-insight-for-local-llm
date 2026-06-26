'use client';

import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileViewPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  return (
    <div className='flex w-full flex-col p-4'>
      <Card className='max-w-md'>
        <CardHeader>
          <CardTitle>프로필</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div>
            <div className='text-muted-foreground text-sm'>이름</div>
            <div>{user?.name ?? '-'}</div>
          </div>
          <div>
            <div className='text-muted-foreground text-sm'>이메일</div>
            <div>{user?.email ?? '-'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
