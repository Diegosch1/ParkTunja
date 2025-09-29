import React from "react";
import "./InputComponent.css";

const InputComponent = ({
    label,
    name,
    type = "text",
    placeholder = "",
    value,
    onChange,
    register,
    required = false,
    error,
    ...rest
}) => {
    return (
        <div className="input-wrapper">
            {label && <label htmlFor={name}>{label}</label>}
            <input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                {...(register ? register(name, { required }) : {})}
                {...rest}
            />
            {error && <span className="input-error">{error}</span>}
        </div>
    );
};

export default InputComponent;
