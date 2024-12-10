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

import { signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";


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
const navLeft = document.getElementById("nav-left");
const navRight = document.getElementById("nav-right");
const homeContainer = document.querySelector(".home-container");
const loginContainer = document.querySelector(".login-container");
const signupContainer = document.querySelector(".signup-container");
const profileContainer = document.querySelector(".profile-container");
const bookingContainer = document.querySelector(".booking-container");

// Show Sections
function showSection(section) {
  [homeContainer, loginContainer, signupContainer, profileContainer, bookingContainer].forEach((s) => {
    s.style.display = "none";
  });
  if (section) section.style.display = "block";
}

function updateHeader(isLoggedIn) {
  if (isLoggedIn) {
    navLeft.innerHTML = `
      <li id="nav-profile"><a href="#">Profile</a></li>
      <li id="nav-booking"><a href="#">Booking</a></li>`;
    navRight.innerHTML = `<li id="nav-logout"><a href="#">Log Out</a></li>`;

    document.getElementById("nav-profile").addEventListener("click", () => showSection(profileContainer));
    document.getElementById("nav-booking").addEventListener("click", () => showSection(bookingContainer));
    document.getElementById("nav-logout").addEventListener("click", async () => {
      try {
        await signOut(auth); // Log out the user
        updateHeader(false); // Update the header to the logged-out state
        showSection(homeContainer); // Redirect to the home section
        console.log("User logged out successfully");
      } catch (error) {
        console.error("Logout error:", error);
        alert(`Logout Failed: ${error.message}`);
      }
    });
  } else {
    navLeft.innerHTML = `<li id="nav-home"><a href="#">Home</a></li>`;
    navRight.innerHTML = `
      <li id="nav-login"><a href="#">Log In</a></li>
      <li id="nav-signup"><a href="#">Sign Up</a></li>`;

    document.getElementById("nav-home").addEventListener("click", () => showSection(homeContainer));
    document.getElementById("nav-login").addEventListener("click", () => showSection(loginContainer));
    document.getElementById("nav-signup").addEventListener("click", () => showSection(signupContainer));
  }
}


// Monitor Auth State
onAuthStateChanged(auth, (user) => {
  if (user) {
    showSection(profileContainer); // Default page for logged-in users
    updateHeader(true);
  } else {
    showSection(homeContainer); // Default page for non-logged-in users
    updateHeader(false);
  }
});
// Handle Login
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent form submission
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // Log in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user; // Get the logged-in user's data

    console.log("Login Successful! User Info:", user);

    // Fetch and display the user's stats
    await fetchAndDisplayStats(user.uid); // Call the function and pass the user's UID
  } catch (error) {
    // Handle errors during login
    alert(`Login Failed: ${error.message}`);
    console.error("Login Error:", error);
  }
});




// Fetch and Display Stats
async function fetchAndDisplayStats(userId) {
  try {
    const userRef = ref(database, `users/${userId}`); // Reference to user's data in Firebase Realtime Database

    // Fetch user data
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val(); // Extract data from the snapshot

      // Populate data into the profile/report slip section
      document.getElementById("report-username").textContent = userData.username || "N/A";
      document.getElementById("report-email").textContent = userData.email || "N/A";
      document.getElementById("report-scenario1").textContent = userData.Scenario1 || "N/A";
      document.getElementById("report-scenario2").textContent = userData.Scenario2 || "N/A";
      document.getElementById("report-scenario3").textContent = userData.Scenario3 || "N/A";
      document.getElementById("report-overall").textContent = userData.OverallGrade || "N/A";
      document.getElementById("report-passfail").textContent = userData.PassFail ? "Pass" : "Fail";

      // Show the profile section
      showSection(profileContainer);
    } else {
      console.error("No user data found");
      alert("No user data found!");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

document.getElementById("nav-logout").addEventListener("click", async () => {
  try {
    await signOut(auth); // Firebase sign out
    updateHeader(false); // Update header to reflect logged-out state
    showSection(homeContainer); // Redirect to the home section
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Error during logout:", error);
    alert(`Logout Failed: ${error.message}`);
  }
});


// Handle Signup
document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const username = document.getElementById("signup-username").value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user info in the database
    await set(ref(database, `users/${user.uid}`), {
      username: username,
      email: email,
    });
  } catch (error) {
    alert(`Signup Failed: ${error.message}`);
  }
});
