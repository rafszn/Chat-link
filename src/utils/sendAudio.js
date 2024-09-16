import axios from "axios";

export const sendAudio = async (audioBlob, socket) => {
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

    return data;
  } catch (error) {
    console.error("Error starting recording:", error.message);
    return null;
  }
};
