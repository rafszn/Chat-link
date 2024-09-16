import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOptions } from "../utils";

const useTabManager = (tabId, socket, handleTabFocus) => {
  const navigate = useNavigate();

  useEffect(() => {
    const setActiveTab = () => {
      localStorage.setItem("activeTab", String(tabId));
      handleTabFocus(socket, tabId);
    };

    const handleStorageEvent = (event) => {
      if (event.key === "activeTab" && event.newValue !== String(tabId)) {
        if (socket.connected) {
          socket.disconnect();
          toast.error("Chatroom is opened in another tab", toastOptions);
          setTimeout(() => {
            navigate("/");
          }, 3200);
          console.log(
            "Socket disconnected in this tab due to another tab being active.",
          );
        }
      }
    };
    window.addEventListener("focus", setActiveTab);
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("focus", setActiveTab);
      window.removeEventListener("storage", handleStorageEvent);
      socket.disconnect();
    };
  }, [tabId, socket, handleTabFocus, navigate]);
};

export default useTabManager;
