import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const AdminHeader = () => {
  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: '#000000',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%',
            py: 1,
          }}
        >
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              letterSpacing: '2px',
              fontFamily: "'Playfair Display', serif",
              color: '#ffffff',
              textTransform: 'uppercase',
              '&:after': {
                content: '""',
                display: 'block',
                width: '40px',
                height: '2px',
                backgroundColor: '#ffffff',
                margin: '4px auto 0',
              }
            }}
          >
            TREND TROVE
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
