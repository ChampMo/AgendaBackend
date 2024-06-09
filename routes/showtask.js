import express from 'express';
import session from 'express-session'

import { User, UserWorkspace, Workspace, Task, ShareRequest, RoleTask, RoleUser, Role } from './model/schema.js';
const router = express.Router();


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

// router.post("/api/getroletask", async (req,res)=>{
//     try{
//         const { workspace_id } = req.body;
//         const task = await Task.find({workspace_id});
//         const task_id = task.map(task => task.task_id);

//         const roleTask = await RoleTask.find({task_id});
//         const role_id = roleTask.map(roleTask => roleTask.role_id);

//         const role = await Role.find({role_id});

       
//         res.json({task, task_id, role_id, roleTask, role, massage: "Send Task successfully!"});

        
//     }
//     catch(error){
//         console.error(error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// })

router.post("/api/getroletask", async (req, res) => {
    try {
        const { workspace_id } = req.body;

        // Find roles based on workspace_id
        const roles = await Role.find({ workspace_id });
        const roleMap = roles.reduce((map, role) => {
            map[role.role_id] = { role_name: role.role_name, color: role.color }; // Store role_name and color
            return map;
        }, {});

        // Find role tasks based on role_id
        const roleTasks = await RoleTask.find({ role_id: { $in: Object.keys(roleMap) } });

        // Create a map to store task_ids for each role_id
        const roleTasksMap = {};
        roleTasks.forEach(roleTask => {
            if (!roleTasksMap[roleTask.role_id]) {
                roleTasksMap[roleTask.role_id] = [];
            }
            roleTasksMap[roleTask.role_id].push(roleTask.task_id);
        });

        // Fetch task details for each task_id
        const taskDetailsMap = {};
        for (const roleId of Object.keys(roleTasksMap)) {
            const taskIds = roleTasksMap[roleId];
            const tasks = await Task.find({ task_id: { $in: taskIds } });
            taskDetailsMap[roleId] = tasks; // Use role_id as key for now
        }

        // Convert taskDetailsMap to the desired format
        const formattedData = Object.entries(taskDetailsMap).map(([roleId, tasks]) => ({
            roleName: roleMap[roleId].role_name,
            color: roleMap[roleId].color,
            tasks
        }));

        res.json({ formattedData, message: "Send Task successfully!" });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while fetching tasks." });
    }
});

  

router.post("/api/getusertask", async (req,res)=>{
    try {
        const { workspace_id } = req.body;

        // ค้นหา role_ids ที่เกี่ยวข้องกับ user_id จาก RoleUser
        const userRoles = await RoleUser.find({ user_id: req.session.userId });
        if (userRoles.length === 0) {
            return res.status(404).json({ error: "User roles not found" });
        }

        // ดึง role_ids ทั้งหมด
        const roleIds = userRoles.map(roleUser => roleUser.role_id);

        // ค้นหา role_ids ที่ตรงกับ workspace_id จาก Role
        const roles = await Role.find({ workspace_id: workspace_id, role_id: { $in: roleIds } });
        if (roles.length === 0) {
            return res.status(404).json({ error: "Roles not found for the specified workspace_id and user" });
        }

        // ดึง task_ids ทั้งหมดจาก role_ids
        let taskIds = [];
        for (let role of roles) {
            const roleTasks = await RoleTask.find({ role_id: role.role_id });
            taskIds = taskIds.concat(roleTasks.map(rt => rt.task_id));
        }

        // ส่ง task_ids กลับไปยัง frontend
        return res.json({ taskIds, message: "Send My Task successfully!" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.post("/api/getrole/task", async (req,res)=>{
    try{
        const { workspace_id, task_id } = req.body;
        const roleId = await RoleTask.find({task_id});
        console.log(roleId)
        const role = await Role.find({workspace_id, role_id: {$in: roleId.map(item => item.role_id)}});
        return res.json({ role , massage: "Send Role successfully!"});
    }
    catch(error){
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})


export default router;
