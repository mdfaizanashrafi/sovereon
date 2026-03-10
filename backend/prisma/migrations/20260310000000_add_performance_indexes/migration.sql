-- ============================================================================
-- PERFORMANCE INDEXES MIGRATION
-- ============================================================================
-- Adds indexes for frequently queried fields to improve query performance

-- TeamMember indexes
CREATE INDEX IF NOT EXISTS "team_member_is_active_order_idx" 
  ON "team_members" ("isActive", "order");

CREATE INDEX IF NOT EXISTS "team_member_department_idx" 
  ON "team_members" ("department");

-- Order indexes
CREATE INDEX IF NOT EXISTS "order_user_id_created_at_idx" 
  ON "orders" ("userId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "order_status_idx" 
  ON "orders" ("status");

CREATE INDEX IF NOT EXISTS "order_created_at_idx" 
  ON "orders" ("createdAt" DESC);

-- BlogPost indexes
CREATE INDEX IF NOT EXISTS "blog_post_published_idx" 
  ON "blog_posts" ("isPublished", "publishedAt" DESC);

CREATE INDEX IF NOT EXISTS "blog_post_category_idx" 
  ON "blog_posts" ("categoryId");

-- Testimonial indexes
CREATE INDEX IF NOT EXISTS "testimonial_is_active_order_idx" 
  ON "testimonials" ("isActive", "order");

-- FAQ indexes
CREATE INDEX IF NOT EXISTS "faq_is_active_order_idx" 
  ON "faqs" ("isActive", "order");

-- Service indexes
CREATE INDEX IF NOT EXISTS "service_is_active_category_idx" 
  ON "services" ("isActive", "category");

-- User indexes (for admin queries)
CREATE INDEX IF NOT EXISTS "user_created_at_idx" 
  ON "users" ("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "user_role_idx" 
  ON "users" ("role");
