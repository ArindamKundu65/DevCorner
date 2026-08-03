import { Server } from "socket.io";
import Chat from "../models/chat.js";
import crypto from "crypto"



const getSecretRoomId = (userId, targetUserId) => {
    crypto.createHash("sha256").update([userId, targetUserId].sort().join("_")).digest("hex");
}


const initializeSocket = (server) => {
    console.log("initializeSocket called");

    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", 
                 "https://devcorner-jqtp.onrender.com"]
        }
    });

    io.on("connection", (socket) => {
        socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
            const roomId = getSecretRoomId(userId, targetUserId)
            console.log(firstName + " joined the room: " + roomId)
            socket.join(roomId);

        });

        socket.on("sendMessage", async( {firstName, lastName, userId, targetUserId, text}) => {
           
            try {
                const roomId = getSecretRoomId(userId, targetUserId)
                console.log(firstName+":"+ " " + text);

                  //Save messages to the database

                let chat = await Chat.findOne({
                    participants: { $all: [userId, targetUserId] }
                })

                if(!chat) {
                    chat = new Chat({
                        participants: [userId, targetUserId],
                        messages: [],
                    })
                }

                chat.messages.push({
                    senderId: userId,
                    text
                })

                await chat.save()
                io.to(roomId).emit("messageReceived", { firstName, lastName, text });
            } catch (error) {
                console.log(error)
            }


          
        });

        socket.on("disconnect", ()=> {
            
        })

    });

}


export default initializeSocket;
