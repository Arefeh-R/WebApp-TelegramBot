import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Rating, 
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import { useState } from 'react';

// assets
import { 
  MoreOutlined, 
  DeleteOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const BookCard = ({ book, libraryItem, onChangeStatus, onRemove }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus) => {
    if (onChangeStatus && libraryItem) {
      onChangeStatus(libraryItem.id, newStatus);
    }
    handleClose();
  };

  const handleRemove = () => {
    if (onRemove && libraryItem) {
      onRemove(libraryItem.id);
    }
    handleClose();
  };

  const handleCardClick = () => {
    // Use parent_asin as primary ID, fallback to id
    const bookId = book.parent_asin || book.id;
    navigate(`/dashboard/books/${bookId}`);
  };

  // Get status info
  const getStatusInfo = () => {
    if (!libraryItem) return null;
    
    const statusMap = {
      want_to_read: { 
        label: 'Want to Read', 
        color: 'warning',
        icon: <HeartOutlined />
      },
      currently_reading: { 
        label: 'Reading', 
        color: 'info',
        icon: <ClockCircleOutlined />
      },
      read: { 
        label: 'Completed', 
        color: 'success',
        icon: <CheckCircleOutlined />
      }
    };
    
    return statusMap[libraryItem.status];
  };

  const statusInfo = getStatusInfo();

  // Handle different data formats from backend
  const cover = book.image_url || 'https://via.placeholder.com/200x300?text=No+Cover';
  
  // Extract author names from authors array
  const authorText = book.authors && Array.isArray(book.authors) 
    ? book.authors.map((a) => a.name).filter(Boolean).join(', ') 
    : 'Unknown Author';
  
  // Parse rating correctly - backend returns string
  const avgRating = parseFloat(book.average_rating || 0) || 0;
  
  // Parse review count correctly
  const reviewsCount = parseInt(book.rating_number || 0) || 0;

  return (
    <Card 
      sx={{ 
        width: 200,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: (theme) => theme.customShadows.z1,
        '&:hover': { 
          transform: 'translateY(-8px)',
          boxShadow: (theme) => theme.customShadows.z8
        }
      }}
    >
      {/* Status Badge */}
      {statusInfo && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1
          }}
        >
          <Chip
            icon={statusInfo.icon}
            label={statusInfo.label}
            color={statusInfo.color}
            size="small"
            sx={{ 
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: 1
            }}
          />
        </Box>
      )}

      {/* More Options Menu */}
      {libraryItem && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1
          }}
        >
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                boxShadow: 2
              }
            }}
          >
            <MoreOutlined />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem onClick={() => handleStatusChange('want_to_read')}>
              <HeartOutlined style={{ marginRight: 8 }} />
              Want to Read
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange('currently_reading')}>
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              Currently Reading
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange('read')}>
              <CheckCircleOutlined style={{ marginRight: 8 }} />
              Mark as Read
            </MenuItem>
            <MenuItem onClick={handleRemove} sx={{ color: 'error.main' }}>
              <DeleteOutlined style={{ marginRight: 8 }} />
              Remove from Library
            </MenuItem>
          </Menu>
        </Box>
      )}

      {/* Book Cover */}
      <Box
        onClick={handleCardClick}
        sx={{
          width: '100%',
          aspectRatio: '2 / 3',
          mt: 1,
          overflow: 'hidden',
          backgroundColor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CardMedia
          component="img"
          image={cover}
          alt={book.title}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/200x300?text=No+Cover';
          }}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      </Box>

      {/* Book Info */}
      <CardContent 
        onClick={handleCardClick}
        sx={{ 
          flexGrow: 0,
          height: 150,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          '&:last-child': { pb: 2 }
        }}
      >
        {/* Title and Author */}
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
              fontSize: '0.95rem',
              fontWeight: 600,
              mb: 0.5
            }}
          >
            {book.title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.85rem'
            }}
          >
            {authorText}
          </Typography>
        </Box>

        {/* Rating */}
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={0.5}
          sx={{ mt: 1 }}
        >
          <Rating 
            value={avgRating} 
            precision={0.1} 
            readOnly 
            size="small" 
          />
          <Typography variant="body2" sx={{ fontWeight: 600, ml: 0.5 }}>
            {avgRating.toFixed(1)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
            ({reviewsCount.toLocaleString()})
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

BookCard.propTypes = {
  book: PropTypes.object.isRequired,
  libraryItem: PropTypes.object,
  onChangeStatus: PropTypes.func,
  onRemove: PropTypes.func
};

export default BookCard;