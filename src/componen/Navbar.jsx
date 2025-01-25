import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import { NavLink } from "react-router-dom";
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
import Sidebar from './Sidebar';

export const Navbar = () => {
  const [openDrawer, setOpenDrawer] = useState(false);

  const toggleDrawer = () => {
    setOpenDrawer((prev) => !prev);
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
          <IconButton
            onClick={toggleDrawer}
            sx={{ display: { xs: 'inline-flex', lg: 'none' } }}
          >
            <ListIcon />
          </IconButton>

          {/* Search Icon */}
          <Tooltip title="Search">
            <IconButton>
              {/* <MagnifyingGlassIcon /> */}
            </IconButton>
          </Tooltip>

          {/* Navbar Right Actions */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Tooltip title="User List">
            <Link to="/userlist" style={{ textDecoration: 'none' }}>
              <IconButton>
                <UsersIcon />
              </IconButton>
            </Link>
            </Tooltip>
            <Tooltip title="Notifications">
              
                <IconButton>
                  {/* <BellIcon /> */}
                </IconButton>
             
            </Tooltip>
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
          }}
          onClick={toggleDrawer}
        >
          <Sidebar />
        </Box>
      )}
    </React.Fragment>
  );
};

export default Navbar;
