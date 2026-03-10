/**
 * ============================================================================
 * CONTACT FORM FIELDS
 * ============================================================================
 * Form input fields for contact form
 */

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ServiceCategory } from '../../types';

interface ContactFormFieldsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
    company_website: string;
  };
  categories: ServiceCategory[];
  onChange: (field: string, value: string) => void;
}

export function ContactFormFields({ formData, categories, onChange }: ContactFormFieldsProps) {
  return (
    <>
      {/* Honeypot field - hidden from humans */}
      <div style={{ display: 'none' }}>
        <label htmlFor="company_website">Company Website</label>
        <input
          type="text"
          id="company_website"
          name="company_website"
          value={formData.company_website}
          onChange={(e) => onChange('company_website', e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            required
            className="input-ai"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            required
            className="input-ai"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="9876543210"
            className="input-ai"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service">Service Interest</Label>
          <Select 
            value={formData.service} 
            onValueChange={(value) => onChange('service', value)}
          >
            <SelectTrigger className="input-ai">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.title}>
                  {category.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Project Details</Label>
        <Textarea
          id="message"
          placeholder="Tell us about your project and goals..."
          rows={4}
          className="input-ai resize-none"
          value={formData.message}
          onChange={(e) => onChange('message', e.target.value)}
          required
        />
      </div>
    </>
  );
}
