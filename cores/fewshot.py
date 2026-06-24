"""
Market-regime fixed fewshot templates for local LLM inference.

All templates are 100% static strings — no variable interpolation.
This guarantees KV cache stability under llama.cpp prefix caching:
the same prefix tokens are reused across all invocations in the same
market regime.

Usage
-----
from cores.fewshot import get_fewshot_for_regime

template = get_fewshot_for_regime("bull", language="ko")
# template is a literal str with no f-strings / .format()
"""

# ── Bull market examples (Korean) ───────────────────────────────────────────

FEWSHOT_BULL_KO = """
## 투자 전략 예시 (강세장)

**예시 분석:**
[기업 A]는 최근 강한 상승 추세를 보이고 있으며, 거래량도 증가 추세입니다.
기관 매수가 지속적으로 유입되고 있고, 업종 내에서도 상대적 강세를 나타내고 있습니다.

**투자 전략:**
- 단기 트레이더: 20일 이동평균선 위에서 강한 모멘텀이 확인되며 단기 매수 관점 유지
- 중기 투자자: 실적 개선과 업황 호조가 지속될 경우 비중 확대 검토
- 리스크 관리: 60일 이동평균선 이탈 시 손절 고려
"""

FEWSHOT_BULL_EN = """
## Investment Strategy Example (Bull Market)

**Sample Analysis:**
[Company A] is showing a strong upward trend with increasing volume.
Institutional buying continues, and the stock shows relative strength within the sector.

**Investment Strategy:**
- Short-term trader: Maintain long bias while momentum holds above 20-day MA
- Mid-term investor: Consider increasing position if earnings improvement continues
- Risk management: Consider stop-loss if price breaks below 60-day MA
"""

# ── Bear market examples (Korean) ────────────────────────────────────────────

FEWSHOT_BEAR_KO = """
## 투자 전략 예시 (약세장)

**예시 분석:**
[기업 B]는 최근 하락 추세를 보이고 있으며, 거래량도 동반 감소하고 있습니다.
외국인 매도가 지속되고 있고, 업종 전반이 약세를 나타내고 있습니다.

**투자 전략:**
- 단기 트레이더: 반등 시 매도 관점 유지, 신규 매수는 보류
- 중기 투자자: 비중 축소 검토, 바닥 확인 전까지 현금 비중 유지
- 리스크 관리: 손절선을 좁게 설정하고 급락 시 추가 매수는 자제
"""

FEWSHOT_BEAR_EN = """
## Investment Strategy Example (Bear Market)

**Sample Analysis:**
[Company B] is showing a downward trend with declining volume.
Foreign selling continues, and the overall sector is weak.

**Investment Strategy:**
- Short-term trader: Maintain sell-on-rally perspective, hold new buys
- Mid-term investor: Consider reducing position, maintain cash until confirmation
- Risk management: Set tight stop-losses, avoid catching falling knives
"""

# ── Neutral / sideways market examples (Korean) ─────────────────────────────

FEWSHOT_NEUTRAL_KO = """
## 투자 전략 예시 (횡보장)

**예시 분석:**
[기업 C]는 일정 가격 범위 내에서 등락을 반복하고 있습니다.
거래량은 평균 수준을 유지하고 있으며, 특정 방향성은 확인되지 않고 있습니다.

**투자 전략:**
- 단기 트레이더: 박스권 하단 매수-상단 매도 전략 고려
- 중기 투자자: 방향성 확인 전까지 관망, 주요 지지/저항선 돌파 시 대응
- 리스크 관리: 박스권 이탈 시 손절 준비, 변동성 확대에 대비한 분할 매수
"""

FEWSHOT_NEUTRAL_EN = """
## Investment Strategy Example (Sideways Market)

**Sample Analysis:**
[Company C] is moving within a range with average volume.
No clear directional bias is confirmed.

**Investment Strategy:**
- Short-term trader: Consider buy-at-support, sell-at-resistance range strategy
- Mid-term investor: Wait for breakout confirmation before position taking
- Risk management: Prepare stop-loss on range breakdown, use scaled entries
"""

# ── Template lookup ─────────────────────────────────────────────────────────

_FEWSHOT_MAP = {
    ("bull", "ko"): FEWSHOT_BULL_KO,
    ("bull", "en"): FEWSHOT_BULL_EN,
    ("bear", "ko"): FEWSHOT_BEAR_KO,
    ("bear", "en"): FEWSHOT_BEAR_EN,
    ("neutral", "ko"): FEWSHOT_NEUTRAL_KO,
    ("neutral", "en"): FEWSHOT_NEUTRAL_EN,
}


def get_fewshot_for_regime(regime: str, language: str = "ko") -> str:
    """Return the cache-stable fewshot template for a market regime.

    Parameters
    ----------
    regime : str
        One of "bull", "bear", "neutral". Falls back to "neutral" if unknown.
    language : str
        Language code ("ko" or "en").

    Returns
    -------
    str
        A static fewshot template (no variable interpolation).
    """
    key = (regime, language)
    if key not in _FEWSHOT_MAP:
        key = ("neutral", language)
    return _FEWSHOT_MAP[key]
