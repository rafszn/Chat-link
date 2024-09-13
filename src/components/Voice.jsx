import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState, useRef } from "react";
import { waveform } from "ldrs";

waveform.register();

function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const { data, mutate, isPending } = useMutation({
    mutationFn: async (formdata) => {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/upload`,
          formdata,
        );

        return data;
      } catch (error) {
        console.error("Error starting recording:", error);
        return null;
      }
    },
    onSuccess: (data) => {
      setAudioBlob(null);
      setAudioUrl(data.url);
      console.log(data);
    },
    onError: (error) => {
      console.error("Error starting recording:", error);
    },
  });

  const handleSaveVoiceNote = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "voice_note.webm");
    // formData.append("upload_preset", "your_upload_preset");

    mutate(formData);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        setAudioBlob(event.data);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing the microphone", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleSave = () => {
    if (audioBlob) {
      handleSaveVoiceNote(audioBlob);
    }
  };

  return (
    <>
      {/* <div>
        <button
          className=" bg-black text-white p-2 rounded"
          onClick={startRecording}
          disabled={isRecording}
        >
          {isRecording ? "recording" : "Start Recording"}
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
        <button onClick={handleSave} disabled={!audioBlob}>
          {isPending ? "loading..." : "Save Recording"}
        </button>
      </div> */}

      {/* <div>
        {isRecording ? (
          <button
            className="bg-red-500  text-white p-2 rounded"
            onClick={stopRecording}
            disabled={!isRecording}
          >
            Stop Recording
          </button>
        ) : (
          <button
            className=" bg-black text-white p-2 rounded"
            onClick={startRecording}
            disabled={isRecording}
          >
            start Recording
          </button>
        )}
        {isRecording && (
          <l-waveform
            size="35"
            stroke="3.5"
            speed="1"
            color="black"
          ></l-waveform>
        )}
      </div>

      {audioBlob && (
        <button onClick={handleSave} disabled={!audioBlob}>
          {isPending ? "loading..." : "Save Recording"}
        </button>
      )}

      {data && (
        <div className={`voice-note-right`}>
          <audio controls>
            <source src={data?.url} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )} */}

    </>
  );
}
export default VoiceRecorder;
