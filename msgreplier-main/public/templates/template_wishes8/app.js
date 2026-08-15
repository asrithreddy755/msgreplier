document.addEventListener('DOMContentLoaded', () => {
  // --- Parse URL Query Parameters ---
  const urlParams = new URLSearchParams(window.location.search);
  const recipientName = urlParams.get('recipient_name') || urlParams.get('name') || 'Cutiepiee';
  const senderName = urlParams.get('sender_name') || '';
  const occasion = urlParams.get('occasion') || 'Birthday';
  const dobParam = urlParams.get('dob') || urlParams.get('birthday_date');
  const photoUrlParam = urlParams.get('photo_url');
  const fitModeParam = urlParams.get('fit_mode') || 'cover';
  const objectFitVal = fitModeParam === 'contain' ? 'contain' : 'cover';

  // Dynamic layout changes based on parsed parameters
  document.title = `${occasion} Surprise for ${recipientName}`;

  const countdownTitleEl = document.querySelector('.countdown-title');
  if (countdownTitleEl) {
    countdownTitleEl.innerHTML = `Happy ${occasion} <span>${recipientName}</span>`;
  }

  const envelopeToEl = document.querySelector('.envelope-to');
  if (envelopeToEl) {
    envelopeToEl.textContent = `For You, My ${recipientName}`;
  }

  const modalTitleEl = document.querySelector('.modal-title');
  if (modalTitleEl) {
    modalTitleEl.textContent = `Happy ${occasion} ✨`;
  }

  // --- Parse URL Query Parameters ---
  let photos = [];
  if (photoUrlParam) {
    try {
      if (photoUrlParam.startsWith('[')) {
        photos = JSON.parse(photoUrlParam).filter(p => p && p.url);
      } else if (photoUrlParam.trim() !== '') {
        photos = [{ url: photoUrlParam }];
      }
    } catch (e) {
      console.error('Error parsing photo_url:', e);
      if (photoUrlParam.trim() !== '') {
        photos = [{ url: photoUrlParam }];
      }
    }
  }

  const hasPhotos = photos.length > 0;

  const swiperWrapper = document.querySelector('.swiper-wrapper');
  if (swiperWrapper && hasPhotos) {
    // Replace example slides with actual user photos
    swiperWrapper.innerHTML = '';
    photos.forEach(photo => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.innerHTML = `
        <div class="slide-card">
          <img src="${photo.url}" alt="${photo.caption || 'Memory'}" style="width:100%;height:100%;object-fit:${objectFitVal};border-radius:inherit;" />
        </div>
      `;
      swiperWrapper.appendChild(slide);
    });
  }

  // If no photos: hide gallery screen and its navigation button, change flow directly to letter
  const gotoGalleryBtn = document.getElementById('btn-goto-gallery');
  const galleryScreen = document.getElementById('screen-gallery');
  if (!hasPhotos) {
    if (gotoGalleryBtn) gotoGalleryBtn.style.display = 'none';
    if (galleryScreen) galleryScreen.style.display = 'none';
  }

  // --- Firefly Generation ---
  generateFireflies();

  // --- Curtain Entrance ---
  const curtain = document.getElementById('curtain');
  const curtainLine = document.getElementById('curtain-line');
  const curtainBtnWrap = document.getElementById('curtain-btn-wrap');
  const openCurtainBtn = document.getElementById('open-curtain-btn');

  openCurtainBtn.addEventListener('click', () => {
    // Start curtain opening animations
    curtain.classList.add('open');
    curtainLine.classList.add('fade-out');
    curtainBtnWrap.classList.add('fade-out');

    // Wait for the door slide animation to complete, then remove curtain from DOM and start loader
    setTimeout(() => {
      curtain.classList.add('hidden');
      startLoader();
    }, 1600);
  });

  // --- Screen Routing Controller ---
  function showScreen(screenId) {
    const activeScreen = document.querySelector('.screen.active');
    const targetScreen = document.getElementById(screenId);

    if (activeScreen === targetScreen) return;

    if (activeScreen) {
      activeScreen.classList.add('exit');
      activeScreen.classList.remove('active');
      
      // Complete fade-out, then show next screen
      setTimeout(() => {
        activeScreen.classList.remove('exit');
        targetScreen.classList.add('active');
        
        // Trigger screen-specific entrance hooks
        if (screenId === 'screen-countdown') {
          startCountdownAnimation();
        }
      }, 600);
    } else {
      targetScreen.classList.add('active');
      if (screenId === 'screen-countdown') {
        startCountdownAnimation();
      }
    }
  }

  // --- Screen 0: Loader Screen Logic ---
  function startLoader() {
    const progressBar = document.getElementById('loader-progress');
    
    // Set transitions to fill the bar smoothly in 2.8s
    setTimeout(() => {
      progressBar.style.transition = 'width 2.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
      progressBar.style.width = '100%';
    }, 50);

    // Switch to intro screen after 3 seconds total
    setTimeout(() => {
      showScreen('screen-intro');
    }, 3000);
  }

  // --- Screen 1: Intro Screen Button Handler ---
  document.getElementById('btn-goto-countdown').addEventListener('click', () => {
    showScreen('screen-countdown');
  });

  // --- Screen 2: Countdown btn — goes to gallery if photos exist, else to letter directly ---
  document.getElementById('btn-goto-gallery').addEventListener('click', () => {
    showScreen('screen-gallery');
  });

  // If no photos, add a direct-to-letter button in countdown screen
  if (!hasPhotos) {
    const countdownContent = document.querySelector('#screen-countdown .countdown-content');
    const skipBtn = document.createElement('button');
    skipBtn.className = 'premium-btn';
    skipBtn.style.marginTop = '12px';
    skipBtn.innerHTML = '<span>Read My Message 💌</span>';
    skipBtn.addEventListener('click', () => showScreen('screen-letter'));
    if (countdownContent) countdownContent.appendChild(skipBtn);
  }

  function startCountdownAnimation() {
    let targetDate = new Date('2007-06-23');
    if (dobParam) {
      const parsed = new Date(dobParam);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
      }
    }
    const now = new Date();

    // Calculate elapsed time from the target date
    let years = now.getFullYear() - targetDate.getFullYear();
    let months = now.getMonth() - targetDate.getMonth();
    let days = now.getDate() - targetDate.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const countYearsEl = document.getElementById('count-years');
    const countMonthsEl = document.getElementById('count-months');
    const countDaysEl = document.getElementById('count-days');

    // Count-up animation using requestAnimationFrame
    const startTime = performance.now();
    const duration = 2000; // 2 seconds

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic ease-out curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      countYearsEl.textContent = Math.floor(easeProgress * years);
      countMonthsEl.textContent = Math.floor(easeProgress * months);
      countDaysEl.textContent = Math.floor(easeProgress * days);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }

    requestAnimationFrame(updateCounter);
  }

  // --- Screen 3: Swiper Gallery Setup ---
  let swiperInstance = null;
  document.getElementById('btn-goto-letter').addEventListener('click', () => {
    showScreen('screen-letter');
  });

  // Initialize Swiper carousel when we enter Gallery screen
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.classList.contains('active') && mutation.target.id === 'screen-gallery') {
        if (!swiperInstance) {
          swiperInstance = new Swiper('.swiper', {
            loop: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            spaceBetween: 20,
            grabCursor: true,
          });
        }
      }
    });
  });

  observer.observe(document.getElementById('screen-gallery'), {
    attributes: true,
    attributeFilter: ['class']
  });

  // --- Screen 4: Letter Envelope & Typewriter modal ---
  const envelope = document.getElementById('envelope-trigger');
  const letterModal = document.getElementById('letter-modal');
  const modalContainer = document.getElementById('modal-container');
  const modalClose = document.getElementById('modal-close');
  const typewriterTextEl = document.getElementById('typewriter-text');
  const textWrapper = document.getElementById('modal-text-wrapper');

  let letterMessage = `Happiest birthday my silly cutuu 🐼
I pray you achieve all your dreams, stay happy, and keep smiling the way you do… because that smile is my favorite thing🫶

Everyday is your day because you are the main character… and YOU KNOW IT 😌
Let's share unlimited laughs , love , fights , and happiness 🧿😚
I love you forever and ever and ever ♾️
Thankyou for being my partner in every sense ,happy 24nd 😘😘❤️🧿`;

  const msgParam = urlParams.get('message');
  if (msgParam) {
    letterMessage = decodeURIComponent(msgParam);
    if (senderName) {
      letterMessage += `\n\n— With Love, ${senderName}`;
    }
  }

  let typingInterval = null;

  envelope.addEventListener('click', () => {
    if (envelope.classList.contains('opened')) return;

    envelope.classList.add('opened');

    // Wait 600ms for envelope flap animation to complete, then pop the letter modal
    setTimeout(() => {
      letterModal.classList.add('active');
      startTypewriterEffect();
    }, 600);
  });

  modalClose.addEventListener('click', () => {
    letterModal.classList.remove('active');
    
    // Stop typing and reset
    if (typingInterval) {
      clearInterval(typingInterval);
    }
    typewriterTextEl.innerHTML = '';
    
    // Unseal envelope so it can be re-opened
    setTimeout(() => {
      envelope.classList.remove('opened');
    }, 500);
  });

  // Prevent clicks inside modal container from closing it, but clicking backdrop closes it
  letterModal.addEventListener('click', (e) => {
    if (e.target === letterModal) {
      modalClose.click();
    }
  });

  function startTypewriterEffect() {
    typewriterTextEl.innerHTML = '';
    let charIndex = 0;
    
    // Type characters at 28ms speed
    typingInterval = setInterval(() => {
      if (charIndex < letterMessage.length) {
        // Append character, preserve space, newlines, and maintain cursor block
        typewriterTextEl.innerHTML = letterMessage.slice(0, charIndex + 1) + '<span class="ink-cursor">|</span>';
        charIndex++;
        
        // Auto-scroll lined paper wrapper as writing line advances
        textWrapper.scrollTop = textWrapper.scrollHeight;
      } else {
        clearInterval(typingInterval);
        // Leave the cursor blinking at the end of the text
        typewriterTextEl.innerHTML = letterMessage + '<span class="ink-cursor">|</span>';
      }
    }, 28);
  }

  // --- Helper: Fireflies Generator ---
  function generateFireflies() {
    const container = document.getElementById('fireflies');
    const count = 40;

    for (let i = 0; i < count; i++) {
      const firefly = document.createElement('span');
      firefly.classList.add('firefly');
      
      // Randomize layout, scale, duration, and delay offsets
      const leftPos = Math.random() * 100;
      const duration = 6 + Math.random() * 6; // 6s to 12s
      const delay = Math.random() * 6; // 0s to 6s
      const size = 3 + Math.random() * 2; // 3px to 5px

      firefly.style.left = `${leftPos}%`;
      firefly.style.animationDuration = `${duration}s`;
      firefly.style.animationDelay = `${delay}s`;
      firefly.style.width = `${size}px`;
      firefly.style.height = `${size}px`;

      container.appendChild(firefly);
    }
  }
});
