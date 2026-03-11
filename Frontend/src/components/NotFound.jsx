import Lottie from "lottie-react";
import animationData from "./404.json";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={styles.container}>
      <Lottie
        animationData={animationData}
        loop={true}
        style={{ height: 700 }}
      />

      <Link to="/" style={styles.button}>
        <i
          className="fa-solid fa-arrow-left"
          style={{ marginRight: "8px" }}
        ></i>
        Go Back Login
      </Link>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    // background: "#1751d9",
    background: "linear-gradient(300deg, #30c5d2, #471069)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: "20px",
    marginBottom: "20px",
    padding: "10px 20px",
    background: "#0a10cc",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
  },
};
