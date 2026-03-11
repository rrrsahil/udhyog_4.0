import React, { useEffect, useState } from "react";

const ScrollTopButton = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    show && (
      <button className="scroll-top-btn" onClick={scrollTop}>
        <i className="fas fa-arrow-up"></i>
      </button>
    )
  );
};

export default ScrollTopButton;