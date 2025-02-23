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

// Show/hide period tracking form based on gender selection
document.getElementById('gender').addEventListener('change', function() {
    const periodSection = document.getElementById('period-tracking');
    periodSection.classList.toggle('hidden', this.value.toLowerCase() !== 'female');
});

// Handle form submission and BMI calculation
document.getElementById('bmi-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    showLoading();
    await new Promise(resolve => setTimeout(resolve, 800)); // artificial delay

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

    // Predict biological age
    const biologicalAge = predictBiologicalAge(parseFloat(bmi), age, gender, weight, height);

    // Update results
    const resultSection = document.getElementById('result-section');
    resultSection.classList.remove('hidden');
    
    document.getElementById('bmi-result').innerText = `Your BMI is ${bmi}`;
    document.getElementById('bmi-category').innerText = `Category: ${category}`;
    document.getElementById('biological-age').innerText = `Estimated Biological Age: ${biologicalAge} years`;

    // Generate and display recommendations
    const recommendations = getRecommendations(bmi, age, gender);
    displayRecommendations(recommendations);

    // Scroll to results
    resultSection.scrollIntoView({ behavior: 'smooth' });

    // Setup PDF download
    setupPDFDownload(name, age, gender, weight, height, bmi, category, recommendations, biologicalAge);

    if (gender.toLowerCase() === 'female') {
        try {
            const lastPeriod = document.getElementById('last-period').value;
            if (!lastPeriod) throw new Error('Please enter your last period date');
            const cycleLength = parseInt(document.getElementById('cycle-length').value);
            const cycleRegularity = document.getElementById('cycle-regularity').value;
            const symptoms = Array.from(document.querySelectorAll('input[name="period-symptoms"]:checked'))
                                  .map(cb => cb.value);
            const tracker = new PeriodTracker();
            const predictions = tracker.predictNextPeriods(lastPeriod, cycleLength, cycleRegularity);
            const recs = tracker.getSymptomRecommendations(symptoms);
            displayPeriodPredictions(predictions, recs);
            document.getElementById('period-predictions').classList.remove('hidden');
        } catch(e) {
            alert(`Period Tracking Error: ${e.message}`);
        }
    }

    hideLoading();
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

// Function to predict biological age based on BMI, age, gender, weight, and height
function predictBiologicalAge(bmi, age, gender, weight, height) {
    // Simple predictive model based on BMI deviation from normal range
    const normalBMIMiddle = 21.7; // Middle of normal BMI range
    const bmiDeviation = Math.abs(bmi - normalBMIMiddle);
    
    // Base biological age starts from chronological age
    let biologicalAge = age;
    
    // Adjust based on BMI deviation
    if (bmi < 18.5) {
        biologicalAge += bmiDeviation * 0.5;
    } else if (bmi > 25) {
        biologicalAge += bmiDeviation * 0.7;
    }
    
    // Gender-specific adjustments
    if (gender.toLowerCase() === 'female') {
        biologicalAge *= 0.95; // Slightly lower biological age for females
    }
    
    // Height-weight ratio impact
    const heightInMeters = height / 100;
    const hwRatio = weight / heightInMeters;
    if (hwRatio > 100) {
        biologicalAge += 2;
    }
    
    // Add some controlled randomness to simulate ML prediction variance
    const variance = Math.random() * 2 - 1; // Random value between -1 and 1
    biologicalAge += variance;
    
    return Math.round(biologicalAge * 10) / 10; // Round to 1 decimal place
}

// Function to setup PDF download
function setupPDFDownload(name, age, gender, weight, height, bmi, category, recommendations, biologicalAge) {
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
            `Estimated Biological Age: ${biologicalAge} years`,
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

function displayPeriodPredictions(predictions, recommendations) {
    const timeline = document.getElementById('period-timeline');
    timeline.innerHTML = '';
    predictions.forEach(pred => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-lg p-6 space-y-4 transform transition-all duration-300 hover:scale-[1.02]';
        const periodRange = new PeriodTracker().formatDateRange(pred.periodStart, pred.periodEnd);
        const fertileRange = new PeriodTracker().formatDateRange(pred.fertility.start, pred.fertility.end);
        const ovulation = pred.ovulation.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        card.innerHTML = `
            <div class="flex justify-between">
                <div>
                    <h4 class="font-semibold text-gray-800">Cycle ${pred.cycleNumber}</h4>
                    <p class="text-pink-600">Period: ${periodRange}</p>
                    <p class="text-green-600">Fertility: ${fertileRange}</p>
                    <p class="text-purple-600">Ovulation: ${ovulation}</p>
                </div>
                <div class="text-right">
                    <div class="font-bold text-lg ${pred.certainty>=85?'text-green-600':pred.certainty>=75?'text-yellow-600':'text-red-600'}">
                        ${pred.certainty}% certain
                    </div>
                    <div class="w-24 h-2 bg-gray-200 rounded-full mt-2">
                        <div class="h-full rounded-full ${pred.certainty>=85?'bg-green-600':pred.certainty>=75?'bg-yellow-600':'bg-red-600'}"
                             style="width:${pred.certainty}%"></div>
                    </div>
                </div>
            </div>
        `;
        timeline.appendChild(card);
    });
    // Display recommendations
    document.getElementById('symptom-recommendations').innerHTML =
      recommendations.map(rec => `<li class="flex items-center space-x-3">
            <svg class="h-5 w-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg><span>${rec}</span></li>`).join('');
}

// Add this function to handle period predictions display
function displayUpcomingPeriods(predictions) {
    const timeline = document.getElementById('period-timeline');
    timeline.innerHTML = '<h4 class="text-xl font-bold text-pink-700 mb-4">Your Next 3 Periods</h4>';
    
    predictions.forEach((pred) => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow p-4 mb-4 border-l-4 border-pink-500';
        const startDate = pred.periodStart.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        card.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h5 class="font-semibold text-gray-800">Period ${pred.cycleNumber}</h5>
                    <p class="text-pink-600">Starts: ${startDate}</p>
                </div>
                <div class="text-right">
                    <span class="text-sm text-gray-600">Certainty:</span>
                    <div class="text-lg font-bold ${pred.certainty >= 85 ? 'text-green-600' : 
                                                   pred.certainty >= 75 ? 'text-yellow-600' : 
                                                   'text-red-600'}">
                        ${pred.certainty}%
                    </div>
                </div>
            </div>
        `;
        timeline.appendChild(card);
    });
}

// Enhance form inputs with floating labels and tooltips
document.querySelectorAll('.input-group .form-input').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
    });
});

// Add loading state feedback
function showLoading() {
    document.querySelectorAll('.result-value').forEach(el => {
        el.classList.add('loading'); // Define loading style in CSS if needed
    });
}
function hideLoading() {
    document.querySelectorAll('.result-value').forEach(el => {
        el.classList.remove('loading');
    });
}

// Intersection Observer for scroll animations
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('animate-in');
    });
}, { threshold: 0.1 });
document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

// Responsive navigation (touch targets)
const initResponsiveNav = () => {
    const viewportWidth = window.innerWidth;
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        if (viewportWidth < 768) {
            link.style.padding = '1rem';
        } else {
            link.style.padding = '';
        }
    });
};
window.addEventListener('resize', initResponsiveNav);
initResponsiveNav();
