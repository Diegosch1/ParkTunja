import React from "react";
import "./ButtonComponent.css";

const ButtonComponent = ({ text, onClick, type = "primary", htmlType = "button", ...rest }) => {
  return (
    <button className={`btn btn-${type}`} onClick={onClick} type={htmlType} {...rest}>
      {text}
    </button>
  );
};

export default ButtonComponent;
