import React, { useState } from "react";
import {
  Stack,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Home.css";
import { useForm, Controller } from "react-hook-form";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isSetNewPasswordOpen, setIsSetNewPasswordOpen] = useState(false);
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // email validation
  const regEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Email validation

  const {
    control,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const [validations, setValidations] = useState({
    letter: false,
    capital: false,
    number: false,
    specialChar: false,
    length: false,
    match: false,
  });

  const validatePassword = (password) => {
    const lowerCaseLetters = /[a-z]/g;
    const upperCaseLetters = /[A-Z]/g;
    const numbers = /[0-9]/g;
    const specialChars = /[!@#$%^&*(),.?":{}|<>]/g;

    return {
      hasLowerCase: lowerCaseLetters.test(password),
      hasUpperCase: upperCaseLetters.test(password),
      hasNumber: numbers.test(password),
      hasSpecialChar: specialChars.test(password),
      hasLength: password.length >= 10,
    };
  };

  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);

    const validation = validatePassword(password);
    setValidations((prevValidations) => ({
      letter: validation.hasLowerCase,
      capital: validation.hasUpperCase,
      number: validation.hasNumber,
      specialChar: validation.hasSpecialChar,
      length: validation.hasLength,
      match:
        password !== "" &&
        confirmPassword !== "" &&
        password === confirmPassword,
    }));

    setShowValidation(true);
  };

  const handleConfirmPasswordChange = (e) => {
    const password = e.target.value;
    setConfirmPassword(password);

    setValidations((prevValidations) => ({
      ...prevValidations,
      match: newPassword !== "" && password !== "" && newPassword === password,
    }));

    setShowValidation(true);
  };

  const handleSetNewPasswordSubmit = (e) => {
    e.preventDefault();
    // Handle setting new password
  };

  const togglePopup = () => setIsOpen(!isOpen);
  const toggleForgotPasswordPopup = () =>
    setIsForgotPasswordOpen(!isForgotPasswordOpen);
  const toggleSetNewPasswordPopup = () =>
    setIsSetNewPasswordOpen(!isSetNewPasswordOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://careerguidance.runasp.net/Auth/Login",
        { email, password }
      );
      if (response.status === 200) {
        console.log("Login successful:", response.data);
        if (rememberMe) {
          localStorage.setItem("email", email);
        } else {
          localStorage.removeItem("email");
        }
      } else {
        console.error("Login failed:", response.data);
      }
    } catch (error) {
      console.error("Error occurred during login:", error);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    console.log("Password reset link sent to:", email);
    setIsForgotPasswordOpen(false);
    setIsSetNewPasswordOpen(true);
  };

  return (
    <>
      <div>
        <Stack direction={"row"} justifyContent={"end"} sx={{ mx: 5, my: 2 }}>
          <button onClick={togglePopup} className="open-popup-button login">
            Login
          </button>
          <Link to="/signup" className="signup">
            Sign Up
          </Link>
        </Stack>

        {/* Start Login Popup */}
        <div className="L">
          {isOpen && !isForgotPasswordOpen && !isSetNewPasswordOpen && (
            <div className="popup-overlay">
              <div className="popup">
                <button onClick={togglePopup} className="close-popup-button">
                  &times;
                </button>
                <form onSubmit={handleSubmit} className="login-form">
                  <h2>Login</h2>
                  <div className="form-group">
                    <TextField
                      id="email"
                      label="Username or Email"
                      variant="filled"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <TextField
                      id="password"
                      label="Password"
                      type="password"
                      variant="filled"
                      fullWidth
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group remember-me">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="rememberMe">Remember Me</label>
                  </div>
                  <div className="form-group">
                    <button type="submit">Login</button>
                  </div>
                  <div className="form-group">
                    <button
                      type="button"
                      onClick={toggleForgotPasswordPopup}
                      className="forgot-password-link"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="form-group">
                    <Link to="/signup" type="button" className="sign-up-link">
                      Sign Up
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isForgotPasswordOpen && !isSetNewPasswordOpen && (
            <div className="popup-overlay">
              <div className="popup">
                <button
                  onClick={toggleForgotPasswordPopup}
                  className="close-popup-button"
                >
                  &times;
                </button>
                <form onSubmit={handleForgotPasswordSubmit} className="form">
                  <h2>Forgot Password</h2>
                  <div className="form-group">
                    {/* Email */}
                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: "Email is required",
                        pattern: {
                          value: regEmail,
                          message: "Invalid email address",
                        },
                        minLength: {
                          value: 16,
                          message: "Invalid email address",
                        },
                        maxLength: {
                          value: 40,
                          message: "Invalid email address",
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          sx={{ width: "100%" }}
                          label="Email"
                          variant="filled"
                          placeholder="e.g. example@gmail.com"
                          error={Boolean(errors.email)}
                          helperText={
                            errors.email ? errors.email.message : null
                          }
                        />
                      )}
                    />
                  </div>
                  <div className="form-group">
                    <Button type="submit" variant="contained" color="primary">
                      Reset Password
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isSetNewPasswordOpen && (
            <div className="popup-overlay">
              <div className="popup">
                <button
                  onClick={toggleSetNewPasswordPopup}
                  className="close-popup-button"
                >
                  &times;
                </button>
                <form onSubmit={handleSetNewPasswordSubmit} className="form">
                  <h2>Set New Password</h2>
                  <div className="form-group">
                    <FormControl
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      required
                      onFocus={() => setShowValidation(true)}
                      onBlur={() => setShowValidation(true)}
                    >
                      <TextField
                        variant="filled"
                        id="new-password"
                        type={password}
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        label="New Password"
                      />
                    </FormControl>
                  </div>
                  <div className="form-group">
                    <FormControl
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      required
                    >
                      <TextField
                        variant="filled"
                        id="confirm-password"
                        type={password}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        label="Confirm Password"
                      />
                    </FormControl>
                  </div>
                  {passwordError && (
                    <Typography
                      variant="body2"
                      color="error"
                      align="left"
                      sx={{ mt: 1 }}
                    >
                      {passwordError}
                    </Typography>
                  )}
                  {showValidation && (
                    <Box
                      mt={2}
                      p={2}
                      border={1}
                      borderColor="grey.300"
                      borderRadius="4px"
                    >
                      <Typography variant="subtitle1" sx={{ fontSize: "13px" }}>
                        Password must contain the following:
                      </Typography>
                      <Typography
                        variant="body2"
                        color={validations.letter ? "green" : "red"}
                        sx={{ fontSize: "13px" }}
                      >
                        {validations.letter ? "✔" : "✖"} A lowercase letter
                      </Typography>
                      <Typography
                        variant="body2"
                        color={validations.capital ? "green" : "red"}
                        sx={{ fontSize: "13px" }}
                      >
                        {validations.capital ? "✔" : "✖"} A capital (uppercase)
                        letter
                      </Typography>
                      <Typography
                        variant="body2"
                        color={validations.number ? "green" : "red"}
                        sx={{ fontSize: "13px" }}
                      >
                        {validations.number ? "✔" : "✖"} A number
                      </Typography>
                      <Typography
                        variant="body2"
                        color={validations.specialChar ? "green" : "red"}
                        sx={{ fontSize: "13px" }}
                      >
                        {validations.specialChar ? "✔" : "✖"} A special
                        character
                      </Typography>
                      <Typography
                        variant="body2"
                        color={validations.length ? "green" : "red"}
                        sx={{ fontSize: "13px" }}
                      >
                        {validations.length ? "✔" : "✖"} Minimum 10 characters
                      </Typography>
                      <Typography
                        variant="body2"
                        color={validations.match ? "green" : "red"}
                        sx={{ fontSize: "13px" }}
                      >
                        {validations.match ? "✔" : "✖"} Passwords match
                      </Typography>
                    </Box>
                  )}
                  <div className="form-group">
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      Set Password
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
