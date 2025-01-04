import React,{useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider,useDispatch  } from 'react-redux';
import { store } from './app/store';
import { LoginPage } from './componen/LoginPage';
import { DashboardPages } from './pages/DashboardPages';
import { UserListPages } from './pages/UserListPages';
import { ProfilePages } from './pages/ProfilePages';
import { OrderePages } from './pages/OrderePages';
import { TransactionPages } from './pages/TransactionPages';
import { ProductPages } from './pages/ProductPages';
import { CategoryPages } from './pages/CategoryPages';
import { ProfileKasirPages } from './pages/ProfileKasirPages';
import { TransaksiKasirPages } from './pages/TransaksiKasirPages';
import { BranchPages } from './pages/BranchPages';
import { PrivateRoute } from './PrivateRoute';
import { InvoicePages } from './pages/InvoicePages';
import { ProdukPerCabangPages } from './pages/ProductPerCabangPages';//view transaksi kasir
import SetProdukCabangPages from './pages/SetProdukCabangPages';
import Product from './componen/kasir/transaksi/Produc';
import { Me } from './fitur/AuthSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(Me());
  }, [dispatch]);
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          {/* API ADMIN */}
          <Route path="/dashboard" element={<DashboardPages />} />
          <Route path="/userlist" element={<UserListPages />} />
          <Route path="/profile" element={<ProfilePages />} />
          <Route path="/branch" element={<BranchPages />} />
          <Route path="/transaction" element={<TransactionPages />} />
          <Route path="/product" element={<ProductPages />} />
          <Route path="/category" element={<CategoryPages />} />
          <Route path="/laporan" element={<InvoicePages />} />
          <Route path="/setprodukpercabang" element={<SetProdukCabangPages />} />
          {/*batas API ADMIN */}
          <Route path="/profilekasir" element={<ProfileKasirPages />} />
          <Route
            path="/transaksikasir"
            element={
              <PrivateRoute
                element={<TransaksiKasirPages />}
                allowedRoles={['kasir']} 
              />
            }
          />
           <Route path="/order" element={<OrderePages />} />
           {/* view transaksi kasir */}
           <Route path="/produkpercabang" element={<ProdukPerCabangPages />} /> 
          {/* view transaksi kasir */}
           {/* view transaksi kasir */}
           <Route path="/produktransaksi" element={<Product />} /> 
          {/* view transaksi kasir */}
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
