# PRISM-INSIGHT Reboot: Service Plan

## 1. 아키텍처 개요

```
┌──────────────────────────────────────────────────────┐
│                    Browser                            │
└────────────────────┬─────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────┐
│              OpenStock (Next.js)                      │
│  포트: 3000                                           │
│  인증: Better Auth + MongoDB                          │
│  차트: TradingView widgets                            │
│  데이터: 우리 백엔드 API 호출                          │
│  저장: MongoDB (사용자, watchlist)                    │
└────────────────────┬─────────────────────────────────┘
                     │ REST API (localhost:3001)
                     ▼
┌──────────────────────────────────────────────────────┐
│            AI 분석 서비스 (HazelJS)                    │
│  포트: 3001                                           │
│  오케스트레이션: @hazeljs/agent + @hazeljs/flow        │
│  프롬프트: @hazeljs/prompts                           │
│  LLM: @hazeljs/ai (로컬 Qwen or cloud)                │
│  데이터 분석: polars-js                               │
│  저장: SQLite (거래/성과)                             │
└──────┬──────────┬──────────┬─────────────────────────┘
       │          │          │
       ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│yfinance │ │ kospi/  │ │ vane    │
│US 데이터│ │ kosdaq  │ │ 뉴스    │
│(무료)   │ │(무료)   │ │(자체)   │
└─────────┘ └─────────┘ └─────────┘
```

## 2. 서비스 경계

### OpenStock (Frontend + Auth)
| 책임 | 기술 |
|------|------|
| 사용자 가입/로그인 | Better Auth + MongoDB |
| 종목 검색 | 백엔드 API로 위임 |
| TradingView 차트 | embed widgets |
| Watchlist 관리 | MongoDB |
| AI 분석 요청 | REST API 호출 |
| 분석 결과 표시 | React 컴포넌트 |

### AI 분석 서비스 (Backend)
| 책임 | 기술 |
|------|------|
| US 주가/재무 데이터 | yfinance |
| 한국 주가 데이터 | kospi_kosdaq MCP |
| 뉴스 분석 | vane (자체호스팅) |
| 웹 스크래핑 | crw-mcp (자체호스팅) |
| AI 에이전트 분석 | HazelJS Agents |
| 리포트 생성 | HazelJS Flow |
| 매매 엔진 (시뮬레이션) | SQLite + Agent |
| PDF 리포트 | Puppeteer |
| 텔레그램 전송 | node-telegram-bot-api |

## 3. API 명세

### OpenStock → AI 서비스

```
POST /api/v1/analyze
  Body: { symbol, market: "US"|"KR", language: "ko"|"en" }
  Response: {
    analysis_id,
    report_summary: { price_analysis, technical, financial, news, strategy },
    status: "pending" | "complete"
  }

GET /api/v1/analyze/:analysisId
  Response: { status, report_markdown, pdf_url, generated_at }

POST /api/v1/stock/:symbol
  Body: { market: "US"|"KR" }
  Response: { price, profile, financials, news[] }

POST /api/v1/watchlist/analyze
  Body: { symbols: string[], language }
  Response: { analyses: Analysis[] }

POST /api/v1/trade/simulate
  Body: { symbol, action: "buy"|"sell", amount, price }
  Response: { trade_id, result, portfolio_summary }

GET /api/v1/portfolio
  Response: { holdings[], performance, history[] }
```

## 4. 사용자 시나리오

### 4.1 로그인 → 종목 분석
```
1. OpenStock 로그인 (Better Auth)
2. 종목 검색 (AAPL, 삼성전자)
3. "AI 분석" 버튼 클릭
4. AI 서비스: yfinance + kospi + vane + crw → 13개 에이전트 분석
5. 분석 완료 → OpenStock에 결과 표시
6. TradingView 차트 + AI 분석 리포트 함께 보기
```

### 4.2 데일리 분석
```
1. 스케줄러가 매일 장 마감 후 실행
2. watchlist 기반 자동 분석
3. 분석 결과 요약 → 이메일 or 텔레그램
4. OpenStock 대시보드 업데이트
```

### 4.3 매매 시뮬레이션
```
1. AI 분석 리포트 하단 "매수 시뮬레이션" 버튼
2. 금액/조건 설정 → Agent가 매수 판단
3. SQLite에 가상 거래 기록
4. 포트폴리오 성과 추적
```

## 5. DB 스키마

### MongoDB (OpenStock)
```
users:     { email, password, name, preferences, watchlists[] }
watchlist: { userId, symbol, market, addedAt }
```

### SQLite (AI 서비스)
```
holdings:    { id, symbol, market, buy_price, quantity, buy_date, scenario }
trades:      { id, symbol, action, price, quantity, pnl, date }
analysis:    { id, symbol, market, report_md, pdf_path, created_at }
portfolio:   { id, cash, total_value, last_updated }
```

## 6. 배포 (Docker Compose)

```yaml
services:
  openstock:       # Next.js UI (포트 3000)
  ai-service:      # HazelJS 분석 서버 (포트 3001)
  mongo:           # MongoDB (OpenStock 전용)
  crw:             # 웹 스크래핑 (ghcr.io/us/crw)
  vane:            # 뉴스 검색 (로컬 Next.js)
  llm:             # 로컬 LLM (llama.cpp, 포트 8081)
```

## 7. 개발 순서

### Phase 1 (2주): Core
```yaml
Week 1:
  - OpenStock 로컬 세팅 + 실행
  - AI 서비스 스캐폴딩 (HazelJS)
  - yfinance API 래퍼
  - OpenStock ↔ AI 서비스 연동 (기본 분석)
Week 2:
  - 13개 에이전트 프롬프트 이식
  - MCP 서버 통합 (crw, vane)
  - AI 분석 결과 OpenStock UI 표시
```

### Phase 2 (2주): 에이전트 완성
```yaml
Week 3:
  - 한국 시장 분석 (kospi_kosdaq)
  - 기술적 분석 보강 (polars-js)
  - 뉴스/섹터 분석
Week 4:
  - 리포트 PDF 생성
  - 텔레그램 전송
  - 매매 시뮬레이션 엔진
```

### Phase 3 (1주): 운영
```yaml
Week 5:
  - 스케줄러 (데일리 분석)
  - 포트폴리오 성과 추적
  - Docker compose 통합
  - 배포
```

## 8. 비용 (월)

| 항목 | 비용 | 비고 |
|------|------|------|
| Finnhub | $0 | 안 씀, yfinance로 대체 |
| yfinance | $0 | 무료 |
| kospi_kosdaq | $0 | 무료 |
| crw | $0 | 자체호스팅 |
| vane | $0 | 자체호스팅 |
| LLM (Qwen) | $0 | 자체호스팅 (llama.cpp) |
| MongoDB | $0 | Docker 자체호스팅 |
| 텔레그램 | $0 | 무료 |
| 서버 호스팅 | ~$10~30 | VPS |
| **합계** | **$10~30/월** | |
