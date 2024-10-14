import React, { createContext, useState, useEffect } from "react";
import { post, get } from "../utils/api";
import { showToast } from "../utils/toast";
import { useTranslation } from 'react-i18next';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        try {
            // 首先获取 Token
            const tokenResponse = await post(
                "/api/customUser/token/",
                {
                    email,
                    password,
                },
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            if (tokenResponse.code === 200 && tokenResponse.data) {
                const token = tokenResponse.data.token;
                localStorage.setItem("token", token);

                // 使用获取到的 Token 请求用户详细信息
                const userResponse = await get("/api/customUser/me/", {
                    headers: {
                        "Authorization": `Token ${token}`
                    }
                });

                if (userResponse.code === 200 && userResponse.data) {
                    const userData = userResponse.data;
                    localStorage.setItem("user_id", userData.id);
                    localStorage.setItem("email", userData.email);
                    localStorage.setItem("name", userData.name);
                    localStorage.setItem("is_staff", userData.is_staff ? "true" : "false");
                    localStorage.setItem("is_active", userData.is_active ? "true" : "false");

                    setUser(userData);
                    return { code: 200, data: userData };
                }
            }
            return tokenResponse;
        } catch (err) {
            console.error(t("loginError"), err);
            return err.response ? err.response.data : { code: 500, msg: t("unknownError") };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await post("/api/customUser/create/", {
                email,
                password,
                name,
            });
            if (response.code === 201 && response.data) {
                return await login(email, password);
            } else if (response.code === 400) {
                if (response.msg && response.msg.email) {
                    throw new Error(t("emailAlreadyExists"));
                } else {
                    throw new Error(response.msg || t("registrationFailed"));
                }
            } else {
                throw new Error(t("registrationFailed"));
            }
        } catch (err) {
            if (err.response && err.response.data) {
                const responseData = err.response.data;
                if (responseData.msg && responseData.msg.email) {
                    throw new Error(t("emailAlreadyExists"));
                }
            }
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("email");
        localStorage.removeItem("name");
        localStorage.removeItem("is_staff");
        localStorage.removeItem("is_active");
        setUser(null);
        showToast.info(t("logoutSuccess"));
    };

    const getCurrentUser = () => {
        return user;
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const userResponse = await get("/api/customUser/me/", {
                        headers: {
                            "Authorization": `Token ${token}`
                        }
                    });
                    if (userResponse.code === 200 && userResponse.data) {
                        setUser(userResponse.data);
                    } else {
                        // 如果获取用户信息失败，清除所有存储的信息
                        logout();
                    }
                } catch (err) {
                    console.error(t("authCheckError"), err);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const value = {
        user,
        setUser,
        loading,
        error,
        login,
        register,
        logout,
        getCurrentUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
