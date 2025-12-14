import { Box, Typography, Divider, Stack } from '@mui/material';
import GroupRow from './GroupRow';

const CategorySection = ({ category, groups }) => {
  return (
    <Box sx={{ mb: 4 }}>
      {/* Category Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 1
        }}
      >
        <Typography variant="h6">
          {category.name}
        </Typography>
        {category.description && (
          <Typography variant="caption">
            {category.description}
          </Typography>
        )}
      </Box>

      {/* Groups */}
      <Stack divider={<Divider />} sx={{ bgcolor: 'background.paper' }}>
        {groups.map(group => (
          <GroupRow key={group.id} group={group} />
        ))}
      </Stack>
    </Box>
  );
};

export default CategorySection;
