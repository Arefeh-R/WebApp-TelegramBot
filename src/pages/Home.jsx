// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import BookList from '../components/books/BookList';
import { booksAPI } from '../api/books';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const [featured, recent] = await Promise.all([
          booksAPI.getBooks({ featured: true, limit: 12 }),
          booksAPI.getBooks({ ordering: '-created_at', limit: 12 })
        ]);
        setFeaturedBooks(featured.data.results);
        setRecentBooks(recent.data.results);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" sx={{ mb: 4 }}>
        Welcome to Your Library
      </Typography>
      
      <Box sx={{ mb: 6 }}>
        <BookList books={featuredBooks} title="Featured Books" />
      </Box>
      
      <Box>
        <BookList books={recentBooks} title="Recently Added" />
      </Box>
    </Container>
  );
};

export default Home;