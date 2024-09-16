import { Zoom } from "react-toastify";

export const handleTabFocus = (socket, tabId) => {
  const activeTabId = localStorage.getItem("activeTab");

  if (activeTabId === String(tabId)) {
    if (!socket.connected) {
      socket.connect();
      console.log("Socket reconnected in this tab.");
    }
  }
};

export const startRecording = async (
  mediaStreamRef,
  mediaRecorderRef,
  dispatch,
) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      dispatch({
        type: "START_RECORD",
        audioBlob: event.data,
        audioUrl: URL.createObjectURL(event.data),
      });
    };
    mediaRecorderRef.current.start();
    dispatch({ type: "SET_IS_RECORDING", isRecording: true });
  } catch (error) {
    console.error("Error accessing the microphone", error);
  }
};

export const toastOptions = {
  position: "top-left",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Zoom,
};

export const stopRecording = (mediaRecorderRef, mediaStreamRef, dispatch) => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop();
    dispatch({ type: "STOP_RECORD", isRecording: false });
  }
  if (mediaStreamRef.current) {
    mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }
};
