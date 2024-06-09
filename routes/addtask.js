import express from 'express';
import session from 'express-session'

import { User, UserWorkspace, Workspace, Task, ShareRequest, RoleTask, RoleUser, Role } from './model/schema.js';
const router = express.Router();


router.post("/api/addtask/", async (req,res)=>{
    try{
        const data = req.body.data
        const workspace_id = req.body.workspace_id;
        const task_name = data.taskname;
        const task_create_date = Date.now();
        const note = data.note;
        const task_due_date = data.duedate?new Date(data.duedate):'';
        const status_task = data.status;
        const role_id = data.role;


        const task_id = await Task.findOne().sort({ task_id:-1 }).limit(1); 
        const result = await Task.create({
            task_id:task_id === null ? 0 : task_id.task_id + 1,
            task_name, 
            task_create_date, 
            note:note?note:'', 
            task_due_date, 
            status_task, 
            workspace_id});
            
        
        for(let i = 0; i < role_id.length; i++){
            await RoleTask.create({task_id:result.task_id, role_id:role_id[i]});
        }
        console.log(result)
        return res.json({ result, massage: "Add Task successfully!" });
    }
    catch(error){
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.put("/api/savetask", async (req,res)=>{
    try{
        const data = req.body.data
        const workspace_id = req.body.workspace_id;
        const task_name = data.taskname;
        const task_create_date = Date.now();
        const note = data.note;
        const task_due_date = data.duedate?new Date(data.duedate):'';
        const status_task = data.status;
        const role_id = data.role;
        const task_id = req.body.task_id;

        await Task.updateOne({
            task_id
        },{
            task_name, 
            task_create_date, 
            note:note?note:'', 
            task_due_date, 
            status_task, 
            workspace_id
        });
            
        await RoleTask.deleteMany({ task_id });
        for(let i = 0; i < role_id.length; i++){
            await RoleTask.create({task_id:task_id, role_id:role_id[i]});
        }
        return res.json({ massage: "Add Task successfully!" });
    }
    catch(error){
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.post("/api/gettask", async (req,res)=>{
    try{
        const { workspace_id } = req.body;
        const task = await Task.find({workspace_id});
        return res.json({ task , massage: "Send Task successfully!"});
    }
    catch(error){
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.delete("/api/deletetask", async (req,res)=>{
    try{
        const { task_id } = req.body;
        await Task.deleteOne({task_id});
        await RoleTask.deleteMany({task_id});
        return res.json({ task_id, massage: "Delete Task successfully!" });
    }
    catch(error){
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

export default router;
