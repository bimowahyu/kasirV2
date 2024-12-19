import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';

const categories = ['Semua', 'Makanan', 'Minuman', 'Kosmetik', 'Sayuran'];

const Sidebar = () => {
  return (
    <List>
      {categories.map((category) => (
        <ListItem button key={category}>
          <ListItemText primary={category} />
        </ListItem>
      ))}
    </List>
  );
};

export default Sidebar;
