import React from 'react';
import { Grid, Grid2, useMediaQuery } from '@mui/material';
import Header from '../componen/kasir/Header';
import ProductGrid from '../componen/kasir/ProductGrid';


const OrderPageLayout = () => {
  const isMobile = useMediaQuery('(max-width:768px)'); 

  return (
   <>
      {/* Header tetap di atas */}
      <Header />
      <Grid2>
      </Grid2>
      <Grid container>
      
        {!isMobile && (
          <>
            
            <Grid item xs={12}>
              <ProductGrid />
            </Grid>
           
          </>
        )}
       
        {isMobile && (
          <>
            <Grid item xs={12}>
              <ProductGrid />
            </Grid>
         
          </>
        )}
      </Grid>
      </>
  );
};

export default OrderPageLayout;
