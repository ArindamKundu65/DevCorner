import { Server } from "socket.io";



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

        socket.on("sendMessage", ( {
            firstName,
            userId,
            targetUserId,
            text
          }) => {
            const roomId = getSecretRoomId(userId, targetUserId)
            console.log(firstName+":"+ " " + text);
            io.to(roomId).emit("messageReceived", { firstName, text });
        });

        socket.on("disconnect", ()=> {
            
        })

    });

}


export default initializeSocket;
