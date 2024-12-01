// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAygXmljFXAUHpTMFWlxklzCOzbBQwjsbw",
  authDomain: "asg2dda.firebaseapp.com",
  projectId: "asg2dda",
  storageBucket: "asg2dda.firebasestorage.app",
  messagingSenderId: "269260739471",
  appId: "1:269260739471:web:d3fade189e06e5c02ff1fa",
  measurementId: "G-7FBF0KCBBV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const loginContainer = document.querySelector(".login-container");
const signupContainer = document.querySelector(".signup-container");
const forgotPasswordContainer = document.querySelector(".forgot-password-container");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const forgotPasswordForm = document.getElementById("forgot-password-form");

const signUpLink = document.getElementById("sign-up-link");
const loginLink = document.getElementById("login-link");
const forgotPasswordLink = document.createElement("a");
const backToLoginLink = document.getElementById("back-to-login-link");

forgotPasswordLink.href = "#";
forgotPasswordLink.textContent = "Forgot Password?";
forgotPasswordLink.id = "forgot-password-link";
loginContainer.appendChild(forgotPasswordLink);

// Handle Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    alert("Login Successful!");
    console.log("User Info:", userCredential.user);
  } catch (error) {
    alert(`Login Failed: ${error.message}`);
    console.error("Login Error:", error);
  }
});

// Handle Signup
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("Signup Successful!");
    console.log("New User Info:", userCredential.user);
    toggleForms("login"); // Switch back to login form
  } catch (error) {
    alert(`Signup Failed: ${error.message}`);
    console.error("Signup Error:", error);
  }
});

// Handle Forgot Password
forgotPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgot-email").value;

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent! Please check your inbox.");
    toggleForms("login"); // Switch back to login form
  } catch (error) {
    alert(`Error: ${error.message}`);
    console.error("Password Reset Error:", error);
  }
});

// Navigation between forms
signUpLink.addEventListener("click", () => toggleForms("signup"));
loginLink.addEventListener("click", () => toggleForms("login"));
forgotPasswordLink.addEventListener("click", () => toggleForms("forgot-password"));
backToLoginLink.addEventListener("click", () => toggleForms("login"));

// Toggle Forms
function toggleForms(form) {
  loginContainer.style.display = form === "login" ? "block" : "none";
  signupContainer.style.display = form === "signup" ? "block" : "none";
  forgotPasswordContainer.style.display = form === "forgot-password" ? "block" : "none";
}

// Monitor Auth State
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user);
  } else {
    console.log("No user is logged in.");
  }
});