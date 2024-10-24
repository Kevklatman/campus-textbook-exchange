import React, { useContext, useState, useEffect } from "react";  // Added useEffect import
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
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Required"),
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    // Fetch CSRF token when component mounts
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/csrf_token', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrf_token);
        }
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  // Added back handleLogin function
  const handleLogin = async (values, { setSubmitting, setFieldError }) => {
    setError(null);
    setIsSubmitting(true);
    try {
      // Get the CSRF token from the cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];

      const success = await login({
        ...values,
        headers: {
          'X-CSRF-Token': token || csrfToken
        }
      });
      
      if (success) {
        history.push("/");
      } else {
        setError("Invalid email or password");
        setFieldError('email', ' ');
        setFieldError('password', ' ');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "An error occurred during login");
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (values, { setSubmitting, setFieldError }) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];

      const response = await fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": token || csrfToken
        },
        credentials: 'include',
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message?.includes("Email already exists")) {
          setFieldError('email', 'Email already registered');
        } else {
          throw new Error(data.message || "Registration failed");
        }
        return;
      }

      // User is now automatically logged in from the backend
      // Just redirect to home page
      history.push("/");

    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "An error occurred during registration");
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };
  return (
    <div className="login-register">
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      <div className="login-form">
        <h2>Login</h2>
        <Formik
          initialValues={{ 
            email: "", 
            password: "",
            remember: true 
          }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting: formIsSubmitting }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="loginEmail">Email</label>
                <Field 
                  type="email" 
                  name="email" 
                  id="loginEmail"
                  className="form-control"
                  placeholder="university.email@school.edu"
                  disabled={isSubmitting}
                  autoComplete="email"
                />
                <ErrorMessage 
                  name="email" 
                  component="div" 
                  className="error" 
                />
              </div>

              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <Field 
                  type="password" 
                  name="password" 
                  id="loginPassword"
                  className="form-control"
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <ErrorMessage 
                  name="password" 
                  component="div" 
                  className="error" 
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="remember-label">
                  <Field 
                    type="checkbox" 
                    name="remember" 
                    className="remember-checkbox"
                    disabled={isSubmitting}
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-success" 
                disabled={formIsSubmitting || isSubmitting}
              >
                {formIsSubmitting ? "Logging in..." : "Login"}
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
          {({ isSubmitting: formIsSubmitting }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="signupName">Full Name</label>
                <Field 
                  type="text" 
                  name="name" 
                  id="signupName"
                  className="form-control"
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                  autoComplete="name"
                />
                <ErrorMessage 
                  name="name" 
                  component="div" 
                  className="error" 
                />
              </div>

              <div className="form-group">
                <label htmlFor="signupEmail">Email</label>
                <Field 
                  type="email" 
                  name="email" 
                  id="signupEmail"
                  className="form-control"
                  placeholder="university.email@school.edu"
                  disabled={isSubmitting}
                  autoComplete="email"
                />
                <ErrorMessage 
                  name="email" 
                  component="div" 
                  className="error" 
                />
              </div>

              <div className="form-group">
                <label htmlFor="signupPassword">Password</label>
                <Field 
                  type="password" 
                  name="password" 
                  id="signupPassword"
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <ErrorMessage 
                  name="password" 
                  component="div" 
                  className="error" 
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-success" 
                disabled={formIsSubmitting || isSubmitting}
              >
                {formIsSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default LoginAndRegister;