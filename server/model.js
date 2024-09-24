// @ts-nocheck
const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

const todoSchema=new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    item: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

todoSchema.pre("save", function(next){
    this.updatedAt=Date.now();
    next();
})

const trashSchema=new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    item: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

trashSchema.index({ dateAdded: 1 }, { expireAfterSeconds: 10*24*60*60 });

const User=mongoose.model("User", userSchema);
const Todo=mongoose.model("Todo", todoSchema);
const Trash=mongoose.model("Trash", trashSchema);

module.exports={ User, Todo, Trash };