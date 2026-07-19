// ==========================================
// CONFIGURATION & STATIC DATA
// ==========================================
const NO_BUTTON_TEXTS = [
  "No ane option a ledu 😜",
  "Try again! 🤭",
  "Nice try, but no! 😂",
  "Yes is right there! 👇",
  "Error: Option Disabled 🚫",
  "Just click Yes! 💕",
  "You cannot escape! 🔒",
  "Are you sure? 🥺",
  "No option a ledu!"
];

const ACTIVITY_META = {
  badminton: { name: "Badminton", icon: "fa-table-tennis-paddle-ball", emoji: "🏸" },
  coffee: { name: "Coffee", icon: "fa-mug-hot", emoji: "☕" },
  cycling: { name: "Cycling", icon: "fa-bicycle", emoji: "🚲" },
  cafe: { name: "Cafe", icon: "fa-store", emoji: "🍰" },
  rain_ride: { name: "Rain Ride", icon: "fa-cloud-showers-water", emoji: "🌧️" },
  night_walk: { name: "Night Walk", icon: "fa-moon", emoji: "🌙" }
};

// ==========================================
// STATE VARIABLES
// ==========================================
let yesBtnPaddingVertical = 16;
let yesBtnPaddingHorizontal = 28;
let yesBtnFontSize = 1.2; // in rem
let noClickCount = 0;
let selectedActivity = null;
let history = [];

// ==========================================
// DOM ELEMENTS
// ==========================================
const heartsContainer = document.getElementById("heartsContainer");
const viewHistoryBtn = document.getElementById("viewHistoryBtn");
const proposalScreen = document.getElementById("proposalScreen");
const activityScreen = document.getElementById("activityScreen");
const dateTimeScreen = document.getElementById("dateTimeScreen");
const successScreen = document.getElementById("successScreen");
const historyScreen = document.getElementById("historyScreen");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const activityCards = document.querySelectorAll(".activity-card");
const backToActivities = document.getElementById("backToActivities");
const selectedActivityIcon = document.getElementById("selectedActivityIcon");
const selectedActivityText = document.getElementById("selectedActivityText");

const dateTimeForm = document.getElementById("dateTimeForm");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");

const summaryActivity = document.getElementById("summaryActivity");
const summaryDate = document.getElementById("summaryDate");
const summaryTime = document.getElementById("summaryTime");

const shareWhatsappBtn = document.getElementById("shareWhatsappBtn");
const restartBtn = document.getElementById("restartBtn");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const historyList = document.getElementById("historyList");
const notification = document.getElementById("notification");

// ==========================================
// HEART ANIMATIONS SYSTEM
// ==========================================
function spawnHeart(isBurst = false) {
  const heart = document.createElement("div");
  heart.classList.add("heart-particle");
  heart.innerHTML = "💖";
  
  // Random horizontal position
  const leftPos = Math.random() * 100;
  heart.style.left = `${leftPos}%`;
  
  // Random sizing
  const size = Math.random() * 20 + (isBurst ? 15 : 10);
  heart.style.fontSize = `${size}px`;
  
  // Random animation speed
  const duration = Math.random() * 4 + (isBurst ? 2 : 5);
  heart.style.animationDuration = `${duration}s`;
  
  // If it's a burst, randomize vertical speed and angle
  if (isBurst) {
    heart.style.bottom = `${Math.random() * 20 + 20}%`;
    heart.style.animationName = "floatUp";
    heart.style.opacity = Math.random();
  }
  
  heartsContainer.appendChild(heart);
  
  // Remove element after animation ends
  setTimeout(() => {
    heart.remove();
  }, duration * 1000);
}

// Generate ambient floating hearts
function initFloatingHearts() {
  setInterval(() => {
    // Keep ambient count low so it's cute but not overwhelming
    if (document.querySelectorAll(".heart-particle").length < 25) {
      spawnHeart(false);
    }
  }, 1000);
}

// Spark a burst of hearts on click Yes
function triggerHeartBurst() {
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      spawnHeart(true);
    }, i * 50);
  }
}

// ==========================================
// NAVIGATION ENGINE
// ==========================================
function showScreen(screenToShow) {
  const screens = [proposalScreen, activityScreen, dateTimeScreen, successScreen, historyScreen];
  
  screens.forEach(screen => {
    if (screen === screenToShow) {
      screen.style.display = "block";
      // Tiny delay to trigger CSS transition
      setTimeout(() => {
        screen.classList.add("active");
      }, 50);
    } else {
      screen.classList.remove("active");
      screen.style.display = "none";
    }
  });
}

