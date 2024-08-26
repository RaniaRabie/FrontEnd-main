import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Button,
  MenuItem,
  Snackbar,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  CircularProgress,
  Select,
} from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useForm, Controller } from "react-hook-form";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import "./SignUp.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Show JSON data in console
axios.interceptors.request.use((request) => {
  console.log("Starting Request", JSON.stringify(request.data, null, 2));
  return request;
});

const regName = /^[A-Za-z\s]+$/; // Only letters and spaces are allowed
const regUserName = /^[a-zA-Z]{3}[a-zA-Z0-9_\s]*$/; // Only letters, numbers, underscore are allowed
const specialCharPattern = /[^a-zA-Z0-9_]/; // Detects any special character except underscore
const regEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Email validation
const regNumber = /^(10|11|12|15)[0-9]{8}$/;

const role = [
  { value: "Student", label: "Student" },
  { value: "Instructor", label: "Instructor" },
];

export default function SignUp() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch the list of countries when the component mounts
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(
          "https://countriesnow.space/api/v0.1/countries"
        );
        setCountries(response.data.data);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  // Fetch cities for the selected country
  const handleCountryChange = async (event) => {
    const country = event.target.value;
    setSelectedCountry(country);
    setSelectedCity(""); // Reset selected city
    setLoading(true);
    setCities([]); // Clear previous cities while loading new ones

    try {
      const response = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/cities",
        { country }
      );
      setCities(response.data.data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }

    setLoading(false);
  };

  // Handle city selection
  const handleCityChange = (event) => {
    const city = event.target.value;
    setSelectedCity(city);
  };

  const [open, setOpen] = useState(false);
  // const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validations, setValidations] = useState({
    letter: false,
    capital: false,
    number: false,
    specialChar: false,
    length: false,
    match: false,
  });
  const [showValidation, setShowValidation] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    const phoneNumberWithPrefix = `+20${data.phoneNumber}`;
    const finalData = {
      ...data,
      phoneNumber: phoneNumberWithPrefix, // Update the phone number with the prefix
    };

    try {
      const response = await axios.post(
        "http://careerguidance.runasp.net/Auth/SignUp",
        finalData
      );
      console.log("Submitted Data: ", response.data);
      handleClick(); // Show success Snackbar
    } catch (error) {
      console.error("Error during API call: ", error);
    }
  };

  const name = watch("name");
  const userName = watch("userName");
  const phoneNumber = watch("phoneNumber");
  const fullPhoneNumber = `+20${phoneNumber}`; // Concatenate prefix with the phone number

  // Password Validation Function
  const validatePassword = (value) => {
    const lowerCaseLetters = /[a-z]/g;
    const upperCaseLetters = /[A-Z]/g;
    const numbers = /[0-9]/g;
    const specialChars = /[!@#$%^&*(),.?":{}|<>]/g;

    const validation = {
      hasLowerCase: lowerCaseLetters.test(value),
      hasUpperCase: upperCaseLetters.test(value),
      hasNumber: numbers.test(value),
      hasSpecialChar: specialChars.test(value),
      hasLength: value.length >= 10,
    };

    const errors = [];
    if (!validation.hasLowerCase) errors.push("at least one lowercase letter");
    if (!validation.hasUpperCase) errors.push("at least one uppercase letter");
    if (!validation.hasNumber) errors.push("at least one number");
    if (!validation.hasSpecialChar)
      errors.push("at least one special character");
    if (!validation.hasLength) errors.push("at least 10 characters long");

    // Additional restrictions
    if (name) {
      const nameParts = name.split(/\s+/);
      for (let part of nameParts) {
        if (part && value.toLowerCase().includes(part.toLowerCase())) {
          errors.push("not contain any part of your name");
          break;
        }
      }
    }

    if (userName && value.toLowerCase().includes(userName.toLowerCase())) {
      errors.push("not contain your username");
    }
    if (
      phoneNumber &&
      (value.includes(phoneNumber) || value.includes(fullPhoneNumber))
    ) {
      errors.push("not contain your phone number.");
    }

    return errors.length === 0 ? true : `Password must ${errors.join(", ")}`;
  };

  // Check if password matches
  const validateConfirmPassword = (value) => {
    if (value !== password) {
      return "Passwords don't match";
    }
    return true;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setPassword(password);

    const validation = validatePassword(password);
    setValidations({
      letter: /[a-z]/.test(password),
      capital: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      length: password.length >= 10,
      match:
        password !== "" &&
        confirmPassword !== "" &&
        password === confirmPassword,
    });

    setShowValidation(true);
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value;
    setConfirmPassword(confirmPassword);

    setValidations((prevValidations) => ({
      ...prevValidations,
      match:
        password !== "" &&
        confirmPassword !== "" &&
        password === confirmPassword,
    }));

    setShowValidation(true);
  };

  return (
    <div className="container">
      <Box sx={{ my: 3 }}>
        <Typography
          sx={{
            fontSize: "30px",
            py: 1,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Sign Up
        </Typography>

        <Typography sx={{ textAlign: "center" }}>
          Create an account to track your progress, showcase your skill-set and
          be a part of the community.
        </Typography>
      </Box>

      <Box
        onSubmit={handleSubmit(onSubmit)}
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
        noValidate
        autoComplete="off"
      >
        <Stack sx={{ gap: 2 }} direction={"row"}>
          {/* Name */}
          <Controller
            name="name"
            control={control}
            rules={{
              required: "Name is required",
              pattern: {
                value: regName,
                message: "Name must contain characters only",
              },
              minLength: {
                value: 8,
                message: "Name must be at least 8 characters long",
              },
              maxLength: {
                value: 50,
                message: "Name must not exceed 50 characters",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                sx={{ flex: 1 }}
                label="Name"
                variant="filled"
                error={Boolean(errors.name)}
                helperText={errors.name ? errors.name.message : null}
              />
            )}
          />

          {/* UserName */}
          <Controller
            name="userName"
            control={control}
            rules={{
              required: "UserName is required",
              validate: (value) => {
                if (specialCharPattern.test(value)) {
                  return "UserName must contain letters, numbers, and underscore only";
                }
                if (!regUserName.test(value)) {
                  return "UserName must start with at least 3 letters";
                }
                if (value.length < 6) {
                  return "UserName must be at least 6 characters long";
                }
                return true;
              },
              maxLength: {
                value: 50,
                message: "UserName must not exceed 50 characters",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                error={Boolean(errors.userName)}
                helperText={errors.userName ? errors.userName.message : null}
                sx={{ flex: 1 }}
                label="User Name"
                variant="filled"
              />
            )}
          />
        </Stack>

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
              label="Email"
              variant="filled"
              placeholder="e.g. example@gmail.com"
              error={Boolean(errors.email)}
              helperText={errors.email ? errors.email.message : null}
            />
          )}
        />

        {/* Age */}
        <Stack sx={{ gap: 2 }} direction={"row"}>
          <Controller
            name="age"
            control={control}
            rules={{
              required: "Age is required",
              min: {
                value: 12,
                message: "Age must be at least 12",
              },
              max: {
                value: 50,
                message: "Age must not exceed 50",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                sx={{ flex: 1 }}
                label="Age"
                type="number"
                variant="filled"
                error={Boolean(errors.age)}
                helperText={errors.age ? errors.age.message : null}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: 12,
                  max: 50,
                }}
              />
            )}
          />

          <Controller
            name="role"
            control={control}
            rules={{ required: "Role is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                sx={{ flex: 1 }}
                variant="filled"
                select
                label="Role"
                error={Boolean(errors.role)}
                helperText={errors.role ? errors.role.message : null}
              >
                {role.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Stack>

        <Stack direction={"row"} gap={2}>
          {/* Country Selection */}
          <FormControl fullWidth variant="filled">
            <InputLabel id="country-select-label">Select Country</InputLabel>
            <Select
              labelId="country-select-label"
              value={selectedCountry}
              onChange={handleCountryChange}
              label="Select Country"
            >
              {countries.map((country) => (
                <MenuItem key={country.country} value={country.country}>
                  {country.country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* City Selection */}
          <FormControl fullWidth variant="filled" disabled={!selectedCountry}>
            <InputLabel id="city-select-label">Select City</InputLabel>
            <Select
              labelId="city-select-label"
              value={selectedCity}
              onChange={handleCityChange}
              label="Select City"
            >
              {cities.map((city, index) => (
                <MenuItem key={index} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          )}
        </Stack>

        {/* Phone */}
        <Stack direction={"row"} gap={2}>
          <TextField
            sx={{ flex: 0.3 }}
            value="+20"
            InputProps={{
              readOnly: true,
            }}
            variant="filled"
            label="Country Code"
          />
          <TextField
            name="phoneNumber"
            sx={{ flex: 1 }}
            error={Boolean(errors.phoneNumber)}
            helperText={
              errors.phoneNumber ? "Please provide a valid phone number" : null
            }
            {...register("phoneNumber", {
              required: true,
              pattern: regNumber,
            })}
            label="Phone Number"
            variant="filled"
            placeholder="e.g. 1234567890"
          />
        </Stack>

        {/* Password, Confirm Password */}
        <Stack direction={"row"} gap={2}>
          <Controller
            name="password"
            control={control}
            rules={{
              required: "Password is required",
              validate: validatePassword,
              maxLength: {
                value: 50,
                message: "Password must not exceed 50 characters",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                variant="filled"
                sx={{ flex: 1 }}
                type={password}
                label="Password"
                placeholder="Enter your password"
                error={Boolean(errors.password)}
                onChange={(e) => {
                  handlePasswordChange(e);
                  field.onChange(e);
                }}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: true,
              validate: validateConfirmPassword,
            }}
            render={({ field }) => (
              <TextField
                {...field}
                variant="filled"
                sx={{ flex: 1 }}
                type={password}
                label="Confirm Password"
                placeholder="Confirm your password"
                error={Boolean(errors.confirmPassword)}
                onChange={(e) => {
                  handleConfirmPasswordChange(e);
                  field.onChange(e);
                }}
              />
            )}
          />
        </Stack>

        {/* Validation Feedback */}
        {showValidation && (
          <Box
            p={2}
            border={1}
            borderColor="grey.300"
            borderRadius="4px"
            // width={300}
            sx={{ backgroundColor: "#eaf4f4" }}
          >
            <Typography variant="subtitle1" sx={{ fontSize: "15px" }}>
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
              {validations.capital ? "✔" : "✖"} A capital (uppercase) letter
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
              {validations.specialChar ? "✔" : "✖"} A special character
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

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button className="signupBtn" type="submit" variant="contained">
            Sign Up
          </Button>
        </Box>

        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            severity="info"
            variant="filled"
            sx={{ width: "100%" }}
          >
            Account created successfully
          </Alert>
        </Snackbar>
      </Box>

      <Typography sx={{ my: 1, textAlign: "center" }}>OR</Typography>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button className="googleSignup" type="submit" variant="contained">
          <img src="/google.png" alt="Google" />
          Continue with Google
        </Button>
      </Box>

      <Typography sx={{ mt: 2, textAlign: "center" }}>
        Already have an account?
        <Link to="/login" type="button" style={{ textDecoration: "none" }}>
          Login
        </Link>
      </Typography>
    </div>
  );
}
