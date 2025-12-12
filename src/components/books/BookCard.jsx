// src/components/books/BookCard.jsx
import { Card, CardMedia, CardContent, Typography, Rating, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  return (
    <Card 
      sx={{ 
        maxWidth: 280, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': { transform: 'translateY(-4px)', transition: '0.3s' }
      }}
      onClick={() => navigate(`/books/${book.id}`)}
    >
      <CardMedia
        component="img"
        height="320"
        image={book.cover_image || '/placeholder-book.jpg'}
        alt={book.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {book.author}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <Rating value={book.average_rating || 0} precision={0.5} readOnly size="small" />
          <Typography variant="caption" sx={{ ml: 1 }}>
            ({book.reviews_count || 0})
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BookCard;