function resetBodyTheme() {
  document.body.className = "theme-default";
}

function setBodyTheme(themeName) {
  document.body.className = `theme-${themeName}`;
}

// ==========================================
// NOTIFICATION TOAST
// ==========================================
function showToast(message) {
  notification.textContent = message;
  notification.classList.add("show");
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// ==========================================
// HISTORY SYSTEM (LOCAL STORAGE)
// ==========================================
function loadHistory() {
  const storedHistory = localStorage.getItem("date_proposals_history");
  if (storedHistory) {
    try {
      history = JSON.parse(storedHistory);
    } catch (e) {
      history = [];
    }
  } else {
    history = [];
  }
  renderHistory();
}

function saveProposalToHistory(activity, date, time) {
  const item = {
    id: Date.now().toString(),
    activity: activity,
    date: date,
    time: time,
    timestamp: new Date().toLocaleString()
  };
  history.unshift(item); // Add to the top
  localStorage.setItem("date_proposals_history", JSON.stringify(history));
  renderHistory();
}

function deleteHistoryItem(id) {
  history = history.filter(item => item.id !== id);
  localStorage.setItem("date_proposals_history", JSON.stringify(history));
  renderHistory();
  showToast("Record deleted! 💔");
}

function clearAllHistory() {
  if (confirm("Are you sure you want to clear all history? 😢")) {
    history = [];
    localStorage.removeItem("date_proposals_history");
    renderHistory();
    showToast("History cleared! 🧹");
  }
}

function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = `
      <div class="no-history">
        <i class="fa-solid fa-heart-crack"></i>
        <p>No date history found yet. Make a proposal!</p>
      </div>
    `;
    clearHistoryBtn.style.display = "none";
    return;
  }

  clearHistoryBtn.style.display = "inline-flex";
  historyList.innerHTML = "";
  
  history.forEach(item => {
    const meta = ACTIVITY_META[item.activity] || { name: item.activity, icon: "fa-heart", emoji: "💖" };
    
    // Format date beautifully
    const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
    
    const historyItem = document.createElement("div");
    historyItem.classList.add("history-item");
    historyItem.innerHTML = `
      <button class="delete-history-item-btn" data-id="${item.id}" title="Delete Record">
        <i class="fa-solid fa-trash-can"></i>
      </button>
      <div class="history-item-header">
        <div class="history-item-activity">
          <i class="fa-solid ${meta.icon}"></i> ${meta.name} ${meta.emoji}
        </div>
        <div class="history-item-time">
          <i class="fa-regular fa-clock"></i> ${item.time}
        </div>
      </div>
      <div class="history-item-date">
        <i class="fa-regular fa-calendar-days"></i> ${formattedDate}
      </div>
      <div class="history-item-created">
        Submitted: ${item.timestamp}
      </div>
    `;
    
    // Attach delete handler
    historyItem.querySelector(".delete-history-item-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute("data-id");
      deleteHistoryItem(id);
    });
    
    historyList.appendChild(historyItem);
  });
}

// ==========================================
// EVENT HANDLERS & LISTENERS
// ==========================================

// --- Screen 1: Proposal ---

// Clicking "No" grows the Yes button
noBtn.addEventListener("click", () => {
  noClickCount++;
  
  // Wiggle animation
  noBtn.classList.remove("wiggle");
  void noBtn.offsetWidth; // Trigger reflow to restart animation
  noBtn.classList.add("wiggle");
  
  // Resize Yes button (+5px padding and increase font slightly)
  yesBtnPaddingVertical += 5;
  yesBtnPaddingHorizontal += 5;
  yesBtnFontSize += 0.12;
  
  yesBtn.style.padding = `${yesBtnPaddingVertical}px ${yesBtnPaddingHorizontal}px`;
  yesBtn.style.fontSize = `${yesBtnFontSize}rem`;
  
  // Cycle button text
  const textIndex = noClickCount % NO_BUTTON_TEXTS.length;
  noBtn.textContent = NO_BUTTON_TEXTS[textIndex];
  
  // Fun toast messages
  if (noClickCount === 3) {
    showToast("The 'Yes' button is getting hungry... 🦖");
  } else if (noClickCount === 6) {
    showToast("Resistance is cute, but futile! 😘");
  }
});

