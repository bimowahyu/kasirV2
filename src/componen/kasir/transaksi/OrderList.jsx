import React from 'react';
import { List, ListItem, Typography, Button, Box } from '@mui/material';

const OrderList = ({ orders, incrementOrder, decrementOrder, removeOrder }) => (
  <List>
    {orders.map((order) => (
      <ListItem key={order.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body1">{order.name}</Typography>
          <Typography variant="body2">Rp {(order.price * order.quantity).toLocaleString()}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => decrementOrder(order.id)}>-</Button>
          <Typography>{order.quantity}</Typography>
          <Button variant="outlined" onClick={() => incrementOrder(order.id)}>+</Button>
        </Box>
        <Button color="error" onClick={() => removeOrder(order.id)}>Hapus</Button>
      </ListItem>
    ))}
  </List>
);

export default OrderList;
