import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Category } from '../../types';
import { api } from '../../utils/api';
import { useToast } from '../../hooks/useToast';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Badge from '../ui/Badge';

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/categories');
      if (res.data.success) {
        setCategories(res.data.data.categories);
      }
    } catch (error) {
      showError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setDescription(category.description || '');
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('');
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (editingCategory) {
        await api.patch(`/api/admin/categories/${editingCategory.id}`, {
          name,
          description,
        });
        showSuccess('Category updated');
      } else {
        await api.post('/api/admin/categories', {
          name,
          description,
        });
        showSuccess('Category created');
      }

      setShowModal(false);
      loadCategories();
    } catch (error: any) {
      showError(error.response?.data?.error?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this category?')) return;

    try {
      await api.delete(`/api/admin/categories/${id}`);
      showSuccess('Category deactivated');
      loadCategories();
    } catch (error) {
      showError('Failed to delete category');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-neutral-900">Categories</h2>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white border border-neutral-200 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-neutral-900">{category.name}</h3>
                {!category.isActive && <Badge variant="default">Inactive</Badge>}
              </div>
              {category.description && (
                <p className="text-sm text-neutral-600 mt-1">{category.description}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => handleOpenModal(category)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(category.id)}
              >
                <Trash2 className="w-4 h-4 text-danger" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? 'Edit Category' : 'New Category'}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} fullWidth isLoading={saving} disabled={!name}>
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
