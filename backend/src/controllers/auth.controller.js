import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { generateToken } from '../lib/utils.js';

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields required!!" })
        }
        if (password.lenght < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "Email already exist" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email: email,
            password: hashedPassword,
            fullName: fullName
        })

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();
            return res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })
        } else {
            return res.status(400).json({ message: "Invalid user data" })
        }

    } catch (error) {
        console.log("Signup controller error: ", error);
        return res.status(500).json({ message: "Internal Server Error!!!" })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        generateToken(user._id, res);
        res.status(200).json({
            _id: user.id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })
    } catch (error) {
        console.log("Auth Controller -> Login Error: ", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logout Successfully"});
    } catch (error) {
        console.log("Auth Controller -> Logout Error: ", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}