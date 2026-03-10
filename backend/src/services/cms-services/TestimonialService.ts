/**
 * ============================================================================
 * TESTIMONIAL SERVICE - CRUD Interface
 * ============================================================================
 * Wraps repository calls to conform to CrudService interface
 */

import { TestimonialRepository } from '../../repositories/TestimonialRepository';
import * as cmsService from '../cms.service';

const repo = new TestimonialRepository();

export const TestimonialService = {
  getAll: cmsService.getAllTestimonials,
  getActive: cmsService.getActiveTestimonials,
  getById: async (id: string) => {
    const testimonial = await repo.findById(id);
    return { success: true, data: testimonial };
  },
  create: cmsService.createTestimonial,
  update: cmsService.updateTestimonial,
  delete: cmsService.deleteTestimonial,
};

export default TestimonialService;
