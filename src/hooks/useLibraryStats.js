import { useMemo } from 'react';
import { useGetUserLibrary } from './useBooks';

export function useLibraryStats() {
  // fetch ALL library items once
  const { library, libraryLoading } = useGetUserLibrary({});

  const stats = useMemo(() => {
    if (!library) {
      return {
        total: 0,
        want: 0,
        reading: 0,
        read: 0
      };
    }

    return {
      total: library.length,
      want: library.filter(i => i.status === 'wishlist').length,
      reading: library.filter(i => i.status === 'reading').length,
      read: library.filter(i => i.status === 'completed').length
    };
  }, [library]);

  return { stats, loading: libraryLoading };
}
