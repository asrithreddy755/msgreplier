const questionContainer = document.querySelector(".question-container");
const resultContainer = document.querySelector(".result-container");
const gifResult = document.querySelector(".gif-result");
const heartLoader = document.querySelector(".cssload-main");
const yesBtn = document.querySelector(".js-yes-btn");
const noBtn = document.querySelector(".js-no-btn");

// /change the postion of no button
noBtn.addEventListener("mouseover", () => {
  const newX = Math.floor(Math.random() * questionContainer.offsetWidth);
  const newY = Math.floor(Math.random() * questionContainer.offsetWidth);

  noBtn.style.left = `${newX}px`;
  noBtn.style.top = `${newY}px`;
});

// yes button functionality

yesBtn.addEventListener("click", () => {
  questionContainer.style.display = "none";
  heartLoader.style.display = "inherit";

  const timeoutId = setTimeout(() => {
    heartLoader.style.display = "none";
    resultContainer.style.display = "inherit";
    gifResult.play();
  }, 3000);
});

// URL Parameter Injection
const urlParams = new URLSearchParams(window.location.search);
const recipientName = urlParams.get('recipient_name') || 'Cutie';
const customMsg = urlParams.get('message') || 'I knew it😍!';
const senderName = urlParams.get('sender_name') || '';

document.getElementById('recipient-name').textContent = recipientName;
document.getElementById('success-message').textContent = customMsg;
if (senderName) {
  document.getElementById('sender-message').textContent = 'Love, ' + senderName;
}