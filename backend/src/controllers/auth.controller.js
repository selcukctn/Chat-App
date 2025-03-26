import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import bycript from 'bcryptjs';
import { generateToken } from '../lib/utils.js';

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;
    try {
        if(password.lenght < 6){
            return res.status(400).json({message:"Password must be at least 6 characters"})
        }

        const user = await User.findOne({email})
        if(user){
            return res.status(400).json({message:"Email already exist"})
        }

        const salt = bcrypt.genSalt(10);
        const hashedPassword = bycript.hash(password,salt);

        const newUser = new User({
            email:email,
            password:hashedPassword,
            fullName:fullName
        })

        if(newUser){
            generateToken(newUser._id,res);
            await newUser.save();
            return res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic: newUser.profilePic
            })
        }else {
            return res.status(400).json({message:"Invalid user data"})
        }
        
    } catch (error) {
        console.log("Signup controller error: ",error);
        return res.status(500).json({message:"Internal Server Error!!!"})
    }
}

export const login = (req, res) => {
    res.send("login route")
}

export const logout = (req, res) => {
    res.send("logout route")
}