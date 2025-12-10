import { useState, useEffect } from 'react';
import { Plus, Edit2, MapPin } from 'lucide-react';
import { Studio } from '../../types';
import { api } from '../../utils/api';
import { useToast } from '../../hooks/useToast';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Badge from '../ui/Badge';

export default function StudioManager() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudio, setEditingStudio] = useState<Studio | null>(null);
  const [studioId, setStudioId] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadStudios = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/studios');
      if (res.data.success) {
        setStudios(res.data.data.studios);
      }
    } catch (error) {
      showError('Failed to load studios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudios();
  }, []);

  const handleOpenModal = (studio?: Studio) => {
    if (studio) {
      setEditingStudio(studio);
      setStudioId(studio.studioId);
      setName(studio.name);
      setCity(studio.city);
      setState(studio.state);
      setInstagram(studio.instagram || '');
      setFacebook(studio.facebook || '');
      setTiktok(studio.tiktok || '');
    } else {
      setEditingStudio(null);
      setStudioId('');
      setName('');
      setCity('');
      setState('');
      setInstagram('');
      setFacebook('');
      setTiktok('');
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const data = {
        studioId,
        name,
        city,
        state,
        instagram: instagram || undefined,
        facebook: facebook || undefined,
        tiktok: tiktok || undefined,
      };

      if (editingStudio) {
        await api.patch(`/api/studios/${editingStudio.studioId}`, data);
        showSuccess('Studio updated');
      } else {
        await api.post('/api/studios', data);
        showSuccess('Studio created');
      }

      setShowModal(false);
      loadStudios();
    } catch (error: any) {
      showError(error.response?.data?.error?.message || 'Failed to save studio');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (studio: Studio) => {
    try {
      await api.patch(`/api/studios/${studio.studioId}`, {
        isActive: !studio.isActive,
      });
      showSuccess(studio.isActive ? 'Studio deactivated' : 'Studio activated');
      loadStudios();
    } catch (error) {
      showError('Failed to update studio status');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-neutral-900">Studios</h2>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Studio
        </Button>
      </div>

      <div className="grid gap-4">
        {studios.map((studio) => (
          <div
            key={studio.studioId}
            className="bg-white border border-neutral-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-neutral-900">{studio.name}</h3>
                  <Badge variant={studio.isActive ? 'Approved' : 'default'}>
                    {studio.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{studio.city}, {studio.state}</span>
                  <span className="text-neutral-400">•</span>
                  <span className="font-mono text-xs">{studio.studioId}</span>
                </div>

                {(studio.instagram || studio.facebook || studio.tiktok) && (
                  <div className="space-y-1 text-sm">
                    {studio.instagram && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <span className="font-medium">Instagram:</span>
                        <span>{studio.instagram}</span>
                      </div>
                    )}
                    {studio.facebook && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <span className="font-medium">Facebook:</span>
                        <span>{studio.facebook}</span>
                      </div>
                    )}
                    {studio.tiktok && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <span className="font-medium">TikTok:</span>
                        <span>{studio.tiktok}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleOpenModal(studio)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleActive(studio)}
                >
                  {studio.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingStudio ? 'Edit Studio' : 'New Studio'}
      >
        <div className="space-y-4">
          <Input
            label="Studio ID"
            value={studioId}
            onChange={(e) => setStudioId(e.target.value.toUpperCase())}
            placeholder="TN0045"
            required
            maxLength={20}
            disabled={!!editingStudio}
            helperText="Cannot be changed after creation"
          />

          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Collierville"
            required
            maxLength={100}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Collierville"
              required
              maxLength={100}
            />

            <Input
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              placeholder="TN"
              required
              maxLength={2}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-neutral-700 mb-3">Social Media Handles</h3>

            <div className="space-y-3">
              <Input
                label="Instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@hotworx_collierville"
                maxLength={100}
              />

              <Input
                label="Facebook"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="facebook.com/hotworxcollierville"
                maxLength={200}
              />

              <Input
                label="TikTok"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="@hotworx_collierville"
                maxLength={100}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              fullWidth
              isLoading={saving}
              disabled={!studioId || !name || !city || !state || state.length !== 2}
            >
              Save
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)} fullWidth>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
