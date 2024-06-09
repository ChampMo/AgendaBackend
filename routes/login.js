import express from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import session from 'express-session'

import { User, UserWorkspace, Workspace, Task, ShareRequest, RoleTask, RoleUser, Role } from './model/schema.js';

const router = express.Router();

//login
router.post("/api/login/", async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        console.log(user);
        if (user === null) {
        return res.json({
            success: false,
            error: "Invalid username or password",
        });
        }
        console.log(password, user.password);
        const compare_result = await bcrypt.compare(password, user.password);
        console.log(compare_result, "compare_result");
        if (compare_result) {
        req.session.isLoggedIn = true;
        req.session.userId = user.user_id;
        console.log(req.session.isLoggedIn, "----", req.session.userId, "----");
        return res.json({ success: true, massage: "Login successfully!"});
        } else {
        return res.json({
            success: false,
            error: "Invalid username or password",
        });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//register
router.post("/api/signup", async (req, res) => {
    const { email, password } = req.body;
    console.log(req.session.isLoggedIn, "--dwwwwwwwwwwwwwwwwwwwwwwwww--", req.session.userId, "+++");
    try {
        const user = await User.findOne({ email });
        if (user !== null) {
        // อีเมลถูกลงทะเบียนแล้ว
        res.json({ success: false ,massage:"Your account already signup."});
        } else {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // ทำการ insert ข้อมูลลงในฐานข้อมูล

        let maxIdUser = await User.findOne()
            .sort({ user_id: -1 }) // Sort by ID in descending order
            .limit(1); // Limit to 1 document (the highest ID)

        let nextId
        if(maxIdUser === null){
            nextId = 0;
        }else{
            nextId = parseInt(maxIdUser.user_id) + 1;
        }
        console.log('nextId',nextId);
        User.create([
            { user_id: nextId, email: email, username:'', password: hashedPassword, picture:''},
        ]);
        console.log('nextId',nextId);
        console.log("Data inserted successfully");
        res.json({ success: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//logout

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.json({ massage:"Logout successfully!" });

});

router.get("/api/checklogin", async (req, res) => {
    const isLoggedInz = req.session.isLoggedIn;
    console.log(
        req.session.isLoggedIn,
        "----",
        req.session.userId,
        "----",
        req.session.uuu
    );
    if (isLoggedInz) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

router.put("/changepassword", async (req, res) => {
    
    try {
        const {oldPassword, newPassword }= req.body;
        const user = await User.findOne({ user_id: req.session.userId });
        const compare_result = await bcrypt.compare(oldPassword, user.password);
        if (compare_result) {
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            await User.updateOne({ user_id: req.session.userId }, { password: hashedPassword });
            return res.json({ success: true, massage: "Change password successfully!" });
        } else {
            return res.json({ success: false, error: "Invalid old password" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
