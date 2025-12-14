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
      onError('نام دسته‌بندی الزامی است');
      return;
    }

    try {
      if (isEdit) {
        await updateCategory(category.id, formData);
        onSuccess(`دسته‌بندی "${formData.name}" با موفقیت به‌روزرسانی شد`);
      } else {
        await createCategory(formData);
        onSuccess(`دسته‌بندی "${formData.name}" با موفقیت ایجاد شد`);
      }
    } catch (error) {
      onError(error.response?.data?.detail || `${isEdit ? 'به‌روزرسانی' : 'ایجاد'} دسته‌بندی با شکست مواجه شد`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? `ویرایش دسته‌بندی: ${category?.name}` : 'ایجاد دسته‌بندی جدید'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            required
            fullWidth
            label="نام دسته‌بندی"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="مثال: علمی-تخیلی، تاریخ، فناوری"
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="توضیحات"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="این دسته‌بندی را توضیح دهید..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>لغو</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'در حال ذخیره...' : isEdit ? 'به‌روزرسانی' : 'ایجاد'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryForm;