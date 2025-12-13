import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api'; 
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const navigate = useNavigate();

    // 1. Kiểm tra đăng nhập khi F5
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('authTokens');
            if (token) {
                try {
                    const parsedToken = JSON.parse(token);
                    const decoded = jwtDecode(parsedToken.access); 
                    setUser(decoded); 
                } catch (e) {
                    logoutUser();
                }
            }
            setAuthLoading(false);
        };
        checkLoggedIn();
    }, []);

    // 2. SỬA HÀM NÀY: Nhận 'e' (event) thay vì username/password rời
    const loginUser = async (e) => {
        e.preventDefault(); // Chặn reload form
        
        // Lấy dữ liệu trực tiếp từ form cũ của bạn (dựa vào name="username" và name="password")
        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            // Gọi API
            const response = await api.post('token/', { 
                username, 
                password 
            });

            if (response.status === 200) {
                localStorage.setItem('authTokens', JSON.stringify(response.data));
                const decoded = jwtDecode(response.data.access);
                setUser(decoded); 
                
                alert("Đăng nhập thành công!");
                navigate('/'); 
            } else {
                alert("Sai tài khoản hoặc mật khẩu!");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Đăng nhập thất bại! Vui lòng kiểm tra lại.");
        }
    };

    // 3. register
    const registerUser = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        const email = e.target.email.value;

        try {
            await api.post('register/', { username, password, email });
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate('/login');
        } catch (error) {
            alert("Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại.");
        }
    };

    // 4. Hàm Đăng xuất
    const logoutUser = () => {
        localStorage.removeItem('authTokens');
        setUser(null);
        navigate('/login');
    };

    const contextData = {
        user,
        loginUser,   
        registerUser,
        logoutUser,
        authLoading
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;