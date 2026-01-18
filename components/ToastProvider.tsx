"use client";

import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 3000,
        style: {
          background: '#F5F5F5', // surface-light
          color: '#1A1A1A', // text-dark
          border: '1px solid #E0E0E0', // surface-medium
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          padding: '12px 20px',
          borderRadius: '16px',
          fontSize: '14px',
          fontWeight: 'bold',
        },
        // Override for success
        success: {
          iconTheme: {
            primary: '#00e676', // accent-green
            secondary: '#fff',
          },
        },
        // Override for error
        error: {
          iconTheme: {
            primary: '#ff1744', // accent-red
            secondary: '#fff',
          },
        },
        // Override for loading
        loading: {
          iconTheme: {
            primary: '#E95420', // primary
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default ToastProvider;