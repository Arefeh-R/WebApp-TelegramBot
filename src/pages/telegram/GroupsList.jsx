import MainCard from 'components/MainCard';
import CategorySection from './CategorySection';
import { useTelegramGroups } from 'hooks/useTelegramGroups';

const GroupsList = () => {
  const { groups } = useTelegramGroups();

  
  const grouped = groups.reduce((acc, group) => {
   
    const key = group.category?.id || 'uncategorized';
    
    if (!acc[key]) {
      acc[key] = {
        category: group.category || {
          id: 'uncategorized',
          name: 'Uncategorized',
          description: 'Groups without a category'
        },
        groups: []
      };
    }
    acc[key].groups.push(group);
    return acc;
  }, {});

  return (
    <MainCard title="Telegram Forums">
      {Object.values(grouped).map(section => (
        <CategorySection
          key={section.category.id}
          category={section.category}
          groups={section.groups}
        />
      ))}
    </MainCard>
  );
};

export default GroupsList;