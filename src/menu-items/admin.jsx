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
      title: 'داشبورد',
      type: 'item',
      url: '/admin/dashboard',
      icon: DashboardOutlined
    },
    {
      id: 'admin-pending-groups',
      title: 'گروه های در انتظار تایید',
      type: 'item',
      url: '/admin/groups/pending',
      icon: CheckCircleOutlined
    },
    {
      id: 'admin-manage-groups',
      title: 'مدیریت گروه ها',
      type: 'item',
      url: '/admin/groups/manage',
      icon: TeamOutlined
    },
    {
      id: 'admin-manage-categories',
      title: 'مدیریت دسته‌بندی‌ها',
      type: 'item',
      url: '/admin/categories',
      icon: AppstoreOutlined
    }
  ]
};

export default admin;