// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Topbar } from "../global/Topbar";
import { toast } from "react-toastify";

export function Trash(){
    const [trash, setTrash]=useState([]);
    const apiUrl=process.env.REACT_APP_BACKEND_URL;

    async function fetchTrash(){
        try{
            const response=await fetch(`${apiUrl}/getTrash`, { credentials: "include" });
            const result=await response.json();
            if(response.ok){
                setTrash(result.trash);
                // toast.success(result.message);
            }
            else{
                toast.error(result.message);
            }
        }
        catch(err){
            console.log(err);
        }
    };

    useEffect(()=>{
        fetchTrash();
    }, []);

    async function restoreTodo(trashId){
        try{
            const response=await fetch(`${apiUrl}/recoverTodo/${trashId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                toast.success(result.message);
                fetchTrash();
            }
            else{
                toast.error(result.message);
            }
        }
        catch(err){
            console.log(err);
        }
    };

    async function deleteTrashItem(trashId){
        try{
            const response=await fetch(`${apiUrl}/deleteTrashItem/${trashId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                fetchTrash();
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

    return(
        <div className="trashPage">
            <Topbar/>
            <div className="trashList">
                {trash.map((trashItem, index)=>(
                    <div key={index} className="trashItem">
                        {/* <div className="trashItemContent"> */}
                            <p>{trashItem.item}</p>
                        {/* </div> */}
                        <div className="trashButtons">
                            <img src="restore.png" alt="restore" onClick={()=>restoreTodo(trashItem._id)}/>
                            <img src="delete-forever.png" alt="delete-forever" onClick={()=>deleteTrashItem(trashItem._id)}/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
