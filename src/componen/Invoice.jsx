import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Button
} from '@mui/material';
import dayjs from 'dayjs';
import useSWR from 'swr';
import axios from 'axios';
import * as XLSX from 'xlsx';

const fetcher = (url) => axios.get(url, { withCredentials: true }).then((res) => res.data);

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

export const Invoice = () => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));

  const apiUrl = `${getApiBaseUrl()}/laporan?month=${selectedMonth}`;
  const { data, error } = useSWR(apiUrl, fetcher);

  if (error) return <div>Error loading data.</div>;
  if (!data) return <CircularProgress />;

  const detailPenjualan = data?.data?.detailPenjualan || {};

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const exportToExcel = () => {
    const rows = [];
    Object.entries(detailPenjualan).forEach(([cabang, dataCabang]) => {
      Object.entries(dataCabang.barang).forEach(([namaBarang, barangData]) => {
        rows.push({
          Cabang: cabang,
          Barang: namaBarang,
          Kategori: barangData.kategori,
          "Harga Satuan": barangData.hargaSatuan,
          "Total Terjual": barangData.totalTerjual,
          "Total Penjualan": barangData.totalPenjualan
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");
    XLSX.writeFile(workbook, `Laporan_Penjualan_${selectedMonth}.xlsx`);
  };

  return (
    <Box>
      <Card>
        <CardHeader title="Laporan Penjualan per Cabang" />
        <Box p={2}>
          <TextField
            label="Pilih Bulan"
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            fullWidth
          />
        </Box>
        <Box p={2} display="flex" justifyContent="flex-end">
          <Button variant="contained" color="primary" onClick={exportToExcel}>
            Export to Excel
          </Button>
        </Box>

        {Object.keys(detailPenjualan).length > 0 ? (
          Object.entries(detailPenjualan).map(([cabang, dataCabang]) => (
            <Box key={cabang} mb={4}>
              <Typography variant="h6" sx={{ p: 2 }}>
                Cabang: {cabang}
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Barang</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell>Harga Satuan</TableCell>
                    <TableCell>Total Terjual</TableCell>
                    <TableCell>Total Penjualan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(dataCabang.barang || {}).map(([namaBarang, barangData]) => (
                    <TableRow key={namaBarang}>
                      <TableCell>{namaBarang}</TableCell>
                      <TableCell>{barangData.kategori}</TableCell>
                      <TableCell>{barangData.hargaSatuan}</TableCell>
                      <TableCell>{barangData.totalTerjual}</TableCell>
                      <TableCell>{barangData.totalPenjualan}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ))
        ) : (
          <Box p={2} textAlign="center">
            <p>Data tidak ditemukan untuk bulan yang dipilih.</p>
          </Box>
        )}
      </Card>
    </Box>
  );
};
