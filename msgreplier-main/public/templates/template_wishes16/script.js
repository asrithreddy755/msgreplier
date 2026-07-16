const envelope = document.querySelector('.envelope');
const heartSeal = document.querySelector('.heart-seal');
let timeoutId;

envelope.addEventListener('mouseover', () => {
    clearTimeout(timeoutId);
    heartSeal.style.opacity = 0;
});

envelope.addEventListener('mouseout', () => {
    timeoutId = setTimeout(() => {
        heartSeal.style.opacity = 1;
    }, 1500); 
});

heartSeal.style.transition = 'opacity 0.3s ease';

// URL Parameter Injection
const urlParams = new URLSearchParams(window.location.search);
const recipientName = urlParams.get('recipient_name') || '';
const senderName = urlParams.get('sender_name') || '';
const customMsg = urlParams.get('message') || '';

if (recipientName) {
    document.getElementById('recipient-greeting').textContent = `To ${recipientName},`;
}
if (customMsg) {
    document.getElementById('card-message').textContent = customMsg;
}
if (senderName) {
    document.getElementById('sender-signature').textContent = `Happy Valentine's Day! Love, ${senderName}`;
}