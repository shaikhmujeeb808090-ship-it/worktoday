/* =========================================================
   WorkToday - chat.js
   Customer + Worker Chat JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    setupChat();
    setupChatSearch();
    setupMessageInput();
    setupAttachmentButton();
    console.log("WorkToday chat.js loaded.");
});

/* ---------------------------------------------------------
   1. CHAT SETUP
--------------------------------------------------------- */

function setupChat() {
    const chatContainer = document.querySelector("[data-chat-container]");
    if (!chatContainer) return;
    scrollChatToBottom();
}

/* ---------------------------------------------------------
   2. CHAT SEARCH
--------------------------------------------------------- */

function setupChatSearch() {
    const searchInput = document.querySelector("#chatSearch");
    if (!searchInput) return;
    searchInput.addEventListener("input", debounce(function () {
        const search = searchInput.value.trim().toLowerCase();
        const conversations = document.querySelectorAll("[data-conversation]");
        conversations.forEach(function (conversation) {
            const text = conversation.textContent.toLowerCase();
            if (!search || text.includes(search)) {
                conversation.style.display = "";
            } else {
                conversation.style.display = "none";
            }
        });
    }, 250));
}

/* ---------------------------------------------------------
   3. MESSAGE INPUT
--------------------------------------------------------- */

function setupMessageInput() {
    const form = document.querySelector("#chatForm, [data-chat-form]");
    const input = document.querySelector("#messageInput");
    if (!form ||!input) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        sendChatMessage();
    });

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter" &&!event.shiftKey) {
            event.preventDefault();
            sendChatMessage();
        }
    });
}

/* ---------------------------------------------------------
   4. SEND MESSAGE
--------------------------------------------------------- */

function sendChatMessage() {
    const input = document.querySelector("#messageInput");
    const message = input? input.value.trim() : "";
    if (!message) return;

    const messageList = document.querySelector("#chatMessages, [data-chat-messages]");
    if (!messageList) {
        showNotification("Chat area nahi mila.", "error");
        return;
    }

    const messageElement = document.createElement("div");
    messageElement.className = "chat-message sent";
    messageElement.style.marginBottom = "10px";
    messageElement.style.display = "flex";
    messageElement.style.justifyContent = "flex-end";
    messageElement.innerHTML = `
        <div style="max-width:75%; padding:10px 13px; border-radius:13px 13px 3px 13px; background:#1261d6; color:#ffffff; font-size:14px; line-height:1.5;">
            ${escapeHTML(message)}
            <div style="font-size:10px; opacity:.75; margin-top:4px; text-align:right;">${getCurrentTime()}</div>
        </div>
    `;
    messageList.appendChild(messageElement);
    input.value = "";
    scrollChatToBottom();
    saveTemporaryMessage(message);
    showNotification("Message sent.", "success");
}

/* ---------------------------------------------------------
   5. CURRENT TIME
--------------------------------------------------------- */

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/* ---------------------------------------------------------
   6. SCROLL CHAT
--------------------------------------------------------- */

function scrollChatToBottom() {
    const chat = document.querySelector("#chatMessages, [data-chat-messages]");
    if (!chat) return;
    chat.scrollTop = chat.scrollHeight;
}

/* ---------------------------------------------------------
   7. SAVE TEMPORARY MESSAGE
--------------------------------------------------------- */

function saveTemporaryMessage(message) {
    const messages = getLocalData("worktoday_chat_messages", []);
    const currentUser = getAuthUser();
    messages.push({
        id: "message_" + Date.now(),
        text: message,
        sender: currentUser && currentUser.email? currentUser.email : "temporary-user",
        createdAt: new Date().toISOString()
    });
    saveLocalData("worktoday_chat_messages", messages);
}

/* ---------------------------------------------------------
   8. LOAD SAVED TEMPORARY MESSAGES
--------------------------------------------------------- */

function loadTemporaryMessages() {
    const messages = getLocalData("worktoday_chat_messages", []);
    const messageList = document.querySelector("#chatMessages, [data-chat-messages]");
    if (!messageList) return;
    messages.forEach(function (message) {
        addMessageToChat(message.text, true, message.createdAt);
    });
    scrollChatToBottom();
}

/* ---------------------------------------------------------
   9. ADD MESSAGE TO CHAT
--------------------------------------------------------- */

