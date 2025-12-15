import { lazy } from 'react';
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

const BookSearch = Loadable(lazy(() => import('pages/search/BookSearch')));
const ExternalBookSearch = Loadable(lazy(() => import('pages/search/ExternalBookSearch')));
const TopRatedBooks = Loadable(lazy(() => import('pages/search/TopRatedBooks')));

const SearchRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: 'search/books',
      element: <BookSearch />
    },
    {
      path: 'search/external',
      element: <ExternalBookSearch />
    },
    {
      path: 'books/top-rated',
      element: <TopRatedBooks />
    }
  ]
};

export default SearchRoutes;
