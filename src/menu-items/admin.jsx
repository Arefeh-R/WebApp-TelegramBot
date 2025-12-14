import { 
  DashboardOutlined, 
  TeamOutlined, 
  AppstoreOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';

const admin = {
  id: 'admin',
  title: 'Admin',
  type: 'group',
  children: [
    {
      id: 'admin-dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/admin/dashboard',
      icon: DashboardOutlined
    },
    {
      id: 'admin-pending-groups',
      title: 'Pending Groups',
      type: 'item',
      url: '/admin/groups/pending',
      icon: CheckCircleOutlined
    },
    {
      id: 'admin-manage-groups',
      title: 'Manage Groups',
      type: 'item',
      url: '/admin/groups/manage',
      icon: TeamOutlined
    },
    {
      id: 'admin-manage-categories',
      title: 'Manage Categories',
      type: 'item',
      url: '/admin/categories',
      icon: AppstoreOutlined
    }
  ]
};

export default admin;