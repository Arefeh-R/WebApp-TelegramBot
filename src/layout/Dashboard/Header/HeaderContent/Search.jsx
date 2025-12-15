import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// material-ui
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';

// assets
import SearchOutlined from '@ant-design/icons/SearchOutlined';

// ==============================|| HEADER CONTENT - SEARCH ||============================== //

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');

  const handleKeyDown = (event) => {
    // Handle Ctrl+K or Cmd+K to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      event.target.focus();
      return;
    }

    // Handle Enter to search
    if (event.key === 'Enter' && searchValue.trim()) {
      // Navigate to search page with query parameter
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleChange = (event) => {
    setSearchValue(event.target.value);
  };

  // Clear search when navigating away from search page
  if (location.pathname !== '/search' && searchValue) {
    setSearchValue('');
  }

  return (
    <Box sx={{ width: '100%', ml: { xs: 0, md: 1 } }}>
      <FormControl sx={{ width: { xs: '100%', md: 224 } }}>
        <OutlinedInput
          size="small"
          id="header-search"
          value={searchValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          startAdornment={
            <InputAdornment position="start" sx={{ mr: -0.5 }}>
              <SearchOutlined />
            </InputAdornment>
          }
          aria-describedby="header-search-text"
          slotProps={{ input: { 'aria-label': 'weight' } }}
          placeholder="جستجو... (Ctrl + K)"
        />
      </FormControl>
    </Box>
  );
}