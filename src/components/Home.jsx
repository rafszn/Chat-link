import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { PiLinkBold } from "react-icons/pi";
import OverLay from "./OverLay";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ring2 } from "ldrs";

ring2.register();

export default function Home() {
  const [show, setShow] = useState(false);
  const {
    mutate: generateFn,
    data,
    isPending,
  } = useMutation({
    mutationFn: async () => {
      try {
        const response = await axios(
          `${import.meta.env.VITE_API_URL}/create-chat`,
        );
        return response.data;
      } catch (e) {
        console.log(e.message);
        return null;
      }
    },
    onSuccess: () => {
      setShow(true);
    },
    onError: (error) => {
      console.error("Error generating chat link:", error.message);
      setShow(false);
    },
  });

  return (
    <div className="flex-1 home">
      <div className="chatlink-wrapper">
        <div className="chatlink">
          <PiLinkBold size={25} color="yellow" />
          <p className="link">Link-chat</p>
        </div>
      </div>

      <div className="slogan-wrapper">
        <p className="slogan">Create, Share, and Chat Instantly</p>
        <p className="base">
          Private Conversations, easily shared and instantly connected
        </p>
      </div>

      <div className="image-wrapper">
        <img src="/chat.png" className="chatimg" alt="" />
      </div>

      <button onClick={generateFn} className="btn">
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
          "Generate Chat Link"
        )}
      </button>
      <AnimatePresence>
        {show && <OverLay show={setShow} link={data.link} />}
      </AnimatePresence>
    </div>
  );
}
