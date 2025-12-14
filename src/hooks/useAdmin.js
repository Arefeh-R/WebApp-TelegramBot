import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from 'utils/axios';
import axios from 'utils/axios';

// Get pending groups (not approved)
export const usePendingGroups = () => {
  const { data, error, isLoading, mutate } = useSWR('/groups/?is_approved=false', fetcher);

  return {
    groups: data?.results || data || [],
    isLoading,
    isError: error,
    mutate
  };
};

// Approve a group
export const useApproveGroup = () => {
  const [isLoading, setIsLoading] = useState(false);

  const approveGroup = async (groupId, approvalData) => {
    setIsLoading(true);
    try {
      const response = await axios.patch(`/groups/${groupId}/`, {
        is_approved: true,
        ...approvalData
      });
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    approveGroup,
    isLoading
  };
};

// Reject/delete a group
export const useRejectGroup = () => {
  const [isLoading, setIsLoading] = useState(false);

  const rejectGroup = async (groupId) => {
    setIsLoading(true);
    try {
      await axios.delete(`/groups/${groupId}/`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rejectGroup,
    isLoading
  };
};

// Update a group
export const useUpdateGroup = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updateGroup = async (groupId, groupData) => {
    setIsLoading(true);
    try {
      const response = await axios.patch(`/groups/${groupId}/`, groupData);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateGroup,
    isLoading
  };
};

// Delete a group
export const useDeleteGroup = () => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteGroup = async (groupId) => {
    setIsLoading(true);
    try {
      await axios.delete(`/groups/${groupId}/`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteGroup,
    isLoading
  };
};

// Category management hooks
export const useCreateCategory = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createCategory = async (categoryData) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/group-categories/', categoryData);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCategory,
    isLoading
  };
};

export const useUpdateCategory = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updateCategory = async (categoryId, categoryData) => {
    setIsLoading(true);
    try {
      const response = await axios.patch(`/group-categories/${categoryId}/`, categoryData);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateCategory,
    isLoading
  };
};

export const useDeleteCategory = () => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteCategory = async (categoryId) => {
    setIsLoading(true);
    try {
      await axios.delete(`/group-categories/${categoryId}/`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteCategory,
    isLoading
  };
};