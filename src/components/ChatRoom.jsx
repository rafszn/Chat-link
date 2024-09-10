import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { BsSend } from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa6";
import { IoMdDownload } from "react-icons/io";
import { PiLinkBold } from "react-icons/pi";
import { IoMdAttach } from "react-icons/io";
import { IoDocumentAttachSharp } from "react-icons/io5";
import { ring2 } from "ldrs";
import { ToastContainer, Zoom, toast } from "react-toastify";

ring2.register();

// Default values shown

import { FaTimes } from "react-icons/fa";

import axios from "axios";

const socket = io("http://localhost:3330", { transports: ["websocket"] });

function ChatRoom() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const lastMessageRef = useRef(null);
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isNameSet) {
      socket.emit("join-room", { roomId, name });

      socket.on("chat-history", (messages) => setMessages(messages));
      socket.on("chat-message", (messages) => setMessages(messages));
      socket.on("user-joined", (notification) => {
        setNotifications((prev) => [...prev, notification.message]);
        toast.info(notification.message, {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Zoom,
        });
      });
      socket.on("user-left", (notification) => {
        setNotifications((prev) => [...prev, notification.message]);
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
  }, [roomId, isNameSet, name]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, lastMessageRef]);

  const sendMessage = async () => {
    if (input.trim() || file) {
      let fileUrl = "";
      setIsLoading(true);

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "your_upload_preset");

        try {
          const { data } = await axios.post(
            "http://localhost:3330/upload",
            formData,
          );
          fileUrl = data.url;
        } catch (error) {
          console.error("Error uploading file:", error);
        } finally {
          setFile(null);
          setFilePreview("");
          setIsLoading(false);
        }
      }
      const message = { roomId, message: input, name, file: fileUrl };
      socket.emit("chat-message", message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setInput("");
      setFile(null);
      setFilePreview("");
      setIsLoading(false);
    }
  };

  const handleNameSubmit = () => {
    if (name.length > 3) {
      setIsNameSet(true);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  return (
    <div className="chatroom">
      <div className="top-wrapper">
        <div className="top">
          <div className="svg">
            <PiLinkBold size={30} color="yellow" />
          </div>
          <div>
            <p className="chat">Chat Room</p>
            {roomId}
          </div>
        </div>
      </div>
      {!isNameSet ? (
        <div className="name-input">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
          <button className="join" onClick={handleNameSubmit}>
            Join Chat
          </button>
        </div>
      ) : (
        <div className="inview">
          {/* <div className="notifications">
            {notifications.map((note, index) => (
              <div key={index} className="notification">
                {note}
              </div>
            ))}
          </div> */}

          <div className="messages">
            {messages
              .filter((obj) => {
                const keys = Object.keys(obj);
                const hasNumericKey = keys.some((key) => !isNaN(key));
                return !hasNumericKey;
              })
              .map((msg, index) => (
                <div
                  className={
                    name === msg.name ? "self-end flex flex-col" : "self-start"
                  }
                  key={index}
                  ref={lastMessageRef}
                >
                  {msg.message && (
                    <p className={name === msg.name ? "me" : "others"}>
                      {msg.message}
                    </p>
                  )}
                  {msg.file && msg.file.includes("/image") && (
                    <div
                      className={
                        name === msg.name
                          ? ` imageside align-right`
                          : ` imageside align-left`
                      }
                    >
                      <a href={msg.file} target="_blank">
                        <img className="" src={msg.file}></img>
                      </a>
                    </div>
                  )}
                  {msg.file && msg.file.includes("/raw") && (
                    <a
                      href={msg.file}
                      download
                      target="_blank"
                      className="px-4 py-2 bg-gray-200 rounded-xl flex items-center justify-between"
                    >
                      <FaFilePdf size={20} color="gray" />
                      <IoMdDownload size={20} color="gray" />
                    </a>
                  )}
                  <i className="self-end text-gray-400 mr-2 text-[0.8rem]">
                    {msg.name}
                  </i>
                </div>
              ))}
          </div>

          <div className="inputs">
            <div className="input-wrapper">
              <label htmlFor="file" style={{ cursor: "pointer" }}>
                <div>
                  <IoMdAttach size={20} />
                </div>
              </label>
              <input
                className="text"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
              />
              <input
                id="file"
                className="file"
                type="file"
                onChange={handleFileChange}
              />
              <button onClick={sendMessage} disabled={loading}>
                {loading ? (
                  <l-ring-2
                    size="20"
                    stroke="5"
                    stroke-length="0.25"
                    bg-opacity="0.1"
                    speed="1"
                    color="black"
                  ></l-ring-2>
                ) : (
                  <BsSend />
                )}
              </button>
            </div>
          </div>
          {filePreview && (
            <div>
              {file.type.includes("application/") ? (
                <div className="attachment-file">
                  <div className="attachment-inner">
                    <p>Document</p>
                    <IoDocumentAttachSharp />
                    <FaTimes
                      color="red"
                      className="cancel"
                      size={10}
                      onClick={() => {
                        setFile(null);
                        setFilePreview("");
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="attachment">
                  <div className="attachment-inner">
                    <img
                      src={filePreview}
                      alt="file preview"
                      className="max-w-xs"
                    />
                    <FaTimes
                      color="red"
                      className="cancel"
                      size={10}
                      onClick={() => {
                        setFile(null);
                        setFilePreview("");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition:Bounce
      />
    </div>
  );
}

export default ChatRoom;
