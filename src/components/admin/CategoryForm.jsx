import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack
} from '@mui/material';
import { useCreateCategory, useUpdateCategory } from 'hooks/useAdmin';

const CategoryForm = ({ open, category, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const { createCategory, isLoading: isCreating } = useCreateCategory();
  const { updateCategory, isLoading: isUpdating } = useUpdateCategory();

  const isLoading = isCreating || isUpdating;
  const isEdit = Boolean(category);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
  }, [category, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      onError('Category name is required');
      return;
    }

    try {
      if (isEdit) {
        await updateCategory(category.id, formData);
        onSuccess(`Category "${formData.name}" updated successfully`);
      } else {
        await createCategory(formData);
        onSuccess(`Category "${formData.name}" created successfully`);
      }
    } catch (error) {
      onError(error.response?.data?.detail || `Failed to ${isEdit ? 'update' : 'create'} category`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? `Edit Category: ${category?.name}` : 'Create New Category'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            required
            fullWidth
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Science Fiction, History, Technology"
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe this category..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryForm;