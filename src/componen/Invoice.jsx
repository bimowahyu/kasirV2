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
    let prevCabang = null;
  
    Object.entries(detailPenjualan).forEach(([cabang, dataCabang]) => {
      // Add empty row between branches (except for first branch)
      if (prevCabang !== null) {
        rows.push({
          Cabang: '',
          Barang: '',
          Kategori: '',
          "Harga Satuan": '',
          "Total Terjual": '',
          "Total Penjualan": ''
        });
        
        // Add total row for previous branch
        rows.push({
          Cabang: `Total ${prevCabang}`,
          Barang: '',
          Kategori: '',
          "Harga Satuan": '',
          "Total Terjual": getTotalTerjual(detailPenjualan[prevCabang]),
          "Total Penjualan": getTotalPenjualan(detailPenjualan[prevCabang])
        });
        
        // Add another empty row for better spacing
        rows.push({
          Cabang: '',
          Barang: '',
          Kategori: '',
          "Harga Satuan": '',
          "Total Terjual": '',
          "Total Penjualan": ''
        });
      }
  
      // Add branch header
      rows.push({
        Cabang: `Cabang: ${cabang}`,
        Barang: '',
        Kategori: '',
        "Harga Satuan": '',
        "Total Terjual": '',
        "Total Penjualan": ''
      });
  
      // Add items for current branch
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
  
      prevCabang = cabang;
    });
  
    // Add total for the last branch
    if (prevCabang !== null) {
      rows.push({
        Cabang: '',
        Barang: '',
        Kategori: '',
        "Harga Satuan": '',
        "Total Terjual": '',
        "Total Penjualan": ''
      });
      
      rows.push({
        Cabang: `Total ${prevCabang}`,
        Barang: '',
        Kategori: '',
        "Harga Satuan": '',
        "Total Terjual": getTotalTerjual(detailPenjualan[prevCabang]),
        "Total Penjualan": getTotalPenjualan(detailPenjualan[prevCabang])
      });
    }
  
    // Add grand total at the end
    rows.push({
      Cabang: '',
      Barang: '',
      Kategori: '',
      "Harga Satuan": '',
      "Total Terjual": '',
      "Total Penjualan": ''
    });
    
    rows.push({
      Cabang: 'GRAND TOTAL',
      Barang: '',
      Kategori: '',
      "Harga Satuan": '',
      "Total Terjual": getGrandTotalTerjual(detailPenjualan),
      "Total Penjualan": getGrandTotalPenjualan(detailPenjualan)
    });
  
    // Helper functions for calculating totals
    function getTotalTerjual(dataCabang) {
      return Object.values(dataCabang.barang).reduce((total, barang) => total + barang.totalTerjual, 0);
    }
  
    function getTotalPenjualan(dataCabang) {
      return Object.values(dataCabang.barang).reduce((total, barang) => total + barang.totalPenjualan, 0);
    }
  
    function getGrandTotalTerjual(data) {
      return Object.values(data).reduce((total, cabang) => total + getTotalTerjual(cabang), 0);
    }
  
    function getGrandTotalPenjualan(data) {
      return Object.values(data).reduce((total, cabang) => total + getTotalPenjualan(cabang), 0);
    }
  
    // Create and style the worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    
    // Add some style to the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Style configuration
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "CCCCCC" } }
    };
    
    // Apply styles (Note: Basic XLSX doesn't support much styling, 
    // you might need xlsx-style package for more styling options)
    for (let C = range.s.c; C <= range.e.c; C++) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[address]) worksheet[address] = {};
      worksheet[address].s = headerStyle;
    }
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");
    XLSX.writeFile(workbook, `Laporan_Penjualan_${selectedMonth}.xlsx`);
  };
  const exportCabangToExcel = async () => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/export-laporan?month=${selectedMonth}`, {
        withCredentials: true,
        responseType: 'blob'
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Penjualan_${selectedMonth}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
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
        {/* <Box p={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={exportCabangToExcel}>
          Export Cabang ke Excel
        </Button>
      </Box> */}
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
