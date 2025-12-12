import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'utils/axios';
import { reviewsAPI } from 'api/reviews';

// ==============================|| REVIEWS - GET LIST ||============================== //

export function useGetReviews(bookId) {
  const { data, isLoading, error, isValidating } = useSWR(
    bookId ? `/books/${bookId}/reviews/` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const memoizedValue = useMemo(
    () => ({
      reviews: data?.results || [],
      reviewsLoading: isLoading,
      reviewsError: error,
      reviewsValidating: isValidating,
      reviewsEmpty: !isLoading && !data?.results?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ==============================|| REVIEWS - MUTATE FUNCTIONS ||============================== //

// Add review with optimistic update
export async function addReview(bookId, reviewData) {
  try {
    const newReview = await reviewsAPI.addReview(bookId, reviewData);
    
    // Update reviews cache
    mutate(
      `/books/${bookId}/reviews/`,
      (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          results: [newReview, ...(currentData.results || [])]
        };
      },
      false
    );
    
    // Also update the book's review count
    mutate(`/books/${bookId}/`, (currentBook) => {
      if (!currentBook) return currentBook;
      return {
        ...currentBook,
        reviews_count: (currentBook.reviews_count || 0) + 1
      };
    });
    
    return { success: true, data: newReview };
  } catch (error) {
    console.error('Error adding review:', error);
    return { success: false, error: error.message };
  }
}

// Update review
export async function updateReview(bookId, reviewId, reviewData) {
  try {
    const updatedReview = await reviewsAPI.updateReview(bookId, reviewId, reviewData);
    
    // Update cache
    mutate(
      `/books/${bookId}/reviews/`,
      (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          results: currentData.results.map((review) =>
            review.id === reviewId ? updatedReview : review
          )
        };
      },
      false
    );
    
    return { success: true, data: updatedReview };
  } catch (error) {
    console.error('Error updating review:', error);
    return { success: false, error: error.message };
  }
}

// Delete review
export async function deleteReview(bookId, reviewId) {
  try {
    await reviewsAPI.deleteReview(bookId, reviewId);
    
    // Update reviews cache
    mutate(
      `/books/${bookId}/reviews/`,
      (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          results: currentData.results.filter((review) => review.id !== reviewId)
        };
      },
      false
    );
    
    // Update book's review count
    mutate(`/books/${bookId}/`, (currentBook) => {
      if (!currentBook) return currentBook;
      return {
        ...currentBook,
        reviews_count: Math.max((currentBook.reviews_count || 1) - 1, 0)
      };
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting review:', error);
    return { success: false, error: error.message };
  }
}