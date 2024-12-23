import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';

const ReceiptDialog = ({ open, onClose, receiptData }) => {
  const { items = [], total = 0, paymentMethod = 'Tidak diketahui' } = receiptData || {};

  const printReceipt = () => {
    const receiptContent = `
      <html>
        <head>
          <title>Struk Pembelian</title>
          <style>
            @page {
              size: 58mm auto;
              margin: 0;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 10px;
              width: 58mm;
              margin: 0;
              padding: 10px;
            }
            .header, .footer {
              text-align: center;
            }
            .items {
              margin: 10px 0;
            }
            .items li {
              display: flex;
              justify-content: space-between;
            }
            .total {
              font-weight: bold;
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Toko Kami</h2>
            <p>Terima kasih telah berbelanja!</p>
          </div>
          <ul class="items">
            ${items.map(item => `
              <li>
                <span>${item.name} (${item.quantity})</span>
                <span>Rp ${(item.price * item.quantity).toLocaleString()}</span>
              </li>`).join('')}
          </ul>
          <div class="total">
            <p>Total: Rp ${total.toLocaleString()}</p>
            <p>Metode Pembayaran: ${paymentMethod}</p>
          </div>
          <div class="footer">
            <p>Selamat datang kembali!</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Struk Pembelian</DialogTitle>
      <DialogContent>
        <Typography variant="h6" align="center">
          Toko Kami
        </Typography>
        <Typography variant="body2" align="center" gutterBottom>
          {new Date().toLocaleString()}
        </Typography>
        <Divider style={{ margin: '10px 0' }} />
        <List>
          {items.map((item, index) => (
            <ListItem key={index} style={{ padding: '8px 0' }}>
              <ListItemText
                primary={item.name}
                secondary={`Jumlah: ${item.quantity} x Rp ${item.price.toLocaleString()}`}
              />
              <Typography>Rp {(item.price * item.quantity).toLocaleString()}</Typography>
            </ListItem>
          ))}
        </List>
        <Divider style={{ margin: '10px 0' }} />
        <Typography variant="h6" align="right" gutterBottom>
          Total: Rp {total.toLocaleString()}
        </Typography>
        <Typography variant="body2" align="center">
          Metode Pembayaran: {paymentMethod}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={printReceipt} color="primary">
          Cetak
        </Button>
        <Button onClick={onClose} color="secondary">
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptDialog;
