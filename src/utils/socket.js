import { Server } from "socket.io";




const initializeSocket = (server) => {
    console.log("initializeSocket called");

    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", 
                 "https://devcorner-jqtp.onrender.com"]
        }
    });

    io.on("connection", (socket) => {
        socket.on("joinChat", ({ userId, targetUserId }) => {
            const roomId = [userId, targetUserId].sort().join("_");
            console.log("joining room: " + roomId)
            socket.join(roomId);

        });

        socket.on("sendMessage", () => {

        });

        socket.on("disconnect", ()=> {
            
        })

    });

}


export default initializeSocket;
