import useSWR from 'swr';
import axios from 'utils/axios';

export const useBookSearch = (params) => {
  const query = new URLSearchParams(params).toString();

  const { data, error, isLoading } = useSWR(
    query ? `/books/?${query}` : null,
    (url) => axios.get(url).then(res => res.data)
  );

  return {
    books: data?.results || [],
    count: data?.count || 0,
    isLoading,
    isError: !!error
  };
};

export const useTopRatedBooks = () => {
  const { data, error, isLoading } = useSWR(
    '/books/top-rated/',
    (url) => axios.get(url).then(res => res.data)
  );

  return {
    books: data || [],
    isLoading,
    isError: !!error
  };
};

export const useExternalBookSearch = (query, queryType) => {
  const shouldFetch = query && queryType;

  const { data, error, isLoading } = useSWR(
    shouldFetch
      ? `/books/search-external?query_type=${queryType}&query=${query}`
      : null,
    async (url) => {
      try {
        const res = await axios.get(url);
        return res.data;
      } catch (err) {
        if (err.response?.status === 404) {
          return {
            __notFound: true,
            message: err.response.data?.detail
          };
        }
        throw err;
      }
    }
  );

  return {
    results: data?.__notFound ? [] : data || [],
    notFoundMessage: data?.__notFound ? data.message : null,
    isLoading,
    isError: !!error && !data?.__notFound
  };
};