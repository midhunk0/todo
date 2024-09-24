const express=require("express");
const { registerUser, loginUser, addTodo, getTodos, toggleComplete, editTodo, deleteTodo, getTrashItems, deleteTrashItem, recoverTodo, logoutUser, deleteUser }=require("./controller");
const router=express.Router();
const cors=require("cors");

router.use(
    cors({
    origin: process.env.FRONTEND_API,
    credentials: true
}))

router.post("/registerUser", registerUser);
router.post("/loginUser", loginUser);
router.post("/logoutUser", logoutUser);
router.delete("/deleteUser", deleteUser);
router.post("/addTodo", addTodo);
router.get("/getTodos", getTodos);
router.patch("/toggleComplete/:todoId", toggleComplete);
router.put("/editTodo/:todoId", editTodo);
router.delete("/deleteTodo/:todoId", deleteTodo);
router.get("/getTrash", getTrashItems);
router.delete("/deleteTrashItem/:trashId", deleteTrashItem);
router.patch("/recoverTodo/:trashId", recoverTodo);

module.exports=router;