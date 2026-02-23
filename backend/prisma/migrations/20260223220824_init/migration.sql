/*
  Warnings:

  - Made the column `isPublished` on table `blog_posts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `order` on table `blog_posts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `order` on table `case_studies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `case_studies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `formType` on table `contact_submissions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isSpam` on table `contact_submissions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `adminNotified` on table `contact_submissions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `autoReplied` on table `contact_submissions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `progress` on table `current_projects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `order` on table `current_projects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `current_projects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `order` on table `faqs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `faqs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `order` on table `future_quests` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `future_quests` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tax` on table `invoices` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `invoices` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isRead` on table `notifications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quantity` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentStatus` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currency` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentMethod` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `order` on table `service_categories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `service_categories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pricingModel` on table `services` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `services` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `services_cms` required. This step will fail if there are existing NULL values in that column.
  - Made the column `order` on table `services_cms` required. This step will fail if there are existing NULL values in that column.
  - Made the column `billingCycle` on table `subscriptions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `subscriptions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cancelAtPeriodEnd` on table `subscriptions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `order` on table `team_members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `team_members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rating` on table `testimonials` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `testimonials` required. This step will fail if there are existing NULL values in that column.
  - Made the column `order` on table `testimonials` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `emailVerified` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "blog_posts" ALTER COLUMN "isPublished" SET NOT NULL,
ALTER COLUMN "order" SET NOT NULL;

-- AlterTable
ALTER TABLE "case_studies" ALTER COLUMN "order" SET NOT NULL,
ALTER COLUMN "isActive" SET NOT NULL;

-- AlterTable
ALTER TABLE "contact_submissions" ALTER COLUMN "formType" SET NOT NULL,
ALTER COLUMN "isSpam" SET NOT NULL,
ALTER COLUMN "adminNotified" SET NOT NULL,
ALTER COLUMN "autoReplied" SET NOT NULL;

-- AlterTable
ALTER TABLE "current_projects" ALTER COLUMN "progress" SET NOT NULL,
ALTER COLUMN "order" SET NOT NULL,
ALTER COLUMN "isActive" SET NOT NULL;

-- AlterTable
ALTER TABLE "faqs" ALTER COLUMN "order" SET NOT NULL,
ALTER COLUMN "isActive" SET NOT NULL;

-- AlterTable
ALTER TABLE "future_quests" ALTER COLUMN "order" SET NOT NULL,
ALTER COLUMN "isActive" SET NOT NULL;

-- AlterTable
ALTER TABLE "invoices" ALTER COLUMN "tax" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL;

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "isRead" SET NOT NULL;

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "quantity" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "paymentStatus" SET NOT NULL;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "paymentMethod" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL;

-- AlterTable
ALTER TABLE "service_categories" ALTER COLUMN "order" SET NOT NULL,
ALTER COLUMN "isActive" SET NOT NULL;

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "pricingModel" SET NOT NULL,
ALTER COLUMN "isActive" SET NOT NULL;

-- AlterTable
ALTER TABLE "services_cms" ALTER COLUMN "isActive" SET NOT NULL,
ALTER COLUMN "order" SET NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "billingCycle" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "cancelAtPeriodEnd" SET NOT NULL;

-- AlterTable
ALTER TABLE "team_members" ALTER COLUMN "order" SET NOT NULL,
ALTER COLUMN "isActive" SET NOT NULL;

-- AlterTable
ALTER TABLE "testimonials" ALTER COLUMN "rating" SET NOT NULL,
ALTER COLUMN "isActive" SET NOT NULL,
ALTER COLUMN "order" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "emailVerified" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL;
