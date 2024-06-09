import mongoose from 'mongoose';
const Schema = mongoose.Schema;



const UserSchema = new Schema({
    user_id:Number,
    username:String,
    email:String,
    password:String,
    picture:String
});

const UserWorkspaceSchema = new Schema({
    user_id:Number,
    workspace_id:Number,
    Date_time:Date,
    order_number: Number
});

const WorkspaceSchema = new Schema({
    workspace_id:Number,
    workspace_name:String,
    workspace_icon:String,
    workspace_create_date:Date
});

const TaskSchema = new Schema({
    task_id:Number,
    workspace_id:Number,
    task_name:String,
    task_create_date:Date,
    note:String,
    task_due_date:Date,
    status_task:String
});

const ShareRequestSchema = new Schema({
    req_user_id:Number,
    user_id:Number,
    workspace_id:Number,
    status:String,
    date_request:Date
});

const RoleTaskSchema = new Schema({
    role_id:Number,
    task_id:Number
});

const RoleUserSchema = new Schema({
    role_id:Number,
    user_id:Number
});

const RoleSchema = new Schema({
    role_id:Number,
    workspace_id:Number,
    role_name:String,
    color:String
});



const User = mongoose.model('User', UserSchema);
const UserWorkspace = mongoose.model('UserWorkspace', UserWorkspaceSchema);
const Workspace = mongoose.model('Workspace', WorkspaceSchema);
const Task = mongoose.model('Task', TaskSchema);
const ShareRequest = mongoose.model('ShareRequest', ShareRequestSchema);
const RoleTask = mongoose.model('RoleTask', RoleTaskSchema);
const RoleUser = mongoose.model('RoleUser', RoleUserSchema);
const Role = mongoose.model('Role', RoleSchema);

export { User, UserWorkspace, Workspace, Task, ShareRequest, RoleTask, RoleUser, Role }; 





















