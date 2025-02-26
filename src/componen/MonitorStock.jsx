import React from "react";
import useSWR from "swr";
import { useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TableContainer,
  Paper,
} from "@mui/material";
import axios from "axios";

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  const baseUrl = process.env.REACT_APP_URL.replace(/^https?:\/\//, "");
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) =>
  axios.get(url, { withCredentials: true }).then((res) => res.data);

export const MonitorStock = () => {
  const { user } = useSelector((state) => state.auth);
  const apiUrl = `${getApiBaseUrl()}/cekstock`;

  const { data, error, isLoading } = useSWR(apiUrl, fetcher);

  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Gagal mengambil data.</Typography>;

  const barangData = data?.data || [];

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Typography variant="h6">Monitor Stok Barang Hampir Habis</Typography>

          {/* Scroll Table */}
          <TableContainer component={Paper} sx={{ mt: 2, overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Nama Barang</strong></TableCell>
                  <TableCell><strong>Nama Cabang</strong></TableCell>
                  <TableCell><strong>Stok</strong></TableCell>
                  <TableCell><strong>Kategori</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {barangData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography>Tidak ada data barang.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  barangData.map((item) => (
                    <TableRow
                      key={item.uuid}
                      sx={{
                        backgroundColor: item.stok < 5 ? "#ffebee" : "inherit",
                      }}
                    >
                      <TableCell>{item.Barang.namabarang}</TableCell>
                      <TableCell>{item.Cabang.namacabang}</TableCell>
                      <TableCell>
                        <Typography
                          color={item.stok < 5 ? "error" : "inherit"}
                        >
                          {item.stok}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.Barang.Kategori.namakategori}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MonitorStock;
