// ============================================================
// ASSIGNMENT #5 - COMPLETE JAVASCRIPT SOLUTION
// All 5 tasks in one file
// Team: Nuraly, Sultan, Daniyar, Ramazan | Group: Eagles
// ============================================================

// ============================================================
// TASK 1: FORM VALIDATION (15%)
// ============================================================
function initFormValidation() {
  const form = document.getElementById('register-form');
  if (!form) return;

  // Create error message container
  const createErrorElement = (message) => {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.style.cssText = 'color: #e74c3c; font-size: 13px; margin-top: 5px; display: block;';
    error.textContent = message;
    return error;
  };

  // Remove all previous errors
  const clearErrors = () => {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.is-invalid').forEach(el => {
      el.classList.remove('is-invalid');
      el.style.borderColor = '';
    });
  };

  // Show error for specific field
  const showError = (input, message) => {
    input.style.borderColor = '#e74c3c';
    input.classList.add('is-invalid');
    const errorEl = createErrorElement(message);
    input.parentElement.appendChild(errorEl);
  };

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[\d\s\+\-\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  // Form submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const username = document.getElementById('username');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');

    let isValid = true;

    // Validate username
    if (!username.value.trim()) {
      showError(username, 'Full name is required');
      isValid = false;
    } else if (username.value.trim().length < 2) {
      showError(username, 'Name must be at least 2 characters');
      isValid = false;
    }

    // Validate phone
    if (!phone.value.trim()) {
      showError(phone, 'Phone number is required');
      isValid = false;
    } else if (!validatePhone(phone.value)) {
      showError(phone, 'Please enter a valid phone number');
      isValid = false;
    }

    // Validate email
    if (!email.value.trim()) {
      showError(email, 'Email is required');
      isValid = false;
    } else if (!validateEmail(email.value)) {
      showError(email, 'Please enter a valid email address');
      isValid = false;
    }

    // Validate password
    if (!password.value) {
      showError(password, 'Password is required');
      isValid = false;
    } else if (!validatePassword(password.value)) {
      showError(password, 'Password must be at least 8 characters long');
      isValid = false;
    }

    // Validate password confirmation
    if (!confirmPassword.value) {
      showError(confirmPassword, 'Please confirm your password');
      isValid = false;
    } else if (password.value !== confirmPassword.value) {
      showError(confirmPassword, 'Passwords do not match');
      isValid = false;
    }

    // If all valid, save user
    if (isValid) {
      const user = {
        username: username.value.trim(),
        phone: phone.value.trim(),
        email: email.value.trim(),
        password: password.value,
        avatar: null,
        friends: [],
        registeredAt: new Date().toISOString()
      };

      localStorage.setItem('user', JSON.stringify(user));
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.style.cssText = 'background: #2ecc71; color: white; padding: 15px; border-radius: 10px; margin: 20px 0; text-align: center; font-weight: bold;';
      successMsg.textContent = '✓ Registration successful! Redirecting...';
      form.insertBefore(successMsg, form.firstChild);

      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 1500);
    }
  });

  // Real-time validation on blur
  ['username', 'phone', 'email', 'password', 'confirm-password'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('blur', () => {
        const errors = input.parentElement.querySelectorAll('.error-message');
        errors.forEach(e => e.remove());
        input.style.borderColor = '';
        input.classList.remove('is-invalid');
      });
    }
  });
}

