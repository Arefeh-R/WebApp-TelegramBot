import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from 'utils/axios';
import axios from 'utils/axios';

export const useTelegramGroups = () => {
  const { data, error, isLoading } = useSWR('/groups/', fetcher);

  return {
    groups: data?.results || data || [],
    isLoading,
    isError: error
  };
};

export const useGroupCategories = () => {
  const { data, error, isLoading } = useSWR('/group-categories/', fetcher);

  return {
    categories: data?.results || data || [],
    isLoading,
    isError: error
  };
};

export const useRequestGroup = () => {
  const [isLoading, setIsLoading] = useState(false);

  const requestGroup = async (groupData) => {
    setIsLoading(true);
    try {
      // If category_name is provided instead of category_id, 
      // the backend should handle creating/finding the category
      const response = await axios.post('/groups/request_group/', groupData);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requestGroup,
    isLoading
  };
};