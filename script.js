// Hamburger Icon toggle for Mobile Menu
document.getElementById('nav-toggle').addEventListener('click', function () {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
});

// Mobile Menu - About Dropdown Toggle
document.getElementById('about-toggle').addEventListener('click', function () {
    const aboutMobileMenu = document.getElementById('about-mobile');
    aboutMobileMenu.classList.toggle('hidden');
});

// Mobile Menu - Contact Dropdown Toggle
document.getElementById('contact-toggle').addEventListener('click', function () {
    const contactMobileMenu = document.getElementById('contact-mobile');
    contactMobileMenu.classList.toggle('hidden');
});

// Add debounced scroll handler for fade animations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize fade-in animations
const handleScroll = debounce(() => {
    document.querySelectorAll('.fade-in:not(.fade-in-visible)').forEach(el => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top <= windowHeight * 0.8) {
            el.classList.add('fade-in-visible');
            anime({
                targets: el,
                opacity: [0, 1],
                translateY: [10, 0],
                duration: 1000,
                easing: 'easeOutQuad'
            });
        }
    });
}, 50);

window.addEventListener('scroll', handleScroll);
window.addEventListener('resize', handleScroll);
document.addEventListener('DOMContentLoaded', handleScroll);

// Handle form submission and BMI calculation
document.getElementById('bmi-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get form values
    const name = document.getElementById('username').value;
    const age = parseInt(document.getElementById('age').value, 10);
    const gender = document.getElementById('gender').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);

    // Validate inputs
    if (isNaN(age) || isNaN(weight) || isNaN(height)) {
        alert('Please enter valid numerical values for age, weight, and height.');
        return;
    }

    // Calculate BMI
    const heightM = height / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(2);

    // Determine BMI category
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

    // Update results
    const resultSection = document.getElementById('result-section');
    resultSection.classList.remove('hidden');
    
    document.getElementById('bmi-result').innerText = `Your BMI is ${bmi}`;
    document.getElementById('bmi-category').innerText = `Category: ${category}`;

    // Generate and display recommendations
    const recommendations = getRecommendations(bmi, age, gender);
    displayRecommendations(recommendations);

    // Scroll to results
    resultSection.scrollIntoView({ behavior: 'smooth' });

    // Setup PDF download
    setupPDFDownload(name, age, gender, weight, height, bmi, category, recommendations);
});

// Function to get recommendations based on BMI, age, and gender
function getRecommendations(bmi, age, gender) {
    const recommendations = [];

    // Basic recommendations based on BMI
    if (bmi < 18.5) {
        recommendations.push('Increase your daily caloric intake with nutrient-rich foods');
        recommendations.push('Include protein-rich foods in your diet');
        recommendations.push('Consider strength training exercises to build muscle mass');
    } else if (bmi >= 18.5 && bmi < 24.9) {
        recommendations.push('Maintain your current healthy lifestyle');
        recommendations.push('Engage in regular physical activity');
        recommendations.push('Keep a balanced diet with plenty of fruits and vegetables');
    } else if (bmi >= 25 && bmi < 29.9) {
        recommendations.push('Gradually reduce caloric intake');
        recommendations.push('Increase physical activity to 150 minutes per week');
        recommendations.push('Focus on portion control');
    } else {
        recommendations.push('Consult with a healthcare provider for personalized advice');
        recommendations.push('Start with low-impact exercises like walking or swimming');
        recommendations.push('Keep a food diary to track your intake');
    }

    // Age-specific recommendations
    if (age >= 50) {
        recommendations.push('Include calcium-rich foods for bone health');
        recommendations.push('Focus on low-impact exercises to protect joints');
    }

    // Gender-specific recommendations
    if (gender.toLowerCase() === 'female') {
        recommendations.push('Ensure adequate iron intake');
        if (age >= 50) {
            recommendations.push('Consider vitamin D and calcium supplements (consult your doctor)');
        }
    }

    return recommendations;
}

// Function to setup PDF download
function setupPDFDownload(name, age, gender, weight, height, bmi, category, recommendations) {
    document.getElementById('download-pdf').addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString();

        // Add content to PDF
        doc.setFontSize(20);
        doc.text('BMI Report - fitIN', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text([
            `Date: ${currentDate}`,
            `Name: ${name}`,
            `Age: ${age} years`,
            `Gender: ${gender}`,
            `Weight: ${weight} kg`,
            `Height: ${height} cm`,
            `BMI: ${bmi}`,
            `Category: ${category}`,
            '\nRecommendations:'
        ], 20, 40);

        // Add recommendations
        let yPosition = 100;
        recommendations.forEach((rec, index) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(`${index + 1}. ${rec}`, 20, yPosition);
            yPosition += 10;
        });

        // Save the PDF
        doc.save('BMI_Report.pdf');
    });
}

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

// Add smooth reveal animation for recommendations
function animateRecommendations() {
    const recommendations = document.querySelectorAll('#recommendation-list li');
    recommendations.forEach((rec, index) => {
        rec.style.opacity = '0';
        rec.style.transform = 'translateY(20px)';
        setTimeout(() => {
            rec.style.transition = 'all 0.5s ease-out';
            rec.style.opacity = '1';
            rec.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Update the recommendations display to include animation
function displayRecommendations(recommendations) {
    const recommendationList = document.getElementById('recommendation-list');
    recommendationList.innerHTML = '';
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.className = 'flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-all duration-300';
        
        const bullet = document.createElement('span');
        bullet.className = 'text-blue-500 font-bold';
        bullet.textContent = '•';
        
        const text = document.createElement('span');
        text.textContent = rec;
        
        li.appendChild(bullet);
        li.appendChild(text);
        recommendationList.appendChild(li);
    });
    
    animateRecommendations();
}
