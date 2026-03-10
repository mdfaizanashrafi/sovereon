/**
 * ============================================================================
 * APP ROUTER
 * ============================================================================
 * Main application router with all routes defined inline
 * React Router v6 requires Route components to be direct children of Routes
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { AdminProvider } from '@/contexts/AdminContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoader } from './PageLoader';
import type { RouteConfig } from '@/routes';

interface AppRouterProps {
  adminRoutes: RouteConfig[];
  mainRoutes: RouteConfig[];
  websiteRoutes: RouteConfig[][];
}

/**
 * Wrap a lazy component with Suspense and error handling
 */
function LazyComponent({ 
  component: Component 
}: { 
  component: React.LazyExoticComponent<React.ComponentType<any>> 
}) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

/**
 * Wrap admin component with AdminProvider and ErrorBoundary
 */
function AdminLazyComponent({ 
  component: Component 
}: { 
  component: React.LazyExoticComponent<React.ComponentType<any>> 
}) {
  return (
    <ErrorBoundary>
      <AdminProvider>
        <Suspense fallback={<PageLoader />}>
          <Component />
        </Suspense>
      </AdminProvider>
    </ErrorBoundary>
  );
}

export function AppRouter({
  adminRoutes,
  mainRoutes,
  websiteRoutes,
}: AppRouterProps) {
  return (
    <Router>
      <Routes>
        {/* Admin Routes - Must be defined before the catch-all Layout route */}
        {adminRoutes.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={<AdminLazyComponent component={route.component} />}
          >
            {route.children?.map(child => (
              <Route
                key={child.path}
                path={child.path}
                element={<AdminLazyComponent component={child.component} />}
              />
            ))}
          </Route>
        ))}

        {/* Main Website Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          
          {/* Main pages */}
          {mainRoutes.map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={<LazyComponent component={route.component} />}
            />
          ))}
          
          {/* All other website routes */}
          {websiteRoutes.map((routeGroup, index) => 
            routeGroup.map(route => (
              <Route
                key={`${index}-${route.path}`}
                path={route.path}
                element={<LazyComponent component={route.component} />}
              />
            ))
          )}
        </Route>
      </Routes>
    </Router>
  );
}