// ============================================================
// TASK 2: ACCORDION FOR FAQs (15%)
// ============================================================
function initAccordion() {
  const accordionHTML = `
    <div class="faq-section" style="max-width: 800px; margin: 40px auto; padding: 20px;">
      <h2 style="text-align: center; margin-bottom: 30px; color: var(--text-color);">
        Frequently Asked Questions
      </h2>
      <div class="accordion">
        <div class="accordion-item">
          <button class="accordion-header">
            <span>What is Play Beat?</span>
            <span class="accordion-icon">+</span>
          </button>
          <div class="accordion-content">
            <p>Play Beat is your personal music streaming platform where you can listen to millions of songs, create playlists, and discover new music from around the world.</p>
          </div>
        </div>

        <div class="accordion-item">
          <button class="accordion-header">
            <span>How do I create a playlist?</span>
            <span class="accordion-icon">+</span>
          </button>
          <div class="accordion-content">
            <p>Simply browse songs, click the "+" button next to any track you like, and it will be automatically added to your personal playlist. You can manage your playlist from the "My Playlist" page.</p>
          </div>
        </div>

        <div class="accordion-item">
          <button class="accordion-header">
            <span>Is Play Beat free to use?</span>
            <span class="accordion-icon">+</span>
          </button>
          <div class="accordion-content">
            <p>Yes! Play Beat offers a free tier with unlimited music streaming. We also offer premium features for an enhanced experience without ads and with offline downloads.</p>
          </div>
        </div>

        <div class="accordion-item">
          <button class="accordion-header">
            <span>Can I use Play Beat on multiple devices?</span>
            <span class="accordion-icon">+</span>
          </button>
          <div class="accordion-content">
            <p>Absolutely! Your account syncs across all your devices - phone, tablet, and computer. Your playlists and preferences are always available wherever you log in.</p>
          </div>
        </div>

        <div class="accordion-item">
          <button class="accordion-header">
            <span>How do I change my theme?</span>
            <span class="accordion-icon">+</span>
          </button>
          <div class="accordion-content">
            <p>Click the "Toggle Theme" button in the navigation menu to switch between light and dark modes. Your preference will be saved automatically.</p>
          </div>
        </div>
      </div>
    </div>

    <style>
      .accordion-item {
        background: var(--bg1-color);
        margin-bottom: 15px;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
      }

      .accordion-item:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateY(-2px);
      }

      .accordion-header {
        width: 100%;
        padding: 20px 25px;
        background: transparent;
        border: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-color);
        text-align: left;
        transition: all 0.3s ease;
      }

      .accordion-header:hover {
        background: var(--accent-color);
        color: var(--bg-color);
      }

      .accordion-icon {
        font-size: 24px;
        font-weight: bold;
        transition: transform 0.3s ease;
        color: var(--accent-color);
      }

      .accordion-header:hover .accordion-icon {
        color: var(--bg-color);
      }

      .accordion-item.active .accordion-icon {
        transform: rotate(45deg);
      }

      .accordion-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.4s ease, padding 0.4s ease;
        background: var(--bg-color);
      }

      .accordion-item.active .accordion-content {
        max-height: 500px;
        padding: 20px 25px;
      }

      .accordion-content p {
        margin: 0;
        line-height: 1.6;
        color: var(--text-color);
        font-size: 15px;
      }
    </style>
  `;

  // Insert accordion after the main content on about.html or news.html
  const insertPoints = [
    document.querySelector('.container.my-5'),
    document.querySelector('main'),
    document.querySelector('.container')
  ];

  const insertPoint = insertPoints.find(el => el !== null);
  
  if (insertPoint) {
    const accordionContainer = document.createElement('div');
    accordionContainer.innerHTML = accordionHTML;
    insertPoint.appendChild(accordionContainer);

    // Add click handlers
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const accordionItem = header.parentElement;
        const isActive = accordionItem.classList.contains('active');

        // Close all other items
        document.querySelectorAll('.accordion-item').forEach(item => {
          if (item !== accordionItem) {
            item.classList.remove('active');
          }
        });

        // Toggle current item
        accordionItem.classList.toggle('active', !isActive);
      });
    });
  }
}

