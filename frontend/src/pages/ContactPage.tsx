/**
 * ============================================================================
 * CONTACT US PAGE
 * ============================================================================
 * 
 * Features:
 * - Contact form (inquiry, quote request)
 * - Office location with map placeholder
 * - Contact information (phone, email)
 * - Social media links
 * 
 * PLACEHOLDERS:
 * - [PLACEHOLDER_MAP_EMBED]: Google Maps embed code
 * 
 * @page
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Instagram, Linkedin, Facebook } from 'lucide-react';
import { companyInfo, serviceCategories } from '@/data/siteData';

export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
    company_website: '', // Honeypot
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        console.error('Form submission failed');
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="badge-ai mb-4">Get in Touch</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Contact <span className="text-gradient">Us</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Have a project in mind? We'd love to hear from you. 
            Reach out and let's discuss how we can help.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="ai-card">
            <CardContent className="p-6 text-center">
              <Phone className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-medium mb-1">Phone</h3>
              <a href={`tel:${companyInfo.contact.phone}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {companyInfo.contact.phone}
              </a>
            </CardContent>
          </Card>
          <Card className="ai-card">
            <CardContent className="p-6 text-center">
              <Mail className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-medium mb-1">Email</h3>
              <a href={`mailto:${companyInfo.contact.email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {companyInfo.contact.email}
              </a>
            </CardContent>
          </Card>
          <Card className="ai-card">
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-medium mb-1">Address</h3>
              <p className="text-sm text-muted-foreground">{companyInfo.address.full}</p>
            </CardContent>
          </Card>
          <Card className="ai-card">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-medium mb-1">Hours</h3>
              <p className="text-sm text-muted-foreground">24/7 Support Available</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card className="ai-card">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                  <p className="text-muted-foreground">
                    We've received your message and will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field - hidden from humans */}
                  <div style={{ display: 'none' }}>
                    <label htmlFor="company_website">Company Website</label>
                    <input
                      type="text"
                      id="company_website"
                      name="company_website"
                      value={formData.company_website}
                      onChange={(e) => handleChange('company_website', e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" placeholder="John Doe" required className="input-ai" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" placeholder="john@example.com" required className="input-ai" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="8789109928" className="input-ai" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input id="company" placeholder="Your Company" className="input-ai" value={formData.company} onChange={(e) => handleChange('company', e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Service Interest</Label>
                    <Select value={formData.service} onValueChange={(value) => handleChange('service', value)}>
                      <SelectTrigger className="input-ai">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((category) => (
                          <SelectItem key={category.id} value={category.title}>
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your project..."
                      rows={5}
                      required
                      className="input-ai resize-none"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full btn-ai" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Map & Social */}
          <div className="space-y-6">
            <Card className="ai-card">
              <CardContent className="p-0 overflow-hidden">
                <div className="h-64 bg-primary/10 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-primary/50" />
                    <p className="text-sm text-muted-foreground">[PLACEHOLDER_MAP_EMBED]</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold mb-2">Visit Our Office</h3>
                  <p className="text-sm text-muted-foreground">{companyInfo.address.full}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="ai-card">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Connect With Us</h3>
                <div className="space-y-3">
                  <a href={companyInfo.social.instagram} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <Instagram className="w-5 h-5 text-primary" />
                    <span className="text-sm">@sovereoninc</span>
                  </a>
                  <a href={companyInfo.social.linkedin} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <Linkedin className="w-5 h-5 text-primary" />
                    <span className="text-sm">Sovereon Inc.</span>
                  </a>
                  <a href={companyInfo.social.facebook} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <Facebook className="w-5 h-5 text-primary" />
                    <span className="text-sm">Sovereon Inc.</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
