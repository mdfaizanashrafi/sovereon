/**
 * Services CMS
 * Manage service categories and services
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  services: Service[];
}

interface Service {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  shortDescription: string;
  fullDescription: string;
  features: string;
  benefits: string;
  strategy: string;
  order: number;
  isActive: boolean;
}

export default function ServicesCMS() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    slug: '',
    title: '',
    description: '',
    order: 0,
    isActive: true,
  });

  const loadCategories = async () => {
    try {
      const response = await adminApi.getServiceCategories();
      if (response.success) {
        setCategories((response.data as ServiceCategory[]) || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCategoryDialog = (category?: ServiceCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        slug: category.slug,
        title: category.title,
        description: category.description,
        order: category.order,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        slug: '',
        title: '',
        description: '',
        order: categories.length + 1,
        isActive: true,
      });
    }
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await adminApi.updateServiceCategory(editingCategory.id, categoryForm);
      } else {
        await adminApi.createServiceCategory(categoryForm);
      }
      setIsCategoryDialogOpen(false);
      loadCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure? This will also delete all services in this category.')) return;
    
    try {
      await adminApi.deleteServiceCategory(id);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete. Please try again.');
    }
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
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage service categories and services.</p>
        </div>
        <Button onClick={() => handleOpenCategoryDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-4">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-4 text-left">
                <span className="font-semibold">{category.title}</span>
                <span className="text-sm text-muted-foreground">
                  ({category.services?.length || 0} services)
                </span>
                {!category.isActive && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    Inactive
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pb-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCategoryDialog(category)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Category
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    Delete
                  </Button>
                </div>

                {category.services?.length > 0 ? (
                  <div className="border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Order</th>
                          <th className="px-4 py-2 text-left">Service</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.services.map((service) => (
                          <tr key={service.id} className="border-t">
                            <td className="px-4 py-2">{service.order}</td>
                            <td className="px-4 py-2 font-medium">{service.title}</td>
                            <td className="px-4 py-2">
                              <span className={service.isActive ? 'text-green-600' : 'text-gray-400'}>
                                {service.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No services in this category.</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update category details.' : 'Add a new service category.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                placeholder="software-development"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={categoryForm.title}
                onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                placeholder="Software Development"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Brief description..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-order">Order</Label>
              <Input
                id="cat-order"
                type="number"
                value={categoryForm.order}
                onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="cat-isActive"
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
              />
              <Label htmlFor="cat-isActive">Active (visible on website)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? 'Save Changes' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
