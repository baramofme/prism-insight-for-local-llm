"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signUp.email({ name, email, password });
    setLoading(false);
    if (error) {
      setError(error.message ?? "회원가입에 실패했습니다.");
      return;
    }
    router.push("/dashboard");
  };

  const handleGoogle = async () => {
    setError(null);
    await signIn.social({ provider: "google", callbackURL: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">PRISM</span>
            </div>
          </div>
          <CardTitle className="text-xl">회원가입</CardTitle>
          <CardDescription>AI 분석을 시작하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input id="name" placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "가입 중…" : "가입하기"}
            </Button>
          </form>
          <Button type="button" variant="outline" className="w-full mt-3" onClick={handleGoogle}>
            Google로 계속하기
          </Button>
          <div className="text-center text-sm text-muted-foreground mt-4">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-primary hover:underline">로그인</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
