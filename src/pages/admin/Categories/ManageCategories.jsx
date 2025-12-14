import { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider
} from '@mui/material';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import CategoryForm from 'components/admin/CategoryForm';
import { useGroupCategories } from 'hooks/useTelegramGroups';
import { useDeleteCategory } from 'hooks/useAdmin';

const ManageCategories = () => {
  const { categories, isLoading, isError, mutate } = useGroupCategories();
  const { deleteCategory } = useDeleteCategory();
  
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (category) => {
    if (!window.confirm(`آیا مطمئن هستید که می‌خواهید "${category.name}" را حذف کنید؟`)) {
      return;
    }

    setDeletingId(category.id);
    try {
      await deleteCategory(category.id);
      setMessage({ type: 'success', text: `دسته‌بندی "${category.name}" با موفقیت حذف شد` });
      mutate();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'حذف دسته‌بندی با شکست مواجه شد' 
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSuccess = (text) => {
    setMessage({ type: 'success', text });
    handleFormClose();
    mutate();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleFormError = (text) => {
    setMessage({ type: 'error', text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (isLoading) {
    return (
      <MainCard title="مدیریت دسته‌بندی‌ها">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (isError) {
    return (
      <MainCard title="مدیریت دسته‌بندی‌ها">
        <Alert severity="error">بارگذاری دسته‌بندی‌ها با شکست مواجه شد</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard 
      title="مدیریت دسته‌بندی‌ها"
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => setShowForm(true)}
        >
          افزودن دسته‌بندی
        </Button>
      }
    >
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {categories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            هیچ دسته‌بندی یافت نشد. اولین دسته‌بندی خود را ایجاد کنید!
          </Typography>
        </Box>
      ) : (
        <List>
          {categories.map((category, index) => (
            <Box key={category.id}>
              <ListItem
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={() => handleEdit(category)}
                    >
                      <EditOutlined />
                    </IconButton>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleDelete(category)}
                      disabled={deletingId === category.id}
                    >
                      {deletingId === category.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <DeleteOutlined />
                      )}
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="h6">{category.name}</Typography>
                  }
                  secondary={category.description || 'بدون توضیحات'}
                />
              </ListItem>
              {index < categories.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      )}

      <CategoryForm
        open={showForm}
        category={editingCategory}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        onError={handleFormError}
      />
    </MainCard>
  );
};

export default ManageCategories;