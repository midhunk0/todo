// @ts-nocheck
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import express, { response } from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { addTodo, deleteUser, loginUser, logoutUser, registerUser } from "./controller";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();
const app=express();
app.use(express.json());
app.post("/registerUser", registerUser);
app.post("/loginUser", loginUser);
app.post("/logoutUser", logoutUser);
app.delete("/deleteUser", deleteUser);
app.post("/addTodo", addTodo);

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
    it("should return, all the fields are required", async()=>{
        const testCases=[
            { username: "", email: "temp@gmail.com", password: "temp" },
            { username: "temp", email: "", password: "temp" },
            { username: "temp", email: "temp@gmail.com", password: "" }
        ];

        for(const testCase of testCases){
            const response=await request(app).post("/registerUser").send(testCase); 
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("All fields are required");
        }
    });

    it("should return, the username already exists", async()=>{
        await mongoose.connection.db.collection("users").insertOne({
            username: "temp",
            email: "temp@gmail.com",
            password: "temp"
        });

        const response=await request(app).post("/registerUser").send({
            username: "temp",
            email: "temp1@gmail.com",
            password: "temp1"
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Username already exists")
    });

    it("should return, the email is already in use", async()=>{
        await mongoose.connection.db.collection("users").insertOne({
            username: "temp",
            email: "temp@gmail.com",
            password: "temp"
        });

        const respose=await request(app).post("/registerUser").send({
            username: "temp1",
            email: "temp@gmail.com",
            password: "temp1"
        });

        expect(respose.status).toBe(400);
        expect(respose.body.message).toBe("Email is already in use");
    });

    // it("should return, server error", async()=>{
    //     const response=await request(app).post("/registerUser").send({
    //         username: "temp",
    //         email: "temp@gmail.com",
    //         password: "temp"
    //     });

    //     expect(response.status).toBe(500);
    //     expect(response.body.message).toBe("Server error");
    // });

    it("should return registration successfull", async()=>{
        const response=await request(app).post("/registerUser").send({
            username: "temp",
            email: "temp@gmail.com",
            password: "temp"
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User created successfully");
    });
});

describe("user login", ()=>{
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
        await mongoose.connection.db.collection("users").insertOne({
            username: "test",
            email: "test@gmail.com",
            password: "test"
        });

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
        await mongoose.connection.db.collection("users").insertOne({
            username: "test",
            email: "test@gmail.com",
            password: "test"
        });

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
        const hashedPassword = await bcrypt.hash("test", 10);
        await mongoose.connection.db.collection("users").insertOne({
            username: "test",
            email: "test@gmail.com",
            password: hashedPassword
        });

        const testCases=[
            { credential: "test", password: "test" },
            { credential: "test@gmail.com", password: "test" }
        ];

        for(const testCase of testCases){
            const response=await request(app).post("/loginUser").send(testCase);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Login successful");
        }
    });
});

describe("logout user", ()=>{
    it("should return logout successful", async()=>{
        const response=await request(app).post("/logoutUser").send();
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Logout successful");
    });
});

// describe("delete user", ()=>{
    
// });

// describe("add todo", ()=>{

// });