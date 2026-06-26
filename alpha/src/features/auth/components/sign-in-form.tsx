'use client';

import { useState } from 'react';
import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn.email({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message ?? '로그인에 실패했습니다.');
      return;
    }
    window.location.href = '/dashboard/overview';
  };

  return (
    <form onSubmit={submit} className='w-full max-w-sm space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='email'>이메일</Label>
        <Input id='email' type='email' placeholder='name@example.com' value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='password'>비밀번호</Label>
        <Input id='password' type='password' placeholder='••••••••' value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p className='text-destructive text-sm'>{error}</p>}
      <Button type='submit' className='w-full' disabled={loading}>
        {loading ? '로그인 중…' : '로그인'}
      </Button>
      <Button type='button' variant='outline' className='w-full' onClick={() => signIn.social({ provider: 'google', callbackURL: '/dashboard/overview' })}>
        Google로 계속하기
      </Button>
    </form>
  );
}
