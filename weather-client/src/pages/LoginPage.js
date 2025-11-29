// src/pages/LoginPage.js
import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const styles = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; font-weight: 400; }
    
    .auth-wrapper {
        min-height: 100vh;
        width: 100%;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        background: transparent; 
    }

    .auth-overlay {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.4); 
        z-index: 0;
    }

    .auth-card {
        position: relative;
        z-index: 1;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        padding: 50px 40px;
        border-radius: 24px;
        width: 100%;
        max-width: 420px;
        text-align: center;
        color: #fff;
    }

    .auth-card h2 {
        margin-bottom: 10px;
        font-size: 32px;
        font-weight: 600;
        color: #fff;
    }
    
    .sub-text {
        font-size: 15px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 40px;
    }

    .form-group {
        margin-bottom: 20px;
        text-align: left;
    }

    .form-input {
        width: 100%;
        padding: 14px 20px;
        border-radius: 50px;
        background: rgba(0, 0, 0, 0.2); 
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #fff;
        font-size: 15px;
        outline: none;
        transition: all 0.3s;
    }

    .form-input::placeholder {
        color: rgba(255, 255, 255, 0.6);
    }

    .form-input:focus {
        background: rgba(0, 0, 0, 0.3);
        border-color: #3182ce;
        box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.25);
    }

    .submit-btn {
        width: 100%;
        padding: 14px;
        border-radius: 50px;
        border: none;
        background: #3182ce; 
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
        margin-top: 20px;
        box-shadow: 0 4px 15px rgba(49, 130, 206, 0.4);
    }

    .submit-btn:hover {
        transform: translateY(-2px);
        background: #2b6cb0;
        box-shadow: 0 6px 20px rgba(49, 130, 206, 0.6);
    }

    .auth-footer {
        margin-top: 30px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
    }

    .auth-link {
        color: #63b3ed;
        text-decoration: none;
        font-weight: 600;
        margin-left: 5px;
    }

    .auth-link:hover {
        text-decoration: underline;
        color: #90cdf4;
    }
`;

const LoginPage = () => {
    let { loginUser } = useContext(AuthContext);

    return (
        <div className="auth-wrapper">
            <style>{styles}</style>
            
            <div className="auth-overlay"></div>

            <div className="auth-card">
                <div style={{ marginBottom: 20 }}>
                    <img 
                        src="https://cdn-icons-png.flaticon.com/512/1163/1163661.png" 
                        alt="logo" 
                        width="80" 
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
                    />
                </div>
                
                <h2>Welcome</h2>
                <p className="sub-text">Sign in to continue tracking the weather</p>
                
                <form onSubmit={loginUser}>
                    <div className="form-group">
                        <input 
                            className="form-input" 
                            type="text" 
                            name="username" 
                            placeholder="Username" 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            className="form-input" 
                            type="password" 
                            name="password" 
                            placeholder="Password" 
                            required 
                        />
                    </div>
                    <button type="submit" className="submit-btn">
                        Log in
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?
                        <Link to="/register" className="auth-link">Register now</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
