import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import QRCode from "qrcode";
import './Header.css'
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
  List, 
  ListItem, 
  ListItemText, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  IconButton,
  InputBase,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import Swal from "sweetalert2";
import { useSelector } from 'react-redux';

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  const baseUrl = process.env.REACT_APP_URL.replace(/^https?:\/\//, "");
  return `${protocol}://${baseUrl}`;
};

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [customerCash, setCustomerCash] = useState("");
  const [receiptData, setReceiptData] = useState([]);
  const [branchName, setBranchName] = useState("Nama Toko");
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          axios.get(`${getApiBaseUrl()}/barang`, { withCredentials: true }),
          axios.get(`${getApiBaseUrl()}/kategori`, { withCredentials: true })
        ]);
        setProducts(productResponse.data.data || []);
        setCategories(categoryResponse.data.data || []);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);
  useEffect(() => {
    const fetchBranchName = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/cabang`, { withCredentials: true });
        setBranchName(response.data.branchName || "Nama Toko Tidak Diketahui");
      } catch (err) {
        console.error("Gagal mendapatkan nama cabang:", err);
      }
    };
  
    fetchBranchName();
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

  const removeOrder = (id) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
  };

  const handlePayment = async () => {
    const total = orders.reduce((sum, order) => sum + order.price * order.quantity, 0);
  
    if (!selectedPaymentMethod) {
      Swal.fire("Metode Pembayaran Tidak Dipilih", "Pilih metode pembayaran terlebih dahulu", "error");
      return;
    }
  
    if (selectedPaymentMethod === "cash") {
      await processCashPayment(total);
    } else if (selectedPaymentMethod === "qris") {
      await processQrisPayment(total);
    }
  };
  const printReceipt = () => {
    if (!receiptData || !Array.isArray(receiptData.items) || receiptData.items.length === 0) {
      Swal.fire("Tidak ada data untuk dicetak", "", "error");
      return;
    }
  
    const total = receiptData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  
    const receiptContent = `
      <html>
        <head>
          <title>Struk Pembelian</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            h2, h3 { text-align: center; margin: 0; }
            ul { list-style: none; padding: 0; margin: 10px 0; }
            li { margin-bottom: 5px; }
            hr { border: 1px solid #ccc; }
            .total { text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>${branchName}</h2>
          <p style="text-align: center;">${formatDate(new Date())}</p>
          <hr />
          <ul>
            ${receiptData.items
              .map(
                (order) =>
                  `<li>${order.name} x${order.quantity} - Rp ${(order.price * order.quantity).toLocaleString()}</li>`
              )
              .join("")}
          </ul>
          <hr />
          <h3 class="total">Total: Rp ${total.toLocaleString()}</h3>
        </body>
      </html>
    `;
  
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.top = "-10000px";
    document.body.appendChild(iframe);
  
    const iframeDoc = iframe.contentWindow || iframe.contentDocument;
    iframeDoc.document.open();
    iframeDoc.document.write(receiptContent);
    iframeDoc.document.close();
  
    setTimeout(() => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 500);
  };
  

  
  // **Proses Pembayaran Tunai**
  const processCashPayment = async (total) => {
    if (!customerCash || parseFloat(customerCash) < total) {
      Swal.fire("Uang tidak mencukupi", "Silakan masukkan jumlah yang benar", "error");
      return;
    }
  
    const change = parseFloat(customerCash) - total;
  
    try {
      await axios.post(`${getApiBaseUrl()}/createtransaksi`, {
        pembayaran: "cash",
        items: orders.map((order) => ({
          baranguuid: order.id,
          jumlahbarang: order.quantity,
        })),
        
      },{withCredentials :true});
      
  
      Swal.fire({
        title: "Pembayaran Berhasil",
        html: `<p>Total: Rp ${total.toLocaleString()}</p><p>Dibayar: Rp ${parseFloat(customerCash).toLocaleString()}</p><p>Kembalian: Rp ${change.toLocaleString()}</p>`,
        icon: "success",
      });
  
      setReceiptData({
        total,
        paymentMethod: "Cash",
        items: orders.map((order) => ({
          id: order.id,
          name: order.name,
          quantity: order.quantity,
          price: order.price,
        })),
      });
      console.log(change)
      setPaymentDialogOpen(false); 
      setReceiptDialogOpen(true); 
      setOrders([]); 
    } catch (error) {
      console.error("Error processing cash payment:", error);
      Swal.fire("Terjadi kesalahan", "Gagal menyimpan transaksi", "error");
    }
  };
  const renderQRCode = (qrString) => {
    return `<div id="qrcode-container" style="background: white; padding: 16px; border-radius: 8px; display: inline-block;"></div>`;
  };
  const processQrisPayment = async (total) => {
    try {
      const response = await axios.post(`${getApiBaseUrl()}/createtransaksi`, {
        pembayaran: "qris",
        items: orders.map((order) => ({
          baranguuid: order.id,
          jumlahbarang: order.quantity,
        })),
      },{withCredentials: true});
  
      const { qris_data, transaksi } = response.data?.data || {};
      const qrString = qris_data?.qr_string;
      const orderId = transaksi?.order_id;
      const generatedImageUrl = qris_data?.generated_image_url;
  
      if (!qrString || !orderId) {
        Swal.fire("Terjadi kesalahan", "Data QRIS tidak tersedia", "error");
        return;
      }
      setPaymentDialogOpen(false);
      Swal.fire({
        title: "Scan QRIS",
        html: `
          <div class="text-center">
            <p style="font-size: 16px; margin: 10px 0;">
              <strong>Total Pembayaran:</strong> Rp ${total.toLocaleString()}
            </p>
            <p style="font-size: 14px; color: #666; margin: 10px 0;">
              Order ID: ${orderId}
            </p>
            <p style="font-size: 14px; color: #444;">
              Silakan scan kode QR menggunakan aplikasi e-wallet Anda.
            </p>
            <img src="${generatedImageUrl}" alt="QRIS Code" style="max-width: 256px; height: auto;"/>
          </div>
        `,
        showConfirmButton: true,
        confirmButtonText: "Tutup",
        width: 600,
        showCloseButton: true,
      });
      startPaymentStatusPolling(orderId, () => {
        setReceiptData({
          total,
          paymentMethod: "Cash",
          items: orders.map((order) => ({
            id: order.id,
            name: order.name,
            quantity: order.quantity,
            price: order.price,
          })),
        });
        setReceiptDialogOpen(true);
        setOrders([]); 
      });
    } catch (error) {
      console.error("Error processing QRIS payment:", error);
      Swal.fire("Terjadi kesalahan", "Gagal memproses pembayaran QRIS", "error");
    }
  };
 
 

  // **Render QR Code**

  
  // **Polling Status Pembayaran**
  const startPaymentStatusPolling = (orderId, onSuccess) => {
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await axios.get(`${getApiBaseUrl()}/gettransaksinotification/${orderId}`);
        const status = statusResponse.data?.data?.transaksi?.status_pembayaran;
  
        if (status === "settlement") {
          clearInterval(pollInterval);
          Swal.fire({
            title: "Pembayaran Berhasil!",
            text: "Terima kasih atas pembayaran Anda.",
            icon: "success",
          });
          if (onSuccess) onSuccess(); // Callback untuk aksi tambahan
        } else if (status === "expire" || status === "cancel") {
          clearInterval(pollInterval);
          Swal.fire({
            title: "Pembayaran Gagal",
            text: "Silakan coba lagi.",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 5000); // Poll setiap 5 detik
  
    // Hentikan polling setelah 5 menit
    setTimeout(() => clearInterval(pollInterval), 300000);
  };
  const ReceiptDialog = () => {
    const items = Array.isArray(receiptData?.items) ? receiptData.items : [];
  
    return (
      <Dialog open={receiptDialogOpen} onClose={() => setReceiptDialogOpen(false)}>
        <DialogTitle>Struk Pembelian</DialogTitle>
        <DialogContent>
          <div id="receipt-preview" style={{ minWidth: "300px" }}>
          <Typography variant="h6" align="center">{user?.cabang?.namacabang || "Cabang Tidak Diketahui"}</Typography>

            <Typography variant="body2" align="center" gutterBottom>
              {formatDate(new Date())}
            </Typography>
            <Divider style={{ margin: "10px 0" }} />
            <List>
              {items.map((order) => (
                <ListItem key={order.id} style={{ padding: "4px 0" }}>
                  <ListItemText
                    primary={order.name}
                    secondary={`${order.quantity} x Rp ${order.price.toLocaleString()}`}
                  />
                  <Typography>Rp {(order.price * order.quantity).toLocaleString()}</Typography>
                </ListItem>
              ))}
            </List>
            <Divider style={{ margin: "10px 0" }} />
            <Typography variant="h6" align="right" gutterBottom>
              Total: Rp {items.reduce((sum, order) => sum + order.price * order.quantity, 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" align="center">
              Metode Pembayaran: {receiptData?.paymentMethod || "Tidak diketahui"}
            </Typography>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={printReceipt} color="primary">
            Cetak
          </Button>
          <Button onClick={() => setReceiptDialogOpen(false)} color="secondary">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !selectedCategory || product.Kategori.namakategori === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      product.namabarang.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Gagal memuat data produk.</Alert>;
  const incrementOrder = (id) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, quantity: order.quantity + 1 } : order
      )
    );
  };
  
  const decrementOrder = (id) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id && order.quantity > 1
          ? { ...order, quantity: order.quantity - 1 }
          : order
      )
    );
  };
  
  return (
<div
  style={{
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  }}
>
{/* Bagian Produk */}
<div
  style={{
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflowY: 'auto',
    maxHeight: '100vh',
  }}
>

  {/* Filter Kategori */}
  <FormControl fullWidth>
    <InputLabel id="category-filter-label">Filter Kategori</InputLabel>
    <Select
      labelId="category-filter-label"
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      fullWidth
    >
      <MenuItem value="">Semua Kategori</MenuItem>
      {categories.map((category) => (
        <MenuItem key={category.uuid} value={category.namakategori}>
          {category.namakategori}
        </MenuItem>
      ))}
    </Select>
    <Box sx={{ position: 'relative'}}>
          {showSearch ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f1f1f1',
               
                
              }}
            >
              <InputBase
                placeholder="Cari produk"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flex: 1 }}
              />
              <IconButton onClick={() => setShowSearch(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          ) : (
            <IconButton
              onClick={() => setShowSearch(true)}
              sx={{
                backgroundColor: '#f1f1f1',
              
               
              }}
            >
              <SearchIcon />
            </IconButton>
          )}
        </Box>
  </FormControl>

  {/* Grid Produk */}
  <Grid container spacing={2}>
    {filteredProducts.map((product) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={product.uuid}>
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%', // Tinggi konsisten untuk semua card
            boxShadow: 3, // Tambahkan bayangan
          }}
        >
          <CardMedia
            component="img"
            image={`${getApiBaseUrl()}/uploads/${product.foto}`}
            alt={product.namabarang}
            height="140"
            sx={{ objectFit: 'cover' }} // Pastikan gambar rapi dan tidak terdistorsi
          />
          <CardContent sx={{ flexGrow: 1, overflow: "hidden" }}>
            <Typography
              variant="h6"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {product.namabarang}
            </Typography>
            <Typography color="textSecondary">
              Rp {product.harga.toLocaleString()}
            </Typography>
            <Typography color="textSecondary">
              Kategori: {product.Kategori.namakategori}
            </Typography>
          </CardContent>
          <Box sx={{ padding: "8px" }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => addToOrder(product)}
            >
              Tambah
            </Button>
          </Box>
        </Card>
      </Grid>
    ))}
  </Grid>
</div>

{/* Bagian Transaksi */}
<div className="transaction-container">
  {/* Judul Daftar Pesanan */}
  <Typography variant="h6" gutterBottom>
    Daftar Pesanan
  </Typography>

  {/* List Pesanan */}
  <List>
    {orders.map((order) => (
      <ListItem
        key={order.id}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" }, // Kolom di mobile
          textAlign: { xs: "center", sm: "left" }, // Tengah di mobile
          gap: 1, // Spasi antar elemen
          padding: "8px 0", // Padding vertikal
        }}
      >
        {/* Nama Barang dan Harga */}
        <Box
          sx={{
            flexGrow: 1, // Memanfaatkan ruang yang tersedia
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap", // Nama barang tidak multi-baris
            minWidth: "0", // Mencegah overflow
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {order.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Rp {(order.price * order.quantity).toLocaleString()}
          </Typography>
        </Box>

        {/* Tombol Kuantitas */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0, // Tombol tidak mengecil
            gap: 1, // Spasi antar tombol
            marginTop: { xs: 1, sm: 0 }, // Spasi tambahan di mobile
          }}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={() => decrementOrder(order.id)}
          >
            -
          </Button>
          <Typography>{order.quantity}</Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => incrementOrder(order.id)}
          >
            +
          </Button>
        </Box>

        {/* Tombol Hapus */}
        <Button
          color="error"
          onClick={() => removeOrder(order.id)}
          sx={{
            marginTop: { xs: 1, sm: 0 }, // Spasi di mobile
            flexShrink: 0,
          }}
        >
          Hapus
        </Button>
      </ListItem>
    ))}
  </List>

  {/* Total dan Tombol Bayar */}
  <Typography
    variant="h6"
    className="total-amount"
    sx={{
      textAlign: "right",
      marginTop: 2,
    }}
  >
    Total: Rp{" "}
    {orders
      .reduce((sum, order) => sum + order.price * order.quantity, 0)
      .toLocaleString()}
  </Typography>
  <Button
    variant="contained"
    color="secondary"
    onClick={() => setPaymentDialogOpen(true)}
    fullWidth
    sx={{ marginTop: 2 }}
  >
    Bayar
  </Button>
</div>


{/* Dialog Pembayaran */}
<ReceiptDialog />
<Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
  <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
  <DialogContent>
    <FormControl fullWidth>
      <InputLabel id="payment-method-label">Metode Pembayaran</InputLabel>
      <Select
        labelId="payment-method-label"
        value={selectedPaymentMethod}
        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
        fullWidth
      >
        <MenuItem value="qris">QRIS</MenuItem>
        <MenuItem value="cash">Cash</MenuItem>
      </Select>
    </FormControl>
    {selectedPaymentMethod === "cash" && (
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
    <Button onClick={() => setPaymentDialogOpen(false)} color="secondary">
      Batal
    </Button>
    <Button onClick={handlePayment} color="primary">
      Lanjutkan
    </Button>
  </DialogActions>
</Dialog>


  {/* Responsif untuk Mobile */}
  <style>
    {`
      @media (max-width: 768px) {
        div {
          flex-direction: column;
        }
      }
    `}
  </style>
</div>
  );
};

export default ProductGrid;
