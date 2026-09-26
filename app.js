/* =========================================================
   WorkToday - app.js
   Common JavaScript
   ========================================================= */

/* ---------------------------------------------------------
   1. PAGE READY
--------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", function () {
    console.log("WorkToday app.js loaded successfully.");
    setupMobileMenu();
    setupImagePreviews();
    setupCurrentYear();
    setupBackButtons();
    setupLogoutButtons();
});

/* ---------------------------------------------------------
   2. MOBILE MENU
--------------------------------------------------------- */

function setupMobileMenu() {
    const menuButton = document.querySelector(".mobile-menu-btn");
    const navigation = document.querySelector(".main-nav");
    if (!menuButton ||!navigation) {
        return;
    }
    menuButton.addEventListener("click", function () {
        navigation.classList.toggle("mobile-open");
    });
    const navLinks = navigation.querySelectorAll("a");
    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            navigation.classList.remove("mobile-open");
        });
    });
}

/* ---------------------------------------------------------
   3. IMAGE PREVIEW
--------------------------------------------------------- */

function setupImagePreviews() {
    const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    imageInputs.forEach(function (input) {
        input.addEventListener("change", function () {
            const file = input.files[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image.");
                input.value = "";
                return;
            }
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert("Image size 5 MB se kam honi chahiye.");
                input.value = "";
                return;
            }
            let preview = null;
            if (input.dataset.preview) {
                preview = document.querySelector(input.dataset.preview);
            }
            if (!preview) {
                const parent = input.parentElement;
                if (parent) {
                    preview = parent.querySelector(".image-preview");
                }
            }
            if (!preview) return;
            const reader = new FileReader();
            reader.onload = function (event) {
                preview.src = event.target.result;
                preview.style.display = "block";
            };
            reader.readAsDataURL(file);
        });
    });
}

/* ---------------------------------------------------------
   4. CURRENT YEAR
--------------------------------------------------------- */

function setupCurrentYear() {
    const yearElements = document.querySelectorAll("[data-current-year]");
    const currentYear = new Date().getFullYear();
    yearElements.forEach(function (element) {
        element.textContent = currentYear;
    });
}

/* ---------------------------------------------------------
   5. BACK BUTTONS
--------------------------------------------------------- */

function setupBackButtons() {
    const backButtons = document.querySelectorAll("[data-back]");
    backButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = "index.html";
            }
        });
    });
}

/* ---------------------------------------------------------
   6. LOGOUT BUTTONS
--------------------------------------------------------- */

function setupLogoutButtons() {
    const logoutButtons = document.querySelectorAll("[data-logout]");
    logoutButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            const confirmLogout = confirm("Kya aap logout karna chahte hain?");
            if (!confirmLogout) return;
            localStorage.removeItem("worktoday_user");
            sessionStorage.removeItem("worktoday_user");
            window.location.href = "login.html";
        });
    });
}

/* ---------------------------------------------------------
   7. LOCAL STORAGE HELPERS
--------------------------------------------------------- */

function saveLocalData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Local storage save error:", error);
        return false;
    }
}

function getLocalData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        if (!data) return defaultValue;
        return JSON.parse(data);
    } catch (error) {
        console.error("Local storage read error:", error);
        return defaultValue;
    }
}

function removeLocalData(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error("Local storage remove error:", error);
        return false;
    }
}

/* ---------------------------------------------------------
   8. LOGIN CHECK
--------------------------------------------------------- */

function isUserLoggedIn() {
    const user = getLocalData("worktoday_user", null);
    return user!== null;
}

/* ---------------------------------------------------------
   9. GET CURRENT USER
--------------------------------------------------------- */

function getCurrentUser() {
    return getLocalData("worktoday_user", null);
}

/* ---------------------------------------------------------
   10. PROTECT PAGE
--------------------------------------------------------- */

function requireLogin() {
    if (!isUserLoggedIn()) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

/* ---------------------------------------------------------
   11. SIMPLE NOTIFICATION
--------------------------------------------------------- */

function showNotification(message, type = "info") {
    const oldNotification = document.querySelector(".worktoday-toast");
    if (oldNotification) oldNotification.remove();
    const toast = document.createElement("div");
    toast.className = "worktoday-toast worktoday-toast-" + type;
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.left = "50%";
    toast.style.bottom = "25px";
    toast.style.transform = "translateX(-50%)";
    toast.style.zIndex = "99999";
    toast.style.padding = "13px 18px";
    toast.style.borderRadius = "10px";
    toast.style.background = "#172033";
    toast.style.color = "#ffffff";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "600";
    toast.style.boxShadow = "0 8px 25px rgba(0,0,0,0.18)";
    toast.style.maxWidth = "90%";
    toast.style.textAlign = "center";
    document.body.appendChild(toast);
    setTimeout(function () {
        toast.style.opacity = "0";
        toast.style.transition = "0.3s";
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 2500);
}

/* ---------------------------------------------------------
   12. SAFE REDIRECT
--------------------------------------------------------- */

function goToPage(page) {
    if (!page) return;
    window.location.href = page;
}

/* ---------------------------------------------------------
   13. FORMAT DATE
--------------------------------------------------------- */

function formatDate(dateValue) {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

/* ---------------------------------------------------------
   14. FORMAT TIME
--------------------------------------------------------- */

function formatTime(dateValue) {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

/* ---------------------------------------------------------
   15. ESCAPE HTML
--------------------------------------------------------- */

function escapeHTML(value) {
    if (value === null || value === undefined) return "";
    const div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
}

/* ---------------------------------------------------------
   16. DEBOUNCE
--------------------------------------------------------- */

function debounce(callback, delay = 300) {
    let timeout;
    return function () {
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            callback.apply(null, args);
        }, delay);
    };
}

/* ---------------------------------------------------------
   17. CONSOLE MESSAGE
--------------------------------------------------------- */

console.log("WorkToday: Common JavaScript initialized.");