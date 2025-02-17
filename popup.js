// Check if it's the user's first visit and manage popup features
document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('greeting-popup');
    const greetingMessage = document.getElementById('greeting-message');
    const closeButton = document.getElementById('close-popup');
    const minimizeButton = document.getElementById('minimize-popup-btn');
    const closePopupButton = document.getElementById('close-popup-btn');
    const countdownTimer = document.getElementById('countdown-timer');
    let countdownInterval;
    let isPopupMinimized = false;

    // Check if the user has visited before
    const isFirstVisit = !localStorage.getItem('hasVisited');
    const lastPopupTime = localStorage.getItem('lastPopupTime');
    const currentTime = Date.now();

    // Only show popup if it's first visit or it's been more than 1 hour since last popup
    if (isFirstVisit || !lastPopupTime || (currentTime - parseInt(lastPopupTime)) > 3600000) {
        showPopup();
        localStorage.setItem('lastPopupTime', currentTime.toString());
    }

    function showPopup() {
        if (isPopupMinimized) return;

        localStorage.setItem('hasVisited', 'true');
        greetingMessage.innerText = isFirstVisit ? 'Welcome to fitIN!' : 'Welcome back to fitIN!';

        popup.classList.remove('hidden');
        popup.classList.add('scale-100');
        startCountdown();
    }

    function startCountdown() {
        let timer = 10;
        countdownTimer.innerText = timer;

        clearInterval(countdownInterval);
        countdownInterval = setInterval(function() {
            timer--;
            countdownTimer.innerText = timer;

            if (timer <= 0) {
                closePopup();
            }
        }, 1000);
    }

    function closePopup() {
        popup.classList.add('scale-95');
        setTimeout(() => {
            popup.classList.add('hidden');
            isPopupMinimized = false;
        }, 300);
        clearInterval(countdownInterval);
    }

    function minimizePopup() {
        popup.classList.add('scale-95');
        setTimeout(() => {
            popup.classList.add('hidden');
            isPopupMinimized = true;
        }, 300);
        clearInterval(countdownInterval);
    }

    closePopupButton.addEventListener('click', closePopup);
    minimizeButton.addEventListener('click', minimizePopup);
    closeButton.addEventListener('click', closePopup);

    // Show popup every hour if not minimized
    setInterval(function() {
        const currentTime = Date.now();
        const lastPopupTime = parseInt(localStorage.getItem('lastPopupTime'));

        if (!isPopupMinimized && (!lastPopupTime || (currentTime - lastPopupTime) > 3600000)) {
            showPopup();
            localStorage.setItem('lastPopupTime', currentTime.toString());
        }
    }, 3600000); // Check every hour
});
