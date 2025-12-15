import { CircularProgress } from '@mui/material';
import BookList from 'components/books/BookList';
import { useTopRatedBooks } from 'hooks/useBookSearch';

const TopRatedBooks = () => {
  const { books, isLoading } = useTopRatedBooks();

  if (isLoading) return <CircularProgress />;

  return (
    <BookList
      books={books}
      title="برترین کتاب‌ها"
      page={1}
      totalPages={1}
    />
  );
};

export default TopRatedBooks;
