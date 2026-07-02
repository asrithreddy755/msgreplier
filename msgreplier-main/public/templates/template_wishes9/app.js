// Parse URL Query Parameters
const urlParams = new URLSearchParams(window.location.search);
const recipientName = urlParams.get('recipient_name') || urlParams.get('name') || 'Cutie';
const senderName = urlParams.get('sender_name') || '';
const customMessage = urlParams.get('message') || '';

document.addEventListener('DOMContentLoaded', () => {
  // Apply dynamic recipient name
  if (recipientName) {
    document.title = `Sorry for ${recipientName} 🥺`;
    const sealedTitle = document.querySelector('.sealed-title');
    if (sealedTitle) {
      sealedTitle.innerText = `Sealed For ${recipientName}`;
    }
    const finalTitle = document.querySelector('#stage-final .loader-title');
    if (finalTitle) {
      finalTitle.innerText = `Hey ${recipientName}, are you still angry at me? If yes, please just forgive me.`;
    }
  }

  // Apply dynamic message
  if (customMessage) {
    const messageP = document.querySelector('.message-scroll p');
    if (messageP) {
      messageP.innerText = customMessage;
    }
  }

  // Apply sender name in letter
  const senderEl = document.getElementById('letter-sender-name');
  if (senderEl && senderName) {
    senderEl.innerText = `— With love, ${senderName} ♥`;
  }
});

// Particle Click Effect
document.addEventListener('click', (t) => {
  // Prevent particles on clicking buttons, stamps, seals, or text inputs to keep UI clean
  if (t.target.closest('.corner-stamp') || t.target.closest('.seal') || t.target.closest('input') || t.target.closest('button')) return;
  
  const x = t.clientX;
  const y = t.clientY;
  const symbols = ["✨", "͙͘͡★", "-`♡´-"];
  const count = 10;
  
  for (let s = 0; s < count; s++) {
    const particle = document.createElement('div');
    particle.className = 'click-particle';
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    // Random directions matching the Next.js version
    const offsetX = (Math.random() - 0.5) * 200;
    const offsetY = -(200 * Math.random()) - 60;
    const rotate = 500 * Math.random();
    const size = 16 * Math.random() + 8;
    const duration = 0.6 * Math.random() + 1.4;

    particle.innerText = symbol;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.fontSize = `${size}px`;
    particle.style.setProperty('--dx', `${offsetX}px`);
    particle.style.setProperty('--dy', `${offsetY}px`);
    particle.style.setProperty('--dr', `${rotate}deg`);
    particle.style.animationDuration = `${duration}s`;

    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, duration * 1000);
  }
});

// Stage Management
const stages = document.querySelectorAll('.stage');

function goToStage(index) {
  stages.forEach((stage, idx) => {
    if (idx === index) {
      stage.style.display = 'flex';
      // Automatically focus name input on Stage 0 if it is already unlocked
      if (idx === 0) {
        const nameInput = document.querySelector('.name-input');
        if (nameInput && !nameInput.disabled) {
          nameInput.focus();
        }
      }
    } else {
      stage.style.display = 'none';
    }
  });
}

// Initialize first stage
goToStage(0);

// ================== STAGE 1 (Sealed Letter) ==================
const stamp = document.querySelector('.corner-stamp');
const seal = document.querySelector('.seal');
const openLetterBtn = document.querySelector('.open-letter-btn');

let activated = false;

stamp.addEventListener('click', () => {
  if (activated) return;
  activated = true;
  
  stamp.classList.add('fly-away');
  seal.classList.add('rotating');

  setTimeout(() => {
    stamp.classList.add('hidden-stamp');
    openLetterBtn.disabled = false;
    openLetterBtn.classList.remove('disabled-btn');
    openLetterBtn.innerText = "✨ OPEN THE LETTER";
  }, 800);
});

openLetterBtn.addEventListener('click', () => {
  goToStage(1);
});

// ================== STAGE 2 (Do Not Close) ==================
document.getElementById('stage2-next').addEventListener('click', () => {
  goToStage(2);
});

// ================== STAGE 3 (Apology Intro) ==================
document.getElementById('stage3-next').addEventListener('click', () => {
  goToStage(3);
});

// ================== STAGE 4 (Beat Me) ==================
let beatCount = 0;
const beatNum = document.querySelector('.beat-number');
const beatMeBtn = document.querySelector('.beat-me-btn');
const revealGifWrapper = document.querySelector('.reveal-gif-wrapper');
const messageRevealed = document.querySelector('.message-revealed');
const beatEmoji = document.querySelector('.beat-emoji');
const dividerSad = document.querySelector('.divider-sad');
const dividerHappy = document.querySelector('.divider-happy');
const stage4Next = document.getElementById('stage4-next');

