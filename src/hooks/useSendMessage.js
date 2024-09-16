import { useReducer } from "react";

const initialState = {
  isRecording: false,
  audioBlob: null,
  audioUrl: null,
  file: null,
  input: "",
  filePreview: null,
  tabId: Date.now(),
};

function reducer(state, payload) {
  switch (payload.type) {
    case "SET_IS_RECORDING":
      return { ...state, isRecording: payload.isRecording };

    case "SET_AUDIO_URL":
      return { ...state, audioUrl: payload.audioUrl };

    case "SET_FILE_PREVIEW":
      return {
        ...state,
        filePreview: payload.filePreview,
      };

    case "START_RECORD":
      return {
        ...state,
        audioUrl: payload.audioUrl,
        audioBlob: payload.audioBlob,
      };

    case "STOP_RECORD":
      return {
        ...state,
        isRecording: payload.isRecording,
      };

    case "SET_FILE":
      return { ...state, file: payload.file };

    case "SET_INPUT":
      return { ...state, input: payload.input };

    case "HANDLE_FILE_CHANGE":
      return { ...state, filePreview: payload.filePreview, file: payload.file };

    case "SEND_MESSAGE":
      return {
        ...state,
        file: payload.file,
        filePreview: payload.filePreview,
        audioBlob: payload.audioBlob,
        audioUrl: payload.audioUrl,
        input: payload.input,
      };

    case "RESET_STATE":
      return initialState;

    default:
      throw new Error("case does not exist");
  }
}

export default function useSendMessage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return { state, dispatch };
}
