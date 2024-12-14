// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
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
  measurementId: "G-7FBF0KCBBV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM Helper to dynamically load nav elements
function setupNav(isLoggedIn) {
  const navLeft = document.getElementById("nav-left");
  const navRight = document.getElementById("nav-right");

  if (isLoggedIn) {
    navLeft.innerHTML = `
      <li><a href="report.html">Report</a></li>
      <li><a href="booking.html">Booking</a></li>
    `;
    navRight.innerHTML = `<li><a id="logout-btn" href="#">Log Out</a></li>`;

    document.getElementById("logout-btn")?.addEventListener("click", handleLogout);
  } else {
    navLeft.innerHTML = `<li><a href="index.html">Home</a></li>`;
    navRight.innerHTML = `
      <li><a href="login.html">Log In</a></li>
      <li><a href="signup.html">Sign Up</a></li>
    `;
  }
}

// Handle Login
const loginForm = document.getElementById("login-form");
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful:", userCredential.user);
    window.location.href = "report.html";
  } catch (error) {
    console.error("Login failed:", error);
    alert(`Login Failed: ${error.message}`);
  }
});

// Handle Signup
const signupForm = document.getElementById("signup-form");
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const username = document.getElementById("signup-username").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await set(ref(database, `users/${user.uid}`), {
      username,
      email,
      Scenario1: "NA",
      Scenario2: "NA",
      Scenario3: "NA",
      OverallGrade: "NA",
      PassFail: false,
    });

    alert("Signup successful! Please log in.");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Signup failed:", error);
    alert(`Signup Failed: ${error.message}`);
  }
});

// Handle Logout
async function handleLogout() {
  try {
    await signOut(auth);
    alert("Logged out successfully!");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout failed:", error);
    alert(`Logout Failed: ${error.message}`);
  }
}

// Fetch and Display Stats for Report
async function fetchAndDisplayStats(userId) {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      document.getElementById("report-username").textContent = userData.username || "N/A";
      document.getElementById("report-email").textContent = userData.email || "N/A";
      document.getElementById("report-scenario1").textContent = userData.Scenario1 || "N/A";
      document.getElementById("report-scenario2").textContent = userData.Scenario2 || "N/A";
      document.getElementById("report-scenario3").textContent = userData.Scenario3 || "N/A";
      document.getElementById("report-overall").textContent = userData.OverallGrade || "N/A";
      document.getElementById("report-passfail").textContent = userData.PassFail ? "Pass" : "Fail";
    } else {
      alert("No user data found!");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

// Handle Booking Functionality
const calendarDaysContainer = document.querySelector(".calendar-days");
const cancelBookingBtn = document.getElementById("cancel-booking-btn");

async function fetchAndDisableBookedDates() {
  console.log("Fetching booked dates...");
  try {
    const bookingsRef = ref(database, "bookings");
    const snapshot = await get(bookingsRef);

    if (snapshot.exists()) {
      console.log("Booked dates found:", snapshot.val());
      const bookings = snapshot.val();
      calendarDaysContainer?.querySelectorAll("button").forEach((button) => {
        const day = button.textContent;
        if (bookings[day]) {
          button.disabled = true;
          button.style.backgroundColor = "gray";
        }
      });
    } else {
      console.log("No booked dates found.");
    }
  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
}

async function handleBooking(day) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to book.");
    return;
  }

  console.log(`Attempting to book day ${day} for user:`, user.uid);

  try {
    const bookingsRef = ref(database, "bookings");
    const snapshot = await get(bookingsRef);

    if (snapshot.exists()) {
      const bookings = snapshot.val();
      const userBooking = Object.entries(bookings).find(
        ([, value]) => value.userId === user.uid
      );

      if (userBooking) {
        alert("You already have a booking. Please cancel it first.");
        console.log("User already has a booking:", userBooking);
        return;
      }
    }

    await set(ref(database, `bookings/${day}`), {
      userId: user.uid,
      username: user.displayName || "Anonymous",
    });

    alert(`Booking confirmed for December ${day}`);
    console.log(`Booking successful for day ${day}`);
    fetchAndDisableBookedDates();
  } catch (error) {
    console.error("Error booking date:", error);
  }
}

async function cancelBooking() {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to cancel booking.");
    return;
  }

  console.log(`Attempting to cancel booking for user:`, user.uid);

  try {
    const bookingsRef = ref(database, "bookings");
    const snapshot = await get(bookingsRef);

    if (snapshot.exists()) {
      const bookings = snapshot.val();
      const userBooking = Object.entries(bookings).find(
        ([, value]) => value.userId === user.uid
      );

      if (userBooking) {
        const [day] = userBooking;
        await set(ref(database, `bookings/${day}`), null);
        alert("Booking canceled.");
        console.log(`Booking canceled for day ${day}`);
        fetchAndDisableBookedDates();
        return;
      }
    }

    alert("You do not have any bookings to cancel.");
    console.log("No bookings found to cancel for this user.");
  } catch (error) {
    console.error("Error canceling booking:", error);
  }
}

calendarDaysContainer?.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const day = e.target.textContent;
    console.log(`Button clicked for day: ${day}`);
    handleBooking(day);
  }
});

cancelBookingBtn?.addEventListener("click", cancelBooking);

// Monitor Auth State
onAuthStateChanged(auth, (user) => {
  setupNav(!!user);
  if (user) {
    console.log("User is logged in:", user);
    if (window.location.pathname.endsWith("report.html")) {
      fetchAndDisplayStats(user.uid);
    } else if (window.location.pathname.endsWith("booking.html")) {
      fetchAndDisableBookedDates();
    }
  } else {
    console.log("User is not logged in");
    if (
      window.location.pathname.endsWith("report.html") ||
      window.location.pathname.endsWith("booking.html")
    ) {
      window.location.href = "index.html";
    }
  }
});
