import mongoose from "mongoose";

const loginSchema = new mongoose.Schema({

    email: String,
    password: String,
    loginTime: {
        type: Date,
        default: Date.now
    }

});

const LoginUser =
    mongoose.models.LoginUser ||
    mongoose.model("LoginUser", loginSchema);

export default LoginUser;