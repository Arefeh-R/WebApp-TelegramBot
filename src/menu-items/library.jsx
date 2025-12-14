// src/menu-items/library.js

// assets
import { BookOutlined, ReadOutlined,EyeOutlined } from '@ant-design/icons';

// icons
const icons = {
  BookOutlined,
  ReadOutlined,
  EyeOutlined
};

// ==============================|| MENU ITEMS - LIBRARY ||============================== //

const library = {
  id: 'group-library',
  title: 'کتابخانه',
  type: 'group',
  children: [
    {
      id: 'books',
      title: 'مشاهده کتاب ها',
      type: 'item',
      url: '/dashboard/books',
      icon: icons.EyeOutlined,
      breadcrumbs: true
    },
    {
      id: 'library',
      title: 'کتابخانه من',
      type: 'item',
      url: '/dashboard/library',
      icon: icons.ReadOutlined,
      breadcrumbs: true
    },
    {
      id: 'book-detail',
      title: 'جزئیات کتاب',
      type: 'item',
      url: '/dashboard/books/:id',
      icon: icons.BookOutlined,
      breadcrumbs: true,  // Disable automatic breadcrumbs
    }
  ]
};

export default library;