import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import '../componen/css/Dashboard.css';
import axios from 'axios';
import useSWR from 'swr';

ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, Tooltip, Legend);

// Fungsi untuk mendapatkan URL API
const getApiBaseUrl = () => {
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  const baseUrl = process.env.REACT_APP_URL.replace(/^https?:\/\//, "");
  return `${protocol}://${baseUrl}`;
};

// Fetcher untuk SWR
const fetcher = (url) => axios.get(url, { withCredentials: true }).then((res) => res.data);

export const Dashboard = () => {
  // State
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [totalPenjualanSuccess, setTotalPenjualanSuccess] = useState(0);
  const [totalCabang, setTotalCabang] = useState(0);
  const [totalTransaksi, setTotalTransaksi] = useState(0);

  // Fetch data transaksi menggunakan SWR
  const { data, error, req } = useSWR(`${getApiBaseUrl()}/gettransaksi`, fetcher);

  useEffect(() => {
    if (data && Array.isArray(data.transaksi)) {
      const filteredData =
        req?.user?.role === "admin"
          ? data.transaksi.filter((trans) => trans.User.Cabang.uuid === req.user.cabanguuid)
          : data.transaksi;

      processTransactionData(filteredData);
      setTotalPenjualanSuccess(data.totalPenjualanSuccess || 0);
      setTotalTransaksi(data.totalTransaksi || 0);
    }
  }, [data]);

  useEffect(() => {
    fetchCabangData();
    fetchLaporanDetail();
  }, []);

  const fetchCabangData = async () => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/cabang`);
      if (response.status === 200) {
        setTotalCabang(response.data.totalcabang || 0);
      } else {
        console.error("Invalid API response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching cabang data:", error);
    }
  };

  const fetchLaporanDetail = async () => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/laporandetail`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        const { totalPenjualanSuccess, monthlyData } = response.data;
        setTotalPenjualanSuccess(totalPenjualanSuccess || 0);
        processChartData(monthlyData);
      } else {
        console.error("Invalid API response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching laporan detail:", error);
    }
  };

  const processTransactionData = (transaksiData) => {
    const monthlySales = {};
    transaksiData.forEach((transaksi) => {
      const month = new Date(transaksi.tanggal).toLocaleString("en-US", {
        month: "short",
      });
      if (!monthlySales[month]) {
        monthlySales[month] = 0;
      }
      monthlySales[month] += parseFloat(transaksi.totaljual || 0);
    });
    setChartData((prev) => ({
      ...prev,
      labels: Object.keys(monthlySales),
      datasets: [
        {
          label: "Total Sales",
          backgroundColor: "rgba(63, 81, 181, 0.6)",
          borderColor: "#3f51b5",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(63, 81, 181, 0.8)",
          hoverBorderColor: "#3f51b5",
          data: Object.values(monthlySales),
        },
      ],
    }));
  };

  const processChartData = (monthlyData) => {
    const labels = Object.keys(monthlyData);
    const cashData = labels.map((month) => monthlyData[month].cash || 0);
    const qrisData = labels.map((month) => monthlyData[month].qris || 0);

    setChartData({
      labels,
      datasets: [
        {
          label: "Cash Sales",
          backgroundColor: "rgba(63, 81, 181, 0.6)",
          borderColor: "#3f51b5",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(63, 81, 181, 0.8)",
          hoverBorderColor: "#3f51b5",
          data: cashData,
        },
        {
          label: "QRIS Sales",
          backgroundColor: "rgba(255, 152, 0, 0.6)",
          borderColor: "#ff9800",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255, 152, 0, 0.8)",
          hoverBorderColor: "#ff9800",
          data: qrisData,
        },
      ],
    });
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {/* Statistik */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary">
                Total Sales
              </Typography>
              <Typography variant="h4" sx={{ color: '#3f51b5' }}>
                Rp.{totalPenjualanSuccess.toLocaleString("id-ID")}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Updated just now
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary">
                Branch
              </Typography>
              <Typography variant="h4" sx={{ color: '#4caf50' }}>
                {totalCabang}
              </Typography>
              <Typography variant="body2" color="error.main">
                All Branch
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary">
                All Transactions
              </Typography>
              <Typography variant="h4" sx={{ color: '#ff9800' }}>
                {totalTransaksi}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Updated just now
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart Section */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Sales
              </Typography>
              <div className="chart-container">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Bulan",
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Total Penjualan",
                        },
                        beginAtZero: true,
                      },
                    },
                    plugins: {
                      legend: {
                        display: true,
                        position: "top",
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Traffic Source
              </Typography>
              <div className="chart-container">
                <Doughnut
                  data={{
                    labels: ['Desktop', 'Mobile', 'Tablet'],
                    datasets: [
                      {
                        data: [65, 25, 10],
                        backgroundColor: ['#3f51b5', '#ff9800', '#4caf50'],
                        hoverBackgroundColor: ['#5c6bc0', '#ffb74d', '#66bb6a'],
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
