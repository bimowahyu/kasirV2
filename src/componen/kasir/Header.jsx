import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink, useNavigate } from "react-router-dom";
import { Logout, reset } from '../../fitur/AuthSlice';
import { useDispatch, useSelector } from "react-redux";


const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dispatch = useDispatch();
  const isMobile = useMediaQuery('(max-width:768px)');
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const logout = () => {
    dispatch(Logout());
    dispatch(reset());
    navigate("/");
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <>
   <AppBar position="static" color="primary" sx={{ margin: 0, padding: 0, width: '100%' }}>
  <Toolbar sx={{ display: 'flex', justifyContent: isMobile ? 'flex-start' : 'space-between' }}>
    <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)}>
      <MenuIcon />
    </IconButton>
    {!isMobile && (
      <Typography variant="h6">
        Point Of Sales
      </Typography>
    )}
  </Toolbar>
</AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <List style={{ width: 250 }}>
          <ListItem button
          component={NavLink}
         // to="/order"
         to={"/produkpercabang"}
          >
            <ListItemText primary="Beranda" />
          </ListItem>
         
          <ListItem button
           
           component={NavLink}
           //onClick={logout}
           to="/transaksikasir"
          >
            <ListItemText primary="Transaksi" />
          </ListItem>
          <ListItem button
           
           component={NavLink}
           //onClick={logout}
           to="/profilekasir"
          >
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem 
            button
            component={NavLink}
            onClick={logout}
            to="/"
          >
            <ListItemText primary="Log Out" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Header;
