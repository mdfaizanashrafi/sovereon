/**
 * ============================================================================
 * SERVICE CMS SERVICE - CRUD Interface
 * ============================================================================
 * Wraps repository calls to conform to CrudService interface
 */

import { ServiceCMSRepository } from '../../repositories/ServiceCMSRepository';
import * as cmsService from '../cms.service';

const repo = new ServiceCMSRepository();

export const ServiceCMSService = {
  getAll: cmsService.getAllServices,
  getActive: cmsService.getActiveServiceCategories, // Returns services with categories
  getById: async (id: string) => {
    const service = await repo.findById(id, { include: { category: true } });
    return { success: true, data: service };
  },
  getBySlug: cmsService.getServiceBySlug,
  create: cmsService.createService,
  update: cmsService.updateService,
  delete: cmsService.deleteService,
};

export default ServiceCMSService;
