import { toast } from 'react-toastify';

export const toastConfig = {
  position: "bottom-right",
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  newestOnTop: false,
  rtl: false,
  pauseOnFocusLoss: true
};

const commonStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  background: '#ffffff',
  color: '#000000',  // 确保文字颜色为黑色
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  borderLeft: '4px solid',
  zIndex: 9999,
  padding: '12px 16px',  // 增加内边距
  lineHeight: '1.5',  // 增加行高
};

export const showToast = {
  success: (message, options = {}) => {
    console.log('Showing success toast:', message);
    toast.success(message, { 
      ...toastConfig, 
      ...options,
      icon: '✅',
      style: {
        ...commonStyle,
        borderLeftColor: '#4caf50',
      },
    });
  },
  error: (message, options = {}) => {
    console.log('Showing error toast:', message);
    toast.error(message, { 
      ...toastConfig, 
      ...options,
      icon: '❌',
      style: {
        ...commonStyle,
        borderLeftColor: '#d32f2f',
      },
    });
  },
  info: (message, options = {}) => {
    console.log('Showing info toast:', message);
    toast.info(message, { 
      ...toastConfig, 
      ...options,
      icon: 'ℹ️',
      style: {
        ...commonStyle,
        borderLeftColor: '#0288d1',
      },
    });
  },
  warn: (message, options = {}) => {
    console.log('Showing warn toast:', message);
    toast.warn(message, { 
      ...toastConfig, 
      ...options,
      icon: '⚠️',
      style: {
        ...commonStyle,
        borderLeftColor: '#ffa000',
      },
    });
  },
};
