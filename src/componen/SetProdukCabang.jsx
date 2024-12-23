import React, { useState } from "react";
import useSWR from "swr";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Card,
  Button,
  Modal,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import { ListProdukPerCabang } from "./ListProdukPerCabang";

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  const baseUrl = process.env.REACT_APP_URL.replace(/^https?:\/\/+/, "");
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) => axios.get(url).then((res) => res.data.data);

export const SetProdukCabang = () => {
  const { data: branchProducts, mutate: mutateBranchProducts } = useSWR(
    `${getApiBaseUrl()}/barangcabangadmin`,
    fetcher
  );
  const { data: branches } = useSWR(`${getApiBaseUrl()}/cabang`, fetcher);
  const { data: products } = useSWR(`${getApiBaseUrl()}/barang`, fetcher);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddProduct = async () => {
    try {
      await axios.post(`${getApiBaseUrl()}/createbarangcabang`, {
        baranguuid: selectedProduct,
        cabanguuid: selectedBranch,
      });
      setSuccess("Produk berhasil ditambahkan ke cabang!");
      mutateBranchProducts();
      setModalOpen(false);
      setSelectedProduct("");
      setSelectedBranch("");
    } catch (error) {
      setError(error.response?.data?.message || "Gagal menambah produk.");
    }
  };

  const handleDeleteProduct = async (baranguuid, cabanguuid) => {
    try {
      await axios.delete(`${getApiBaseUrl()}/deletebarangcabang`, {
        data: { baranguuid, cabanguuid },
      });
      setSuccess("Produk berhasil dihapus dari cabang!");
      mutateBranchProducts();
    } catch (error) {
      setError(error.response?.data?.message || "Gagal menghapus produk.");
    }
  };
  return (
    <Box padding={{ xs: 2, sm: 3 }}>
      <Typography 
        variant="h4" 
        marginBottom={2}
        fontSize={{ xs: '1rem', sm: '1.125rem' }}
      >
        Kelola Produk Per Cabang
      </Typography>
      
      <Card>
        <Box padding={2} display="flex" justifyContent="space-between">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setModalOpen(true)}
            fullWidth={false}
          >
            Tambah Produk ke Cabang
          </Button>
        </Box>
      </Card>

      <Modal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: '95%', sm: '400px' },
            maxHeight: { xs: '80vh', sm: '90vh' },
            overflow: 'auto',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
            margin: { xs: '16px', sm: 'auto' },
            '&:focus': {
              outline: 'none'
            }
          }}
        >
          <Typography 
            variant="h6" 
            marginBottom={2}
            fontSize={{ xs: '1.1rem', sm: '1.25rem' }}
          >
            Tambah Produk ke Cabang
          </Typography>

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Barang</InputLabel>
            <Select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: '40vh'
                  }
                }
              }}
            >
              {products?.map((product) => (
                <MenuItem key={product.uuid} value={product.uuid}>
                  {product.namabarang}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Cabang</InputLabel>
            <Select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: '40vh'
                  }
                }
              }}
            >
              {branches?.map((branch) => (
                <MenuItem key={branch.uuid} value={branch.uuid}>
                  {branch.namacabang}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box 
            marginTop={3} 
            display="flex" 
            justifyContent="space-between"
            gap={2}
          >
            <Button
              variant="outlined"
              onClick={() => setModalOpen(false)}
              fullWidth
            >
              Batal
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddProduct}
              disabled={!selectedProduct || !selectedBranch}
              fullWidth
            >
              Simpan
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>

      <ListProdukPerCabang />
    </Box>
  );
};