// Check if it's the user's first visit and manage popup features
document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('greeting-popup');
    const greetingMessage = document.getElementById('greeting-message');
    const closeButton = document.getElementById('close-popup');
    const minimizeButton = document.getElementById('minimize-popup-btn');
    const closePopupButton = document.getElementById('close-popup-btn');
    const countdownTimer = document.getElementById('countdown-timer');
    let countdownInterval;

    // Check if the user has visited before
    const isFirstVisit = !localStorage.getItem('hasVisited');

    if (isFirstVisit) {
        localStorage.setItem('hasVisited', 'true');
        greetingMessage.innerText = 'Welcome to fitIN!';
    } else {
        greetingMessage.innerText = 'Welcome back to fitIN!';
    }

    // Display the popup with animation
    popup.classList.remove('hidden');
    popup.classList.add('scale-100');

    // Function to close the popup
    function closePopup() {
        popup.classList.add('scale-95');
        setTimeout(() => popup.classList.add('hidden'), 300); // Add delay for the animation
        clearInterval(countdownInterval); // Stop the countdown when closed
    }

    // Function to minimize the popup
    function minimizePopup() {
        popup.classList.add('scale-95');
        setTimeout(() => popup.classList.add('hidden'), 300); // Hide with animation
    }

    // Countdown timer (closes popup automatically after 10 seconds)
    let timer = 10;
    countdownTimer.innerText = timer;

    countdownInterval = setInterval(function() {
        timer--;
        countdownTimer.innerText = timer;

        if (timer <= 0) {
            closePopup();
        }
    }, 1000); // Decrease timer every second

    // Event listeners for popup actions
    closePopupButton.addEventListener('click', closePopup);
    minimizeButton.addEventListener('click', minimizePopup);

    // Show the popup every 100 seconds (100000 milliseconds)
    setInterval(function() {
        popup.classList.remove('hidden');
        popup.classList.add('scale-100');
        timer = 10; // Reset timer for next show
        countdownTimer.innerText = timer;

        // Restart countdown
        clearInterval(countdownInterval);
        countdownInterval = setInterval(function() {
            timer--;
            countdownTimer.innerText = timer;

            if (timer <= 0) {
                closePopup();
            }
        }, 1000);
    }, 100000); // 100 seconds
});
