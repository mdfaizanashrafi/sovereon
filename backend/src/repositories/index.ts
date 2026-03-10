/**
 * ============================================================================
 * REPOSITORIES - Barrel Export
 * ============================================================================
 * Export all repositories and types for dependency injection
 */

// Base repository
export {
  BaseRepository,
  type PaginationOptions,
  type SortOptions,
  type FilterOptions,
  type QueryOptions,
  type PaginatedResult,
} from './BaseRepository';

// Cached repository
export {
  CachedRepository,
  CachedRepositoryWrapper,
  withCaching,
  cacheable,
  invalidate,
  type RepositoryCacheConfig,
  type CacheableMethodOptions,
} from './CachedRepository';

// Entity repositories
export { AdminUserRepository, type AdminUser } from './AdminUserRepository';
export { FAQRepository, type FAQ } from './FAQRepository';
export { InvoiceRepository, type Invoice } from './InvoiceRepository';
export { OrderRepository, type Order } from './OrderRepository';
export { PaymentRepository, type Payment } from './PaymentRepository';
export { ServiceCategoryRepository, type ServiceCategory } from './ServiceCategoryRepository';
export { ServiceCMSRepository, type ServiceCMS } from './ServiceCMSRepository';
export { ServiceRepository, type Service } from './ServiceRepository';
export { SubscriptionRepository, type Subscription } from './SubscriptionRepository';
export { TeamMemberRepository, type TeamMember } from './TeamMemberRepository';
export { TestimonialRepository, type Testimonial } from './TestimonialRepository';
export { UserRepository, type User } from './UserRepository';

// Repository factory for dependency injection
import { AdminUserRepository } from './AdminUserRepository';
import { FAQRepository } from './FAQRepository';
import { InvoiceRepository } from './InvoiceRepository';
import { OrderRepository } from './OrderRepository';
import { PaymentRepository } from './PaymentRepository';
import { ServiceCategoryRepository } from './ServiceCategoryRepository';
import { ServiceCMSRepository } from './ServiceCMSRepository';
import { ServiceRepository } from './ServiceRepository';
import { SubscriptionRepository } from './SubscriptionRepository';
import { TeamMemberRepository } from './TeamMemberRepository';
import { TestimonialRepository } from './TestimonialRepository';
import { UserRepository } from './UserRepository';
import { getPrismaClient } from '../database/client';

/**
 * Repository Factory
 * Centralized factory for creating repository instances
 * Supports dependency injection for testing
 */
export class RepositoryFactory {
  private static instances: Map<string, any> = new Map();

  static getAdminUserRepository(): AdminUserRepository {
    return this.getInstance('adminUser', () => new AdminUserRepository());
  }

  static getFAQRepository(): FAQRepository {
    return this.getInstance('faq', () => new FAQRepository());
  }

  static getInvoiceRepository(): InvoiceRepository {
    return this.getInstance('invoice', () => new InvoiceRepository());
  }

  static getOrderRepository(): OrderRepository {
    return this.getInstance('order', () => new OrderRepository());
  }

  static getPaymentRepository(): PaymentRepository {
    return this.getInstance('payment', () => new PaymentRepository());
  }

  static getServiceCategoryRepository(): ServiceCategoryRepository {
    return this.getInstance('serviceCategory', () => new ServiceCategoryRepository());
  }

  static getServiceCMSRepository(): ServiceCMSRepository {
    return this.getInstance('serviceCMS', () => new ServiceCMSRepository());
  }

  static getServiceRepository(): ServiceRepository {
    return this.getInstance('service', () => new ServiceRepository());
  }

  static getSubscriptionRepository(): SubscriptionRepository {
    return this.getInstance('subscription', () => new SubscriptionRepository());
  }

  static getTeamMemberRepository(): TeamMemberRepository {
    return this.getInstance('teamMember', () => new TeamMemberRepository());
  }

  static getTestimonialRepository(): TestimonialRepository {
    return this.getInstance('testimonial', () => new TestimonialRepository());
  }

  static getUserRepository(): UserRepository {
    return this.getInstance('user', () => new UserRepository());
  }

  /**
   * Reset all instances (useful for testing)
   */
  static reset(): void {
    this.instances.clear();
  }

  private static getInstance<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory());
    }
    return this.instances.get(key);
  }
}

// Convenience exports for direct usage
export const repositories = {
  adminUser: () => RepositoryFactory.getAdminUserRepository(),
  faq: () => RepositoryFactory.getFAQRepository(),
  invoice: () => RepositoryFactory.getInvoiceRepository(),
  order: () => RepositoryFactory.getOrderRepository(),
  payment: () => RepositoryFactory.getPaymentRepository(),
  serviceCategory: () => RepositoryFactory.getServiceCategoryRepository(),
  serviceCMS: () => RepositoryFactory.getServiceCMSRepository(),
  service: () => RepositoryFactory.getServiceRepository(),
  subscription: () => RepositoryFactory.getSubscriptionRepository(),
  teamMember: () => RepositoryFactory.getTeamMemberRepository(),
  testimonial: () => RepositoryFactory.getTestimonialRepository(),
  user: () => RepositoryFactory.getUserRepository(),
};

export default RepositoryFactory;
