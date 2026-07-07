import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

// create token
const createToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET)
}


// login route
const loginUser = async (req,res) => {
    try {
        const {email, password} = req.body

        const user = await userModel.findOne({email})

        if (!user) {
            return res.json({success:false, message:"User does not exist. Signing up."})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.json({success: false, message: "Invalid credentials"})
        }

        const token = createToken(user._id)

        res.json({success:true, token})
    } catch (error) {
        console.log(`Errror in login user ${error}`)       
        res.json({ success: false, message: error.message })
    }
}


// register user
const registerUser = async (req,res) => {
    try {
        const {name, email, password} = req.body
        
        // check user exists
        const exists = await userModel.findOne({email})
        if (exists) {
            return res.json({success:false, message:"User already exists"})
        }

        // validating email format and password
        if (!validator.isEmail(email.trim())) {
            return res.json({success:false, message:"Please enter a valid email"})
        }
        if (password.length<3) {
            return res.json({success:false, message:"Please enter a strong password"})
        }

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()
        
        const token = createToken(user._id)

        res.json({success:true, token})

    } catch (error) {
        console.log(`Error in registeruser ${error}`);
        res.json({success:false, message:error.message})
    }
}

// route for Admin Login
const adminLogin = async (req,res) => {
    try {
        const {email, password} = req.body
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
           const token = jwt.sign(email+password, process.env.JWT_SECRET)
           res.json({success:true, token})
        }else{
            res.json({success:false, message:"Invalid Credentials"})
        }
    } catch (error) {
        console.log(`Errror in admin login user ${error}`)       
        res.json({ success: false, message: error.message })
    }
}


export {loginUser , registerUser, adminLogin}