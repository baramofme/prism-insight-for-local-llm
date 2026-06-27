import { describe, it, expect } from 'bun:test';
import { useAppMode } from './app-mode';

describe('useAppMode store', () => {
  it('initial value is main', () => {
    expect(useAppMode.getState().mode).toBe('main');
  });

  it('setMode changes mode to finance', () => {
    useAppMode.setState({ mode: 'main' }); // reset
    useAppMode.getState().setMode('finance');
    expect(useAppMode.getState().mode).toBe('finance');
  });

  it('toggleMode switches between modes', () => {
    useAppMode.setState({ mode: 'main' }); // reset
    useAppMode.getState().toggleMode();
    expect(useAppMode.getState().mode).toBe('finance');

    useAppMode.getState().toggleMode();
    expect(useAppMode.getState().mode).toBe('main');
  });
});
