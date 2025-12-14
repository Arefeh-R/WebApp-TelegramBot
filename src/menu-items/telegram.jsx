import { WechatWorkOutlined, PlusCircleOutlined } from '@ant-design/icons';

const telegram = {
  id: 'telegram',
  title: 'گفت و گوها',
  type: 'group',
  children: [
    {
      id: 'telegram-groups',
      title: 'گروه ها ',
      type: 'item',
      url: '/telegram/groups',
      icon: WechatWorkOutlined
    },
    {
      id: 'telegram-request',
      title: 'درخواست گروه جدید',
      type: 'item',
      url: '/telegram/request',
      icon: PlusCircleOutlined
    }
  ]
};

export default telegram;