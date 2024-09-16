import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import io from "socket.io-client";
import { motion } from "framer-motion";

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
import useSendMessage from "../hooks/useSendMessage";
import useTabManager from "../hooks/useTabManager";
import useRoomManager from "../hooks/useRoomManager";
import useScrollToBottom from "../hooks/useScrollToBottom";
import { useMutation } from "@tanstack/react-query";
import { sendFile } from "../utils/sendFile";
import { sendAudio } from "../utils/sendAudio";
import getRandomColor from "../utils/randomColor";
waveform.register();
ring2.register();

const socket = io(import.meta.env.VITE_API_URL, { transports: ["websocket"] });

function ChatRoom() {
  const { state, dispatch } = useSendMessage();
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const lastMessageRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const nameColors = {};

  useTabManager(state.tabId, socket, handleTabFocus);
  useRoomManager(socket, roomId, name, isNameSet, setMessages);
  useScrollToBottom(messages, lastMessageRef);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ input, file, audioBlob }) => {
      let fileUrl = "";
      let audioUrl = "";

      if (file) {
        const res = await sendFile(file, socket);
        fileUrl = res.url;
      }

      if (audioBlob) {
        const res = await sendAudio(audioBlob, socket);
        audioUrl = res.url;
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

      return true;
    },
    onSettled: () => {
      dispatch({
        type: "SEND_MESSAGE",
        file: null,
        filePreview: null,
        audioBlob: null,
        audioUrl: null,
        input: "",
      });
    },
  });

  const startRecord = () => {
    startRecording(mediaStreamRef, mediaRecorderRef, dispatch);
  };

  const stopRecord = () => {
    stopRecording(mediaRecorderRef, mediaStreamRef, dispatch);
  };

  const sendMessage = () => {
    if (state.input || state.file || state.audioBlob) {
      mutate({
        input: state.input,
        file: state.file,
        audioBlob: state.audioBlob,
      });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
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
      dispatch({
        type: "HANDLE_FILE_CHANGE",
        file: selectedFile,
        filePreview: URL.createObjectURL(selectedFile),
      });
    }
  };

  return (
    <div className="chatroom">
      <div className="room">
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
                const isLastFromSameSender =
                  index === messages.length - 1 ||
                  messages[index + 1].name !== msg.name;
                if (!nameColors[msg.name]) {
                  nameColors[msg.name] = getRandomColor();
                }
                return (
                  <motion.div
                    initial={{ opacity: 0.5, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
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
                          me
                            ? ` imageside align-right`
                            : ` imageside align-left`
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
                    {isLastFromSameSender && (
                      <i
                        className="self-end text-gray-400 mr-2 text-[0.8rem]"
                        style={{
                          fontWeight: "bold",
                          color: nameColors[msg.name],
                        }}
                      >
                        {msg.name}
                      </i>
                    )}
                  </motion.div>
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
                  value={state.input}
                  onChange={(e) =>
                    dispatch({ type: "SET_INPUT", input: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message"
                />
                <input
                  id="file"
                  className="file"
                  type="file"
                  onChange={handleFileChange}
                />
                <div className="flex items-center justify-center">
                  {state.isRecording && (
                    <l-waveform
                      size="18"
                      stroke="3.5"
                      speed="0.8"
                      color="red"
                    ></l-waveform>
                  )}
                </div>
                <div>
                  {state.isRecording ? (
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
                <button onClick={sendMessage} disabled={isPending}>
                  {isPending ? (
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
            {state.filePreview && (
              <div>
                {state.file.type.includes("application/") ? (
                  <div className="attachment-file">
                    <div className="attachment-inner">
                      <p>Document</p>
                      <IoDocumentAttachSharp />
                      <FaTimes
                        color="red"
                        className="cancel"
                        size={10}
                        onClick={() => {
                          dispatch({
                            type: "SET_FILE_PREVIEW",
                            filePreview: null,
                          });
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="attachment">
                    <div className="attachment-inner">
                      <img
                        src={state.filePreview}
                        alt="file preview"
                        className="max-w-xs"
                      />
                      <FaTimes
                        color="red"
                        className="cancel"
                        size={10}
                        onClick={() => {
                          dispatch({
                            type: "SET_FILE_PREVIEW",
                            filePreview: null,
                          });
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            {state.audioUrl && (
              <div className="attachment-file">
                <div className="attachment-inner">
                  <AudioPlayer url={state.audioUrl} />
                  <FaTimes
                    color="red"
                    className="cancel"
                    size={10}
                    onClick={() => {
                      dispatch({ type: "SET_AUDIO_URL", audioUrl: null });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        <ToastContainer {...toastOptions} />
      </div>
    </div>
  );
}

export default ChatRoom;