beatMeBtn.addEventListener('click', () => {
  beatCount++;
  beatNum.innerText = beatCount;

  // Synthesize soft beat punch sound
  playBeatSound();

  // Wiggle emoji animation
  beatEmoji.classList.remove('wiggle');
  void beatEmoji.offsetWidth; // Trigger reflow
  beatEmoji.classList.add('wiggle');

  // Change reaction emoji based on beat count
  if (beatCount === 0) {
    beatEmoji.innerText = "•︵•";
  } else if (beatCount < 2) {
    beatEmoji.innerText = "(ಥ_ಥ)";
  } else if (beatCount < 4) {
    beatEmoji.innerText = ".·°՞(¯□¯)՞°·.";
  } else {
    beatEmoji.innerText = "(˚ ˃̣̣̥⌓˂̣̣̥ )づ♡";
  }

  // Show hidden elements
  revealGifWrapper.classList.add('active');
  messageRevealed.classList.add('active');
  dividerSad.style.display = 'none';
  dividerHappy.classList.add('active');
});

function playBeatSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Randomize slightly for dynamic feel
    osc.frequency.value = 400 + Math.random() * 200;
    osc.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (err) {
    console.log("Synthesizer blocked or unsupported:", err);
  }
}

stage4Next.addEventListener('click', () => {
  goToStage(4);
});

// ================== STAGE 5 (Apology Letter / Curtain) ==================
const openBtn = document.querySelector('.open-btn');
const leftCurtain = document.querySelector('.left-curtain');
const rightCurtain = document.querySelector('.right-curtain');
const centerLine = document.querySelector('.center-line');
const letterPaper = document.querySelector('.letter-paper');

openBtn.addEventListener('click', () => {
  leftCurtain.classList.add('opened');
  rightCurtain.classList.add('opened');
  centerLine.style.display = 'none';
  openBtn.style.display = 'none';
  letterPaper.classList.add('active');
});


// ================== STAGE 6 (Final Decision) ==================
const btnYes = document.querySelector('.btn-yes');
const btnNo = document.querySelector('.btn-no');
const backdrop = document.querySelector('.backdrop');
const claimoldPopup = document.querySelector('.claimold-popup');
const popupGif = document.querySelector('.popup-gif');
const popupText = document.querySelector('.popup-text');

let noPopupActive = false;
let autoHideTimeout = null;

btnNo.addEventListener('click', () => {
  showModal('no');
});

btnYes.addEventListener('click', () => {
  showModal('yes');
});

function showModal(type) {
  // Clear any active timeouts
  if (autoHideTimeout) {
    clearTimeout(autoHideTimeout);
    autoHideTimeout = null;
  }

  // Display backdrop
  backdrop.style.display = 'flex';
  void backdrop.offsetWidth; // Trigger reflow
  backdrop.classList.add('active');
  document.querySelector('.stage-wrapper').classList.add('blur-active');

  if (type === 'no') {
    noPopupActive = true;
    popupGif.src = 'gifs/fifth.gif';
    popupText.innerText = "Why, I made something really nice for you… please just say yes, please, please.";
    
    // Remove Love You button if it exists
    const loveBtn = document.querySelector('.love-you-btn');
    if (loveBtn) loveBtn.remove();

    // Auto-hide popup after 3 seconds
    autoHideTimeout = setTimeout(() => {
      if (noPopupActive) {
        hideModal();
      }
    }, 3000);
  } else if (type === 'yes') {
    noPopupActive = false;
    popupGif.src = 'gifs/fouth.gif';
    popupText.innerText = 'Thanku Thanku, I knew you would definitely say "yes" my love. Now, Just say “I love you” to me one time.';

    // Create and append WhatsApp button if not already present
    let loveBtn = document.querySelector('.love-you-btn');
    if (!loveBtn) {
      loveBtn = document.createElement('button');
      loveBtn.className = 'love-you-btn';
      loveBtn.innerText = "✨ LOVE YOU જ⁀➴ ♡";
      loveBtn.addEventListener('click', () => {
        const text = encodeURIComponent("Love you");
        window.open(`https://wa.me/?text=${text}`, '_blank');
      });
      claimoldPopup.appendChild(loveBtn);
    }
  }
}

// Hide popup when clicking outside (only active for 'No' popup to prevent missing WhatsApp redirect)
backdrop.addEventListener('click', (e) => {
  if (e.target === backdrop && noPopupActive) {
    hideModal();
  }
});

function hideModal() {
  backdrop.classList.remove('active');
  document.querySelector('.stage-wrapper').classList.remove('blur-active');
  setTimeout(() => {
    backdrop.style.display = 'none';
  }, 300);
  noPopupActive = false;
}
