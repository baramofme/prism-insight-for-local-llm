"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Plus, TrendingUp, TrendingDown } from "lucide-react";

export default function PortfolioPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">포트폴리오</h1>
          <p className="text-muted-foreground mt-1">매매 시뮬레이션 및 포트폴리오 관리</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />매수</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">총 자산</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₩10,000,000</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">총 수익률</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-500">+0.00%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">보유 종목</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">0</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="holdings">
        <TabsList>
          <TabsTrigger value="holdings">보유 종목</TabsTrigger>
          <TabsTrigger value="history">거래 내역</TabsTrigger>
          <TabsTrigger value="performance">성과 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="mt-4">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>보유한 종목이 없습니다</p>
              <p className="text-sm mt-1">AI 분석 후 매수 시뮬레이션을 시작하세요</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              거래 내역이 없습니다
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              성과 데이터가 없습니다
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
