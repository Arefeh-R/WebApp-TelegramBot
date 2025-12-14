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
      onError('لینک دعوت تلگرام الزامی است');
      return;
    }

    try {
      await approveGroup(group.id, approvalData);
      onSuccess(`گروه "${group.name}" با موفقیت تأیید شد`);
      setShowApprovalDialog(false);
    } catch (error) {
      onError(error.response?.data?.detail || 'تأیید گروه با شکست مواجه شد');
    }
  };

  const handleReject = async () => {
    try {
      await rejectGroup(group.id);
      onSuccess(`گروه "${group.name}" رد شد`);
      setShowRejectDialog(false);
    } catch (error) {
      onError(error.response?.data?.detail || 'رد گروه با شکست مواجه شد');
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
                  label={`درخواست توسط: ${group.requested_by}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>

            <Typography variant="body2" color="text.secondary">
              {group.description || 'توضیحاتی ارائه نشده است'}
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
                تأیید
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<CloseCircleOutlined />}
                onClick={() => setShowRejectDialog(true)}
                disabled={isApproving || isRejecting}
              >
                رد
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
        <DialogTitle>تأیید گروه: {group.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              required
              fullWidth
              label="لینک دعوت تلگرام"
              value={approvalData.telegram_invite_link}
              onChange={(e) =>
                setApprovalData({ ...approvalData, telegram_invite_link: e.target.value })
              }
              placeholder="https://t.me/+..."
              helperText="الزامی: لینک دعوت گروه تلگرام را اضافه کنید"
            />

            <FormControl fullWidth>
              <InputLabel>دسته‌بندی</InputLabel>
              <Select
                value={approvalData.category_id}
                onChange={(e) =>
                  setApprovalData({ ...approvalData, category_id: e.target.value })
                }
                label="دسته‌بندی"
              >
                <MenuItem value="">
                  <em>هیچکدام</em>
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
          <Button onClick={() => setShowApprovalDialog(false)}>لغو</Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={isApproving}
          >
            {isApproving ? 'در حال تأیید...' : 'تأیید'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
        <DialogTitle>رد درخواست گروه</DialogTitle>
        <DialogContent>
          <Typography>
            آیا مطمئن هستید که می‌خواهید درخواست گروه "{group.name}" را رد کنید؟ این عملیات قابل بازگشت نیست.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectDialog(false)}>لغو</Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={isRejecting}
          >
            {isRejecting ? 'در حال رد...' : 'رد'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupApprovalCard;