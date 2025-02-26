import React, { useState } from 'react';
import { Link,useNavigate,NavLink } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { List, ListItemButton, Collapse } from '@mui/material';
import { useSelector } from "react-redux";
import Sidebar from './Sidebar';
import useSWR from "swr";
import axios from "axios";

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  const baseUrl = process.env.REACT_APP_URL.replace(/^https?:\/\/+/, "");
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) => axios.get(url).then((res) => res.data);

export const Navbar = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { data, error } = useSWR(`${getApiBaseUrl()}/getdistribusistok?status=pending`, fetcher, {
    refreshInterval: 5000, // Auto refresh setiap 5 detik
  });

  const pendingCount = data?.data?.length || 0;

  const toggleDrawer = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setOpenDrawer((prev) => !prev);
  };

  const handleDropdownClick = (event) => {
    event.stopPropagation();
    setOpenDropdown(!openDropdown);
  };

  return (
    <React.Fragment>
      {/* Navbar Container */}
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 1200,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          {/* Mobile Menu Button */}
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton
              onClick={toggleDrawer}
              sx={{ display: { xs: 'inline-flex', lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>

            {/* Dropdown Menu - Positioned in the navbar */}
            <Box
              sx={{
                position: 'relative',
                display: { xs: 'inline-flex', lg: 'none' }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ListItemButton
                onClick={handleDropdownClick}
                sx={{
                  borderRadius: 1,
                  minWidth: '120px',
                  py: 1,
                }}
              >
                Invoice All
                {openDropdown ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse
                in={openDropdown}
                timeout="auto"
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '200px',
                  backgroundColor: 'white',
                  boxShadow: 3,
                  zIndex: 1250,
                  borderRadius: 1,
                }}
              >
                <List component="div" disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/laporan"
                    sx={{ pl: 4 }}
                  >
                    Invoice
                  </ListItemButton>
                  <ListItemButton
                    component={Link}
                    to="/penjualankategori"
                    sx={{ pl: 4 }}
                  >
                    Category Sell Report
                  </ListItemButton>
                  <ListItemButton
                    component={Link}
                    to="/stockpages"
                    sx={{ pl: 4 }}
                  >
                    Stock
                  </ListItemButton>
                  <ListItemButton
                    component={Link}
                    to="/komprehensif"
                    sx={{ pl: 4 }}
                  >
                    Komprehensif
                  </ListItemButton>
                </List>
              </Collapse>
            </Box>
          </Stack>

          {/* Navbar Right Actions */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Tooltip title="User List">
              <Link to="/userlist" style={{ textDecoration: 'none' }}>
                <IconButton>
                  <UsersIcon />
                </IconButton>
              </Link>
            </Tooltip>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      {user && user.role === "admin" && (
        <Tooltip title="Konfirmasi Distribusi Stok" component={NavLink} to="/confirm">
          <IconButton>
            <Badge badgeContent={pendingCount} color="error">
              <BellIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      )}
      </Stack>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <Avatar
                sx={{
                  cursor: 'pointer',
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  color: 'white',
                }}
              />
            </Link>
          </Stack>
        </Stack>
      </Box>

      {/* Sidebar for Mobile */}
      {openDrawer && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1300,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.3s ease',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 }
            }
          }}
          onClick={toggleDrawer}
        >
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: { xs: 200, lg: 250 },
              height: '100vh',
              '@keyframes slideIn': {
                from: { transform: 'translateX(-100%)' },
                to: { transform: 'translateX(0)' }
              },
              animation: {
                xs: 'slideIn 0.3s ease',
                lg: 'none'
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </Box>
        </Box>
      )}
    </React.Fragment>
  );
};

export default Navbar;