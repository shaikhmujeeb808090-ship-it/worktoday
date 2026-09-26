/* =========================================================
   WorkToday - worker.js
   Worker Side JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    setupWorkerSearch();
    setupWorkerFilters();
    setupApplicationButtons();
    setupAvailabilityToggle();
    setupWorkerProfileForm();
    setupWorkerActions();
    loadWorkerStats();
    console.log("WorkToday worker.js loaded.");
});

/* ---------------------------------------------------------
   1. WORKER SEARCH
--------------------------------------------------------- */

function setupWorkerSearch() {
    const searchInput = document.querySelector("#workerWorkSearch");
    if (!searchInput) return;

    searchInput.addEventListener("input", debounce(function () {
        const search = searchInput.value.trim().toLowerCase();
        const cards = document.querySelectorAll("[data-worker-work-card]");
        let visible = 0;
        cards.forEach(function (card) {
            const text = card.textContent.toLowerCase();
            if (!search || text.includes(search)) {
                card.style.display = "";
                visible++;
            } else {
                card.style.display = "none";
            }
        });
        updateWorkerNoResults(visible);
    }, 250));
}

/* ---------------------------------------------------------
   2. WORKER FILTERS
--------------------------------------------------------- */

function setupWorkerFilters() {
    const category = document.querySelector("#workerCategoryFilter");
    const distance = document.querySelector("#distanceFilter");
    const availability = document.querySelector("#workerAvailabilityFilter");

    if (!category &&!distance &&!availability) return;

    function applyFilters() {
        const selectedCategory = category? category.value.toLowerCase() : "";
        const selectedDistance = distance? distance.value : "";
        const selectedAvailability = availability? availability.value.toLowerCase() : "";

        const cards = document.querySelectorAll("[data-worker-work-card]");
        let visible = 0;

        cards.forEach(function (card) {
            const cardCategory = (card.dataset.category || "").toLowerCase();
            const cardDistance = Number(card.dataset.distance || 0);
            const cardAvailability = (card.dataset.availability || "").toLowerCase();

            let categoryMatch =!selectedCategory || selectedCategory === "all" || cardCategory === selectedCategory;
            let distanceMatch = true;
            if (selectedDistance && selectedDistance!== "all") {
                const maxDistance = Number(selectedDistance);
                distanceMatch = cardDistance <= maxDistance;
            }
            let availabilityMatch =!selectedAvailability || selectedAvailability === "all" || cardAvailability === selectedAvailability;

            if (categoryMatch && distanceMatch && availabilityMatch) {
                card.style.display = "";
                visible++;
            } else {
                card.style.display = "none";
            }
        });
        updateWorkerNoResults(visible);
    }

    if (category) category.addEventListener("change", applyFilters);
    if (distance) distance.addEventListener("change", applyFilters);
    if (availability) availability.addEventListener("change", applyFilters);
}

/* ---------------------------------------------------------
   3. NO RESULTS
--------------------------------------------------------- */

function updateWorkerNoResults(count) {
    let box = document.querySelector(".worker-no-results");
    if (count > 0) {
        if (box) box.style.display = "none";
        return;
    }
    if (!box) {
        box = document.createElement("div");
        box.className = "worker-no-results";
        box.textContent = "No work found for these filters.";
        box.style.background = "#ffffff";
        box.style.border = "1px solid #e4e8ef";
        box.style.borderRadius = "12px";
        box.style.padding = "25px";
        box.style.textAlign = "center";
        box.style.color = "#697386";
        box.style.marginTop = "15px";
        const container = document.querySelector("[data-worker-work-container],.works-grid,.work-list");
        if (container) {
            container.appendChild(box);
        } else {
            document.body.appendChild(box);
        }
    }
    box.style.display = "block";
}

/* ---------------------------------------------------------
   4. APPLICATION BUTTONS
--------------------------------------------------------- */

function setupApplicationButtons() {
    const buttons = document.querySelectorAll("[data-apply-work]");
    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            const workId = button.dataset.applyWork;
            if (!workId) {
                showNotification("Work ID missing.", "error");
                return;
            }
            applyForWork(workId, button);
        });
    });
}

/* ---------------------------------------------------------
   5. APPLY FOR WORK
--------------------------------------------------------- */

function applyForWork(workId, button) {
    const existing = getLocalData("worktoday_worker_applications", []);
    const alreadyApplied = existing.some(function (application) {
        return application.workId === workId && application.status!== "withdrawn";
    });
    if (alreadyApplied) {
        showNotification("Aap already is work ke liye apply kar chuke ho.", "info");
        return;
    }
    const user = getAuthUser();
    const application = {
        id: "application_" + Date.now(),
        workId: workId,
        workerId: user && user.email? user.email : "temporary-worker",
        status: "pending",
        createdAt: new Date().toISOString()
    };
    existing.unshift(application);
    saveLocalData("worktoday_worker_applications", existing);
    if (button) {
        button.textContent = "✓ Applied";
        button.disabled = true;
        button.style.opacity = "0.7";
    }
    showNotification("Application submitted successfully.", "success");
}

/* ---------------------------------------------------------
   6. WITHDRAW APPLICATION
--------------------------------------------------------- */

function withdrawApplication(applicationId) {
    if (!applicationId) return;
    const confirmed = confirm("Kya aap application withdraw karna chahte hain?");
    if (!confirmed) return;
    const applications = getLocalData("worktoday_worker_applications", []);
    const application = applications.find(function (item) { return item.id === applicationId; });
    if (!application) {
        showNotification("Application nahi mili.", "error");
        return;
    }
    application.status = "withdrawn";
    application.withdrawnAt = new Date().toISOString();
    saveLocalData("worktoday_worker_applications", applications);
    showNotification("Application withdrawn.", "success");
    setTimeout(function () { window.location.reload(); }, 600);
}

