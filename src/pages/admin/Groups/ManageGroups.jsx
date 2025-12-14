import { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import GroupEditDialog from 'components/admin/GroupEditDialog';
import { useTelegramGroups } from 'hooks/useTelegramGroups';
import { useDeleteGroup } from 'hooks/useAdmin';

const ManageGroups = () => {
  const { groups, isLoading, isError, mutate } = useTelegramGroups();
  const { deleteGroup } = useDeleteGroup();
  
  const [editingGroup, setEditingGroup] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (group) => {
    if (!window.confirm(`Are you sure you want to delete "${group.name}"?`)) {
      return;
    }

    setDeletingId(group.id);
    try {
      await deleteGroup(group.id);
      setMessage({ type: 'success', text: `Group "${group.name}" deleted successfully` });
      mutate();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to delete group' 
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSuccess = (text) => {
    setMessage({ type: 'success', text });
    setEditingGroup(null);
    mutate();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleEditError = (text) => {
    setMessage({ type: 'error', text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (isLoading) {
    return (
      <MainCard title="Manage Groups">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (isError) {
    return (
      <MainCard title="Manage Groups">
        <Alert severity="error">Failed to load groups</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard title="Manage Groups">
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {groups.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No groups found
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Members</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{group.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                      {group.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {group.category ? (
                      <Chip label={group.category.name} size="small" />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{group.member_count || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={group.is_approved ? 'Approved' : 'Pending'}
                      color={group.is_approved ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => setEditingGroup(group)}
                      >
                        <EditOutlined />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(group)}
                        disabled={deletingId === group.id}
                      >
                        {deletingId === group.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteOutlined />
                        )}
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {editingGroup && (
        <GroupEditDialog
          group={editingGroup}
          open={Boolean(editingGroup)}
          onClose={() => setEditingGroup(null)}
          onSuccess={handleEditSuccess}
          onError={handleEditError}
        />
      )}
    </MainCard>
  );
};

export default ManageGroups;