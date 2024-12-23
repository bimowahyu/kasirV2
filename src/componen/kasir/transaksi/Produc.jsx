// Main File: ProductGrid.jsx

import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Swal from 'sweetalert2';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import axios from 'axios';
import '../Header.css';

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [customerCash, setCustomerCash] = useState('');
  const [receiptData, setReceiptData] = useState({});
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          axios.get(`${getApiBaseUrl()}/barang`, { withCredentials: true }),
          axios.get(`${getApiBaseUrl()}/kategori`, { withCredentials: true })
        ]);

        setProducts(productResponse.data.data || []);
        setCategories(categoryResponse.data.data || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const addToOrder = (product) => {
    setOrders((prevOrders) => {
      const existingOrder = prevOrders.find((order) => order.id === product.uuid);
      if (existingOrder) {
        return prevOrders.map((order) =>
          order.id === product.uuid ? { ...order, quantity: order.quantity + 1 } : order
        );
      }
      return [...prevOrders, { id: product.uuid, name: product.namabarang, price: product.harga, quantity: 1 }];
    });
  };

  const handlePayment = async () => {
    const total = orders.reduce((sum, order) => sum + order.price * order.quantity, 0);

    if (!selectedPaymentMethod) {
      Swal.fire('Metode Pembayaran Tidak Dipilih', 'Pilih metode pembayaran terlebih dahulu', 'error');
      return;
    }

    if (selectedPaymentMethod === 'cash') {
      processCashPayment(total);
    } else if (selectedPaymentMethod === 'qris') {
      processQrisPayment(total);
    }
  };

  const processCashPayment = async (total) => {
    if (!customerCash || parseFloat(customerCash) < total) {
      Swal.fire('Uang tidak mencukupi', 'Masukkan jumlah yang benar', 'error');
      return;
    }

    const change = parseFloat(customerCash) - total;

    try {
      await axios.post(`${getApiBaseUrl()}/createtransaksi`, {
        pembayaran: 'cash',
        items: orders.map((order) => ({
          baranguuid: order.id,
          jumlahbarang: order.quantity
        }))
      }, { withCredentials: true });

      Swal.fire({
        title: 'Pembayaran Berhasil',
        html: `<p>Total: Rp ${total.toLocaleString()}</p><p>Dibayar: Rp ${parseFloat(customerCash).toLocaleString()}</p><p>Kembalian: Rp ${change.toLocaleString()}</p>`,
        icon: 'success'
      });

      setReceiptData({
        total,
        paymentMethod: 'Cash',
        items: orders
      });

      setPaymentDialogOpen(false);
      setReceiptDialogOpen(true);
      setOrders([]);
    } catch {
      Swal.fire('Terjadi Kesalahan', 'Gagal menyimpan transaksi', 'error');
    }
  };

  const processQrisPayment = async (total) => {
    try {
      const response = await axios.post(`${getApiBaseUrl()}/createtransaksi`, {
        pembayaran: 'qris',
        items: orders.map((order) => ({
          baranguuid: order.id,
          jumlahbarang: order.quantity
        }))
      }, { withCredentials: true });

      const { qris_data, transaksi } = response.data?.data || {};

      if (!qris_data || !transaksi) {
        Swal.fire('Terjadi Kesalahan', 'Data QRIS tidak tersedia', 'error');
        return;
      }

      Swal.fire({
        title: 'Scan QRIS',
        html: `
          <div style="text-align: center;">
            <p>Total: <strong>Rp ${total.toLocaleString()}</strong></p>
            <p>Order ID: ${transaksi.order_id}</p>
            <p>Silakan scan kode QR berikut:</p>
            <img src="${qris_data.generated_image_url}" alt="QRIS Code" style="max-width: 256px; height: auto;" />
          </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Tutup'
      });

      startPaymentStatusPolling(transaksi.order_id, () => {
        setReceiptData({
          total,
          paymentMethod: 'QRIS',
          items: orders
        });
        setReceiptDialogOpen(true);
        setOrders([]);
      });
    } catch {
      Swal.fire('Terjadi Kesalahan', 'Gagal memproses pembayaran QRIS', 'error');
    }
  };

  const startPaymentStatusPolling = (orderId, onSuccess) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/gettransaksinotification/${orderId}`);
        const status = response.data?.data?.transaksi?.status_pembayaran;

        if (status === 'settlement') {
          clearInterval(pollInterval);
          Swal.fire('Pembayaran Berhasil!', 'Terima kasih atas pembayaran Anda.', 'success');
          if (onSuccess) onSuccess();
        } else if (status === 'expire' || status === 'cancel') {
          clearInterval(pollInterval);
          Swal.fire('Pembayaran Gagal', 'Silakan coba lagi.', 'error');
        }
      } catch {
        clearInterval(pollInterval);
        Swal.fire('Terjadi Kesalahan', 'Gagal memantau status pembayaran', 'error');
      }
    }, 5000);

    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.Kategori.namakategori === selectedCategory;
    return matchesCategory;
  });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Gagal memuat data produk.</Alert>;

  return (
    <Box display="flex" flexDirection="column" gap="20px">
      <FormControl fullWidth>
        <InputLabel id="category-filter-label">Filter Kategori</InputLabel>
        <Select
          labelId="category-filter-label"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <MenuItem value="">Semua Kategori</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.uuid} value={category.namakategori}>
              {category.namakategori}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={2}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.uuid}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={`${getApiBaseUrl()}/uploads/${product.foto}`}
                alt={product.namabarang}
              />
              <CardContent>
                <Typography variant="h6">{product.namabarang}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Kategori: {product.Kategori.namakategori}
                </Typography>
                <Typography variant="body1" color="textPrimary">
                  Rp {product.harga.toLocaleString()}
                </Typography>
              </CardContent>
              <Button fullWidth variant="contained" color="primary" onClick={() => addToOrder(product)}>
                Tambah
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Button variant="contained" color="secondary" onClick={() => setPaymentDialogOpen(true)}>
        Bayar
      </Button>

      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel id="payment-method-label">Metode Pembayaran</InputLabel>
            <Select
              labelId="payment-method-label"
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="qris">QRIS</MenuItem>
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
          <Button onClick={() => setPaymentDialogOpen(false)} color="secondary">Batal</Button>
          <Button onClick={handlePayment} color="primary">Lanjutkan</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={receiptDialogOpen} onClose={() => setReceiptDialogOpen(false)}>
        <DialogTitle>Struk Pembelian</DialogTitle>
        <DialogContent>
          <List>
            {receiptData.items?.map((item) => (
              <ListItem key={item.id}>
                <ListItemText
                  primary={item.name}
                  secondary={`Jumlah: ${item.quantity} x Rp ${item.price.toLocaleString()}`}
                />
                <Typography>Rp {(item.quantity * item.price).toLocaleString()}</Typography>
              </ListItem>
            ))}
          </List>
          <Divider />
          <Typography variant="h6" align="right">Total: Rp {receiptData.total?.toLocaleString()}</Typography>
          <Typography align="center">Metode Pembayaran: {receiptData.paymentMethod}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialogOpen(false)} color="primary">Tutup</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductGrid;
