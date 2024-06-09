import express from "express";
const router = express.Router();
import mongoose from "mongoose";
import { User, UserWorkspace, Workspace, Task, ShareRequest, RoleTask, RoleUser, Role } from './model/schema.js';

import dotenv from 'dotenv';

dotenv.config();


const nosqlconect = 'mongodb+srv://Champ:1234@agendadb.erxhg96.mongodb.net/Agenda' ;
mongoose.connect(nosqlconect, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.on(
  "error",
  console.error.bind(console, "เกิดข้อผิดพลาดในการเชื่อมต่อ MongoDB:")
);

export default router;
