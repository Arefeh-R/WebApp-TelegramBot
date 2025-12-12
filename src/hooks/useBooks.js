import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'utils/axios';
import { booksAPI, userLibraryAPI } from 'api/books';

// ==============================|| BOOKS - GET LIST ||============================== //

export function useGetBooks(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/books/?${queryString}` : '/books/';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      books: data?.results || [],
      totalBooks: data?.count || 0,
      booksLoading: isLoading,
      booksError: error,
      booksValidating: isValidating,
      booksEmpty: !isLoading && !data?.results?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ==============================|| BOOKS - GET SINGLE ||============================== //

export function useGetBook(bookId) {
  const { data, isLoading, error, isValidating } = useSWR(
    bookId ? `/books/${bookId}/` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const memoizedValue = useMemo(
    () => ({
      book: data || null,
      bookLoading: isLoading,
      bookError: error,
      bookValidating: isValidating
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ==============================|| BOOKS - SEARCH ||============================== //

export function useSearchBooks(query) {
  const { data, isLoading, error } = useSWR(
    query ? `/books/?search=${query}` : null,
    fetcher,
    {
      revalidateOnFocus: false
    }
  );

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.results || [],
      searchLoading: isLoading,
      searchError: error,
      searchEmpty: !isLoading && !data?.results?.length
    }),
    [data, error, isLoading]
  );

  return memoizedValue;
}

// ==============================|| USER LIBRARY - GET LIST ||============================== //

export function useGetUserLibrary(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/user-books/?${queryString}` : '/user-books/';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      library: data?.results || [],
      libraryLoading: isLoading,
      libraryError: error,
      libraryValidating: isValidating,
      libraryEmpty: !isLoading && !data?.results?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ==============================|| BOOKS - MUTATE FUNCTIONS ||============================== //

// Add book to library with optimistic update
export async function addBookToLibrary(bookId, status) {
  try {
    const newItem = await userLibraryAPI.addToLibrary(bookId, status);
    
    // Update the library list cache
    mutate(
      '/user-books/',
      (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          results: [newItem, ...(currentData.results || [])]
        };
      },
      false
    );
    
    return { success: true, data: newItem };
  } catch (error) {
    console.error('Error adding to library:', error);
    return { success: false, error: error.message };
  }
}

// Update reading status
export async function updateReadingStatus(id, status) {
  try {
    const updatedItem = await userLibraryAPI.updateStatus(id, status);
    
    // Update cache
    mutate(
      '/user-books/',
      (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          results: currentData.results.map((item) =>
            item.id === id ? { ...item, status } : item
          )
        };
      },
      false
    );
    
    return { success: true, data: updatedItem };
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false, error: error.message };
  }
}

// Remove from library
export async function removeFromLibrary(id) {
  try {
    await userLibraryAPI.removeFromLibrary(id);
    
    // Update cache
    mutate(
      '/user-books/',
      (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          results: currentData.results.filter((item) => item.id !== id)
        };
      },
      false
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error removing from library:', error);
    return { success: false, error: error.message };
  }
}

// Filter books with optimistic update
export async function filterBooks(filters) {
  try {
    const filteredBooks = await booksAPI.filterBooks(filters);
    
    // Update books list cache
    mutate(
      '/books/',
      () => filteredBooks,
      false
    );
    
    return { success: true, data: filteredBooks };
  } catch (error) {
    console.error('Error filtering books:', error);
    return { success: false, error: error.message };
  }
}