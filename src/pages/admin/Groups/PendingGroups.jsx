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
      <MainCard title="Pending Group Requests">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (isError) {
    return (
      <MainCard title="Pending Group Requests">
        <Alert severity="error">Failed to load pending groups</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard title="Pending Group Requests">
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
            No pending group requests
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