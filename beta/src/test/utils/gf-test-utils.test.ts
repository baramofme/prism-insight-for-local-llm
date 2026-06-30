import { setViewport, getElementBox, compareColors } from '@/test/utils/gf-test-utils';

describe('gf-test-utils', () => {
  describe('setViewport', () => {
    it('should set window dimensions', () => {
      setViewport(1920, 1080);
      expect(window.innerWidth).toBe(1920);
      expect(window.innerHeight).toBe(1080);
    });
  });

  describe('getElementBox', () => {
    it('should return null for null element', () => {
      expect(getElementBox(null)).toBeNull();
    });

    it('should return DOMRect for valid element', () => {
      document.body.innerHTML = '<div id="test-box" style="width: 100px; height: 50px;"></div>';
      const el = document.getElementById('test-box');
      const box = getElementBox(el);
      expect(box).not.toBeNull();
    });
  });

  describe('compareColors', () => {
    it('should match identical hex colors', () => {
      expect(compareColors('#ff0000', '#ff0000')).toBe(true);
    });

    it('should reject different hex colors', () => {
      expect(compareColors('#ff0000', '#0000ff')).toBe(false);
    });

    it('should match similar rgb colors within tolerance', () => {
      expect(compareColors('rgb(255,0,0)', 'rgb(254,0,0)')).toBe(true);
    });

    it('should handle rgba format', () => {
      expect(compareColors('rgba(0,128,255,1)', 'rgb(0,128,255)')).toBe(true);
    });
  });
});
