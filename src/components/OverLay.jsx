import { AnimatePresence, motion } from "framer-motion";
import { LuCopy } from "react-icons/lu";
import { FaCheck } from "react-icons/fa6";
import { useState } from "react";
import {  ToastContainer } from "react-toastify";

export default function OverLay({ link, show }) {
  const [isCopied, setIsCopied] = useState(false);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  return (
    <motion.div
      className="overlay"
      key="overlay"
      initial={{ y: 1000, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      exit={{ opacity: 0, y: 1000 }}
      onClick={() => {
        show(false);
      }}
    >
      <div
        className="content"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="bar" />
        <p className="share">Share Link</p>

        <div className="link">
          <a href={link} target="_blank">
            <input className="input" type="text" value={link} readOnly />
          </a>
          <button className="copy">
            <LuCopy onClick={copyText} />
          </button>
        </div>

        <AnimatePresence>
          {isCopied && (
            <motion.p
              className="copied"
              key="copied"
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              exit={{ opacity: 0, y: -60 }}
            >
              link copied <FaCheck />
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition:Bounce
      />
    </motion.div>
  );
}
