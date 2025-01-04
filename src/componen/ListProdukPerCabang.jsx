import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  const baseUrl = process.env.REACT_APP_URL.replace(/^https?:\/\/+/, "");
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) => axios.get(url, { withCredentials: true }).then((res) => res.data.data);

export const ListProdukPerCabang = () => {
  // Get auth state from Redux
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const { data: branchProducts, mutate: mutateBranchProducts } = useSWR(
    `${getApiBaseUrl()}/barangcabangbyrole`,
    fetcher
  );
  const { data: branches } = useSWR(`${getApiBaseUrl()}/cabangbyrole`, fetcher);

  const [selectedBranch, setSelectedBranch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Set default selected branch for admin
  useEffect(() => {
    if (user?.role === 'admin' && branches?.length === 1) {
      setSelectedBranch(branches[0].uuid);
    }
  }, [user, branches]);

  const handleDeleteProduct = async (baranguuid, cabanguuid) => {
    try {
      await axios.delete(
        `${getApiBaseUrl()}/deletebarangcabang/${baranguuid}`,
        {
          data: { baranguuid },
          withCredentials: true
        }
      );
      setSuccess("Produk berhasil dihapus!");
      mutateBranchProducts();
    } catch (error) {
      setError(error.response?.data?.message || "Gagal menghapus produk.");
    }
  };

  const filteredProducts = branchProducts?.filter(
    (item) => !selectedBranch || item.Cabang?.uuid === selectedBranch
  );

  if (!isAuthenticated) {
    return <div>Silakan login terlebih dahulu</div>;
  }

  return (
    <Box padding={3}>
      <Typography variant="h6" marginBottom={2}>
        Produk Berdasarkan Cabang
      </Typography>
      
      {/* Only show branch selector for superadmin */}
      {user?.role === 'superadmin' && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Pilih Cabang</InputLabel>
          <Select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <MenuItem value="">Semua Cabang</MenuItem>
            {branches?.map((branch) => (
              <MenuItem key={branch.uuid} value={branch.uuid}>
                {branch.namacabang}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Card>
        <Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nama Barang</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Harga</TableCell>
                <TableCell>Cabang</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts?.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.baranguuid}>
                    <TableCell>{product.Barang.namabarang}</TableCell>
                    <TableCell>{product.Barang.Kategori.namakategori}</TableCell>
                    <TableCell>{product.Barang.harga}</TableCell>
                    <TableCell>{product.Cabang.namacabang}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() =>
                          handleDeleteProduct(product.baranguuid, product.cabanguuid)
                        }
                      >
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Tidak ada produk untuk cabang ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Card>

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
    </Box>
  );
};