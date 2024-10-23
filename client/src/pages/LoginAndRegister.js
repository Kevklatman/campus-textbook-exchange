// src/pages/LoginAndRegister.js
import React, { useContext, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UserContext } from "../contexts/UserContext";
import { useHistory } from "react-router-dom";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .required("Required")
    .matches(/.+\.edu$/, "Must be a .edu email address"),
  password: Yup.string().required("Required"),
  remember: Yup.boolean()
});

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  email: Yup.string()
    .email("Invalid email")
    .required("Required")
    .matches(/.+\.edu$/, "Must be a .edu email address"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Required"),
});

function LoginAndRegister() {
  const { login } = useContext(UserContext);
  const history = useHistory();
  const [error, setError] = useState(null);

  const handleLogin = async (values, { setSubmitting }) => {
    setError(null); // Clear any previous errors
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      
      login(data);
      history.push("/");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      const userData = await response.json();
      login(userData);
      history.push("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-register">
      {error && <div className="error-message">{error}</div>}
      
      <div className="login-form">
        <h2>Login</h2>
        <Formik
          initialValues={{ 
            email: "", 
            password: "",
            remember: false 
          }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="loginEmail">Email</label>
                <Field 
                  type="email" 
                  name="email" 
                  id="loginEmail"
                  placeholder="university.email@school.edu" 
                />
                <ErrorMessage name="email" component="div" className="error" />
              </div>

              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <Field 
                  type="password" 
                  name="password" 
                  id="loginPassword"
                  placeholder="Enter your password" 
                />
                <ErrorMessage name="password" component="div" className="error" />
              </div>

              <div className="form-group checkbox-group">
                <label className="remember-label">
                  <Field 
                    type="checkbox" 
                    name="remember" 
                    className="remember-checkbox"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-success" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <div className="register-form">
        <h2>Sign Up</h2>
        <Formik
          initialValues={{ 
            name: "", 
            email: "", 
            password: "" 
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSignup}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="signupName">Name</label>
                <Field 
                  type="text" 
                  name="name" 
                  id="signupName"
                  placeholder="Enter your full name" 
                />
                <ErrorMessage name="name" component="div" className="error" />
              </div>

              <div className="form-group">
                <label htmlFor="signupEmail">Email</label>
                <Field 
                  type="email" 
                  name="email" 
                  id="signupEmail"
                  placeholder="university.email@school.edu" 
                />
                <ErrorMessage name="email" component="div" className="error" />
              </div>

              <div className="form-group">
                <label htmlFor="signupPassword">Password</label>
                <Field 
                  type="password" 
                  name="password" 
                  id="signupPassword"
                  placeholder="Minimum 6 characters" 
                />
                <ErrorMessage name="password" component="div" className="error" />
              </div>

              <button 
                type="submit" 
                className="btn btn-success" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default LoginAndRegister;