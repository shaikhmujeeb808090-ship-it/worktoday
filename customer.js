/* =========================================================
   WorkToday - customer.js
   Customer Side JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    setupWorkSearch();
    setupWorkFilters();
    setupWorkActions();
    setupCustomerForms();
    setupWorkerInterestButtons();
    console.log("WorkToday customer.js loaded.");
});

/* ---------------------------------------------------------
   1. WORK SEARCH
--------------------------------------------------------- */

function setupWorkSearch() {
    const searchInput = document.querySelector("#workSearch");
    if (!searchInput) return;

    searchInput.addEventListener("input", debounce(function () {
        const searchText = searchInput.value.trim().toLowerCase();
        const workCards = document.querySelectorAll("[data-work-card]");
        let found = 0;
        workCards.forEach(function (card) {
            const text = card.textContent.toLowerCase();
            if (!searchText || text.includes(searchText)) {
                card.style.display = "";
                found++;
            } else {
                card.style.display = "none";
            }
        });
        updateNoResultsMessage(found);
    }, 250));
}

/* ---------------------------------------------------------
   2. WORK FILTERS
--------------------------------------------------------- */

function setupWorkFilters() {
    const categoryFilter = document.querySelector("#categoryFilter");
    const cityFilter = document.querySelector("#cityFilter");
    const availabilityFilter = document.querySelector("#availabilityFilter");

    if (!categoryFilter && !cityFilter && !availabilityFilter) return;

    function applyFilters() {
        const category = categoryFilter ? categoryFilter.value.toLowerCase() : "";
        const city = cityFilter ? cityFilter.value.toLowerCase() : "";
        const availability = availabilityFilter ? availabilityFilter.value.toLowerCase() : "";

        const cards = document.querySelectorAll("[data-work-card]");
        let visible = 0;

        cards.forEach(function (card) {
            const cardCategory = (card.dataset.category || "").toLowerCase();
            const cardCity = (card.dataset.city || "").toLowerCase();
            const cardAvailability = (card.dataset.availability || "").toLowerCase();

            const categoryMatch = !category || category === "all" || cardCategory === category;
            const cityMatch = !city || city === "all" || cardCity === city;
            const availabilityMatch = !availability || availability === "all" || cardAvailability === availability;

            if (categoryMatch && cityMatch && availabilityMatch) {
                card.style.display = "";
                visible++;
            } else {
                card.style.display = "none";
            }
        });
        updateNoResultsMessage(visible);
    }

    if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
    if (cityFilter) cityFilter.addEventListener("change", applyFilters);
    if (availabilityFilter) availabilityFilter.addEventListener("change", applyFilters);
}

/* ---------------------------------------------------------
   3. NO RESULTS MESSAGE
--------------------------------------------------------- */

function updateNoResultsMessage(count) {
    let message = document.querySelector(".customer-no-results");
    if (count > 0) {
        if (message) message.style.display = "none";
        return;
    }
    if (!message) {
        message = document.createElement("div");
        message.className = "customer-no-results";
        message.textContent = "No work found. Try another search or filter.";
        message.style.padding = "25px";
        message.style.marginTop = "15px";
        message.style.textAlign = "center";
        message.style.background = "#ffffff";
        message.style.border = "1px solid #e4e8ef";
        message.style.borderRadius = "12px";
        message.style.color = "#697386";
        const container = document.querySelector(".work-list, .jobs-list, .works-grid");
        if (container) {
            container.appendChild(message);
        } else {
            document.body.appendChild(message);
        }
    }
    message.style.display = "block";
}

/* ---------------------------------------------------------
   4. WORK ACTIONS
--------------------------------------------------------- */

function setupWorkActions() {
    const actionButtons = document.querySelectorAll("[data-work-action]");
    actionButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const action = button.dataset.workAction;
            if (action === "view") {
                const workId = button.dataset.workId;
                if (workId) {
                    window.location.href = "work-details.html?id=" + encodeURIComponent(workId);
                } else {
                    window.location.href = "work-details.html";
                }
            }
            if (action === "post") window.location.href = "post-work.html";
            if (action === "messages") window.location.href = "messages.html";
            if (action === "profile") window.location.href = "profile.html";
        });
    });
}

/* ---------------------------------------------------------
   5. CUSTOMER FORMS
--------------------------------------------------------- */

function setupCustomerForms() {
    const forms = document.querySelectorAll("[data-customer-form]");
    forms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const formType = form.dataset.customerForm;
            if (formType === "post-work") handlePostWorkForm(form);
            if (formType === "profile") handleCustomerProfileForm(form);
        });
    });
}

/* ---------------------------------------------------------
   6. POST WORK FORM
--------------------------------------------------------- */

function handlePostWorkForm(form) {
    const title = getFormValue(form, "title");
    const category = getFormValue(form, "category");
    const description = getFormValue(form, "description");
    const city = getFormValue(form, "city");

    if (!title) { showNotification("Work title enter karo.", "error"); return; }
    if (!category) { showNotification("Work category select karo.", "error"); return; }
    if (!description) { showNotification("Work description enter karo.", "error"); return; }
    if (!city) { showNotification("City select karo.", "error"); return; }

    const work = {
        id: "work_" + Date.now(),
        title: title,
        category: category,
        description: description,
        city: city,
        status: "open",
        views: 0,
        interestedWorkers: 0,
        createdAt: new Date().toISOString()
    };

    const existingWorks = getLocalData("worktoday_customer_works", []);
    existingWorks.unshift(work);
    saveLocalData("worktoday_customer_works", existingWorks);
    showNotification("Work successfully posted!", "success");
    setTimeout(function () { window.location.href = "my-work.html"; }, 900);
}

