import axiosServices from 'utils/axios';

// API endpoints
const endpoints = {
  books: {
    list: '/books/',
    detail: (id) => `/books/${id}/`,
    searchExternal: '/books/search-external/', 
    create: '/books/',
    update: (id) => `/books/${id}/`,
    delete: (id) => `/books/${id}/`,
    topRated: '/books/top-rated/',
  },
  userBooks: {
    list: '/user-books/',
    add: '/user-books/',
    update: (id) => `/user-books/${id}/`,
    delete: (id) => `/user-books/${id}/`
  }
};

// ==============================|| BOOKS API ||============================== //

export const booksAPI = {
  // Get all books with pagination
  getBooks: async (params = {}) => {
    const response = await axiosServices.get(endpoints.books.list, { params });
    return response.data;
  },

  // Get single book by ID
  getBookById: async (id) => {
    const response = await axiosServices.get(endpoints.books.detail(id));
    return response.data;
  },

  // Internal search using DRF SearchFilter: GET /books/?search=...
  searchBooks: async (query, params = {}) => {
    const response = await axiosServices.get(endpoints.books.list, {
      params: { search: query, ...params }
    });
    return response.data;
  },

  // External OpenLibrary search exposed by backend: /books/search-external/?query=...&query_type=...
  searchExternal: async (query, query_type = 'title') => {
    const response = await axiosServices.get(endpoints.books.searchExternal, {
      params: { query, query_type }
    });
    return response.data;
  },

  // Use list with query params for filtering   
  filterBooks: async (filters = {}) => {
    const response = await axiosServices.get(endpoints.books.list, { params: filters });
    return response.data;
  },

  // Create new book (admin only)
  createBook: async (bookData) => {
    const response = await axiosServices.post(endpoints.books.create, bookData);
    return response.data;
  },

  // Update book
  updateBook: async (id, bookData) => {
    const response = await axiosServices.patch(endpoints.books.update(id), bookData);
    return response.data;
  },

  // Delete book
  deleteBook: async (id) => {
    const response = await axiosServices.delete(endpoints.books.delete(id));
    return response.data;
  },

  getTopRated: async () => {
    const response = await axiosServices.get(endpoints.books.topRated);
    return response.data;
  }
};

// ==============================|| USER LIBRARY API ||============================== //

export const userLibraryAPI = {
  // Get user's library
  getUserLibrary: async (params = {}) => {
    const response = await axiosServices.get(endpoints.userBooks.list, { params });
    return response.data;
  },

  // Add book to library
  addToLibrary: async (bookId, status = 'wishlist') => {
    const response = await axiosServices.post(endpoints.userBooks.add, {
      book: bookId,
      status
    });
    return response.data;
  },

  // Update reading status
  updateStatus: async (id, status) => {
    const response = await axiosServices.patch(endpoints.userBooks.update(id), { status });
    return response.data;
  },

  // Remove from library
  removeFromLibrary: async (id) => {
    const response = await axiosServices.delete(endpoints.userBooks.delete(id));
    return response.data;
  }
};