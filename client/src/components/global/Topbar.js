// @ts-nocheck
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function Topbar(){
    const [show, setShow]=useState(false);
    const navigate=useNavigate();
    const location=useLocation();
    const environment=process.env.NODE_ENV;
    const apiUrl=environment==='development'
        ? process.env.REACT_APP_DEV_URL
        : process.env.REACT_APP_PROD_URL;
    const tab=location.pathname;

    function togglePage(){
        if(tab==="/trash"){
            navigate("/todo");
        }
        else{
            navigate("/trash");
        }
    }
    
    async function logoutUser(){
        try{
            const response=await fetch(`${apiUrl}/logoutUser`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                navigate("/login");
                toast.success(result.message);
            }
            else{
                toast.error(result.message);
            }
        }   
        catch(err){
            console.log(err);
        }
    };

    async function deleteUser(e){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/deleteUser`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                toast.success(result.message);
                navigate("/register");
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
        <div className="topbar">
            <div className="logo">
                <h2><a href="/todo">Todo./</a></h2>
            </div>
            <div className="moreOptions">
                <button onClick={()=>setShow(prev=>!prev)}>
                    <img src={show ? "close.png" : "more.png"} alt={show ? "more" : "close"}/>
                </button>                
                <div className={`options ${show ? "show" : ""}`}>
                    <div className="option" onClick={togglePage}>
                        <img 
                            src={tab==="/trash" ? "/checked.png" : "/delete.png"} 
                            alt={tab==="/trash" ? "todo" : "delete"}
                        />
                        <p>View {tab==="/trash" ? "Todo" : "Trash"}</p>
                    </div>
                    <div className="option" onClick={logoutUser}>
                        <img src="/logout.png" alt="logout"/>
                        <p>Logout</p>
                    </div>
                    <div className="option" onClick={deleteUser}>
                        <img src="/delete-forever.png" alt="delete"/>
                        <p>Delete Account</p>
                    </div>
                </div>
            </div>
        </div>
    )
}