import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Me } from '../fitur/AuthSlice';
import OrderBranch from '../layout.jsx/OrderBranch';

export const ProductPerCabangPages = () => {
    const dispatch = useDispatch();
  const navigate = useNavigate();
 const { user, isError } = useSelector((state) => state.auth);
 console.log("User State:", user);
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(Me());
      } catch {
        navigate('/');
      }
    };
    fetchData();
  }, [dispatch, navigate]);

  useEffect(() => {
    if (isError) {
      navigate('/');
    }
  }, [isError, navigate]);
  return (
   <>
    <OrderBranch userUuid={user?.uuid} />
    </>
  )
}
