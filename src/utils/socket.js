import { Server } from "socket.io";




const initializeSocket = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173"
        }
    });

    io.on("connection", (socket) => {

    });

}


export default initializeSocket;
