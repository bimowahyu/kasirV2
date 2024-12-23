import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Select, MenuItem, TextField, Button } from '@mui/material';

const PaymentDialog = ({
  open,
  onClose,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  customerCash,
  setCustomerCash,
  handlePayment,
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
    <DialogContent>
      <FormControl fullWidth>
        <Select
          value={selectedPaymentMethod}
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
        >
          <MenuItem value="qris">QRIS</MenuItem>
          <MenuItem value="cash">Cash</MenuItem>
        </Select>
      </FormControl>
      {selectedPaymentMethod === 'cash' && (
        <TextField
          fullWidth
          margin="normal"
          label="Uang Customer"
          type="number"
          value={customerCash}
          onChange={(e) => setCustomerCash(e.target.value)}
        />
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Batal</Button>
      <Button onClick={handlePayment}>Lanjutkan</Button>
    </DialogActions>
  </Dialog>
);

export default PaymentDialog;
