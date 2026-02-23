/**
 * Settings CMS
 * Manage global settings
 */

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';

interface Setting {
  id: string;
  key: string;
  value: string;
}

export default function SettingsCMS() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const response = await adminApi.getSettings();
      if (response.success) {
        setSettings((response.data as Setting[]) || []);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const getSettingValue = (key: string) => {
    return settings.find(s => s.key === key)?.value || '';
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => {
      const existing = prev.find(s => s.key === key);
      if (existing) {
        return prev.map(s => s.key === key ? { ...s, value } : s);
      }
      return [...prev, { id: '', key, value }];
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = settings.map(s => ({ key: s.key, value: s.value }));
      await adminApi.updateSettingsBatch(settingsToSave);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
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
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage global website settings.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={getSettingValue('companyName')} onChange={(e) => updateSetting('companyName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input value={getSettingValue('tagline')} onChange={(e) => updateSetting('tagline', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Establishment Date</Label>
              <Input value={getSettingValue('establishmentDate')} onChange={(e) => updateSetting('establishmentDate', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Street</Label>
              <Input value={getSettingValue('addressStreet')} onChange={(e) => updateSetting('addressStreet', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={getSettingValue('addressCity')} onChange={(e) => updateSetting('addressCity', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={getSettingValue('addressState')} onChange={(e) => updateSetting('addressState', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input value={getSettingValue('addressPincode')} onChange={(e) => updateSetting('addressPincode', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={getSettingValue('addressCountry')} onChange={(e) => updateSetting('addressCountry', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={getSettingValue('contactPhone')} onChange={(e) => updateSetting('contactPhone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={getSettingValue('contactEmail')} onChange={(e) => updateSetting('contactEmail', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input value={getSettingValue('socialInstagram')} onChange={(e) => updateSetting('socialInstagram', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input value={getSettingValue('socialLinkedin')} onChange={(e) => updateSetting('socialLinkedin', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Facebook</Label>
              <Input value={getSettingValue('socialFacebook')} onChange={(e) => updateSetting('socialFacebook', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Map & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Google Maps Embed Code</Label>
              <textarea
                value={getSettingValue('googleMapsEmbed')}
                onChange={(e) => updateSetting('googleMapsEmbed', e.target.value)}
                placeholder='<iframe src="https://www.google.com/maps/embed..." ...></iframe>'
                className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-transparent text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                Paste the Google Maps embed iframe code here. Get it from Google Maps → Share → Embed a map.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Map Preview URL (Optional)</Label>
              <Input 
                value={getSettingValue('mapPreviewUrl')} 
                onChange={(e) => updateSetting('mapPreviewUrl', e.target.value)}
                placeholder="https://maps.google.com/?q=Your+Address"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
