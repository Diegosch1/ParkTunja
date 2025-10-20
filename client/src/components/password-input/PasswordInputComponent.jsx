import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./PasswordInputComponent.css";

const PasswordInputComponent = ({ register, error, isCreateUsed }) => {
  const [showPassword, setShowPassword] = useState(false);


  const toggleVisibility = () => setShowPassword(prev => !prev);

  return (
    <label className="password-label">
      {`Contraseña`}
      <div className="password-input-wrapper" style={{ position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          {...register("password", {
            required: isCreateUsed ? { value: true, message: `Este campo es obligatorio` } : false,
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#.])[A-Za-z\d@$!%*?&\-_#.]{8,}$/,
              message: `La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial.`
            }
          })}
          style={{ paddingRight: "2.5rem" }}
          className="password-input"
        />
        <button
          type="button"
          onClick={toggleVisibility}
          style={{
            position: "absolute",
            top: "50%",
            right: "0.75rem",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            cursor: "pointer"
          }}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {error?.message && (
        <span className="error-message">{error.message}</span>
      )}
    </label>
  );
}

export default PasswordInputComponent;