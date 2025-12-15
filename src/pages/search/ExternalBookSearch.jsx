import { useState } from 'react';
import {
  Grid,
  Stack,
  TextField,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { SearchOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import ExternalBookCard from 'components/books/ExternalBookCard';
import { useExternalBookSearch } from 'hooks/useBookSearch';

const QUERY_TYPES = [
  { value: 'title', label: 'عنوان کتاب' },
  { value: 'author', label: 'نویسنده' },
  { value: 'isbn', label: 'ISBN' }
];

const ExternalBookSearch = () => {
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryType, setSearchQueryType] = useState('');

  // Use the hook with the search parameters
  const { results, notFoundMessage, isLoading, isError } = useExternalBookSearch(
    searchQuery,
    searchQueryType
  );

  const handleSearch = () => {
    if (!query.trim()) return;
    
    // Trigger the search by updating the parameters
    setSearchQuery(query);
    setSearchQueryType(queryType);
  };

  return (
    <MainCard title="جستجوی خارجی کتاب‌ها">
      <Stack spacing={3}>
        {/* Search Form */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="نوع جستجو"
              value={queryType}
              onChange={(e) => setQueryType(e.target.value)}
            >
              {QUERY_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={7}>
            <TextField
              fullWidth
              label="عبارت جستجو"
              placeholder="مثلاً: Brandon Sanderson"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchOutlined />}
              onClick={handleSearch}
              disabled={isLoading}
            >
              جستجو
            </Button>
          </Grid>
        </Grid>

        {/* Loading */}
        {isLoading && (
          <Stack alignItems="center" sx={{ mt: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              در حال جستجو...
            </Typography>
          </Stack>
        )}

        {/* Error */}
        {isError && (
          <Alert severity="error">
            خطا در ارتباط با سرور
          </Alert>
        )}

        {/* Not Found Message */}
        {notFoundMessage && (
          <Alert severity="info">
            📚 کتابی با این مشخصات پیدا نشد.
          </Alert>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <Stack spacing={2}>
            <Typography variant="h4">
              نتایج جستجو ({results.length})
            </Typography>

            {results.map((book) => (
              <ExternalBookCard
                key={book.parent_asin}
                book={{
                  title: book.title,
                  authors: book.authors?.map((a) => a.name),
                  first_publish_year: book.publication_date
                    ? new Date(book.publication_date).getFullYear()
                    : null,
                  cover_url: book.image_url,
                  isbn: book.isbn_13 || book.isbn_10
                }}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </MainCard>
  );
};

export default ExternalBookSearch;