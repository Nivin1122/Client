import React, { useEffect } from 'react';
import AdminHeader from "../components/adminHeader";
import LoginForm from "../components/loginForm";
import AdminFooter from "../components/adminfooter";
import { Box } from '@mui/material';

const AdminLogin = () => {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f7fa',
      }}
    >
      <AdminHeader />
      <Box sx={{ flex: 1 }}>
        <LoginForm />
      </Box>
      <AdminFooter />
    </Box>
  );
};

export default AdminLogin;
