/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function Topbar(){
    const [show, setShow]=useState(true);
    const navigate=useNavigate();
    const apiUrl=process.env.REACT_APP_BACKEND_URL;

    function toggleShow(){
        setShow(!show);
    }

    function showTrash(){
        navigate("/trash")
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
                <button onClick={toggleShow}>
                    <img src={show ? "more.png" : "close.png"} alt={show ? "more" : "close"}/>
                </button>
                {show ? (
                    <></>
                ) : (
                    <div className="options">
                        <a onClick={showTrash}>View Trash</a>
                        <a onClick={logoutUser}>Logout</a>
                        <a onClick={deleteUser}>Delete Account</a>
                    </div>
                )}
            </div>
        </div>
    )
}