/* ---------------------------------------------------------
   7. WORKER AVAILABILITY
--------------------------------------------------------- */

function setupAvailabilityToggle() {
    const toggle = document.querySelector("#workerAvailability");
    if (!toggle) return;
    toggle.addEventListener("change", function () {
        const available = toggle.checked;
        saveLocalData("worktoday_worker_availability", available);
        updateAvailabilityText(available);
        showNotification(available? "You are now available for work." : "You are now unavailable.", "success");
    });
    const saved = getLocalData("worktoday_worker_availability", true);
    toggle.checked = saved;
    updateAvailabilityText(saved);
}

/* ---------------------------------------------------------
   8. AVAILABILITY TEXT
--------------------------------------------------------- */

function updateAvailabilityText(available) {
    const text = document.querySelector("[data-availability-text]");
    if (!text) return;
    if (available) {
        text.textContent = "Available for work";
        text.style.color = "#16733b";
    } else {
        text.textContent = "Currently unavailable";
        text.style.color = "#b42318";
    }
}

/* ---------------------------------------------------------
   9. WORKER PROFILE FORM
--------------------------------------------------------- */

function setupWorkerProfileForm() {
    const form = document.querySelector("[data-worker-profile-form]");
    if (!form) return;
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const profile = {
            name: getWorkerFormValue(form, "name"),
            phone: getWorkerFormValue(form, "phone"),
            email: getWorkerFormValue(form, "email"),
            city: getWorkerFormValue(form, "city"),
            area: getWorkerFormValue(form, "area"),
            experience: getWorkerFormValue(form, "experience"),
            about: getWorkerFormValue(form, "about"),
            updatedAt: new Date().toISOString()
        };
        if (!profile.name) {
            showNotification("Name enter karo.", "error");
            return;
        }
        saveLocalData("worktoday_worker_profile", profile);
        showNotification("Worker profile saved successfully.", "success");
    });
}

/* ---------------------------------------------------------
   10. GET WORKER FORM VALUE
--------------------------------------------------------- */

function getWorkerFormValue(form, name) {
    const input = form.querySelector(`[name="${name}"]`);
    if (!input) return "";
    return input.value.trim();
}

/* ---------------------------------------------------------
   11. WORKER ACTIONS
--------------------------------------------------------- */

function setupWorkerActions() {
    const buttons = document.querySelectorAll("[data-worker-action]");
    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            const action = button.dataset.workerAction;
            if (action === "view-work") {
                const workId = button.dataset.workId;
                if (workId) {
                    window.location.href = "worker-work-details.html?id=" + encodeURIComponent(workId);
                } else {
                    window.location.href = "worker-work-details.html";
                }
            }
            if (action === "applications") window.location.href = "worker-applications.html";
            if (action === "messages") window.location.href = "worker-messages.html";
            if (action === "notifications") window.location.href = "worker-notifications.html";
            if (action === "profile") window.location.href = "worker-profile.html";
        });
    });
}

/* ---------------------------------------------------------
   12. WORKER STATS
--------------------------------------------------------- */

function loadWorkerStats() {
    const applications = getLocalData("worktoday_worker_applications", []);
    const total = applications.length;
    const pending = applications.filter(function (item) { return item.status === "pending"; }).length;
    const accepted = applications.filter(function (item) { return item.status === "accepted"; }).length;
    const completed = applications.filter(function (item) { return item.status === "completed"; }).length;
    updateWorkerElement("[data-worker-stat='applications']", total);
    updateWorkerElement("[data-worker-stat='pending']", pending);
    updateWorkerElement("[data-worker-stat='accepted']", accepted);
    updateWorkerElement("[data-worker-stat='completed']", completed);
}

/* ---------------------------------------------------------
   13. UPDATE WORKER ELEMENT
--------------------------------------------------------- */

function updateWorkerElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
}

/* ---------------------------------------------------------
   14. GET APPLICATIONS
--------------------------------------------------------- */

function getWorkerApplications() {
    return getLocalData("worktoday_worker_applications", []);
}

/* ---------------------------------------------------------
   15. GET WORKER PROFILE
--------------------------------------------------------- */

function getWorkerProfile() {
    return getLocalData("worktoday_worker_profile", {});
}

/* ---------------------------------------------------------
   16. WORKER APPLICATION FILTER
--------------------------------------------------------- */

function filterWorkerApplications(status) {
    const cards = document.querySelectorAll("[data-application-card]");
    cards.forEach(function (card) {
        const cardStatus = (card.dataset.status || "").toLowerCase();
        if (!status || status === "all" || cardStatus === status.toLowerCase()) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}

/* ---------------------------------------------------------
   17. WORKER PROFILE IMAGE PREVIEW
--------------------------------------------------------- */

function setupWorkerProfileImage(input) {
    if (!input ||!input.files[0]) return;
    const file = input.files[0];
    if (!file.type.startsWith("image/")) {
        showNotification("Please select a valid image.", "error");
        input.value = "";
        return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        showNotification("Image size 5 MB se kam honi chahiye.", "error");
        input.value = "";
        return;
    }
    const preview = document.querySelector("#workerProfilePreview");
    if (!preview) return;
    const reader = new FileReader();
    reader.onload = function (event) {
        preview.src = event.target.result;
        preview.style.display = "block";
    };
    reader.readAsDataURL(file);
}

/* ---------------------------------------------------------
   18. WORKER LOGOUT
--------------------------------------------------------- */

function workerLogout() {
    localStorage.removeItem("worktoday_user");
    sessionStorage.removeItem("worktoday_user");
    window.location.href = "login.html";
}

/* ---------------------------------------------------------
   WORKER JS READY
--------------------------------------------------------- */

console.log("WorkToday: Worker JavaScript initialized.");