import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Button,
  Avatar
} from '@mui/material';
import MainCard from 'components/MainCard';
import { BookOutlined, PlusOutlined } from '@ant-design/icons';

const ExternalBookCard = ({ book, onImport }) => {
  const {
    title,
    authors,
    first_publish_year,
    cover_url,
    isbn
  } = book;

  return (
    <MainCard>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {/* Cover */}
        <Avatar
          variant="rounded"
          src={cover_url}
          sx={{
            width: 72,
            height: 100,
            bgcolor: 'grey.100',
            fontSize: 32
          }}
        >
          <BookOutlined />
        </Avatar>

        {/* Content */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">
            {title || 'عنوان نامشخص'}
          </Typography>

          {authors?.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              نویسنده:{' '}
              {authors.join('، ')}
            </Typography>
          )}

          {first_publish_year && (
            <Typography variant="caption" color="text.secondary">
              سال انتشار: {first_publish_year}
            </Typography>
          )}

          {isbn && (
            <Typography variant="caption" display="block">
              ISBN: {isbn}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        {onImport && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PlusOutlined />}
            onClick={() => onImport(book)}
          >
            افزودن
          </Button>
        )}
      </Stack>
    </MainCard>
  );
};

ExternalBookCard.propTypes = {
  book: PropTypes.shape({
    title: PropTypes.string,
    authors: PropTypes.arrayOf(PropTypes.string),
    first_publish_year: PropTypes.number,
    cover_url: PropTypes.string,
    isbn: PropTypes.string
  }).isRequired,
  onImport: PropTypes.func
};

export default ExternalBookCard;
