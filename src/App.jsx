import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import ChatRoom from "./components/ChatRoom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VoiceRecorder from "./components/Voice";
import AudioPlayer from "./components/AudioPlayer";

export default function App() {
  return (
    <div className="p-4 flex flex-col m-auto min-h-screen app">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition:SLide
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:roomId" element={<ChatRoom />} />
        <Route path="voice" element={<AudioPlayer />} />
      </Routes>
    </div>
  );
}
