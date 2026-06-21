// Dynamic Name/Message parsing and persist functionality
const urlParams = new URLSearchParams(window.location.search);
let recipient = urlParams.get('recipient_name') || sessionStorage.getItem('recipient_name') || 'Beautiful';
let sender = urlParams.get('sender_name') || sessionStorage.getItem('sender_name') || 'Someone';
let message = urlParams.get('message') || sessionStorage.getItem('message') || '';

// Store in sessionStorage for page transition persistence
if (urlParams.get('recipient_name')) sessionStorage.setItem('recipient_name', urlParams.get('recipient_name'));
if (urlParams.get('sender_name')) sessionStorage.setItem('sender_name', urlParams.get('sender_name'));
if (urlParams.get('message')) sessionStorage.setItem('message', urlParams.get('message'));

document.addEventListener("DOMContentLoaded", function () {
  // Inject recipient name
  const recipientEl = document.getElementById("recipient-name");
  if (recipientEl) {
    recipientEl.textContent = recipient;
  }

  // Inject sender name
  const senderEl = document.getElementById("sender-name");
  if (senderEl) {
    senderEl.textContent = sender;
  }

  // Inject custom message
  const messageEl = document.getElementById("custom-message");
  const messageBoxEl = document.getElementById("message-box");
  if (messageEl && message.trim()) {
    messageEl.textContent = message;
    if (messageBoxEl) {
      messageBoxEl.style.display = "block";
    }
  }

  // Rewrite internal links so parameters persist across page transitions
  document.querySelectorAll("a").forEach(a => {
    const href = a.getAttribute("href");
    if (href && href !== "#" && !href.startsWith("http") && !href.startsWith("//")) {
      const separator = href.includes("?") ? "&" : "?";
      const newParams = new URLSearchParams({
        recipient_name: recipient,
        sender_name: sender,
        message: message
      });
      a.setAttribute("href", href + separator + newParams.toString());
    }
  });

  // Random move element logic (for the 'No' button in no3.html)
  const moveRandom = document.querySelector("#move-random");
  if (moveRandom) {
    moveRandom.addEventListener("mouseenter", function (e) {
      moveRandomEl(e.target);
    });
    // Add touchstart for mobile responsiveness
    moveRandom.addEventListener("touchstart", function (e) {
      e.preventDefault();
      moveRandomEl(e.target);
    });
  }
});

function moveRandomEl(elm) {
  elm.style.position = "absolute";
  elm.style.top = Math.floor(Math.random() * 80 + 10) + "%";
  elm.style.left = Math.floor(Math.random() * 80 + 10) + "%";
}
