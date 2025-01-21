// @ts-nocheck
const { User, Todo, Trash }=require("./model");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

const jwt_secret=process.env.JWT_SECRET || "defaultSecret";
const jwt_expires_in="1h";

const registerUser=async(req, res)=>{
    try{
        const { username, email, password }=req.body;
        if(!username || !email || !password){
            return res.status(400).json({ message: "All fields are required" });
        }
        const usernameExist=await User.findOne({ username: username.trim() });
        if(usernameExist){
            return res.status(400).json({ message: "Username already exists" });
        }
        const emailExist=await User.findOne({ email: email.trim() });
        if(emailExist){
            return res.status(400).json({ message: "Email is already in use" });
        }
        const hashedPassword=await bcrypt.hash(password, bcrypt.genSaltSync(10));
        const user=new User({
            username: username.trim(), 
            email: email.trim(),
            password: hashedPassword
        });
        await user.save();
        const token=jwt.sign({ userId: user._id, username: user.username }, jwt_secret, { expiresIn: jwt_expires_in });
        res.cookie("jwt", token, { httpOnly: true, secure: true, sameSite: "None", maxAge: 3600000 });
        return res.status(200).json({ message: "User created successfully" });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

const loginUser=async(req, res)=>{
    try{
        const { credential, password }=req.body;
        if(!credential || !password){
            return res.status(400).json({ message: "All fields are required" });
        }
        const userExist=await User.findOne({ $or: [{ email: credential.trim() }, { username: credential.trim() }] });
        if(!userExist){
            return res.status(400).json({ message: "Invalid credential" });
        }
        const passwordMatch=await bcrypt.compare(password, userExist.password);
        if(!passwordMatch){
            return res.status(400).json({ message: "Incorrect password" });
        }
        const token=jwt.sign({ userId: userExist._id, username: userExist.username }, jwt_secret, { expiresIn: jwt_expires_in });
        res.cookie("jwt", token, { httpOnly: true, secure: true, sameSite: "None", maxAge: 3600000 });
        return res.status(200).json({ message: "Login successful" });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

const logoutUser=(req, res)=>{
    try{
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ message: "Logout successful" });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

const deleteUser=async(req, res)=>{
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(400).json({ message: "User token not found" });
        }
        const decoded=jwt.verify(token, jwt_secret);
        const userId=decoded.userId;
        const deleteAccount=await User.findByIdAndDelete(userId);
        if(!deleteAccount){
            return res.status(400).json({ message: "User deletion failed" });
        }
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

const addTodo=async(req, res)=>{   
    const { item }=req.body;
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(400).json({ message: "User token not found" });
        }
        const decoded=jwt.verify(token, jwt_secret);
        const userId=decoded.userId;
        const user=await User.findById(userId);
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }
        if(!item || item.trim()===""){
            return res.status(400).json({ message: "Item cannot be empty" });
        }

        const todo=new Todo({
            userId,
            item
        });
        await todo.save();
        res.status(200).json({ item: todo, message: "Item added to todos" });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

const getTodos=async(req, res)=>{
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(400).json({ message: "User token not found" });
        }
        const decoded=jwt.verify(token, jwt_secret);
        const userId=decoded.userId;
        const user=await User.findById(userId);
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }
        const todos=await Todo.find({ userId: userId })
            .sort({ completed: 1, updatedAt: -1 });
        let incompleteTodos=[], completedTodos=[];
        todos.forEach(todo=>{
            if(todo.completed) completedTodos.push(todo);
            else incompleteTodos.push(todo);
        });
        const sortedTodos=[...incompleteTodos, ...completedTodos.reverse()];
        return res.status(200).json({ todos: sortedTodos, message: "Todos fetched successfully" });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

const toggleComplete=async(req, res)=>{
    const { todoId }=req.params;
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(400).json({ message: "User token not found" });
        }
        const decoded=jwt.verify(token, jwt_secret);
        const userId=decoded.userId;
        const user=await User.findById(userId);
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }

        const todo=await Todo.findById(todoId);
        if(!todo){
            return res.status(400).json({ message: "Todo not found" });
        }
        todo.completed=!todo.completed;
        await todo.save();
        return res.status(200).json({ message: todo.completed ? "Todo checked" : "Todo unchecked", completed: todo.completed });
    }   
    catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

const editTodo=async(req, res)=>{
    const { todoId }=req.params;
    const { item }=req.body;
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(400).json({ message: "User token not found" });
        }
        const decoded=jwt.verify(token, jwt_secret);
        const userId=decoded.userId;
        const user=await User.findById(userId);
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }

        const todo=await Todo.findByIdAndUpdate(todoId, { item: item }, { new: true });
        if(!todo){
            return res.status(400).json({ message: "Todo not found" });
        }
        return res.status(200).json({ message: "Todo item updated successfully", item: todo.item });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

const deleteTodo=async(req, res)=>{
    const { todoId }=req.params;
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(400).json({ message: "User token not found" });
        }
        const decoded=jwt.verify(token, jwt_secret);
        const userId=decoded.userId;
        const user=await User.findById(userId);
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }

        const todo=await Todo.findByIdAndDelete(todoId);
        if(!todo){
            return res.status(400).json({ message: "Todo not found" });
        }
        const trashTodo=new Trash({
            userId,
            item: todo.item,
            completed: todo.completed
        });
        await trashTodo.save();
        return res.status(200).json({ message: "Todo deleted successfully" });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

const getTrashItems=async(req, res)=>{
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(400).json({ message: "User token not found" });
        }
        const decoded=jwt.verify(token, jwt_secret);
        const userId=decoded.userId;
        const user=await User.findById(userId);
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }
        const trashItems=await Trash.find({ userId: userId })
            .sort({ dateAdded: -1 });
        return res.status(200).json({ trash: trashItems, message: "Trash items fetched successfully" });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

const deleteTrashItem=async(req, res)=>{
    const { trashId }=req.params;
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(400).json({ message: "User token not found" });
        }
        const decoded=jwt.verify(token, jwt_secret);
        const userId=decoded.userId;
        const user=await User.findById(userId);
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }
        const deleteItem=await Trash.findByIdAndDelete(trashId);
        return res.status(200).json({ message: "Todo deleted from the trash" });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

const recoverTodo=async(req, res)=>{
    const { trashId }=req.params;
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(400).json({ message: "User token not found" });
        }
        const decoded=jwt.verify(token, jwt_secret);
        const userId=decoded.userId;
        const user=await User.findById(userId);
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }
        const recoverTodo=await Trash.findByIdAndDelete(trashId);
        if(!recoverTodo){
            return res.status(400).json({ message: "Todo not found" });
        }
        const todo=new Todo({
            userId,
            item: recoverTodo.item,
            completed: recoverTodo.completed
        });
        await todo.save();
        return res.status(200).json({ message: "Todo recovered successfully" });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports={
    registerUser,
    loginUser,
    logoutUser,
    deleteUser,
    addTodo,
    getTodos,
    toggleComplete,
    editTodo,
    deleteTodo,
    getTrashItems,
    deleteTrashItem,
    recoverTodo
}