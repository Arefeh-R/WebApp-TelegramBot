import { lazy } from 'react';
import { Outlet } from 'react-router-dom';
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import AdminGuard from 'utils/route-guard/AdminGuard';

// Lazy load admin pages
const AdminDashboard = Loadable(lazy(() => import('pages/admin/dashboard/AdminDashboard')));
const PendingGroups = Loadable(lazy(() => import('pages/admin/groups/PendingGroups')));
const ManageGroups = Loadable(lazy(() => import('pages/admin/groups/ManageGroups')));
const ManageCategories = Loadable(lazy(() => import('pages/admin/categories/ManageCategories')));

// ==============================|| ADMIN ROUTES ||============================== //

const AdminRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: 'admin',
      element: (
        <AdminGuard>
          <Outlet />
        </AdminGuard>
      ),
      children: [
        {
          path: 'dashboard',
          element: <AdminDashboard />
        },
        {
          path: 'groups',
          children: [
            {
              path: 'pending',
              element: <PendingGroups />
            },
            {
              path: 'manage',
              element: <ManageGroups />
            }
          ]
        },
        {
          path: 'categories',
          element: <ManageCategories />
        }
      ]
    }
  ]
};

export default AdminRoutes;