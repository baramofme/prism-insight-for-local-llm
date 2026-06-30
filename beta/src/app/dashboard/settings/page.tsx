"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-muted-foreground mt-1">분석 환경 및 API 연결 설정</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">일반</TabsTrigger>
          <TabsTrigger value="api">API 연결</TabsTrigger>
          <TabsTrigger value="alert">알림</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>분석 언어</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Label>기본 분석 언어</Label>
              <div className="flex gap-2">
                <Button variant="default">한국어</Button>
                <Button variant="secondary">English</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>시장 선택</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Label>분석 대상 시장</Label>
              <div className="flex gap-2">
                <Button variant="default">US</Button>
                <Button variant="secondary">KR</Button>
                <Button variant="secondary">Both</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>AI 서비스 연결</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>AI 서비스 URL</Label>
                <Input value="http://localhost:3001" readOnly className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">AI 분석 HazelJS 서버 주소</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>LLM 서버</Label>
                <Input value="http://localhost:8081" readOnly className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">로컬 LLM (llama.cpp / Qwen) 주소</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Vane 검색</Label>
                <Input value="http://localhost:3003" readOnly className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">AI 웹 검색 엔진</p>
              </div>
              <Button className="mt-4">연결 테스트</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alert" className="mt-4">
          <Card>
            <CardHeader><CardTitle>텔레그램 알림</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>텔레그램 봇 토큰</Label>
                <Input type="password" placeholder="봇 토큰 입력" />
              </div>
              <div className="space-y-2">
                <Label>채널 ID</Label>
                <Input placeholder="@channel 또는 ID" />
              </div>
              <Button variant="secondary">저장</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
