import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Card,
  TableContainer,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from "@mui/material";
import { format } from "date-fns";

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  const baseUrl = process.env.REACT_APP_URL.replace(/^https?:\/\/+/, "");
  return `${protocol}://${baseUrl}`;
};

const GetJurnal = () => {
  const [balanceData, setBalanceData] = useState(null);
  const [journalData, setJournalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionType, setTransactionType] = useState("");
  const apiBaseUrl = getApiBaseUrl();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const fetchJournalData = async (month, year) => {
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-${new Date(year, parseInt(month), 0).getDate()}`;
    let url = `${apiBaseUrl}/getjurnal?start_date=${startDate}&end_date=${endDate}`;

    if (transactionType) {
      url += `&jenis_transaksi=${transactionType}`;
    }

    const response = await axios.get(url);
    return response.data.data;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
        const currentYear = now.getFullYear();

        const balanceResponse = await axios.get(
          `${apiBaseUrl}/getsaldodandebit?bulan=${currentMonth}&tahun=${currentYear}`
        );

        const journalData = await fetchJournalData(currentMonth, currentYear);

        setBalanceData(balanceResponse.data);
        setJournalData(journalData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [apiBaseUrl, transactionType]);

  const handleTransactionTypeChange = (event) => {
    setTransactionType(event.target.value);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Journal Entries Report", 14, 10);
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), "dd MMM yyyy")}`, 14, 18);

    const tableColumn = ["Date", "Transaction Type", "Item Name", "Quantity", "Unit Price", "Total Price", "Description"];
    const tableRows = [];

    journalData.forEach((entry) => {
      const rowData = [
        format(new Date(entry.createdAt), "dd MMM yyyy"),
        entry.jenis_transaksi,
        entry.Barang?.namabarang || "Null",
        entry.jumlah,
        formatCurrency(parseFloat(entry.harga_satuan)),
        formatCurrency(parseFloat(entry.total_harga)),
        entry.deskripsi || "-",
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: "grid",
    });

    doc.save(`Journal_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Financial Summary
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, bgcolor: "#e3f2fd" }}>
            <Typography variant="subtitle2">Total Income</Typography>
            <Typography variant="h6">{formatCurrency(parseFloat(balanceData?.total_pemasukan || 0))}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, bgcolor: "#fbe9e7" }}>
            <Typography variant="subtitle2">Total Expenses</Typography>
            <Typography variant="h6">{formatCurrency(parseFloat(balanceData?.total_pengeluaran || 0))}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, bgcolor: "#f3e5f5" }}>
            <Typography variant="subtitle2">Running Balance</Typography>
            <Typography variant="h6">{formatCurrency(parseFloat(balanceData?.saldo_berjalan || 0))}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, bgcolor: "#e8f5e9" }}>
            <Typography variant="subtitle2">Final Balance</Typography>
            <Typography variant="h6">{formatCurrency(parseFloat(balanceData?.saldo_akhir || 0))}</Typography>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h5">Journal Entries</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
          <Select labelId="transaction-type-label" value={transactionType} label="Transaction Type" onChange={handleTransactionTypeChange}>
            <MenuItem value="">All Transactions</MenuItem>
            <MenuItem value="pembelian">Pembelian</MenuItem>
            <MenuItem value="penjualan">Penjualan</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={downloadPDF}>
          Download PDF
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell>Date</TableCell>
              <TableCell>Transaction Type</TableCell>
              <TableCell>Branch Name</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {journalData.map((entry) => (
              <TableRow key={entry.uuid}>
                <TableCell>{format(new Date(entry.createdAt), "dd MMM yyyy")}</TableCell>
                <TableCell>{entry.jenis_transaksi}</TableCell>
                <TableCell>{entry.Cabang?.namacabang || 'Tidak tersedia'}</TableCell>
                <TableCell>{entry.Barang?.namabarang ||'Tidak tersedia'}</TableCell>
                <TableCell>{entry.jumlah}</TableCell>
                <TableCell>{formatCurrency(parseFloat(entry.harga_satuan))}</TableCell>
                <TableCell>{formatCurrency(parseFloat(entry.total_harga))}</TableCell>
                <TableCell>{entry.deskripsi || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GetJurnal;