// ============================================================
// TASK 3: POPUP SUBSCRIPTION FORM (10%)
// ============================================================
function initPopupForm() {
  // Create popup HTML
  const popupHTML = `
    <div id="subscription-popup" class="popup-overlay" style="display: none;">
      <div class="popup-content">
        <button class="popup-close" aria-label="Close popup">&times;</button>
        <h2 style="color: var(--accent-color); margin-bottom: 10px;">Subscribe to Play Beat</h2>
        <p style="margin-bottom: 25px; opacity: 0.8;">Get the latest music news and exclusive updates!</p>
        
        <form id="subscription-form" class="popup-form">
          <div class="form-group">
            <label for="sub-name">Your Name</label>
            <input type="text" id="sub-name" placeholder="Enter your name" required>
          </div>
          
          <div class="form-group">
            <label for="sub-email">Email Address</label>
            <input type="email" id="sub-email" placeholder="your@email.com" required>
          </div>
          
          <div class="form-group" style="text-align: left;">
            <label style="display: flex; align-items: center; cursor: pointer;">
              <input type="checkbox" id="sub-newsletter" style="width: auto; margin-right: 10px;">
              <span>I want to receive weekly newsletter</span>
            </label>
          </div>
          
          <button type="submit" class="popup-submit-btn">Subscribe Now</button>
        </form>
      </div>
    </div>

    <style>
      .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }

      .popup-overlay.show {
        opacity: 1;
        visibility: visible;
      }

      .popup-content {
        background: var(--bg1-color);
        padding: 40px 35px;
        border-radius: 20px;
        max-width: 450px;
        width: 90%;
        position: relative;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }

      .popup-overlay.show .popup-content {
        transform: scale(1);
      }

      .popup-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: #e74c3c;
        color: white;
        border: none;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }

      .popup-close:hover {
        background: #c0392b;
        transform: rotate(90deg);
      }

      .popup-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .popup-form .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        text-align: left;
      }

      .popup-form label {
        font-weight: 600;
        color: var(--text-color);
        font-size: 14px;
      }

      .popup-form input[type="text"],
      .popup-form input[type="email"] {
        padding: 12px 15px;
        border: 2px solid transparent;
        border-radius: 10px;
        background: var(--bg-color);
        color: var(--text-color);
        font-size: 15px;
        transition: all 0.3s ease;
      }

      .popup-form input:focus {
        border-color: var(--accent-color);
        outline: none;
        transform: translateY(-2px);
      }

      .popup-submit-btn {
        background: var(--accent-color);
        color: var(--bg-color);
        border: none;
        padding: 14px;
        border-radius: 10px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 10px;
      }

      .popup-submit-btn:hover {
        opacity: 0.9;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
    </style>
  `;

  // Add popup to body
  document.body.insertAdjacentHTML('beforeend', popupHTML);

  const popup = document.getElementById('subscription-popup');
  const closeBtn = popup.querySelector('.popup-close');
  const form = document.getElementById('subscription-form');

  // Create "Subscribe" button in footer or main section
  const addSubscribeButton = () => {
    const footers = document.querySelectorAll('.footer, footer, .container');
    const targetFooter = Array.from(footers).find(f => 
      f.textContent.includes('2025') || f.textContent.includes('Eagles')
    );

    if (targetFooter && !document.getElementById('open-subscription-popup')) {
      const btn = document.createElement('button');
      btn.id = 'open-subscription-popup';
      btn.textContent = '📧 Subscribe to Newsletter';
      btn.style.cssText = `
        background: var(--accent-color);
        color: var(--bg-color);
        border: none;
        padding: 12px 25px;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        margin: 20px auto;
        display: block;
        font-size: 16px;
        transition: all 0.3s ease;
      `;
      btn.onmouseover = () => btn.style.transform = 'translateY(-2px)';
      btn.onmouseout = () => btn.style.transform = 'translateY(0)';

      targetFooter.insertBefore(btn, targetFooter.firstChild);

      btn.addEventListener('click', () => {
        popup.style.display = 'flex';
        setTimeout(() => popup.classList.add('show'), 10);
      });
    }
  };

  addSubscribeButton();

  // Close popup
  const closePopup = () => {
    popup.classList.remove('show');
    setTimeout(() => {
      popup.style.display = 'none';
    }, 300);
  };

  closeBtn.addEventListener('click', closePopup);
  
  popup.addEventListener('click', (e) => {
    if (e.target === popup) closePopup();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('show')) {
      closePopup();
    }
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('sub-name').value;
    const email = document.getElementById('sub-email').value;
    const newsletter = document.getElementById('sub-newsletter').checked;

    const subscriber = { name, email, newsletter, subscribedAt: new Date().toISOString() };
    
    let subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
    subscribers.push(subscriber);
    localStorage.setItem('subscribers', JSON.stringify(subscribers));

    alert(`✓ Thank you for subscribing, ${name}!\nWe'll send updates to ${email}`);
    form.reset();
    closePopup();
  });
}

