import React from "react";
import "./ButtonComponent.css";

const ButtonComponent = ({ text, onClick, type = "primary" }) => {
  return (
    <button className={`btn btn-${type}`} onClick={onClick}>
      {text}
    </button>
  );
};

export default ButtonComponent;
