import { describe, expect, it } from 'bun:test';
import { routeMapping } from './use-breadcrumbs';

describe('routeMapping', () => {
  it('has existing dashboard routes', () => {
    expect(routeMapping['/dashboard']).toBeDefined();
    expect(routeMapping['/dashboard/employee']).toBeDefined();
    expect(routeMapping['/dashboard/product']).toBeDefined();
  });

  it('has /dashboard/finance route with correct breadcrumbs', () => {
    const finance = routeMapping['/dashboard/finance'];
    expect(finance).toBeDefined();
    expect(finance?.length).toBe(2);
    expect(finance?.[0]).toEqual({ title: 'Dashboard', link: '/dashboard' });
    expect(finance?.[1]).toEqual({ title: 'Finance', link: '/dashboard/finance' });
  });

  it('does not modify existing routes', () => {
    expect(routeMapping['/dashboard']?.[0]?.title).toBe('Dashboard');
    expect(routeMapping['/dashboard/employee']?.[1]?.title).toBe('Employee');
    expect(routeMapping['/dashboard/product']?.[1]?.title).toBe('Product');
  });
});
