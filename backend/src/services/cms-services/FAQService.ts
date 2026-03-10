/**
 * ============================================================================
 * FAQ SERVICE - CRUD Interface
 * ============================================================================
 * Wraps repository calls to conform to CrudService interface
 */

import { FAQRepository } from '../../repositories/FAQRepository';
import * as cmsService from '../cms.service';

const repo = new FAQRepository();

export const FAQService = {
  getAll: cmsService.getAllFAQs,
  getActive: cmsService.getActiveFAQs,
  getById: async (id: string) => {
    const faq = await repo.findById(id);
    return { success: true, data: faq };
  },
  create: cmsService.createFAQ,
  update: cmsService.updateFAQ,
  delete: cmsService.deleteFAQ,
};

export default FAQService;
