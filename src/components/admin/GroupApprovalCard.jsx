import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  TextField,
  Box,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useApproveGroup, useRejectGroup } from 'hooks/useAdmin';
import { useGroupCategories } from 'hooks/useTelegramGroups';

const GroupApprovalCard = ({ group, onSuccess, onError }) => {
  const [approvalData, setApprovalData] = useState({
    telegram_invite_link: '',
    category_id: group.category?.id || ''
  });
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { approveGroup, isLoading: isApproving } = useApproveGroup();
  const { rejectGroup, isLoading: isRejecting } = useRejectGroup();
  const { categories } = useGroupCategories();

  const handleApprove = async () => {
    if (!approvalData.telegram_invite_link) {
      onError('Telegram invite link is required');
      return;
    }

    try {
      await approveGroup(group.id, approvalData);
      onSuccess(`Group "${group.name}" approved successfully`);
      setShowApprovalDialog(false);
    } catch (error) {
      onError(error.response?.data?.detail || 'Failed to approve group');
    }
  };

  const handleReject = async () => {
    try {
      await rejectGroup(group.id);
      onSuccess(`Group "${group.name}" rejected`);
      setShowRejectDialog(false);
    } catch (error) {
      onError(error.response?.data?.detail || 'Failed to reject group');
    }
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h5" gutterBottom>
                {group.name}
              </Typography>
              {group.requested_by && (
                <Chip
                  icon={<UserOutlined />}
                  label={`Requested by: ${group.requested_by}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>

            <Typography variant="body2" color="text.secondary">
              {group.description || 'No description provided'}
            </Typography>

            {group.category && (
              <Chip
                label={group.category.name}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}

            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlined />}
                onClick={() => setShowApprovalDialog(true)}
                disabled={isApproving || isRejecting}
              >
                Approve
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<CloseCircleOutlined />}
                onClick={() => setShowRejectDialog(true)}
                disabled={isApproving || isRejecting}
              >
                Reject
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog 
        open={showApprovalDialog} 
        onClose={() => setShowApprovalDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Group: {group.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              required
              fullWidth
              label="Telegram Invite Link"
              value={approvalData.telegram_invite_link}
              onChange={(e) =>
                setApprovalData({ ...approvalData, telegram_invite_link: e.target.value })
              }
              placeholder="https://t.me/+..."
              helperText="Required: Add the Telegram group invite link"
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={approvalData.category_id}
                onChange={(e) =>
                  setApprovalData({ ...approvalData, category_id: e.target.value })
                }
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={isApproving}
          >
            {isApproving ? 'Approving...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
        <DialogTitle>Reject Group Request</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reject the group request for "{group.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={isRejecting}
          >
            {isRejecting ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupApprovalCard;