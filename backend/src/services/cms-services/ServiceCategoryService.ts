/**
 * ============================================================================
 * SERVICE CATEGORY SERVICE - CRUD Interface
 * ============================================================================
 * Wraps repository calls to conform to CrudService interface
 */

import { ServiceCategoryRepository } from '../../repositories/ServiceCategoryRepository';
import * as cmsService from '../cms.service';

const repo = new ServiceCategoryRepository();

export const ServiceCategoryService = {
  getAll: cmsService.getAllServiceCategories,
  getActive: cmsService.getActiveServiceCategories,
  getById: async (id: string) => {
    const category = await repo.findById(id, { include: { services: true } });
    return { success: true, data: category };
  },
  create: cmsService.createServiceCategory,
  update: cmsService.updateServiceCategory,
  delete: cmsService.deleteServiceCategory,
};

export default ServiceCategoryService;
