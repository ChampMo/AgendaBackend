import express from 'express';
import session from 'express-session'
import { supabase } from '../supabaseClient.js';

import { User, UserWorkspace, Workspace, Task, ShareRequest, RoleTask, RoleUser, Role } from './model/schema.js';


const router = express.Router();


// create workspace
router.get("/api/create/workspace/", async (req, res) => {
    try {
        console.log(req.session.userId, "req.session.userId");
        let lastId = await Workspace.findOne()
            .sort({ workspace_id: -1 })
            .limit(1);
        let nextId
        if(lastId === null){
            nextId = 0;
        }else{
            nextId = parseInt(lastId.workspace_id) + 1;
        }
        

        Workspace.create([
            { workspace_id: nextId, workspace_name: 'Workspace Name', workspace_icon: '', workspace_create_date: new Date()},
        ]);

        const workspace = await UserWorkspace.findOne({user_id:req.session.userId}).sort({ order_number: -1 }).limit(1);

        UserWorkspace.create([
            { user_id:req.session.userId, workspace_id: nextId, Date_time: new Date(), order_number:workspace === null? 0 : workspace.order_number + 1},
        ]);

        return res.json({
            workspace_id:nextId,
            massage: "Create Workspace Successfully!",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// get all workspace
router.get("/api/allwork/", async (req, res) => {
    try {
        console.log(req.session.userId, "req.session.userId")
        const result = await UserWorkspace.find({user_id:req.session.userId});
        const result2Promises = result.map(item => Workspace.findOne({ workspace_id: item.workspace_id }));
        const result2 = await Promise.all(result2Promises);
        const result3 = result.map((item, index) => {
            return {
                order_number: item.order_number,
                workspace_id: item.workspace_id,
                workspace_name: result2[index].workspace_name,
                workspace_icon: result2[index].workspace_icon,
                workspace_create_date: result2[index].workspace_create_date,
            }
        });
        return res.json({
            allWorkspace:result3,
            massage: "Send Workspace Successfully!",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// update workspace name
router.put("/api/update/workspace_name", async (req, res) => {
    const { workspace_id, workspace_name } = req.body;
    try {
        const workspace = await Workspace.findOne({ workspace_id: workspace_id });
        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }
        workspace.workspace_name = workspace_name;
        await workspace.save();
        res.json({ message: 'Update successfully!', workspace_name: workspace_name});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// invite request workspace
router.get("/api/share_request/", async (req, res) => {
    try {
        console.log(req.session.userId, "req.session.userId");

        const userWorkspaces = await UserWorkspace.find({ user_id: req.session.userId });
        const userWorkspaceIds = userWorkspaces.map(item => item.workspace_id);

        const request = await ShareRequest.find({
            user_id: req.session.userId,
            status: 'pending',
            workspace_id: { $nin: userWorkspaceIds }
        });

        const workspacePromises = request.map(item => Workspace.findOne({ workspace_id: item.workspace_id }));
        const workspace = await Promise.all(workspacePromises);
        const userRequestPromises = request.map(item => User.findOne({ user_id: item.req_user_id }));
        const userRequest = await Promise.all(userRequestPromises);
        const result = request.map((item, index) => {
            return {
                workspace_id: workspace[index].workspace_id,
                workspace_name: workspace[index].workspace_name,
                req_user_id: userRequest[index].user_id,
                req_user_name: userRequest[index].username,
                req_email: userRequest[index].email,
                req_profile: userRequest[index].picture,
                date_request: item.date_request,
            }
        });
        return res.json({
            result:result,
            massage: "Get Share Workspace Successfully!",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// reject workspace
router.put("/api/request_reject/", async (req, res) => {
    try {
        console.log(req.session.userId, "req.session.userId");
        const { workspace_id, req_user_id } = req.body;
        const result = await ShareRequest.findOne({ user_id: req.session.userId, req_user_id: req_user_id, workspace_id: workspace_id, status: 'pending' });
        if(result.length === 0){
            return res.json({
                massage: "No Request!",
            });
        }
        result.status = 'reject';
        await result.save();
        return res.json({
            result:result,
            massage: "Reject Workspace Successfully!",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// accept workspace
router.put("/api/request_accept/", async (req, res) => {
    try {
        console.log(req.session.userId, "req.session.userId");
        const { workspace_id } = req.body;
        const result = await ShareRequest.find({ user_id: req.session.userId, workspace_id: workspace_id, status: 'pending' });
        if(result.length === 0){
            return res.json({
                massage: "No Request!",
            });
        }


        const updatePromises = result.map(result => {
            result.status = 'accept';
            return result.save();
        });
        await Promise.all(updatePromises);

        await UserWorkspace.create({ user_id: req.session.userId, workspace_id: workspace_id, Date_time: new Date() });

        return res.json({
            result:result,
            massage: "Accept Workspace Successfully!",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/api/update/order_number/", async (req, res) => {
    try {
        console.log(req.session.userId, "req.session.userId");
        const { workspaceIds } = req.body;
        const userWorkspaces = await UserWorkspace.find({ user_id: req.session.userId });
        userWorkspaces.map((item, index) => {
            item.order_number = workspaceIds.indexOf(item.workspace_id);
            item.save();
        });
        return res.json({
            massage: "Accept Workspace Successfully!",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


export default router;
