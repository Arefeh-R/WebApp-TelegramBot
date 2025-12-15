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
const ProfileView = Loadable(lazy(() => import('pages/profile/ProfileView')));
const ProfileEdit = Loadable(lazy(() => import('pages/profile/ProfileEdit')));
const AccountSettings = Loadable(lazy(() => import('pages/settings/AccountSettings')));
const PasswordChange = Loadable(lazy(() => import('pages/settings/PasswordChange')));

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
      element: <BooksListPage />
    },
    {
      path: 'profile',
      element: <ProfileView />
    },
    {
      path: 'profile/edit',
      element: <ProfileEdit />
    },
    {
      path: 'settings',
      children: [
        {
          path: 'account',
          element: <AccountSettings />
        },
        {
          path: 'password',
          element: <PasswordChange />
        }
      ]
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <BooksListPage />
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
