import React, { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { AuthProvider } from "./context/authContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastConfig } from './utils/toast';

// 添加这个样式
import './toastStyles.css';

function App() {
    return (
        <AuthProvider>
            <Suspense fallback={<div>Loading...</div>}>
                <RouterProvider router={router} />
                <ToastContainer {...toastConfig} />
            </Suspense>
        </AuthProvider>
    );
}

export default App;