// ============================================================
// TASK 4: CHANGE BACKGROUND COLOR (5%)
// ============================================================
function initBackgroundChanger() {
  const colors = [
    '#ffffff', '#f0f0f0', '#e8f4f8', '#fff3e0', '#f3e5f5',
    '#e0f2f1', '#fce4ec', '#fff9c4', '#f1f8e9', '#ede7f6'
  ];

  let currentIndex = 0;

  // Create button if not exists
  if (!document.getElementById('bg-color-btn')) {
    const btn = document.createElement('button');
    btn.id = 'bg-color-btn';
    btn.innerHTML = '🎨 Change Background';
    btn.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: var(--accent-color);
      color: var(--bg-color);
      border: none;
      padding: 15px 25px;
      border-radius: 50px;
      font-weight: bold;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      font-size: 14px;
    `;

    btn.onmouseover = () => {
      btn.style.transform = 'translateY(-3px) scale(1.05)';
      btn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
    };
    btn.onmouseout = () => {
      btn.style.transform = 'translateY(0) scale(1)';
      btn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    };

    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % colors.length;
      const newColor = colors[currentIndex];
      
      document.documentElement.style.setProperty('--bg-color', newColor);
      document.body.style.backgroundColor = newColor;
      
      // Save preference
      localStorage.setItem('customBgColor', newColor);
      
      // Visual feedback
      btn.innerHTML = '✓ Color Changed!';
      setTimeout(() => {
        btn.innerHTML = '🎨 Change Background';
      }, 1000);
    });
  }

  // Load saved color
  const savedColor = localStorage.getItem('customBgColor');
  if (savedColor) {
    document.documentElement.style.setProperty('--bg-color', savedColor);
    document.body.style.backgroundColor = savedColor;
  }
}

// ============================================================
// TASK 5: DISPLAY CURRENT DATE AND TIME (5%)
// ============================================================
function initDateTimeDisplay() {
  const dateTimeHTML = `
    <div id="datetime-display" style="
      position: fixed;
      top: 80px;
      right: 20px;
      background: var(--bg1-color);
      padding: 15px 25px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      z-index: 999;
      text-align: center;
      font-family: 'Segoe UI', sans-serif;
      min-width: 250px;
    ">
      <div style="font-size: 12px; color: var(--text-color); opacity: 0.7; margin-bottom: 5px;">
        Current Date & Time
      </div>
      <div id="current-date" style="
        font-size: 15px;
        font-weight: 600;
        color: var(--accent-color);
        margin-bottom: 5px;
      "></div>
      <div id="current-time" style="
        font-size: 22px;
        font-weight: bold;
        color: var(--text-color);
        font-family: 'Courier New', monospace;
      "></div>
      <div id="current-day" style="
        font-size: 13px;
        color: var(--text-color);
        opacity: 0.8;
        margin-top: 5px;
      "></div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', dateTimeHTML);

  function updateDateTime() {
    const now = new Date();
    
    // Format date
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const dateStr = now.toLocaleDateString('en-US', options);
    
    // Format time
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeStr = `${hours}:${minutes}:${seconds} ${ampm}`;
    
    // Get day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStr = days[now.getDay()];
    
    // Update DOM
    document.getElementById('current-date').textContent = dateStr;
    document.getElementById('current-time').textContent = timeStr;
    document.getElementById('current-day').textContent = dayStr;
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);
}

// ============================================================
// INITIALIZE ALL FEATURES ON PAGE LOAD
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎵 Assignment #5 - JavaScript Initialized');
  console.log('Team: Nuraly, Sultan, Daniyar, Ramazan | Group: Eagles');
  
  // Initialize all tasks
  initFormValidation();
  initAccordion();
  initPopupForm();
  initBackgroundChanger();
  initDateTimeDisplay();
  
  console.log('✓ All features loaded successfully!');
});

// ============================================================
// BONUS: Enhanced user experience
// ============================================================

// Smooth scroll for anchor links
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (anchor) {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

// Add loading animation
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);
});