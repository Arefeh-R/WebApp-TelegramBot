import axiosServices from 'utils/axios';

const endpoints = {
  reviews: {
    list: (bookId) => `/books/${bookId}/reviews/`,
    create: (bookId) => `/books/${bookId}/reviews/`,
    update: (bookId, reviewId) => `/books/${bookId}/reviews/${reviewId}/`,
    delete: (bookId, reviewId) => `/books/${bookId}/reviews/${reviewId}/`
  }
};

export const reviewsAPI = {
  // Get reviews for a book
  getReviews: async (bookId, params = {}) => {
    const response = await axiosServices.get(endpoints.reviews.list(bookId), { params });
    return response.data;
  },

  // Add review
  addReview: async (bookId, reviewData) => {
    const response = await axiosServices.post(endpoints.reviews.create(bookId), reviewData);
    return response.data;
  },

  // Update review
  updateReview: async (bookId, reviewId, reviewData) => {
    const response = await axiosServices.patch(
      endpoints.reviews.update(bookId, reviewId),
      reviewData
    );
    return response.data;
  },

  // Delete review
  deleteReview: async (bookId, reviewId) => {
    const response = await axiosServices.delete(endpoints.reviews.delete(bookId, reviewId));
    return response.data;
  }
};