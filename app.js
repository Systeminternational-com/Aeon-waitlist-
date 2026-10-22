// Firebase SDK Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAx51oLiywiJLpqPf8W7KgRnyQJcXllKnQ",
  authDomain: "aeon-waitlist.firebaseapp.com",
  projectId: "aeon-waitlist",
  storageBucket: "aeon-waitlist.firebasestorage.app",
  messagingSenderId: "52250936393",
  appId: "1:52250936393:web:956d1faf9fb643cd6d6b98",
  measurementId: "G-6VPSLR9W69"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// DOM Elements
const waitlistForm = document.getElementById("waitlist-form");
const emailInput = document.getElementById("email-input");
const submitBtn = document.getElementById("submit-btn");
const btnText = submitBtn.querySelector(".btn-text");
const btnSpinner = submitBtn.querySelector(".btn-spinner");
const feedbackMsg = document.getElementById("feedback-msg");
const waitlistCounter = document.getElementById("waitlist-counter");
const scrollToTopBtn = document.getElementById("scroll-to-top-btn");
const bgVideo = document.getElementById("bg-video");

// ==========================================================================
// BACKGROUND VIDEO OPTIMIZED PLAYBACK
// ==========================================================================
if (bgVideo) {
  bgVideo.muted = true;
  bgVideo.defaultMuted = true;

  const playSafely = () => {
    const promise = bgVideo.play();
    if (promise !== undefined) {
      promise.catch(() => {
        const unlock = () => {
          bgVideo.play();
          window.removeEventListener("touchstart", unlock);
          window.removeEventListener("click", unlock);
        };
        window.addEventListener("touchstart", unlock, { passive: true, once: true });
        window.addEventListener("click", unlock, { passive: true, once: true });
      });
    }
  };

  if (document.readyState === "complete") {
    playSafely();
  } else {
    window.addEventListener("load", playSafely, { passive: true });
  }
}

// ==========================================================================
// BUTTON INTERACTION: RESERVE SPOT (Footer Scroll & Focus)
// ==========================================================================
if (scrollToTopBtn) {
  scrollToTopBtn.addEventListener("click", () => {
    waitlistForm.scrollIntoView({ behavior: "smooth", block: "center" });
    
    // Focus and highlight form for high-end feel
    setTimeout(() => {
      emailInput.focus();
      waitlistForm.classList.add("highlight-pulse");
      setTimeout(() => waitlistForm.classList.remove("highlight-pulse"), 1000);
    }, 450);
  });
}

// ==========================================================================
// WAITLIST FORM SUBMISSION & FIREBASE AUTHENTICATION
// ==========================================================================
function setLoading(isLoading) {
  if (isLoading) {
    submitBtn.disabled = true;
    btnText.classList.add("hidden");
    btnSpinner.classList.remove("hidden");
  } else {
    submitBtn.disabled = false;
    btnText.classList.remove("hidden");
    btnSpinner.classList.add("hidden");
  }
}

function showMessage(message, isSuccess = true) {
  feedbackMsg.textContent = message;
  feedbackMsg.className = `feedback-msg ${isSuccess ? "success" : "error"}`;
  
  if (isSuccess && waitlistCounter) {
    const currentCount = parseInt(waitlistCounter.textContent.replace(/,/g, "")) || 1432;
    waitlistCounter.textContent = (currentCount + 1).toLocaleString();
  }
}

waitlistForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();

  // Strict email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showMessage("Please enter a valid email address.", false);
    emailInput.focus();
    return;
  }

  setLoading(true);
  feedbackMsg.textContent = "";

  try {
    // Generate randomized surrogate password to register into Firebase Authentication
    const tempKey = `Aeon_${Math.random().toString(36).slice(-8)}!${Date.now()}`;

    // Registers user directly in the Firebase Authentication user dashboard
    await createUserWithEmailAndPassword(auth, email, tempKey);

    showMessage("Your spot has been reserved. You will receive an invitation when access unlocks.", true);
    emailInput.value = "";
    emailInput.disabled = true;
    submitBtn.disabled = true;
    btnText.textContent = "Reserved";
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      showMessage("This email is already registered on the waitlist.", true);
      emailInput.value = "";
    } else if (error.code === "auth/invalid-email") {
      showMessage("Invalid email format. Please check your input.", false);
    } else if (error.code === "auth/operation-not-allowed") {
      showMessage("Please enable the Email/Password provider in your Firebase Authentication console.", false);
    } else {
      showMessage(error.message || "An unexpected error occurred. Please try again.", false);
    }
  } finally {
    setLoading(false);
  }
});
