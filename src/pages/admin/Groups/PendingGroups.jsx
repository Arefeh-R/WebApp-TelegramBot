import { useState } from 'react';
import { Grid, Alert, CircularProgress, Box, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import GroupApprovalCard from 'components/admin/GroupApprovalCard';
import { usePendingGroups } from 'hooks/useAdmin';

const PendingGroups = () => {
  const { groups, isLoading, isError, mutate } = usePendingGroups();
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSuccess = (text) => {
    setMessage({ type: 'success', text });
    mutate(); // Refresh the list
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleError = (text) => {
    setMessage({ type: 'error', text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (isLoading) {
    return (
      <MainCard title="درخواست‌های گروه در انتظار تأیید">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (isError) {
    return (
      <MainCard title="درخواست‌های گروه در انتظار تأیید">
        <Alert severity="error">بارگذاری گروه‌های در انتظار تأیید با شکست مواجه شد</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard title="درخواست‌های گروه در انتظار تأیید">
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
            هیچ درخواست گروهی در انتظار نیست
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} md={6} lg={4} key={group.id}>
              <GroupApprovalCard
                group={group}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </MainCard>
  );
};

export default PendingGroups;