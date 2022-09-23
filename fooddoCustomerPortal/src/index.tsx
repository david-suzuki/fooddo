import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import MenuProvider from './contexts/MenuProvider';
import CartProvider from './contexts/CartProvider';
import './styles/index.css';

ReactDOM.render(
  <React.StrictMode>
    <MenuProvider>
      <CartProvider>
      <App />
      </CartProvider>
    </MenuProvider>
  </React.StrictMode>,
  document.getElementById('root')
);