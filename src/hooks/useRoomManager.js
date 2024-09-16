import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOptions } from "../utils";

const useRoomManager = (socket, roomId, name, isNameSet, setMessages) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isNameSet) {
      socket.emit("join-room", { roomId, name });

      socket.on("error", (error) => {
        toast.error(error.message, toastOptions);
        setTimeout(() => {
          navigate("/");
        }, 3200);
      });

      socket.on("room-deleted", () => {
        toast.info("Room has been deleted due to inactivity.", toastOptions);
        setTimeout(() => {
          navigate("/");
        }, 3200);
      });

      socket.on("chat-history", (messages) => setMessages(messages));
      socket.on("chat-message", (messages) => setMessages(messages));

      socket.on("user-joined", (notification) => {
        toast.info(notification.message, toastOptions);
      });
      socket.on("user-left", (notification) => {
        toast.info(notification.message, toastOptions);
      });

      return () => {
        socket.off("chat-history");
        socket.off("chat-message");
        socket.off("user-joined");
        socket.off("user-left");
      };
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket, roomId, name, isNameSet, navigate]);
};

export default useRoomManager;
