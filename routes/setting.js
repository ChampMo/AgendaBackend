import express from 'express';
import session from 'express-session'
import multer from 'multer';
import { supabase, upLoadPROFILE, upLoadWORKSPACEIMG } from '../supabaseClient.js';
import { User, UserWorkspace, Workspace, Task, ShareRequest, RoleTask, RoleUser, Role } from './model/schema.js';
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.get("/api/profileInfo/", async (req, res) => {
    try {
        console.log(req.session.userId, "req.session.userId")
        const result = await User.findOne({user_id:req.session.userId});

        return res.json({
            userInfo:result,
            massage: "Send userInfo Successfully!",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/api/addrole/", async (req,res)=>{
    try{
        console.log(req.session.userId, "req.session.userId")
        const { workspace_id, role_name, color } = req.body;
        const role_id = await Role.findOne().sort({ role_id:-1 }).limit(1); 
        const result = await Role.create({role_id:role_id === null ? 0 : role_id.role_id + 1, workspace_id, role_name, color});
        return res.json({ result , massage: "Add Role successfully!"});
    }
    catch(error){
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.post("/api/getrole", async (req,res)=>{
    try{
        const { workspace_id } = req.body;
        const role = await Role.find({workspace_id});
        return res.json({ role , massage: "Send Role successfully!"});
    }
    catch(error){
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})


router.delete("/api/deleterole", async (req, res) => {
    try {
        const { role_id } = req.body;

        if (!role_id) {
            return res.status(400).json({ error: "Role ID is required" });
        }

        const result = await Role.deleteOne({ role_id: role_id });
        await RoleTask.deleteMany({ role_id: role_id });
        await RoleUser.deleteMany({ role_id: role_id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Role not found" });
        }

        return res.json({ message: "Role deleted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// upload profile user
router.post("/api/upload/profile", upload.single('profile'), async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
        }



        const file = req.file;
        console.log(file, "file")
        if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
        }

        const buffer = file.buffer;
        const fileName = file.originalname;

        const imageUrl = await upLoadPROFILE(buffer, userId, fileName);
        console.log('imageUrl',imageUrl)
        
        const updated = await User.findOne(
            { user_id: userId }
        );
        updated.picture = imageUrl;
        const updatedUser = await updated.save();
    
        return res.json({
            userInfo: updatedUser,
            message: "Image uploaded and profile updated successfully!"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// upload profile workspace
router.post("/api/upload/workspace", upload.single('workspace_icon'), async (req, res) => {
    try {
        const workspace_id = parseInt(req.body.workspace_id);

        if (!workspace_id) {
            return res.status(400).json({ error: "Workspace ID is required" });
        }

        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const buffer = file.buffer;
        const fileName = file.originalname;

        const imageUrl = await upLoadWORKSPACEIMG(buffer, workspace_id, fileName);
        console.log('imageUrl',imageUrl)
        
        const updated = await Workspace.findOne(
            { workspace_id: workspace_id }
        );
        updated.workspace_icon = imageUrl;
        const updatedUser = await updated.save();
    
        return res.json({
            userInfo: updatedUser,
            message: "Image uploaded and profile updated successfully!"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// get workspace info
router.post("/api/workspaceinfo", async (req, res) => {
    try {
        const { workspace_id } = req.body;
        const result = await Workspace.findOne({workspace_id});
        const task = await Task.find({workspace_id});
        const role = await Role.find({workspace_id});
        return res.json({
            workspaceInfo:result,
            taskInfo:task,
            roleInfo:role,
            massage: "Send workspaceInfo Successfully!",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// update user name
router.put("/api/update/username", async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findOne({ user_id: req.session.userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.username = username;
        await user.save();
        res.json({ message: 'Update successfully!', username: username});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//Send Email
router.post("/api/sendemail", async (req, res) => {
    const { emailUser, workspace_id } = req.body;
    const date = Date.now();
    console.log(req.body)
    try{
        const request = await ShareRequest.findOne({ 
            req_user_id: req.session.userId, 
            user_id: emailUser,
            workspace_id,
            status: "pending"
        });
        if (request){
            return res.json({ request, message: "User already send request" });
        }

        const result = await ShareRequest.create({ 
            req_user_id: req.session.userId, 
            user_id: emailUser,
            workspace_id, 
            status: "pending", 
            date_request: date});
        res.json({ result, message: 'Share successfully!'});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//search email
router.post("/api/searchemail", async (req, res) => {
    const { email, workspace_id } = req.body;
    try{


        const user = await User.findOne({ email: email });
        if (!user){
            return res.json({ message: "User not found" });
        }
        
        const request = await ShareRequest.findOne({ 
            req_user_id: req.session.userId, 
            user_id: user.user_id,
            workspace_id,
            status: "pending"
        });
        if (request){
            return res.json({ user, message: "User already send request" });
        }
        res.json({ user, message: 'Search successfully!'});


    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//get user info
router.post("/api/workspace/user", async (req, res) => {
    try {
        const { workspace_id } = req.body;
        const userWorkspace = await UserWorkspace.find({ workspace_id: workspace_id });
        const userInfo = [];
        for (let i = 0; i < userWorkspace.length; i++) {
            const user = await User.findOne({ user_id: userWorkspace[i].user_id });
            userInfo.push(user);
        }

        return res.json({
            userInfo: userInfo,
            massage: "Send userInfo for workspace Successfully!",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//get role user
router.post("/api/workspace/user/role", async (req, res) => {
    try {
        const { workspace_id, user_id } = req.body;

        // Find all roles in the workspace
        const roleWork = await Role.find({ workspace_id });

        // Find all roles for the user
        const roleUser = await RoleUser.find({ user_id });

        // Fetch role information for each roleUser
        const role = await Promise.all(
            roleUser.map(async (roleUserItem) => {
                return await Role.findOne({ role_id: roleUserItem.role_id });
            })
        );

        // Filter roles that exist in both roleWork and role
        const roleUserWork = roleWork.filter((roleWorkItem) => {
            return role.some(roleItem => roleItem.role_id === roleWorkItem.role_id);
        });

        return res.json({
            userInfo: { role_id: roleUserWork },
            message: "Send Role User Successfully!",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.post("/api/workspace/user/roleadd", async (req, res) => {
    try {
        const { user_id, workspace_id, role_id } = req.body;
        console.log(req.body)
        const result = await Role.find({ workspace_id });
        const roleWork = result.map(role => role.role_id);

        const roleUser = await RoleUser.find({ role_id:roleWork, user_id });
        const roleUserWork = roleUser.map(role => role.role_id);
        console.log(roleUser)

        
        for (let i = 0; i < roleUser.length; i++) {
            await RoleUser.deleteOne({ role_id: roleUser[i].role_id, user_id });
        }

        let results = [];
        for (let i = 0; i < role_id.length; i++) {
            const result = await RoleUser.create({ user_id, role_id: role_id[i] });
            results.push(result);
        }

        res.json({ results, message: 'Add Role User successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/api/workspace/exit", async (req, res) => {
    try {
        const { workspace_id } = req.body;
        const { userId } = req.session; // Assume userId is stored in session

        // Find roles associated with the workspace
        const roles = await Role.find({ workspace_id });
        const roleIds = roles.map(role => role.role_id);

        // Delete UserWorkspace entries for the current user
        await UserWorkspace.deleteMany({ user_id: userId, workspace_id : workspace_id});

        // Delete RoleUser entries where role_id is in roleIds and user_id matches the current user
        const resultDeleteRoleUser = await RoleUser.deleteMany({ role_id: { $in: roleIds }, user_id: userId });

        res.json({ resultDeleteRoleUser, message: 'Exit Workspace successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



export default router;