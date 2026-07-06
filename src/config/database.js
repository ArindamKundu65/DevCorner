import mongoose from "mongoose";



const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://arindam:arindam@cluster0.jyzmpyr.mongodb.net/DevCorner?appName=Cluster0"
    )
 }



export default connectDB;