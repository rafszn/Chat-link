import { useRef, useEffect, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { FaRegCirclePlay } from "react-icons/fa6";
import { FaPauseCircle } from "react-icons/fa";

function AudioPlayer({ url, current }) {
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "rgb(222, 222, 222)",
      height: 25,
      width: 200,
      progressColor: "grey",
      url: url,
      barGap: 2,
      barRadius: 20,
      barWidth: 4,
      dragToSeek: true,
      cursorWidth: 0,
      normalize: true,
    });
    // audioRef.current.load(url);
    audioRef.current.on("play", () => setIsPlaying(true));
    audioRef.current.on("pause", () => setIsPlaying(false));
    return () => {
      audioRef.current.destroy();
    };
  }, []);

  return (
    <div
      className={
        current
          ? ` audio-wrapper flex-row-reverse bg-[#1b1c1d]`
          : ` audio-wrapper bg-white`
      }
    >
      <div ref={waveformRef} />
      <button>
        {isPlaying ? (
          <FaPauseCircle
            color={current ? "white" : "black"}
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause();
              }
            }}
          />
        ) : (
          <FaRegCirclePlay
            color={current ? "white" : "black"}
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.play();
              }
            }}
          />
        )}
      </button>
    </div>
  );
}
export default AudioPlayer;
