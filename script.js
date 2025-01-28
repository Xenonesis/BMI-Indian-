// Add fade-in animation
document.querySelectorAll('.fade-in').forEach(function(el) {
    el.classList.add('hidden');
    anime({
        targets: el,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 1000,
        easing: 'easeOutQuad',
        complete: function() {
            el.classList.remove('hidden');
        }
    });
});

// Handle form submission and BMI calculation
document.getElementById('bmi-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('username').value;
    const age = parseInt(document.getElementById('age').value, 10);
    const gender = document.getElementById('gender').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);

    if (isNaN(age) || isNaN(weight) || isNaN(height)) {
        alert('Please enter valid numerical values for age, weight, and height.');
        return;
    }

    const heightM = height / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(2);

    let category = '';
    if (bmi < 18.5) {
        category = 'Underweight';
    } else if (bmi >= 18.5 && bmi < 24.9) {
        category = 'Normal weight';
    } else if (bmi >= 25 && bmi < 29.9) {
        category = 'Overweight';
    } else {
        category = 'Obesity';
    }

    document.getElementById('bmi-result').innerText = `Your BMI is ${bmi}`;
    document.getElementById('bmi-category').innerText = `Category: ${category}`;

    // AI-enhanced recommendations
    const recommendations = await generateAIRecommendations(bmi, age, gender);

    const recommendationList = document.getElementById('recommendation-list');
    recommendationList.innerHTML = '';
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.innerText = rec;
        recommendationList.appendChild(li);
    });

    document.getElementById('result-section').classList.remove('hidden');
    document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });

    // PDF generation
    document.getElementById('download-pdf').addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString() + ' ' + currentDate.toLocaleTimeString();

        doc.text('fitIN - BMI Report', 10, 10);
        doc.text(`Name: ${name}`, 10, 20);
        doc.text(`Age: ${age} years`, 10, 30);
        doc.text(`Gender: ${gender}`, 10, 40);
        doc.text(`Weight: ${weight} kg`, 10, 50);
        doc.text(`Height: ${height} cm`, 10, 60);
        doc.text(`BMI: ${bmi}`, 10, 70);
        doc.text(`Category: ${category}`, 10, 80);
        doc.text(`Date: ${formattedDate}`, 10, 90);

        let yPosition = 100;
        doc.text('Health Recommendations:', 10, yPosition);
        yPosition += 10;
        recommendations.forEach((rec, index) => {
            doc.text(`${index + 1}. ${rec}`, 10, yPosition);
            yPosition += 10;
        });

        doc.save('BMI_Report.pdf');
    });
});

// Dropdown Toggle with Click Outside to Close
document.getElementById('about-link').addEventListener('click', function(event) {
    event.preventDefault();
    const aboutDropdown = document.getElementById('about-dropdown');
    aboutDropdown.classList.toggle('hidden');
});

document.getElementById('contact-link').addEventListener('click', function(event) {
    event.preventDefault();
    const contactDropdown = document.getElementById('contact-dropdown');
    contactDropdown.classList.toggle('hidden');
});

document.addEventListener('click', function(event) {
    const aboutDropdown = document.getElementById('about-dropdown');
    const contactDropdown = document.getElementById('contact-dropdown');
    const aboutLink = document.getElementById('about-link');
    const contactLink = document.getElementById('contact-link');

    if (!aboutDropdown.contains(event.target) && !aboutLink.contains(event.target)) {
        aboutDropdown.classList.add('hidden');
    }
    if (!contactDropdown.contains(event.target) && !contactLink.contains(event.target)) {
        contactDropdown.classList.add('hidden');
    }
});

// AI-enhanced personalized recommendations\async function generateAIRecommendations(bmi, age, gender) {
    // Simulate AI processing (replace this with an actual ML API in production)
    return new Promise(resolve => {
        setTimeout(() => {
            let recommendations = [];

            if (bmi < 18.5) {
                recommendations.push('Increase calorie intake with healthy foods.');
                recommendations.push('Incorporate strength training to build muscle mass.');
            } else if (bmi >= 18.5 && bmi < 24.9) {
                recommendations.push('Maintain a balanced diet and regular exercise.');
                recommendations.push('Consider yoga or mindfulness to reduce stress.');
            } else if (bmi >= 25 && bmi < 29.9) {
                if (age >= 50) {
                    recommendations.push('Focus on low-impact exercises like swimming or walking.');
                } else {
                    recommendations.push('Incorporate cardio workouts into your routine.');
                }
                recommendations.push('Monitor your diet and reduce sugar intake.');
            } else {
                if (age >= 50 && gender === 'female') {
                    recommendations.push('Adopt age-specific meal plans with calcium-rich foods.');
                } else {
                    recommendations.push('Engage in a structured weight-loss program.');
                }
                recommendations.push('Consult a dietitian for a personalized nutrition plan.');
            }

            resolve(recommendations);
        }, 1000); // Simulate 1-second delay for AI response
    });
}

// Consent modal toggle
document.addEventListener('DOMContentLoaded', function() {
    const consentModal = document.getElementById('consent-modal');
    const consentAccept = document.getElementById('consent-accept');
    const consentDecline = document.getElementById('consent-decline');

    // Show the consent modal if not accepted
    if (!localStorage.getItem('consentAccepted')) {
        consentModal.classList.remove('hidden');
    }

    consentAccept.addEventListener('click', function() {
        localStorage.setItem('consentAccepted', 'true');
        consentModal.classList.add('hidden');
        // You can add code here to handle data collection and cookies
    });

    consentDecline.addEventListener('click', function() {
        localStorage.setItem('consentAccepted', 'false');
        consentModal.classList.add('hidden');
        // Handle decline action if necessary
    });
});

// Toggle Mobile Menu
document.getElementById('nav-toggle').addEventListener('click', function () {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
});

// Toggle About Dropdown in Mobile Menu
document.getElementById('about-toggle').addEventListener('click', function () {
    const about = document.getElementById('about-mobile');
    about.classList.toggle('hidden');
});

// Toggle Contact Dropdown in Mobile Menu
document.getElementById('contact-toggle').addEventListener('click', function () {
    const contact = document.getElementById('contact-mobile');
    contact.classList.toggle('hidden');
});
