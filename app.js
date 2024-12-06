// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAygXmljFXAUHpTMFWlxklzCOzbBQwjsbw",
  authDomain: "asg2dda.firebaseapp.com",
  databaseURL: "https://asg2dda-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "asg2dda",
  storageBucket: "asg2dda.firebasestorage.app",
  messagingSenderId: "269260739471",
  appId: "1:269260739471:web:d3fade189e06e5c02ff1fa",
  measurementId: "G-7FBF0KCBBV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM Elements
const loginContainer = document.querySelector(".login-container");
const signupContainer = document.querySelector(".signup-container");
const forgotPasswordContainer = document.querySelector(".forgot-password-container");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const forgotPasswordForm = document.getElementById("forgot-password-form");

const signUpLink = document.getElementById("sign-up-link");
const loginLink = document.getElementById("login-link");
const forgotPasswordLink = document.getElementById("forgot-password-link");
const backToLoginLink = document.getElementById("back-to-login-link");

// Handle Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("Login Successful! User Info:", user);

    // Fetch and display user stats after login
    fetchAndDisplayStats(user.uid);
  } catch (error) {
    alert(`Login Failed: ${error.message}`);
    console.error("Login Error:", error);
  }
});

// Fetch and Display Stats
async function fetchAndDisplayStats(userId) {
  try {
    const userRef = ref(database, `users/${userId}`);

    // Fetch user data
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();

      // Populate stats in the report slip section
      document.getElementById("report-username").textContent = userData.username || "N/A";
      document.getElementById("report-email").textContent = userData.email || "N/A";
      document.getElementById("report-scenario1").textContent = userData.Scenario1 || "N/A";
      document.getElementById("report-scenario2").textContent = userData.Scenario2 || "N/A";
      document.getElementById("report-scenario3").textContent = userData.Scenario3 || "N/A";
      document.getElementById("report-overall").textContent = userData.OverallGrade || "N/A";
      document.getElementById("report-passfail").textContent = userData.PassFail ? "Pass" : "Fail";

      // Switch to the report slip section
      showReportSlip();
    } else {
      console.error("No user data found");
      alert("No user data found!");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}


// Show Report Slip Section
function showReportSlip() {
  document.querySelector(".login-container").style.display = "none";
  document.querySelector(".report-slip-container").style.display = "block";
}


// Handle Signup
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const username = document.getElementById("signup-username").value;
  console.log('hi')
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    let userRef = await ref(database, `users/${user.uid}`);
    console.log("uref " + userRef)
    // Store username in Realtime Database
    await set(userRef, {
      username: username,
      email: email,
      Scenario1: 'NA',
      Scenario2: 'NA',
      Scenario3: 'NA',
      OverallGrade: 'NA',
      PassFail: false
    })
    .then(() => {
      console.log('succes')
    })
    .catch(() => {
      console.log('nop')
    });

    alert("Signup Successful!");
    console.log("New User Info:", user);
    toggleForms("login"); // Switch back to login form
  } catch (error) {
    // ... (Your existing error handling)
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
