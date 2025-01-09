import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { LogoutOutlined } from '@mui/icons-material';
import { Logout, reset } from '../fitur/AuthSlice';
// import Button from '@mui/material/Button';

export const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const logout = () => {
    dispatch(Logout());
    dispatch(reset());
    navigate("/");
  };
  return (
    <Box
      sx={{
        bgcolor: '#1e293b',
        color: 'white',
        display: { xs: 'block', lg: 'flex' },
        flexDirection: 'column',
        height: '100vh',
        width: { xs: 200, lg: 250 },
        position: 'fixed',
        top: 0,
        left: 0,
        p: 2,
        zIndex: 1200,
        
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 60,
          mb: 3,
          borderBottom: '1px solid #374151',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Point Of Sales
        </Typography>
      </Box>

      {/* Navigation Links */}
      <Stack spacing={2} sx={{ flex: 1 }}>
      <Typography
            component={NavLink}
            to="/dashboard"
            sx={{
                textDecoration: 'none',
                color: '#cbd5e1',
                p: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: '#374151', color: 'white' },
                '&.active': { bgcolor: '#374151', color: 'white' }, 
            }}
            >
            Dashboard
            </Typography>

        <Typography
            component={NavLink}
            to="/userlist"
            sx={{
                textDecoration: 'none',
                color: '#cbd5e1',
                p: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: '#374151', color: 'white' },
                '&.active': { bgcolor: '#374151', color: 'white' }, 
            }}
            >
            User List
            </Typography>
            <Typography
            component={NavLink}
            to="/transaction"
            sx={{
                textDecoration: 'none',
                color: '#cbd5e1',
                p: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: '#374151', color: 'white' },
                '&.active': { bgcolor: '#374151', color: 'white' }, 
            }}
            >
            Transaction
            </Typography>

            <Typography
            component={NavLink}
            to="/product"
            sx={{
                textDecoration: 'none',
                color: '#cbd5e1',
                p: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: '#374151', color: 'white' },
                '&.active': { bgcolor: '#374151', color: 'white' }, 
            }}
            >
            Product
            </Typography>
            <Typography
            component={NavLink}
            to="/category"
            sx={{
                textDecoration: 'none',
                color: '#cbd5e1',
                p: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: '#374151', color: 'white' },
                '&.active': { bgcolor: '#374151', color: 'white' }, 
            }}
            >
            Category
            </Typography>
            <Typography
            component={NavLink}
            to="/setprodukpercabang"
            sx={{
                textDecoration: 'none',
                color: '#cbd5e1',
                p: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: '#374151', color: 'white' },
                '&.active': { bgcolor: '#374151', color: 'white' }, 
            }}
            >Set Produk
              </Typography>
              {user && user.role === "superadmin" && (
            <Typography
            component={NavLink}
            to="/branch"
            sx={{
                textDecoration: 'none',
                color: '#cbd5e1',
                p: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: '#374151', color: 'white' },
                '&.active': { bgcolor: '#374151', color: 'white' }, 
            }}
            >
            Branch
            </Typography>
            )}


            <Typography
            component={NavLink}
            to="/laporan"
            sx={{
                textDecoration: 'none',
                color: '#cbd5e1',
                p: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: '#374151', color: 'white' },
                '&.active': { bgcolor: '#374151', color: 'white' }, 
            }}
            >
            Invoice
            </Typography>

            <Typography
            component={NavLink}
            onClick={logout}

            to="/"
            sx={{
                textDecoration: 'none',
                color: '#cbd5e1',
                p: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: '#374151', color: 'white' },
                '&.active': { bgcolor: '#374151', color: 'white' }, 
            }}
            >
            <LogoutOutlined /> Log Out
           
            </Typography>
      </Stack>

      {/* Divider */}
      <Divider sx={{ bgcolor: '#374151', my: 2 }} />

      {/* Footer Section */}
      
    </Box>
  );
};

export default Sidebar;