// @ts-nocheck
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import express, { response } from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { addTodo, deleteTodo, deleteTrashItem, deleteUser, editTodo, getTodos, getTrashItems, loginUser, logoutUser, recoverTodo, registerUser, toggleComplete } from "./controller";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();
const app=express();
app.use(express.json());
app.use(cookieParser());

app.post("/registerUser", registerUser);
app.post("/loginUser", loginUser);
app.post("/logoutUser", logoutUser);
app.delete("/deleteUser", deleteUser);
app.post("/addTodo", addTodo);
app.get("/getTodos", getTodos);
app.patch("/toggleComplete/:todoId", toggleComplete);
app.put("/editTodo/:todoId", editTodo);
app.delete("/deleteTodo/:todoId", deleteTodo);
app.get("/getTrash", getTrashItems);
app.delete("/deleteTrashItem/:trashId", deleteTrashItem);
app.patch("/recoverTodo/:trashId", recoverTodo);

let mongoServer;

beforeAll(async()=>{
    mongoServer=await MongoMemoryServer.create();
    const uri=mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async()=>{
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async()=>{
    const collections=await mongoose.connection.db.collections();
    for(const collection of collections){
        await collection.deleteMany({});
    }
})

describe("user registration", ()=>{
    const registerUser=async()=>{
        const response=await request(app).post("/registerUser").send({
            username: "test",
            email: "test@gmail.com",
            password: "test"
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User created successfully");
    };

    beforeEach(async()=>{
        await mongoose.connection.db.collection("users").deleteMany({});
    });

    it("should return, all the fields are required", async()=>{
        const testCases=[
            { username: "", email: "test@gmail.com", password: "test" },
            { username: "test", email: "", password: "test" },
            { username: "test", email: "test@gmail.com", password: "" }
        ];

        for(const testCase of testCases){
            const response=await request(app).post("/registerUser").send(testCase);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("All fields are required");
        }
    });

    it("should return, the username already exists", async()=>{
        await registerUser();

        const response=await request(app).post("/registerUser").send({
            username: "test",
            email: "test1@gmail.com",
            password: "test1"
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Username already exists")
    });

    it("should return, the email is already in use", async()=>{
        await registerUser();

        const respose=await request(app).post("/registerUser").send({
            username: "test1",
            email: "test@gmail.com",
            password: "test1"
        });
        
        expect(respose.status).toBe(400);
        expect(respose.body.message).toBe("Email is already in use");
    });

    it("should return, registration successfull", async()=>{
        const response=await request(app).post("/registerUser").send({
            username: "test",
            email: "test@gmail.com",
            password: "test"
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User created successfully");
        expect(response.headers['set-cookie']).toBeDefined();
    });
});

describe("user login", ()=>{
    const registerUser=async()=>{
        const response=await request(app).post("/registerUser").send({
            username: "test",
            email: "test@gmail.com",
            password: "test"
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User created successfully");
        const cookie=response.headers["set-cookie"];
        expect(cookie).toBeDefined();
    };

    beforeEach(async()=>{
        await mongoose.connection.db.collection("users").deleteMany({});
        await registerUser();
    })

    it("should return, all fields are required", async()=>{
        const testCases=[
            { credential: "", password: "test" },
            { credential: "test", password: "" },
            { credential: "test@gmail.com", password: "" }
        ];

        for(const testCase of testCases){
            const response=await request(app).post("/loginUser").send(testCase);
            
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("All fields are required");
        }
    });

    it("should return, the invalid credential", async()=>{
        const testCases=[
            { credential: "test1", password: "test" },
            { credential: "test1@gmail.com", password: "test" }
        ];

        for(const testCase of testCases){
            const response=await request(app).post("/loginUser").send(testCase);
            
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Invalid credential");
        }
    });

    it("should return, incorrect password", async()=>{
        const testCases=[
            { credential: "test", password: "test1" },
            { credential: "test@gmail.com", password: "test1" }
        ];

        for(const testCase of testCases){
            const response=await request(app).post("/loginUser").send(testCase);
            
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Incorrect password");
        }
    });

    it("should return, login successful", async()=>{
        const testCases=[
            { credential: "test", password: "test" },
            { credential: "test@gmail.com", password: "test" }
        ];

        for(const testCase of testCases){
            const response=await request(app).post("/loginUser").send(testCase);
            
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Login successful");
            expect(response.headers['set-cookie']).toBeDefined();
        }
    });
});

describe("logout user", ()=>{
    it("should return, logout successful", async()=>{
        const response=await request(app).post("/logoutUser").send();
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Logout successful");
    });
});

describe("delete user", ()=>{
    let cookie;

    const registerUser=async()=>{
        const response=await request(app).post("/registerUser").send({
            username: "test",
            email: "test@gmail.com",
            password: "test"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User created successfully");
        cookie=response.headers["set-cookie"];
        expect(cookie).toBeDefined();
    };

    beforeEach(async()=>{
        await mongoose.connection.db.collection("users").deleteMany({});
        await registerUser();
    });

    it("should return, user token not found", async()=>{
        const response=await request(app).delete("/deleteUser");
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User token not found");
    }); 

    it("should return, user deletion failed", async()=>{
        await mongoose.connection.db.collection("users").deleteOne({ username: "test" });

        const response=await request(app).delete("/deleteUser").set("Cookie", cookie);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User deletion failed");
    });

    it("should return, user deletion successful", async()=>{
        const response=await request(app).delete("/deleteUser").set("Cookie", cookie);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User deleted successfully");
    });    
});

describe("add todo", ()=>{
    let cookie;

    const registerUser=async()=>{
        const response=await request(app).post("/registerUser").send({
            username: "test",
            email: "test@gmail.com",
            password: "test"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User created successfully");
        cookie=response.headers["set-cookie"];
        expect(cookie).toBeDefined();
    };

    beforeEach(async()=>{
        await mongoose.connection.db.collection("users").deleteMany({});
        await registerUser();
    });

    it("should return, user token not found", async()=>{
        const response=await request(app).post("/addTodo");
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User token not found");
    }); 

    it("should return, user not found", async()=>{
        await mongoose.connection.db.collection("users").deleteOne({ username: "test" });
        
        const response=await request(app).post("/addTodo").set("Cookie", cookie);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User not found");
    });

    it("should return, item cannot be empty", async()=>{
        const response=await request(app).post("/addTodo").set("Cookie", cookie).send({ item: "" });
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Item cannot be empty");
    });

    it("should return, item added to todos", async()=>{
        const response=await request(app).post("/addTodo").set("Cookie", cookie).send({ item: "item" });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Item added to todos");
    });
});

describe("get todos", ()=>{
    let cookie, todoId;

    const registerUser=async()=>{
        const response=await request(app).post("/registerUser").send({
            username: "test",
            email: "test@gmail.com",
            password: "test"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User created successfully");
        cookie=response.headers["set-cookie"];
        expect(cookie).toBeDefined();
    };

    beforeEach(async()=>{
        await mongoose.connection.db.collection("users").deleteMany({});
        await registerUser();
    });

    it("should return, user token not found", async()=>{
        const response=await request(app).get("/getTodos");
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User token not found");
    });

    it("should return, user not found", async()=>{
        await mongoose.connection.db.collection("users").deleteOne({ username: "test" });

        const response=await request(app).get("/getTodos").set("Cookie", cookie);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User not found");
    });

    it("should return, todos fetched successfully", async()=>{
        const response=await request(app).get("/getTodos").set("Cookie", cookie);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Todos fetched successfully");
    });
});

describe("toggle todo complete", ()=>{
    let cookie, todoId;

    const registerUser=async()=>{
        const response=await request(app).post("/registerUser").send({
            username: "test",
            email: "test@gmail.com",
            password: "test"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User created successfully");
        cookie=response.headers["set-cookie"];
        expect(cookie).toBeDefined();
    };

    const addTodo=async()=>{
        const response=await request(app).post("/addTodo").set("Cookie", cookie).send({
            item: "test todo"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Item added to todos");
        todoId=response.body.item._id;
        expect(todoId).toBeDefined();
    };

    beforeEach(async()=>{
        await mongoose.connection.db.collection("users").deleteMany({});
        await mongoose.connection.db.collection("todos").deleteMany({});
        await registerUser();
        await addTodo();
    });

    it("should return, user token not found", async()=>{
        const response=await request(app).patch(`/toggleComplete/${todoId}`);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User token not found");
    });

    it("should return, user not found", async()=>{
        await mongoose.connection.db.collection("users").deleteOne({ username: "test" });

        const response=await request(app).patch(`/toggleComplete/${todoId}`).set("Cookie", cookie);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User not found");
    });

    it("should return, todo not found", async()=>{
        todoId="64a7fabe6c82f8bd12345678";

        const response=await request(app).patch(`/toggleComplete/${todoId}`).set("Cookie", cookie);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Todo not found");
    });

    it("should return, todo toggled", async()=>{
        const response=await request(app).patch(`/toggleComplete/${todoId}`).set("Cookie", cookie);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Todo checked" || "Todo unchecked");
    });
});

describe("edit todos", ()=>{
    let cookie, todoId;

    const registerUser=async()=>{
        const response=await request(app).post("/registerUser").send({
            username: "test",
            email: "test@gmail.com",
            password: "test"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User created successfully");
        cookie=response.headers["set-cookie"];
        expect(cookie).toBeDefined();
    };

    const addTodo=async()=>{
        const response=await request(app).post("/addTodo").set("Cookie", cookie).send({
            item: "test todo"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Item added to todos");
        todoId=response.body.item._id;
        expect(todoId).toBeDefined();
    };

    beforeEach(async()=>{
        await mongoose.connection.db.collection("users").deleteMany({});
        await mongoose.connection.db.collection("todos").deleteMany({});
        await registerUser();
        await addTodo();
    });

    it("should return, user token not found", async()=>{
        const response=await request(app).put(`/editTodo/${todoId}`).send({
            item: "new test todo"
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User token not found");
    });  
    
    it("should return, user not found", async()=>{
        await mongoose.connection.db.collection("users").deleteOne({ username: "test" });

        const response=await request(app).put(`/editTodo/${todoId}`).set("Cookie", cookie).send({
            item: "new test todo"
        });
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User not found");
    });  

    it("should return, todo not found", async()=>{
        todoId="64a7fabe6c82f8bd12345678";

        const response=await request(app).put(`/editTodo/${todoId}`).set("Cookie", cookie).send({
            item: "new test todo"
        });
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Todo not found");
    });  

    it("should return, todo item updated successfully", async()=>{
        const response=await request(app).put(`/editTodo/${todoId}`).set("Cookie", cookie).send({
            item: "new test todo"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Todo item updated successfully");
    });  
});

describe("delete todos", ()=>{
    let cookie, todoId;

    const registerUser=async()=>{
        const response=await request(app).post("/registerUser").send({
            username: "test",
            email: "test@gmail.com",
            password: "test"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User created successfully");
        cookie=response.headers["set-cookie"];
        expect(cookie).toBeDefined();
    };

    const addTodo=async()=>{
        const response=await request(app).post("/addTodo").set("Cookie", cookie).send({
            item: "test todo"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Item added to todos");
        todoId=response.body.item._id;
        expect(todoId).toBeDefined();
    };

    beforeEach(async()=>{
        await mongoose.connection.db.collection("users").deleteMany({});
        await mongoose.connection.db.collection("todos").deleteMany({});
        await registerUser();
        await addTodo();
    });

    it("should return, user token not found", async()=>{
        const response=await request(app).delete(`/deleteTodo/${todoId}`);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User token not found");
    });

    it("should return, user not found", async()=>{
        await mongoose.connection.db.collection("users").deleteOne({ username: "test" });

        const response=await request(app).delete(`/deleteTodo/${todoId}`).set("Cookie", cookie);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User not found");
    });

    it("should return, todo not found", async()=>{
        todoId="64a7fabe6c82f8bd12345678"

        const response=await request(app).delete(`/deleteTodo/${todoId}`).set("Cookie", cookie);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Todo not found");
    });

    it("should return, todo deleted succesfully", async()=>{
        const response=await request(app).delete(`/deleteTodo/${todoId}`).set("Cookie", cookie);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Todo deleted successfully");
    });
});

describe("fetch trash", ()=>{
    let cookie;

    const registerUser=async()=>{
        const response=await request(app).post("/registerUser").send({
            username: "test",
            email: "test@gmail.com",
            password: "test"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User created successfully");
        cookie=response.headers["set-cookie"];
        expect(cookie).toBeDefined();
    };

    beforeEach(async()=>{
        await mongoose.connection.db.collection("users").deleteMany({});
        await mongoose.connection.db.collection("todos").deleteMany({});
        await registerUser();
    });

    it("should return, user token not found", async()=>{
        const response=await request(app).get("/getTrash");
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User token not found");
    });

    it("should return, user not found", async()=>{
        await mongoose.connection.db.collection("users").deleteOne({ username: "test" });

        const response=await request(app).get("/getTrash").set("Cookie", cookie);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User not found");
    });

    it("should return, trash fetched successfully", async()=>{
        const response=await request(app).get("/getTrash").set("Cookie", cookie);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Trash items fetched successfully");
    });
});

describe("delete trash", ()=>{
    let cookie, todoId, trashId;

    const registerUser=async()=>{
        const response=await request(app).post("/registerUser").send({
            username: "test",
            email: "test@gmail.com",
            password: "test"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User created successfully");
        cookie=response.headers["set-cookie"];
        expect(cookie).toBeDefined();
    };

    const addTodo=async()=>{
        const response=await request(app).post("/addTodo").set("Cookie", cookie).send({
            item: "test todo"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Item added to todos");
        todoId=response.body.item._id;
        expect(todoId).toBeDefined();
    };

    const deleteTodo=async()=>{
        const response=await request(app).delete(`/deleteTodo/${todoId}`).set("Cookie", cookie);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Todo deleted successfully");
        trashId=response.body.item._id;
        expect(trashId).toBeDefined();
    };

    beforeEach(async()=>{
        await mongoose.connection.db.collection("users").deleteMany({});
        await mongoose.connection.db.collection("todos").deleteMany({});
        await registerUser();
        await addTodo();
        await deleteTodo();
    });

    it("should return, user token not found", async()=>{
        const response=await request(app).delete(`/deleteTrashItem/${trashId}`);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User token not found");
    });

    it("should return, user not found", async()=>{
        await mongoose.connection.db.collection("users").deleteOne({ username: "test" });

        const response=await request(app).delete(`/deleteTrashItem/${trashId}`).set("Cookie", cookie);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User not found");
    });

    it("should return, todo not found", async()=>{
        trashId="64a7fabe6c82f8bd12345678";

        const response=await request(app).delete(`/deleteTrashItem/${trashId}`).set("Cookie", cookie);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Todo not found in trash");
    });

    it("should return, todo deleted from trash", async()=>{
        const response=await request(app).delete(`/deleteTrashItem/${trashId}`).set("Cookie", cookie);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Todo deleted from the trash");
    });
});

describe("recover todo from trash", ()=>{
    let cookie, todoId, trashId;

    const registerUser=async()=>{
        const response=await request(app).post("/registerUser").send({
            username: "test",
            email: "test@gmail.com",
            password: "test"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User created successfully");
        cookie=response.headers["set-cookie"];
        expect(cookie).toBeDefined();
    };

    const addTodo=async()=>{
        const response=await request(app).post("/addTodo").set("Cookie", cookie).send({
            item: "test todo"
        });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Item added to todos");
        todoId=response.body.item._id;
        expect(todoId).toBeDefined();
    };

    const deleteTodo=async()=>{
        const response=await request(app).delete(`/deleteTodo/${todoId}`).set("Cookie", cookie);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Todo deleted successfully");
        trashId=response.body.item._id;
        expect(trashId).toBeDefined();
    }

    beforeEach(async()=>{
        await mongoose.connection.db.collection("users").deleteMany({});
        await mongoose.connection.db.collection("todos").deleteMany({});
        await registerUser();
        await addTodo();
        await deleteTodo();
    });

    it("should return, user token not found", async()=>{
        const response=await request(app).patch(`/recoverTodo/${trashId}`);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User token not found");
    });

    it("should return, user not found", async()=>{
        await mongoose.connection.db.collection("users").deleteOne({ username: "test" });

        const response=await request(app).patch(`/recoverTodo/${trashId}`).set("Cookie", cookie);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User not found");

    });

    it("should return, todo not found", async()=>{
        trashId="64a7fabe6c82f8bd12345678"

        const response=await request(app).patch(`/recoverTodo/${trashId}`).set("Cookie", cookie);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Todo not found in trash");
    });

    it("should return, todo recovered from trash", async()=>{
        const response=await request(app).patch(`/recoverTodo/${trashId}`).set("Cookie", cookie);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Todo recovered successfully");
    });
});