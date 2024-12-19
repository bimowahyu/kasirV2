import React from 'react';
import { List, ListItem, ListItemText, Typography, Button } from '@mui/material';

const orders = [
  { id: 1, name: 'Nasi Bakar', price: 15000, quantity: 2 },
  { id: 2, name: 'Ayam Penyet', price: 20000, quantity: 1 },
];

const OrderList = () => {
  const total = orders.reduce((sum, order) => sum + order.price * order.quantity, 0);

  return (
    <div>
      <List>
        {orders.map((order) => (
          <ListItem key={order.id}>
            <ListItemText primary={`${order.name} x${order.quantity}`} secondary={`Rp ${order.price.toLocaleString()}`} />
          </ListItem>
        ))}
      </List>
      <Typography variant="h6" style={{ marginTop: 10 }}>
        Total: Rp {total.toLocaleString()}
      </Typography>
      <Button variant="contained" color="secondary" fullWidth style={{ marginTop: 10 }}>
        Bayar
      </Button>
    </div>
  );
};

export default OrderList;
