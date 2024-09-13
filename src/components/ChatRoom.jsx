import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import io from "socket.io-client";
import axios from "axios";

import { BsSend } from "react-icons/bs";
import { FaFilePdf, FaCircleStop } from "react-icons/fa6";
import { IoMdDownload, IoMdAttach } from "react-icons/io";
import { PiLinkBold } from "react-icons/pi";
import { IoDocumentAttachSharp } from "react-icons/io5";
import { FaTimes } from "react-icons/fa";
import { AiFillAudio } from "react-icons/ai";

import { ring2 } from "ldrs";
import { waveform } from "ldrs";
import AudioPlayer from "./AudioPlayer";
import {
  handleTabFocus,
  startRecording,
  stopRecording,
  toastOptions,
} from "../utils";

waveform.register();

ring2.register();

const socket = io(import.meta.env.VITE_API_URL, { transports: ["websocket"] });

function ChatRoom() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const lastMessageRef = useRef(null);
  const [loading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [tabId] = useState(() => Date.now());

  useEffect(() => {
    const setActiveTab = () => {
      localStorage.setItem("activeTab", String(tabId));
      handleTabFocus(socket, tabId);
    };

    window.addEventListener("focus", setActiveTab);
    window.addEventListener("storage", (event) => {
      if (event.key === "activeTab" && event.newValue !== String(tabId)) {
        if (socket.connected) {
          socket.disconnect();
          toast.error("chatroom is opened in another tab", toastOptions);
          setTimeout(() => {
            navigate("/");
          }, 3200);
          console.log(
            "Socket disconnected in this tab due to another tab being active.",
          );
        }
      }
    });

    return () => {
      window.removeEventListener("focus", setActiveTab);
      socket.disconnect();
    };
  }, [tabId]);

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
  }, [roomId, isNameSet, name, navigate]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, lastMessageRef]);

  const startRecord = () => {
    startRecording(
      mediaStreamRef,
      mediaRecorderRef,
      setAudioBlob,
      setAudioUrl,
      setIsRecording,
    );
  };

  const stopRecord = () => {
    stopRecording(mediaRecorderRef, mediaStreamRef, setIsRecording);
  };

  const sendMessage = async () => {
    if (input.trim() || file || audioBlob) {
      let fileUrl = "";
      let audioUrl = "";
      setIsLoading(true);

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "your_upload_preset");

        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/upload`,
            formData,
          );
          if (data) {
            socket.emit("upload-media", {
              publicId: data.publicId,
            });
          }

          fileUrl = data.url;
        } catch (error) {
          console.error("Error uploading file:", error);
        } finally {
          setFile(null);
          setFilePreview("");
          setIsLoading(false);
        }
      }

      if (audioBlob) {
        const formData = new FormData();
        formData.append("file", audioBlob, "voice_note.webm");
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/upload`,
            formData,
          );

          if (data) {
            socket.emit("upload-media", {
              publicId: data.publicId,
            });
          }

          audioUrl = data.url;
        } catch (error) {
          console.error("Error starting recording:", error);
        } finally {
          setIsRecording(false);
        }
      }

      const message = {
        roomId,
        message: input,
        name,
        file: fileUrl,
        audio: audioUrl,
      };
      socket.emit("chat-message", message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setInput("");
      setFile(null);
      setFilePreview("");
      setIsLoading(false);
      setAudioBlob(null);
      setAudioUrl("");
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
          <div className="messages">
            {messages.map((msg, index) => {
              const me = name === msg.name;
              return (
                <div
                  className={me ? "self-end flex flex-col" : "self-start"}
                  key={index}
                  ref={lastMessageRef}
                >
                  {msg.message && (
                    <p className={me ? "me" : "others"}>{msg.message}</p>
                  )}
                  {msg.file && msg.file.includes("/image") && (
                    <div
                      className={
                        me ? ` imageside align-right` : ` imageside align-left`
                      }
                    >
                      <a href={msg.file} target="_blank">
                        <img className="" src={msg.file} />
                      </a>
                    </div>
                  )}

                  {msg.audio && msg.audio.includes(".webm") && (
                    <AudioPlayer url={msg.audio} current={me} />
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
              );
            })}
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
              <div className="flex items-center justify-center">
                {isRecording && (
                  <l-waveform
                    size="18"
                    stroke="3.5"
                    speed="0.8"
                    color="red"
                  ></l-waveform>
                )}
              </div>
              <div>
                {isRecording ? (
                  <FaCircleStop
                    size={20}
                    color="red"
                    onClick={stopRecord}
                    className="cursor-pointer"
                  />
                ) : (
                  <AiFillAudio
                    size={20}
                    onClick={startRecord}
                    className="cursor-pointer"
                  />
                )}
              </div>
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
          {audioUrl && (
            <div className="attachment-file">
              <div className="attachment-inner">
                <AudioPlayer url={audioUrl} />
                <FaTimes
                  color="red"
                  className="cancel"
                  size={10}
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioUrl("");
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
      <ToastContainer {...toastOptions} />
    </div>
  );
}

export default ChatRoom;
