/**
 * ============================================================================
 * PAGE LOADER
 * ============================================================================
 * Loading component for suspended routes
 */

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-pulse space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
