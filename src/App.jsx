import { Routes, Route } from "react-router-dom"; 
import Home from "./components/Home";
import ChatRoom from "./components/ChatRoom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toastOptions } from "./utils";

export default function App() {
  return (
    <div className="p-4 flex flex-col m-auto min-h-screen app">
      <ToastContainer {...toastOptions} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:roomId" element={<ChatRoom />} />
      </Routes>
    </div>
  );
}
//JetBrains Mono, 'Cascadia Code'