import React from 'react'; // Added React import for JSX
import ReactDOM from 'react-dom/client'; // Updated to ReactDOM
import App from './App.jsx';
// import './index.css'; // Or your main CSS file // Removed CSS import
import { AuthProvider } from './context/AuthContext.jsx'; // Import AuthProvider
import { ModalProvider } from './context/ModalContext.jsx';
import { BrowserRouter } from 'react-router-dom'; // Assuming App uses React Router

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Ensure Router is outside AuthProvider if AuthProvider uses router features like useNavigate, though this one doesn't directly */}
      <AuthProvider>
        <ModalProvider> {/* ModalProvider wraps App and potentially other context providers if App needs them */}
          <App />
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
