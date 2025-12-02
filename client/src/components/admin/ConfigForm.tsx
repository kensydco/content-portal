import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../hooks/useToast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Config } from '../../types';

export default function ConfigForm() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/config');
      if (res.data.success) {
        setConfig(res.data.data);
      }
    } catch (error) {
      showError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      await api.patch('/api/config', config);
      showSuccess('Configuration updated successfully');
    } catch (error) {
      showError('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!config) {
    return <div className="text-center py-8">Failed to load configuration</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">System Configuration</h2>
        <p className="text-sm text-neutral-600">
          Manage global settings for the content portal
        </p>
      </div>

      <div className="grid gap-6">
        <Input
          label="Google Drive Folder ID"
          value={config.driveFolderId}
          onChange={(e) => setConfig({ ...config, driveFolderId: e.target.value })}
        />

        <Input
          label="Waiver URL"
          type="url"
          value={config.waiverUrl}
          onChange={(e) => setConfig({ ...config, waiverUrl: e.target.value })}
        />

        <Input
          label="Default Start Offset (Days)"
          type="number"
          value={config.defaultStartOffsetDays}
          onChange={(e) =>
            setConfig({ ...config, defaultStartOffsetDays: parseInt(e.target.value) })
          }
          min={0}
          max={365}
        />

        <Input
          label="Default End Offset (Days)"
          type="number"
          value={config.defaultEndOffsetDays}
          onChange={(e) =>
            setConfig({ ...config, defaultEndOffsetDays: parseInt(e.target.value) })
          }
          min={0}
          max={365}
        />

        <Input
          label="Max File Size (MB)"
          type="number"
          value={config.maxFileSizeMb}
          onChange={(e) => setConfig({ ...config, maxFileSizeMb: parseInt(e.target.value) })}
          min={1}
          max={2000}
        />

        <Button onClick={handleSave} isLoading={saving}>
          <Save className="w-4 h-4 mr-2" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