function addMessageToChat(text, sent = true, createdAt = null) {
    const messageList = document.querySelector("#chatMessages, [data-chat-messages]");
    if (!messageList) return;
    const messageElement = document.createElement("div");
    messageElement.className = sent? "chat-message sent" : "chat-message received";
    const time = createdAt? formatTime(createdAt) : getCurrentTime();
    messageElement.style.marginBottom = "10px";
    messageElement.style.display = "flex";
    messageElement.style.justifyContent = sent? "flex-end" : "flex-start";
    const bubble = document.createElement("div");
    bubble.textContent = text;
    bubble.style.maxWidth = "75%";
    bubble.style.padding = "10px 13px";
    bubble.style.fontSize = "14px";
    bubble.style.lineHeight = "1.5";
    bubble.style.borderRadius = sent? "13px 13px 3px 13px" : "13px 13px 13px 3px";
    if (sent) {
        bubble.style.background = "#1261d6";
        bubble.style.color = "#ffffff";
    } else {
        bubble.style.background = "#f0f2f5";
        bubble.style.color = "#172033";
    }
    const timeElement = document.createElement("div");
    timeElement.textContent = time;
    timeElement.style.fontSize = "10px";
    timeElement.style.opacity = "0.7";
    timeElement.style.marginTop = "4px";
    timeElement.style.textAlign = "right";
    bubble.appendChild(timeElement);
    messageElement.appendChild(bubble);
    messageList.appendChild(messageElement);
}

/* ---------------------------------------------------------
   10. ATTACHMENT BUTTON
--------------------------------------------------------- */

function setupAttachmentButton() {
    const button = document.querySelector("[data-chat-attachment]");
    const fileInput = document.querySelector("#chatAttachment");
    if (!button ||!fileInput) return;

    button.addEventListener("click", function () { fileInput.click(); });

    fileInput.addEventListener("change", function () {
        const file = fileInput.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/") &&!file.type.startsWith("video/")) {
            showNotification("Sirf image ya video select karo.", "error");
            fileInput.value = "";
            return;
        }
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            showNotification("File size 10 MB se kam honi chahiye.", "error");
            fileInput.value = "";
            return;
        }
        showNotification("File selected: " + file.name, "success");
    });
}

/* ---------------------------------------------------------
   11. CHAT CALL BUTTON
--------------------------------------------------------- */

function setupCallButton() {
    const buttons = document.querySelectorAll("[data-chat-call]");
    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            const phone = button.dataset.phone;
            if (!phone) {
                showNotification("Phone number available nahi hai.", "error");
                return;
            }
            window.location.href = "tel:" + phone;
        });
    });
}

/* ---------------------------------------------------------
   12. OPEN CHAT
--------------------------------------------------------- */

function openChat(chatId) {
    if (!chatId) { window.location.href = "chat.html"; return; }
    window.location.href = "chat.html?id=" + encodeURIComponent(chatId);
}

/* ---------------------------------------------------------
   13. WORKER CHAT
--------------------------------------------------------- */

function openWorkerChat(chatId) {
    if (!chatId) { window.location.href = "worker-chat.html"; return; }
    window.location.href = "worker-chat.html?id=" + encodeURIComponent(chatId);
}

/* ---------------------------------------------------------
   14. CHAT SAFETY
--------------------------------------------------------- */

function reportChat() {
    const confirmed = confirm("Kya aap is conversation ko report karna chahte hain?");
    if (!confirmed) return;
    showNotification("Report submitted. Admin review ke liye bheja gaya.", "success");
}

/* ---------------------------------------------------------
   15. BLOCK USER
--------------------------------------------------------- */

function blockChatUser() {
    const confirmed = confirm("Kya aap is user ko block karna chahte hain?");
    if (!confirmed) return;
    showNotification("User block request saved.", "success");
}

/* ---------------------------------------------------------
   16. CLEAR CHAT - TEMPORARY
--------------------------------------------------------- */

function clearTemporaryChat() {
    const confirmed = confirm("Kya aap temporary chat messages clear karna chahte hain?");
    if (!confirmed) return;
    localStorage.removeItem("worktoday_chat_messages");
    const messageList = document.querySelector("#chatMessages, [data-chat-messages]");
    if (messageList) messageList.innerHTML = "";
    showNotification("Chat cleared.", "success");
}

/* ---------------------------------------------------------
   17. CHAT STATUS
--------------------------------------------------------- */

function setChatStatus(status) {
    const statusElement = document.querySelector("[data-chat-status]");
    if (!statusElement) return;
    statusElement.textContent = status;
    if (status.toLowerCase() === "online") {
        statusElement.style.color = "#16733b";
    } else {
        statusElement.style.color = "#697386";
    }
}

/* ---------------------------------------------------------
   18. CHAT JS READY
--------------------------------------------------------- */

console.log("WorkToday: Chat JavaScript initialized.");