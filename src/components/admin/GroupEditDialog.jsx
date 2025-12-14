import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useUpdateGroup } from 'hooks/useAdmin';
import { useGroupCategories } from 'hooks/useTelegramGroups';

const GroupEditDialog = ({ group, open, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    telegram_invite_link: '',
    category_id: '',
    is_approved: false
  });

  const { updateGroup, isLoading } = useUpdateGroup();
  const { categories } = useGroupCategories();

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        telegram_invite_link: group.telegram_invite_link || '',
        category_id: group.category?.id || '',
        is_approved: group.is_approved || false
      });
    }
  }, [group]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'is_approved' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      onError('Group name is required');
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        telegram_invite_link: formData.telegram_invite_link,
        is_approved: formData.is_approved
      };

      if (formData.category_id) {
        updateData.category_id = formData.category_id;
      }

      await updateGroup(group.id, updateData);
      onSuccess(`Group "${formData.name}" updated successfully`);
    } catch (error) {
      onError(error.response?.data?.detail || 'Failed to update group');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Group: {group?.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            required
            fullWidth
            label="Group Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Telegram Invite Link"
            name="telegram_invite_link"
            value={formData.telegram_invite_link}
            onChange={handleChange}
            placeholder="https://t.me/+..."
          />

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              label="Category"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                name="is_approved"
                checked={formData.is_approved}
                onChange={handleChange}
              />
            }
            label="Approved"
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
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupEditDialog;