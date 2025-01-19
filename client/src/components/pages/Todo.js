/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Topbar } from "../global/Topbar";
import { toast } from "react-toastify";

export function Todo(){
    const [todoItem, setTodoItem]=useState("");
    const [todos, setTodos]=useState([]);
    const [edited, setEdited]=useState(null);
    const [updateTodo, setUpdateTodo]=useState("");
    const environment=process.env.NODE_ENV;
    const apiUrl=environment==='development'
        ? process.env.REACT_APP_DEV_URL
        : process.env.REACT_APP_PROD_URL;

    async function addTodo(e){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/addTodo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item: todoItem }),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                toast.success(result.message);
                setTodoItem("");
                fetchTodos();
            }
            else{
                toast.error(result.message);
            }
        }
        catch(err){
            console.log(err);
        }
    }

    async function fetchTodos(){
        try{
            const response=await fetch(`${apiUrl}/getTodos`, { credentials: "include" });
            const result=await response.json();
            if(response.ok){
                setTodos(result.todos);
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
        fetchTodos();
    }, []);

    async function toggleComplete(todoId){
        try{
            const response=await fetch(`${apiUrl}/toggleComplete/${todoId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                fetchTodos();
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

    async function editTodo(todoId){
        try{
            const response=await fetch(`${apiUrl}/editTodo/${todoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item: updateTodo }),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                setEdited(null);
                fetchTodos();
                toast.success(result.message);
            }
            else{
                toast.error(result.message);
            }
        }
        catch(err){
            console.log(err);
        }
    }

    async function deleteTodo(todoId){
        try{
            const response=await fetch(`${apiUrl}/deleteTodo/${todoId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                fetchTodos();
                toast.success(result.message);
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
        <div className="todoPage">
            <Topbar/>
            <div className="todo">
                <form className="addTodo" onSubmit={addTodo}>
                    <input type="text" placeholder="type something..." value={todoItem} onChange={(e)=>setTodoItem(e.target.value)}/>
                    <button className="addButton" onClick={addTodo} type="button" >
                        <img src="add.png" alt=""/>
                    </button>
                </form>
                {todos.map((todo, index)=>(
                    <div key={index} className="todoItem">
                        <div className="todoItemContent">
                            {edited===todo._id ? (
                                <form className="updateForm" onSubmit={(e)=>{e.preventDefault();editTodo(todo._id)}}>
                                    <input type="text" value={updateTodo} onChange={(e)=>setUpdateTodo(e.target.value)}/>
                                </form>
                            ):(
                                <div className="contentDiv">
                                    <button onClick={()=>toggleComplete(todo._id)}>
                                        <img src={todo.completed ? "checked.png" : "nonchecked.png"} alt={todo.completed ? "completed" : "incompleted"}/>
                                    </button>
                                    <p htmlFor={todo.item} onClick={()=>toggleComplete(todo._id)}>{todo.item}</p>
                                </div>
                            )}
                        </div>
                        <div className="todoItemButtons">
                            {edited===todo._id ? (
                                <button className="saveButton" onClick={(e)=>editTodo(todo._id)}>
                                    <img src="save.png" alt="save"/>
                                </button>
                            ):(
                                <button onClick={()=>{setEdited(todo._id); setUpdateTodo(todo.item)}}>
                                    <img src="edit.png" alt="edit"/>
                                </button>
                            )}
                            <button onClick={()=>deleteTodo(todo._id)}>
                                <img src="delete.png" alt="delete"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}