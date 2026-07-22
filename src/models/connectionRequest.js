import mongoose from "mongoose"


const connectionRequestSchema = new mongoose.Schema({

    fromUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // reference to the user collection
        required: true
    },
    toUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignored","interested","accepted","rejected"],
            message:`{VALUE} is incorrect status type`
        }
    }

},
{ timestamps: true }
);

connectionRequestSchema.pre("save", function(){
    const connectionRequest = this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error("Cannot send connection request to yourself");
    };
});

//why document middleware do not use next()👇

// connectionRequestSchema.pre("save", function(next){
//     const connectionRequest = this;
//     if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
//         throw new Error("Cannot send connection request to yourself");
//     }
//     next();
// });

// should normally work in older Mongoose versions.

// However, you're using Node.js v24 and likely Mongoose 8, where document middleware is promise-based by default. In this case, next is not passed, so next is undefined, and calling:


const ConnectionRequest = new mongoose.model(
    "connectionRequest", 
    connectionRequestSchema
);

export default ConnectionRequest;