import { useEffect } from "react";

const useScrollToBottom = (messages, lastMessageRef) => {
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, lastMessageRef]);
};

export default useScrollToBottom;
