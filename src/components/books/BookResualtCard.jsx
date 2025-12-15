import { Card, CardContent, Typography, Stack, Avatar } from '@mui/material';
import MainCard from 'components/MainCard';

const BookResultCard = ({ book }) => (
  <MainCard>
    <Stack direction="row" spacing={2}>
      <Avatar
        variant="rounded"
        src={book.image_url}
        sx={{ width: 64, height: 96 }}
      />
      <Stack spacing={0.5}>
        <Typography variant="h6">{book.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {book.authors?.map(a => a.name).join(', ')}
        </Typography>
        <Typography variant="caption">
          ⭐ {book.average_rating ?? '—'} ({book.rating_number || 0})
        </Typography>
      </Stack>
    </Stack>
  </MainCard>
);

export default BookResultCard;
