import React from 'react';
import { Grid, Grid2, useMediaQuery } from '@mui/material';
import Header from '../componen/kasir/Header';
import ProductPerCabang from '../componen/kasir/ProductPerCabang';

const OrderBranch = () => {
  const isMobile = useMediaQuery('(max-width:768px)'); 

  return (
   <>
      <Header />
      <Grid2>
      </Grid2>
      <Grid container>
      
        {!isMobile && (
          <>
            
            <Grid item xs={12}>
              <ProductPerCabang />
            </Grid>
           
          </>
        )}
       
        {isMobile && (
          <>
            <Grid item xs={12}>
              <ProductPerCabang />
            </Grid>
         
          </>
        )}
      </Grid>
      </>
  );
};

export default OrderBranch;
