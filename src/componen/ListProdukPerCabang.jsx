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
} from "@mui/material";
import axios from "axios";

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  const baseUrl = process.env.REACT_APP_URL.replace(/^https?:\/\/+/, "");
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) => axios.get(url).then((res) => res.data.data);

export const ListProdukPerCabang = () => {
  const { data: branchProducts, mutate: mutateBranchProducts } = useSWR(
    `${getApiBaseUrl()}/barangcabangadmin`,
    fetcher
  );
  const { data: branches } = useSWR(`${getApiBaseUrl()}/cabang`, fetcher);

  const [selectedBranch, setSelectedBranch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const handleDeleteProduct = async (baranguuid, cabanguuid) => {
    try {
      await axios.delete(`${getApiBaseUrl()}/deletebarangcabang`, {
        data: { baranguuid, cabanguuid },
      });
      mutateBranchProducts();
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
    }
  };

  const filteredProducts = branchProducts?.filter(
    (item) => item.Cabang?.uuid === selectedBranch
  );

  return (
    <Box padding={3}>
      <Typography variant="p" marginBottom={2}>
        Produk Berdasarkan Cabang
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Pilih Cabang</InputLabel>
        <Select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          {branches?.map((branch) => (
            <MenuItem key={branch.uuid} value={branch.uuid}>
              {branch.namacabang}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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

    </Box>
  );
};
