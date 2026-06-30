import type { ReactNode } from 'react';

/**
 * 네비게이션 메뉴 아이템
 * Google Finance UI 사이드바/네비 레일 메뉴 구조 정의
 */
export interface NavigationItem {
  /** 아이콘 컴포넌트 또는 SVG 경로 */
  icon: string;
  /** 메뉴 라벨 텍스트 */
  label: string;
  /** RBAC 역할 요구사항 (모든 사용자 접근 가능 시 'all') */
  role?: 'admin' | 'member' | 'owner' | 'all';
  /** 라우트 경로 */
  route: string;
  /** 활성화 상태 여부 (자동 계산용) */
  isActive?: boolean;
  /** 서브메뉴 아이템들 (재귀적 구조) */
  children?: NavigationItem[];
}

/**
 * 탭 컴포넌트 속성
 * Google Finance UI 탭 패널 구조 정의
 */
export interface TabProps {
  /** 탭 키 (고유 식별자) */
  key: string;
  /** 탭 라벨 텍스트 */
  label: string;
  /** 탭 콘텐츠 JSX */
  content: ReactNode;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 콘텐츠 탭 아이템
 * Google Finance UI 주식 상세 페이지 콘텐츠 탭 구조 정의
 */
export interface ContentTabItem {
  /** 콘텐츠 탭 키: 'overview' | 'financials' | 'news' | 'related' */
  id: 'overview' | 'financials' | 'news' | 'related';
  /** 탭 표시명 */
  displayName: string;
}

/**
 * 차트 설정
 * Google Finance UI 차트 구성 옵션 정의
 */
export interface ChartConfig {
  /** 차트 타입: 'area' | 'line' | 'bar' */
  type: 'area' | 'line' | 'bar';
  /** X축 데이터 키 */
  xKey: string;
  /** Y축 데이터 키 배열 (다중 시리즈 지원) */
  yKeys: string[];
  /** 양수 컬러 CSS 변수 */
  positiveColor: string;
  /** 음수 컬러 CSS 변수 */
  negativeColor: string;
  /** 차트 높이 (px) */
  height?: number;
  /** 그리드 표시 여부 */
  showGrid?: boolean;
  /** 툴팁 표시 여부 */
  showTooltip?: boolean;
}

/** 뷰포트 너비 카테고리: 모바일, 태블릿, 데스크톱, 와이드스크린 */
export type BreakpointCategory = 'mobile' | 'tablet' | 'desktop' | 'widescreen';

/**
 * 뷰포트 너비에 따른 브레이크포인트 카테고리 매핑
 * - < 760px : mobile
 * - < 1480px: tablet
 * - < 1820px: desktop
 * - >= 1820px: widescreen
 */
export function getBreakpointCategory(width: number): BreakpointCategory {
  if (width < 760) return 'mobile';
  if (width < 1480) return 'tablet';
  if (width < 1820) return 'desktop';
  return 'widescreen';
}

/** 네비게이션 레일 가시성 판단 (760px 이상 시 표시) */
export function isNavVisible(width: number): boolean {
  return width >= 760;
}

/** 네비게이션 레일 펼침 상태 판단 (1480px 이상 시 펼침) */
export function isNavExpanded(width: number): boolean {
  return width >= 1480;
}

/** 메인 콘텐츠 영역 왼쪽 마진 계산 (네비 레일 폭 반영) */
export function calculateMainMargin(width: number): string {
  if (width < 760) return '0px';
  if (width < 1480) return '80px';
  return '320px';
}
