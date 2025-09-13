import React, { useState, useEffect } from 'react';
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Box,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';

const SmartSearch = ({ 
  placeholder, 
  onSearch, 
  suggestions = [], 
  searchHistory = [],
  trendingSearches = [],
  loading = false,
  fullWidth = true,
  size = 'medium'
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [searchHistoryFiltered, setSearchHistoryFiltered] = useState([]);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = suggestions.filter(item => 
        item.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.category?.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);

      const historyFiltered = searchHistory.filter(item =>
        item.toLowerCase().includes(query.toLowerCase())
      );
      setSearchHistoryFiltered(historyFiltered);
    } else {
      setFilteredSuggestions([]);
      setSearchHistoryFiltered([]);
    }
  }, [query, suggestions, searchHistory]);

  const handleInputChange = (value) => {
    setQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (item) => {
    onSearch(item);
    setQuery(item.name || item);
    setShowSuggestions(false);
  };

  const handleHistoryClick = (historyItem) => {
    onSearch({ name: historyItem, type: 'history' });
    setQuery(historyItem);
    setShowSuggestions(false);
  };

  const handleTrendingClick = (trendingItem) => {
    onSearch({ name: trendingItem, type: 'trending' });
    setQuery(trendingItem);
    setShowSuggestions(false);
  };

  const hasResults = filteredSuggestions.length > 0 || searchHistoryFiltered.length > 0;

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        fullWidth={fullWidth}
        size={size}
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setShowSuggestions(query.length > 0 || searchHistory.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: loading && (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: { xs: 2, sm: 1 },
            fontSize: { xs: '1rem', sm: '0.875rem' }
          }
        }}
      />
      
      {showSuggestions && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 400,
            overflow: 'auto',
            mt: 1,
            boxShadow: 3,
            borderRadius: { xs: 2, sm: 1 }
          }}
        >
          {/* Search Results */}
          {filteredSuggestions.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
                Search Results
              </Typography>
              <List>
                {filteredSuggestions.map((item, index) => (
                  <ListItem
                    key={`${item.id || index}-${item.name}`}
                    onClick={() => handleSuggestionClick(item)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                      py: { xs: 2, sm: 1 }
                    }}
                  >
                    <ListItemText
                      primary={item.name}
                      secondary={item.category || item.description}
                      primaryTypographyProps={{
                        fontSize: { xs: '1rem', sm: '0.875rem' }
                      }}
                      secondaryTypographyProps={{
                        fontSize: { xs: '0.875rem', sm: '0.75rem' }
                      }}
                    />
                    {item.type && (
                      <Chip 
                        label={item.type} 
                        size="small" 
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Search History */}
          {searchHistoryFiltered.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
                <HistoryIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Recent Searches
              </Typography>
              <List>
                {searchHistoryFiltered.slice(0, 3).map((item, index) => (
                  <ListItem
                    key={`history-${index}`}
                    onClick={() => handleHistoryClick(item)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                      py: { xs: 2, sm: 1 }
                    }}
                  >
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{
                        fontSize: { xs: '1rem', sm: '0.875rem' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Trending Searches */}
          {query.length === 0 && trendingSearches.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
                <TrendingIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Trending Searches
              </Typography>
              <List>
                {trendingSearches.slice(0, 3).map((item, index) => (
                  <ListItem
                    key={`trending-${index}`}
                    onClick={() => handleTrendingClick(item)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                      py: { xs: 2, sm: 1 }
                    }}
                  >
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{
                        fontSize: { xs: '1rem', sm: '0.875rem' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* No Results */}
          {!hasResults && query.length > 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No results found for "{query}"
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SmartSearch; 