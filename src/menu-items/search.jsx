import { FileSearchOutlined,SearchOutlined} from '@ant-design/icons'

const search = {
  id: 'search',
  title: 'جستجو',
  type: 'group',
  children: [
    {
      id: 'book-search',
      title: 'جستجوی کتاب',
      type: 'item',
      url: '/search/books',
      icon: SearchOutlined,
      breadcrumbs: true
    },
    {
      id: 'external-search',
      title: 'جستجوی گسترده',
      type: 'item',
      url: '/search/external',
      icon: FileSearchOutlined,
      breadcrumbs: true
    }
  ]
};

export default search;
