import { Card, CardContent, Typography, Button, Stack } from '@mui/material';
import { TeamOutlined, SendOutlined } from '@ant-design/icons';

const GroupCard = ({ group }) => {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h5">{group.name}</Typography>

          <Typography variant="body2" color="text.secondary">
            {group.description}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <TeamOutlined />
            <Typography variant="caption">
              {group.member_count} members
            </Typography>
          </Stack>

          <Button
            variant="contained"
            startIcon={<SendOutlined />}
            href={group.telegram_invite_link}
            target="_blank"
          >
            Join Group
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default GroupCard;
