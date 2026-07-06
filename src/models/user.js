import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true,
        minLength: 4

    },

    lastName: {
        type: String
    },

    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email adress: "+ value);
            }
        }
    },

    password: {
        type: String,
        required: true
    },

    age: {
        type: Number,
        min: 18
    },

    gender: {
        type: String,
        validate(value) {
            if (!["male", "female", "others"].includes(value)) {
                throw new Error("Gender data is not valid");
            }
        }
    },

    photoUrl: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHmRJcY-hkXF7uiVCpFDBqSfy8KqRds_5R_iU97bIiOg&s=10",
        validate(value){
            if (!validator.isURL(value)) {
                throw new Error("Invalid photo URL: "+ value);
            }
        }
    },

    about: {
        type: String,
        default: "This is a default about of the user!"
    },

    skills: {
        type: [String]
    },
},
    {
        timestamps: true
    }
)

const User = mongoose.model("User", userSchema);

export default User;