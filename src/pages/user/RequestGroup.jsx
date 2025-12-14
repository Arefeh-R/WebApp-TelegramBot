import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { SendOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import { useRequestGroup, useGroupCategories } from 'hooks/useTelegramGroups';

const DEFAULT_CATEGORIES = [
  { id: 'default_1', name: 'General' },
  { id: 'default_2', name: 'Book Lovers' },
  { id: 'default_3', name: 'Gaming' },
  { id: 'default_4', name: 'Tech & Programming' },
  { id: 'default_5', name: 'Movies & TV Shows' },
  { id: 'other', name: 'Other (Create New)' }
];

const RequestGroup = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    custom_category: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  
  const { requestGroup, isLoading } = useRequestGroup();
  const { categories, isLoading: loadingCategories } = useGroupCategories();

  // Merge existing categories with defaults
  const allCategories = [
    ...categories,
    ...DEFAULT_CATEGORIES.filter(
      def => !categories.some(cat => cat.name.toLowerCase() === def.name.toLowerCase())
    )
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category_id') {
      setShowCustomCategory(value === 'other');
      if (value !== 'other') {
        setFormData(prev => ({
          ...prev,
          category_id: value,
          custom_category: ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          category_id: value,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    if (!formData.category_id) {
      setError('Please select a category');
      return;
    }

    if (showCustomCategory && !formData.custom_category.trim()) {
      setError('Please enter a custom category name');
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        description: formData.description
      };

      // If "other" is selected, create new category first
      if (showCustomCategory) {
        submitData.category_name = formData.custom_category;
      } else {
        // Check if it's a default category (starts with 'default_')
        if (formData.category_id.toString().startsWith('default_')) {
          // Send as category name for backend to create/find
          const selectedDefault = DEFAULT_CATEGORIES.find(
            cat => cat.id === formData.category_id
          );
          submitData.category_name = selectedDefault.name;
        } else {
          // It's an existing category ID
          submitData.category_id = formData.category_id;
        }
      }

      await requestGroup(submitData);
      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        description: '',
        category_id: '',
        custom_category: ''
      });
      setShowCustomCategory(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit group request');
    }
  };

  return (
    <MainCard title="Request New Telegram Group">
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {success && (
            <Alert severity="success" onClose={() => setSuccess(false)}>
              Your group request has been submitted and awaits admin approval.
            </Alert>
          )}

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <TextField
            required
            fullWidth
            label="Group Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter the name of your Telegram group"
            disabled={isLoading}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the purpose and topic of your group"
            disabled={isLoading}
            helperText="Optional: Provide details about what your group is about"
          />

          <FormControl fullWidth required disabled={isLoading || loadingCategories}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              label="Category"
            >
              {allCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {showCustomCategory && (
            <TextField
              required
              fullWidth
              label="Custom Category Name"
              name="custom_category"
              value={formData.custom_category}
              onChange={handleChange}
              placeholder="Enter your category name"
              disabled={isLoading}
              helperText="This category will be created for your group"
            />
          )}

          <Box>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={isLoading ? <CircularProgress size={20} /> : <SendOutlined />}
              disabled={isLoading || loadingCategories}
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </MainCard>
  );
};

export default RequestGroup;