/**
 * Case Studies CMS
 * Manage case studies for the website
 */

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, ImageIcon } from 'lucide-react';

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client: string;
  industry: string;
  description: string;
  challenge: string;
  solution: string;
  results: string;
  image: string | null;
  technologies: string;
  metrics: string;
  testimonial: string | null;
  order: number;
  isActive: boolean;
}

export default function CaseStudiesCMS() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CaseStudy | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    client: '',
    industry: '',
    description: '',
    challenge: '',
    solution: '',
    results: '',
    image: '',
    technologies: '',
    metrics: [{ label: '', value: '' }],
    order: 0,
    isActive: true,
  });

  const loadCaseStudies = async () => {
    try {
      const response = await adminApi.getCaseStudies();
      if (response.success) {
        setCaseStudies((response.data as CaseStudy[]) || []);
      }
    } catch (error) {
      console.error('Failed to load case studies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCaseStudies();
  }, []);

  const handleOpenDialog = (item?: CaseStudy) => {
    if (item) {
      setEditingItem(item);
      const metrics = JSON.parse(item.metrics || '[]');
      setFormData({
        title: item.title,
        slug: item.slug,
        client: item.client,
        industry: item.industry,
        description: item.description,
        challenge: item.challenge,
        solution: item.solution,
        results: item.results,
        image: item.image || '',
        technologies: JSON.parse(item.technologies || '[]').join(', '),
        metrics: metrics.length > 0 ? metrics : [{ label: '', value: '' }],
        order: item.order,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        slug: '',
        client: '',
        industry: '',
        description: '',
        challenge: '',
        solution: '',
        results: '',
        image: '',
        technologies: '',
        metrics: [{ label: '', value: '' }],
        order: caseStudies.length + 1,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const technologies = formData.technologies.split(',').map(t => t.trim()).filter(Boolean);
      const metrics = formData.metrics.filter(m => m.label && m.value);
      
      const data = {
        ...formData,
        technologies,
        metrics,
      };
      
      if (editingItem) {
        await adminApi.updateCaseStudy(editingItem.id, data);
      } else {
        await adminApi.createCaseStudy(data);
      }
      setIsDialogOpen(false);
      loadCaseStudies();
    } catch (error) {
      console.error('Failed to save case study:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study?')) return;
    
    try {
      await adminApi.deleteCaseStudy(id);
      loadCaseStudies();
    } catch (error) {
      console.error('Failed to delete case study:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  const addMetric = () => {
    setFormData({
      ...formData,
      metrics: [...formData.metrics, { label: '', value: '' }],
    });
  };

  const updateMetric = (index: number, field: 'label' | 'value', value: string) => {
    const newMetrics = [...formData.metrics];
    newMetrics[index][field] = value;
    setFormData({ ...formData, metrics: newMetrics });
  };

  const removeMetric = (index: number) => {
    const newMetrics = formData.metrics.filter((_, i) => i !== index);
    setFormData({ ...formData, metrics: newMetrics });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case Studies</h1>
          <p className="text-muted-foreground">Manage client case studies for the Case Studies page.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Case Study
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {caseStudies.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.client}</TableCell>
                <TableCell>{item.industry}</TableCell>
                <TableCell>
                  <span className={item.isActive ? 'text-green-600' : 'text-gray-400'}>
                    {item.isActive ? 'Yes' : 'No'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Case Study' : 'Add Case Study'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update case study details.' : 'Add a new case study to your website.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E-commerce Platform Growth"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ecommerce-platform-growth"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="TechCorp Inc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="E-commerce"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief overview of the project..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenge">Challenge</Label>
              <Textarea
                id="challenge"
                value={formData.challenge}
                onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                placeholder="What challenges did the client face?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution">Solution</Label>
              <Textarea
                id="solution"
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                placeholder="How did we solve the problem?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="results">Results</Label>
              <Textarea
                id="results"
                value={formData.results}
                onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                placeholder="What were the outcomes?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/case-study-image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL for the case study image. Upload images to Cloudinary, Imgur, or your CDN first.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technologies">Technologies (comma-separated)</Label>
              <Input
                id="technologies"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                placeholder="React, Node.js, AWS"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Metrics</Label>
                <Button type="button" variant="outline" size="sm" onClick={addMetric}>
                  <Plus className="h-3 w-3 mr-1" /> Add Metric
                </Button>
              </div>
              {formData.metrics.map((metric, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Label (e.g., Revenue Increase)"
                    value={metric.label}
                    onChange={(e) => updateMetric(index, 'label', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value (e.g., 150%)"
                    value={metric.value}
                    onChange={(e) => updateMetric(index, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMetric(index)}
                    disabled={formData.metrics.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active (visible on website)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? 'Save Changes' : 'Add Case Study'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
