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
  title: 'Library',
  type: 'group',
  children: [
    {
      id: 'books',
      title: 'Browse Books',
      type: 'item',
      url: '/dashboard/books',
      icon: icons.EyeOutlined,
      breadcrumbs: true
    },
    {
      id: 'library',
      title: 'My Library',
      type: 'item',
      url: '/dashboard/library',
      icon: icons.ReadOutlined,
      breadcrumbs: true
    },
    {
      id: 'book-detail',
      title: 'Book Details',
      type: 'item',
      url: '/dashboard/books',
      breadcrumbs: true,  // Disable automatic breadcrumbs
      hidden: true  // Hide from sidebar menu
    }
  ]
};

export default library;