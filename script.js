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

// Add this function to create a visual BMI scale
function createBMIScale(bmi) {
    const scale = document.createElement('div');
    scale.className = 'w-full h-4 bg-gray-200 rounded-full mt-4 relative';
    
    // Create the indicator
    const indicator = document.createElement('div');
    indicator.className = 'absolute w-4 h-6 -mt-1 transform -translate-x-1/2 transition-all duration-500';
    indicator.style.left = `${Math.min(Math.max((bmi - 15) * 4, 0), 100)}%`;
    
    // Add the pointer triangle
    indicator.innerHTML = `
        <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 22h20L12 2z"/>
        </svg>
    `;
    
    // Add scale markers
    const markers = [
        { value: 18.5, label: 'Underweight', color: 'bg-blue-300' },
        { value: 24.9, label: 'Normal', color: 'bg-green-300' },
        { value: 29.9, label: 'Overweight', color: 'bg-yellow-300' },
        { value: 35, label: 'Obese', color: 'bg-red-300' }
    ];
    
    markers.forEach((marker, index) => {
        const section = document.createElement('div');
        const width = index === markers.length - 1 ? '100%' : `${(marker.value - 15) * 4}%`;
        section.className = `absolute h-full ${marker.color} rounded-full`;
        section.style.width = width;
        section.style.left = index === 0 ? '0' : `${(markers[index - 1].value - 15) * 4}%`;
        scale.appendChild(section);
    });
    
    scale.appendChild(indicator);
    return scale;
}

// Update the BMI result display
function updateBMIResult(bmi, category) {
    const resultDiv = document.querySelector('.text-center');
    resultDiv.innerHTML = '';
    
    // Add BMI number with animation
    const bmiNumber = document.createElement('p');
    bmiNumber.className = 'text-5xl font-bold text-blue-600 mb-2 transform scale-0';
    bmiNumber.textContent = bmi;
    resultDiv.appendChild(bmiNumber);
    
    // Animate the number
    setTimeout(() => {
        bmiNumber.style.transition = 'transform 0.5s ease-out';
        bmiNumber.style.transform = 'scale(1)';
    }, 100);
    
    // Add category with fade in
    const categoryText = document.createElement('p');
    categoryText.className = 'text-xl text-gray-600 opacity-0';
    categoryText.textContent = `Category: ${category}`;
    resultDiv.appendChild(categoryText);
    
    // Add BMI scale
    const scale = createBMIScale(parseFloat(bmi));
    resultDiv.appendChild(scale);
    
    // Fade in category
    setTimeout(() => {
        categoryText.style.transition = 'opacity 0.5s ease-out';
        categoryText.style.opacity = '1';
    }, 300);
}

// Add loading state function
function setLoadingState(isLoading) {
    const submitButton = document.querySelector('button[type="submit"]');
    const originalText = 'Calculate BMI';
    
    if (isLoading) {
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Calculating...
        `;
    } else {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Update form submission to include loading state
document.getElementById('bmi-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    setLoadingState(true);
    
    try {
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

        // Update results with animation
        const resultSection = document.getElementById('result-section');
        resultSection.classList.remove('hidden');
        resultSection.style.opacity = '0';
        resultSection.style.transform = 'translateY(20px)';
        
        // Animate section appearance
        setTimeout(() => {
            resultSection.style.transition = 'all 0.5s ease-out';
            resultSection.style.opacity = '1';
            resultSection.style.transform = 'translateY(0)';
            updateBMIResult(bmi, category);
        }, 100);

        // Generate and display recommendations
        const recommendations = getRecommendations(bmi, age, gender);
        displayRecommendations(recommendations);

        // Scroll to results
        resultSection.scrollIntoView({ behavior: 'smooth' });

        // Setup PDF download
        setupPDFDownload(name, age, gender, weight, height, bmi, category, recommendations);

        // Add success feedback
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform translate-y-20 opacity-0 transition-all duration-500';
        successMessage.textContent = 'BMI calculated successfully!';
        document.body.appendChild(successMessage);
        
        // Show and hide success message
        setTimeout(() => {
            successMessage.style.transform = 'translate-y-0)';
            successMessage.style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            successMessage.style.opacity = '0';
            setTimeout(() => successMessage.remove(), 500);
        }, 3000);
        
    } catch (error) {
        console.error('Error calculating BMI:', error);
        // Show error message
        alert('There was an error calculating your BMI. Please try again.');
    } finally {
        setLoadingState(false);
    }
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

// Enhance recommendations with icons
function getRecommendationIcon(recommendation) {
    const icons = {
        'increase': '🔼',
        'decrease': '🔽',
        'maintain': '⚖️',
        'exercise': '🏃‍♂️',
        'food': '��',
        'consult': '👨‍⚕️',
        'track': '📊',
        'vitamin': '💊',
        'strength': '💪',
        'water': '💧'
    };
    
    const keyword = Object.keys(icons).find(key => 
        recommendation.toLowerCase().includes(key)
    );
    
    return icons[keyword] || '•';
}

// Update the displayRecommendations function
function displayRecommendations(recommendations) {
    const recommendationList = document.getElementById('recommendation-list');
    recommendationList.innerHTML = '';
    
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.className = 'flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-all duration-300';
        
        const icon = document.createElement('span');
        icon.className = 'text-xl';
        icon.textContent = getRecommendationIcon(rec);
        
        const text = document.createElement('span');
        text.className = 'text-gray-700';
        text.textContent = rec;
        
        li.appendChild(icon);
        li.appendChild(text);
        recommendationList.appendChild(li);
    });
    
    animateRecommendations();
}