// Clicking "Yes" transitions to selections
yesBtn.addEventListener("click", () => {
  triggerHeartBurst();
  showToast("Yay! Best decision ever! 🥰");
  
  // Animate transition delay slightly so she can see the heart burst
  setTimeout(() => {
    showScreen(activityScreen);
  }, 800);
});

// --- Screen 2: Activity Selection ---

activityCards.forEach(card => {
  card.addEventListener("click", () => {
    const activityKey = card.getAttribute("data-activity");
    selectedActivity = activityKey;
    
    const meta = ACTIVITY_META[activityKey];
    
    // Change body class to update background theme
    setBodyTheme(activityKey);
    
    // Setup date/time details header
    selectedActivityIcon.className = `fa-solid ${meta.icon}`;
    selectedActivityText.textContent = `${meta.name} ${meta.emoji}`;
    
    // Smooth transition
    showScreen(dateTimeScreen);
  });
});

// Back to Activity screen
backToActivities.addEventListener("click", () => {
  resetBodyTheme();
  showScreen(activityScreen);
});

// --- Screen 3: Date & Time Form ---

dateTimeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const dateVal = dateInput.value;
  const timeVal = timeInput.value;
  
  if (!dateVal || !timeVal) {
    showToast("Please choose both date and time! ⏰");
    return;
  }
  
  // Save selection
  saveProposalToHistory(selectedActivity, dateVal, timeVal);
  
  // Update UI Summary
  const meta = ACTIVITY_META[selectedActivity];
  summaryActivity.textContent = `${meta.name} ${meta.emoji}`;
  
  const dateObj = new Date(dateVal);
  summaryDate.textContent = dateObj.toLocaleDateString("en-US", {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  
  // Format 12-hour time
  const [hours, minutes] = timeVal.split(':');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  summaryTime.textContent = `${hours12}:${minutes} ${ampm}`;
  
  // Trigger success screen
  triggerHeartBurst();
  showScreen(successScreen);
});

// --- Screen 4: Success Actions ---

shareWhatsappBtn.addEventListener("click", () => {
  if (!selectedActivity) return;
  
  const meta = ACTIVITY_META[selectedActivity];
  const dateObj = new Date(dateInput.value);
  const dateStr = dateObj.toLocaleDateString("en-US", {
    weekday: 'long', month: 'long', day: 'numeric'
  });
  
  // Format 12-hour time
  const [hours, minutes] = timeInput.value.split(':');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const timeStr = `${hours12}:${minutes} ${ampm}`;
  
  // Construct sweet WhatsApp text
  const message = `Hey! I accepted your proposal! Let's go for *${meta.name}* ${meta.emoji} on *${dateStr}* at *${timeStr}*! 💖✨`;
  
  // Open WhatsApp Link
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
});

// Restart Flow
restartBtn.addEventListener("click", () => {
  // Reset Yes button style
  yesBtnPaddingVertical = 16;
  yesBtnPaddingHorizontal = 28;
  yesBtnFontSize = 1.2;
  yesBtn.style.padding = `${yesBtnPaddingVertical}px ${yesBtnPaddingHorizontal}px`;
  yesBtn.style.fontSize = `${yesBtnFontSize}rem`;
  
  // Reset other state
  noClickCount = 0;
  noBtn.textContent = NO_BUTTON_TEXTS[0];
  selectedActivity = null;
  dateTimeForm.reset();
  
  resetBodyTheme();
  showScreen(proposalScreen);
});

// --- History Side Panels ---

viewHistoryBtn.addEventListener("click", () => {
  showScreen(historyScreen);
});

closeHistoryBtn.addEventListener("click", () => {
  // Back to where we make sense
  if (selectedActivity && dateInput.value && timeInput.value) {
    showScreen(successScreen);
  } else if (selectedActivity) {
    showScreen(dateTimeScreen);
  } else {
    resetBodyTheme();
    showScreen(proposalScreen);
  }
});

clearHistoryBtn.addEventListener("click", clearAllHistory);

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
  // Set minimum date picker input to today's date
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
  
  // Set default values for date & time pickers (today, and 6:00 PM)
  dateInput.value = today;
  timeInput.value = "18:00";
  
  // Setup backgrounds & history
  initFloatingHearts();
  loadHistory();
}

// Start the app
window.addEventListener("DOMContentLoaded", init);
