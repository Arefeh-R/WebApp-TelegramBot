import { Box, Typography, Stack, Button } from '@mui/material';
import { TeamOutlined, SendOutlined } from '@ant-design/icons';

const GroupRow = ({ group }) => {
  return (
    <Box sx={{ px: 2, py: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {/* Left */}
        <Box>
          <Typography variant="subtitle1">
            {group.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {group.description}
          </Typography>
        </Box>

        {/* Right */}
        <Stack spacing={0.5} alignItems="flex-end">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <TeamOutlined />
            <Typography variant="caption">
              {group.member_count}
            </Typography>
          </Stack>

          <Button
            size="small"
            variant="outlined"
            startIcon={<SendOutlined />}
            href={group.telegram_invite_link}
            target="_blank"
          >
            عضویت
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default GroupRow;