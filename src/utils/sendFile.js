import axios from "axios";

export const sendFile = async (file, socket) => {
  const formData = new FormData();
  formData.append("file", file);
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
    console.error("Error uploading file:", error.message);
    return null
  }
};
