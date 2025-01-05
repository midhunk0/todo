import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Todo } from './components/pages/Todo';
import { Trash } from './components/pages/Trash';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App(){

    return(
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login"/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/todo" element={<Todo/>}/>
                <Route path="/trash" element={<Trash/>}/>
            </Routes>
            <ToastContainer 
				toastStyle={{
                    background: "#00D7FF",
                    borderRadius: "25px",
                }}
                position="bottom-right" 
                autoClose={2000} 
                hideProgressBar={true} 
                newestOnTop={false} 
                closeOnClick={true} 
                rtl={false}
                pauseOnFocusLoss={true} 
                draggable={true} 
                theme="colored"
                pauseOnHover={true}
                closeButton={false}
            />
        </Router>    
    );
}

export default App;
