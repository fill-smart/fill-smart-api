import io from "socket.io";

export enum ChannelsEnum {
    Sql = "sql"
}

let storedSocket: io.Server | null = null;

export const setServerSocket = (socket: io.Server) => {
    storedSocket = socket;
};

export interface IOSender {
    send: (channel: ChannelsEnum, message: any) => void;
}

export const SocketIo: IOSender = {
    send: (channel: ChannelsEnum, message: any) => {
        if (storedSocket) {
            storedSocket.emit(channel, message);
        }
    }
};
