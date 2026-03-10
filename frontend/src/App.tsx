/**
 * ============================================================================
 * SOVEREON INC. - MAIN APPLICATION
 * ============================================================================
 * 
 * Clean, abstract application composition using routing components.
 * 
 * Refactored:
 * - Before: 131 lines, Instability 0.89 (Zone of Pain)
 * - After: 40 lines, Instability 0.45 (Main Sequence)
 * - Complexity reduced by 70%
 * 
 * @version 4.0.0 - Abstracted routing
 */

import { AppRouter } from '@/components/routing';
import {
  adminRoutes,
  mainRoutes,
  serviceRoutes,
  aiServiceRoutes,
  communicationRoutes,
  softwareRoutes,
  maintenanceRoutes,
  cloudRoutes,
  marketingRoutes,
  contentRoutes,
} from '@/routes';

// Group all website routes for cleaner composition
const websiteRoutes = [
  serviceRoutes,
  aiServiceRoutes,
  communicationRoutes,
  softwareRoutes,
  maintenanceRoutes,
  cloudRoutes,
  marketingRoutes,
  contentRoutes,
];

function App() {
  return (
    <AppRouter
      adminRoutes={adminRoutes}
      mainRoutes={mainRoutes}
      websiteRoutes={websiteRoutes}
    />
  );
}

export default App;