/* ---------------------------------------------------------
   7. CUSTOMER PROFILE FORM
--------------------------------------------------------- */

function handleCustomerProfileForm(form) {
    const name = getFormValue(form, "name");
    const phone = getFormValue(form, "phone");
    const city = getFormValue(form, "city");
    if (!name) { showNotification("Name enter karo.", "error"); return; }
    const profile = { name: name, phone: phone, city: city, updatedAt: new Date().toISOString() };
    saveLocalData("worktoday_customer_profile", profile);
    showNotification("Profile saved successfully.", "success");
}

/* ---------------------------------------------------------
   8. GET FORM VALUE
--------------------------------------------------------- */

function getFormValue(form, fieldName) {
    const input = form.querySelector(`[name="${fieldName}"]`);
    if (!input) return "";
    return input.value.trim();
}

/* ---------------------------------------------------------
   9. WORKER INTEREST BUTTON
--------------------------------------------------------- */

function setupWorkerInterestButtons() {
    const buttons = document.querySelectorAll("[data-interest-worker]");
    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            if (button.dataset.interested === "true") return;
            button.dataset.interested = "true";
            button.textContent = "✓ Interested";
            button.style.background = "#e8f7ee";
            button.style.color = "#16733b";
            showNotification("Worker interest updated.", "success");
        });
    });
}

/* ---------------------------------------------------------
   10. WORKER FOUND
--------------------------------------------------------- */

function markWorkerFound(workId) {
    if (!workId) { showNotification("Work ID missing.", "error"); return; }
    const works = getLocalData("worktoday_customer_works", []);
    const work = works.find(function (item) { return item.id === workId; });
    if (!work) { showNotification("Work nahi mila.", "error"); return; }
    work.status = "closed";
    work.closedAt = new Date().toISOString();
    saveLocalData("worktoday_customer_works", works);
    showNotification("Worker Found! Work closed.", "success");
}

/* ---------------------------------------------------------
   11. INCREASE WORK VIEWS
--------------------------------------------------------- */

function increaseWorkView(workId) {
    if (!workId) return;
    const works = getLocalData("worktoday_customer_works", []);
    const work = works.find(function (item) { return item.id === workId; });
    if (!work) return;
    work.views = Number(work.views || 0) + 1;
    saveLocalData("worktoday_customer_works", works);
}

/* ---------------------------------------------------------
   12. SORT WORKS
--------------------------------------------------------- */

function sortWorks(sortType) {
    const container = document.querySelector("[data-work-container]");
    if (!container) return;
    const cards = Array.from(container.querySelectorAll("[data-work-card]"));
    cards.sort(function (a, b) {
        if (sortType === "newest") return Number(b.dataset.timestamp || 0) - Number(a.dataset.timestamp || 0);
        if (sortType === "oldest") return Number(a.dataset.timestamp || 0) - Number(b.dataset.timestamp || 0);
        if (sortType === "views") return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        return 0;
    });
    cards.forEach(function (card) { container.appendChild(card); });
}

/* ---------------------------------------------------------
   13. CUSTOMER DASHBOARD STATS
--------------------------------------------------------- */

function loadCustomerStats() {
    const works = getLocalData("worktoday_customer_works", []);
    const totalWorks = works.length;
    const activeWorks = works.filter(function (work) { return work.status === "open"; }).length;
    const closedWorks = works.filter(function (work) { return work.status === "closed"; }).length;
    const totalViews = works.reduce(function (total, work) { return total + Number(work.views || 0); }, 0);
    updateElement("[data-stat='total-works']", totalWorks);
    updateElement("[data-stat='active-works']", activeWorks);
    updateElement("[data-stat='closed-works']", closedWorks);
    updateElement("[data-stat='views']", totalViews);
}

/* ---------------------------------------------------------
   14. UPDATE ELEMENT
--------------------------------------------------------- */

function updateElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
}

/* ---------------------------------------------------------
   15. CUSTOMER WORK DATA
--------------------------------------------------------- */

function getCustomerWorks() {
    return getLocalData("worktoday_customer_works", []);
}

/* ---------------------------------------------------------
   16. DELETE WORK - TEMPORARY
--------------------------------------------------------- */

function deleteCustomerWork(workId) {
    if (!workId) return;
    const confirmed = confirm("Kya aap ye work delete karna chahte hain?");
    if (!confirmed) return;
    let works = getCustomerWorks();
    works = works.filter(function (work) { return work.id !== workId; });
    saveLocalData("worktoday_customer_works", works);
    showNotification("Work deleted.", "success");
    setTimeout(function () { window.location.reload(); }, 600);
}

/* ---------------------------------------------------------
   17. CUSTOMER JS READY
--------------------------------------------------------- */

console.log("WorkToday: Customer JavaScript initialized.");