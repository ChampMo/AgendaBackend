import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import { User, UserWorkspace, Workspace, Task, ShareRequest, RoleTask, RoleUser, Role } from './schema.js';

const connection = mongoose.connection;
connection.once("open", async () => {
    console.log("MongoDB database connected.");

    try {
        const users = await User.create([
            { user_id: '1', username: 'Champ', email: 'monthol@example.com', password: 'passwordChamp', picture: 'picture1.jpg' },
            { user_id: '2', username: 'Peet', email: 'navapon@example.com', password: 'passwordPeet', picture: 'picture2.jpg' },
        ]);
    
        const workspaces = await Workspace.create([
            { workspace_id: '1', workspace_name: 'Workspace 1', workspace_icon: 'icon1.jpg', workspace_create_date: new Date() },
            { workspace_id: '2', workspace_name: 'Workspace 2', workspace_icon: 'icon2.jpg', workspace_create_date: new Date() },
        ]);
    
        const tasks = await Task.create([
            { task_id: '1', workspace_id: '1', task_name: 'UX', task_create_date: new Date(), note: 'Note for Task UX', task_due_date: new Date(), status_task: 'Pending' },
            { task_id: '2', workspace_id: '2', task_name: 'fontend', task_create_date: new Date(), note: 'Note for Task fontend', task_due_date: new Date(), status_task: 'Pending' },
            { task_id: '3', workspace_id: '1', task_name: 'UI', task_create_date: new Date(), note: 'Note for Task UI', task_due_date: new Date(), status_task: 'Completed' },
            { task_id: '4', workspace_id: '2', task_name: 'backend', task_create_date: new Date(), note: 'Note for Task backend', task_due_date: new Date(), status_task: 'wait' },
        ]);
    
        const roles = await Role.create([
            { role_id: '1', workspace_id: '1', role_name: 'แรงงานdev', color: '#6FFFD4' },
            { role_id: '2', workspace_id: '1', role_name: 'แรงงานเหมือนกันแค่คนละสี', color: '#F4B3CF' },
            { role_id: '3', workspace_id: '2', role_name: 'คนงาน', color: '#6993FF' },
            { role_id: '4', workspace_id: '2', role_name: 'ceo', color: '#8C52FF' },
        ]);
    
        const userWorkspaces = await UserWorkspace.create([
            { user_id: '1', workspace_id: '1', Date_time: new Date(), order_number: 0 },
            { user_id: '2', workspace_id: '1', Date_time: new Date(), order_number: 1 },
            { user_id: '1', workspace_id: '2', Date_time: new Date(), order_number: 1 },
            { user_id: '2', workspace_id: '2', Date_time: new Date(), order_number: 0 },
        ]);

        const ShareRequests = await ShareRequest.create([
            {req_user_id: 1, user_id: 2, workspace_id:1, status: 'pending', date_request: new Date()},
            {req_user_id: 3, user_id: 2, workspace_id:2, status: 'pending', date_request: new Date()},
            {req_user_id: 1, user_id: 3, workspace_id:1, status: 'success', date_request: new Date()},
        ]);
    
        const roleTasks = await RoleTask.create([
            { role_id: '1', task_id: '1' },
            { role_id: '2', task_id: '1'},
            { role_id: '2', task_id: '3'},
            { role_id: '3', task_id: '2' },
            { role_id: '4', task_id: '4'},
        ]);
    
        const roleUsers = await RoleUser.create([
            { role_id: '1', user_id: '1'},
            { role_id: '2', user_id: '2'},
            { role_id: '3', user_id: '1'},
            { role_id: '4', user_id: '2'},
        ]);
        console.log('Sample data added successfully.');
    } catch (error) {
        console.error('Error adding sample data:', error);
    } finally {
        connection.close();
    }
});

export default router;
