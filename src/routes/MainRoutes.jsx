import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import AuthGuard from 'utils/route-guard/AuthGuard'; 

//render books pages
const BooksListPage = Loadable(lazy(() => import('pages/Book/BooksList')));
const BookDetailPage = Loadable(lazy(() => import('pages/Book/BookDetails')));

//render telegram group pages
const GroupsList = Loadable(lazy(() => import('pages/telegram/GroupsList')));
const RequestGroup = Loadable(lazy(() => import('pages/user/RequestGroup')));

//render user pages
const MyLibraryPage = Loadable(lazy(() => import('pages/user/MyLibrary')));

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

// render - color
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        },
        {
          path: 'library',
          element: (
            <AuthGuard>
              <MyLibraryPage />
            </AuthGuard>
          )
        },
        {
          path: 'books',
          element: <BooksListPage />
        },
        {
          path: 'books/:id',
          element: <BookDetailPage />
        }
        
      ]
    },
    {
      path: 'telegram/groups',
      element: <GroupsList />
    },    
    {
      path: 'telegram/request',
      element: <RequestGroup />
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    }
  ]
};

export default MainRoutes;
