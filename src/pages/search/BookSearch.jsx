import { useState } from 'react';
import { TextField, Stack, CircularProgress } from '@mui/material';
import BookList from 'components/books/BookList';
import { useBookSearch } from 'hooks/useBookSearch';

const BookSearch = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { books, count, isLoading } = useBookSearch({
    search,
    page
  });

  const totalPages = Math.ceil(count / 12); // match backend page size

  return (
    <Stack spacing={3}>
      <TextField
        fullWidth
        placeholder="عنوان، نویسنده یا ISBN"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {isLoading ? (
        <CircularProgress />
      ) : (
        <BookList
          books={books}
          title="نتایج جستجو"
          page={page}
          totalPages={totalPages}
          onPageChange={(_, value) => setPage(value)}
        />
      )}
    </Stack>
  );
};

export default BookSearch;
