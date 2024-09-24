import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function Register(){
    const [userData, setUserData]=useState({
        username: "",
        email: "",
        password: ""
    });
    const [visible, setVisible]=useState(false);
    const navigate=useNavigate();

    const apiUrl=process.env.REACT_APP_BACKEND_URL;

    function toggleVisibility(){
        setVisible(!visible);
    }

    async function registerUser(e){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/registerUser`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                toast.success(result.message);
                navigate("/todo");
            }
            else{
                toast.error(result.message);
            }
        }
        catch(err){
            console.log(err);
        }
    }

    return(
        <div className="formPage">
            <div className="videoDiv">
                <h1>Todo./</h1>
                <video src="background.mp4" autoPlay muted loop></video>
            </div>
            <div className="formDiv">
                <div className="formHeader">
                    <h2>Create a new account</h2>
                </div>
                <form className="form" onSubmit={registerUser}>
                    <div className="formItem">
                        <label>Username</label>
                        <input type="text" placeholder="Enter your username" required onChange={(e)=>setUserData({...userData, username: e.target.value})}/>
                    </div>
                    <div className="formItem">
                        <label>Email</label>
                        <input type="email" placeholder="Enter your email" required onChange={(e)=>setUserData({...userData, email: e.target.value})}/>
                    </div>
                    <div className="formItem">
                        <label>Password</label>
                        <div className="password">
                            <input type={visible ? "text" : "password"} placeholder="Enter your password" required onChange={(e)=>setUserData({...userData, password: e.target.value})}/>
                            <img src={visible ? "visibility-on.png" : "visibility-off.png"} onClick={toggleVisibility} alt={visible ? "visibility-on" : "visibility-off"}/>
                        </div>
                    </div>
                    <button type="submit">Register</button>
                </form>
                <div className="formFooter">
                    <p>Already have an account? <a href="/login">Login</a></p>
                </div>
            </div>
        </div>
    )
}