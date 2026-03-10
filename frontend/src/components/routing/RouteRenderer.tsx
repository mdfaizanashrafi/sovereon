/**
 * ============================================================================
 * ROUTE RENDERER
 * ============================================================================
 * Renders a route configuration with proper error boundaries and suspense
 */

import { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AdminProvider } from '@/contexts/AdminContext';
import { PageLoader } from './PageLoader';
import type { RouteConfig } from '@/routes';

interface RouteRendererProps {
  route: RouteConfig;
  isAdmin?: boolean;
}

export function RouteRenderer({ route, isAdmin = false }: RouteRendererProps) {
  const Component = route.component;
  
  if (isAdmin) {
    return (
      <Route
        key={route.path}
        path={route.path}
        element={
          <ErrorBoundary>
            <AdminProvider>
              <Suspense fallback={<PageLoader />}>
                <Component />
              </Suspense>
            </AdminProvider>
          </ErrorBoundary>
        }
      >
        {route.children?.map(child => (
          <Route
            key={child.path}
            path={child.path}
            element={
              <Suspense fallback={<PageLoader />}>
                <child.component />
              </Suspense>
            }
          />
        ))}
      </Route>
    );
  }

  return (
    <Route
      key={route.path}
      path={route.path}
      element={
        <Suspense fallback={<PageLoader />}>
          <Component />
        </Suspense>
      }
    />
  );
}
