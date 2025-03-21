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

// Add height unit toggle handlers
document.querySelectorAll('input[name="height-unit"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const isFeetInches = radio.value === 'ft_in';
    document.getElementById('height-cm-group').classList.toggle('hidden', isFeetInches);
    document.getElementById('height-ftin-group').classList.toggle('hidden', !isFeetInches);
    
    // Toggle required attributes
    document.getElementById('height-cm').required = !isFeetInches;
    document.getElementById('height-feet').required = isFeetInches;
    document.getElementById('height-inches').required = isFeetInches;
  });
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
    
    // Get height based on selected unit
    let height;
    if (document.querySelector('input[name="height-unit"]:checked').value === 'ft_in') {
        const feet = parseFloat(document.getElementById('height-feet').value) || 0;
        const inches = parseFloat(document.getElementById('height-inches').value) || 0;
        height = ((feet * 12) + inches) * 2.54; // Convert to cm
    } else {
        height = parseFloat(document.getElementById('height-cm').value);
    }

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

    // Update the results with the new function
    updateResults(bmi, category, biologicalAge, age);

    // Update results
    const resultSection = document.getElementById('result-section');
    resultSection.classList.remove('hidden');
    
    document.getElementById('bmi-result').innerText = `Your BMI is ${bmi}`;
    document.getElementById('bmi-category').innerText = `Category: ${category}`;
    document.getElementById('biological-age').innerText = `Estimated Biological Age: ${biologicalAge} years`;
    
    // Update health metrics dashboard with calculated values
    if (typeof updateHealthMetrics === 'function') {
        updateHealthMetrics(bmi, category, biologicalAge, age, weight, height, gender);
    }

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

// Biological Age Accordion Functionality
function toggleAccordion(header) {
  const accordion = header.parentElement;
  const content = accordion.querySelector('.bio-accordion-content');
  const icon = header.querySelector('.accordion-icon');
  
  accordion.classList.toggle('active');
  icon.style.transform = accordion.classList.contains('active') 
    ? 'rotate(90deg)' 
    : 'rotate(0deg)';
}

// Timeline Animation Trigger
function animateTimeline() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add('visible');
    }, index * 300);
  });
}

// Close Accordion When Clicking Outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.bio-accordion')) {
    document.querySelectorAll('.bio-accordion').forEach(accordion => {
      accordion.classList.remove('active');
      accordion.querySelector('.accordion-icon').style.transform = 'rotate(0deg)';
    });
  }
});

// Initialize Timeline Animations
window.addEventListener('DOMContentLoaded', animateTimeline);

// Function to predict biological age based on BMI, age, gender, weight, and height
function predictBiologicalAge(bmi, age, gender, weight, height) {
    // Enhanced predictive model based on BMI deviation from normal range
    const normalBMIMiddle = 21.7; // Middle of normal BMI range
    const bmiDeviation = Math.abs(bmi - normalBMIMiddle);
    
    // Base biological age starts from chronological age
    let biologicalAge = age;
    
    // Adjust based on BMI deviation with improved algorithm
    if (bmi < 18.5) {
        // Underweight has less impact for younger people, more for older
        const ageFactor = age > 50 ? 0.7 : 0.5;
        biologicalAge += bmiDeviation * ageFactor;
    } else if (bmi > 25) {
        // Overweight has more impact as BMI increases
        const severityFactor = bmi > 30 ? 0.9 : 0.7;
        biologicalAge += bmiDeviation * severityFactor;
    }
    
    // Gender-specific adjustments
    if (gender.toLowerCase() === 'female') {
        biologicalAge *= 0.95; // Slightly lower biological age for females
    }
    
    // Height-weight ratio impact with improved calculation
    const heightInMeters = height / 100;
    const hwRatio = weight / heightInMeters;
    if (hwRatio > 100) {
        biologicalAge += 2;
    } else if (hwRatio < 50) {
        biologicalAge -= 1; // Being proportionally lighter can be beneficial
    }
    
    // Add some controlled randomness to simulate ML prediction variance
    // Reduced variance for more consistent results
    const variance = Math.random() * 1.4 - 0.7; // Random value between -0.7 and 0.7
    biologicalAge += variance;
    
    return Math.round(biologicalAge * 10) / 10; // Round to 1 decimal place
}

// Function to setup PDF download
function setupPDFDownload(name, age, gender, weight, height, bmi, category, recommendations, biologicalAge) {
    document.getElementById('download-pdf').addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;

        // Add professional header with logo and title
        // Create header background
        doc.setFillColor(41, 128, 185); // Professional blue color
        doc.rect(0, 0, pageWidth, 30, 'F');

        // Add title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('fitIN - BMI Health Report', pageWidth / 2, 15, { align: 'center' });

        // Add date in header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${currentDate}`, pageWidth - margin, 10, { align: 'right' });

        // Reset text color for body content
        doc.setTextColor(0, 0, 0);

        // Add personal information section
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(margin, 40, pageWidth - (margin * 2), 50, 3, 3, 'F');

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Personal Information', margin + 5, 50);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        // Create two-column layout for personal info
        const col1X = margin + 10;
        const col2X = pageWidth / 2 + 10;
        let infoY = 60;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Name:', col1X, infoY);
        doc.setFont('helvetica', 'normal');
        doc.text(name, col1X + 30, infoY);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Gender:', col2X, infoY);
        doc.setFont('helvetica', 'normal');
        doc.text(gender, col2X + 30, infoY);
        infoY += 10;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Age:', col1X, infoY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${age} years`, col1X + 30, infoY);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Bio. Age:', col2X, infoY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${biologicalAge} years`, col2X + 30, infoY);
        infoY += 10;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Weight:', col1X, infoY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${weight} kg`, col1X + 30, infoY);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Height:', col2X, infoY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${height} cm`, col2X + 30, infoY);

        // Add BMI Results section with visualization
        const bmiSectionY = 100;
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(margin, bmiSectionY, pageWidth - (margin * 2), 60, 3, 3, 'F');

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('BMI Results', margin + 5, bmiSectionY + 10);

        // Add BMI value with category
        doc.setFontSize(22);
        doc.text(`BMI: ${bmi}`, pageWidth / 2, bmiSectionY + 25, { align: 'center' });
        
        // Set category color
        let categoryColor;
        switch(category.toLowerCase()) {
            case 'underweight': categoryColor = [59, 130, 246]; break; // Blue
            case 'normal weight': categoryColor = [16, 185, 129]; break; // Green
            case 'overweight': categoryColor = [245, 158, 11]; break; // Amber
            case 'obesity': categoryColor = [239, 68, 68]; break; // Red
            default: categoryColor = [107, 114, 128]; break; // Gray
        }
        
        doc.setFontSize(14);
        doc.setTextColor(categoryColor[0], categoryColor[1], categoryColor[2]);
        doc.text(`Category: ${category}`, pageWidth / 2, bmiSectionY + 35, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        // Draw BMI scale
        const scaleY = bmiSectionY + 45;
        const scaleWidth = pageWidth - (margin * 2) - 20;
        const scaleX = margin + 10;
        const scaleHeight = 6;
        
        // Draw scale background
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(scaleX, scaleY, scaleWidth, scaleHeight, 2, 2, 'FD');
        
        // Draw colored sections on scale
        const sections = [
            { width: scaleWidth * 0.15, color: [59, 130, 246] }, // Underweight - Blue
            { width: scaleWidth * 0.30, color: [16, 185, 129] }, // Normal - Green
            { width: scaleWidth * 0.25, color: [245, 158, 11] }, // Overweight - Amber
            { width: scaleWidth * 0.30, color: [239, 68, 68] }  // Obese - Red
        ];
        
        let currentX = scaleX;
        sections.forEach((section, index) => {
            doc.setFillColor(section.color[0], section.color[1], section.color[2]);
            if (index === 0) {
                // First section (rounded left)
                doc.roundedRect(currentX, scaleY, section.width, scaleHeight, 2, 2, 'F', [1, 0, 0, 1]);
            } else if (index === sections.length - 1) {
                // Last section (rounded right)
                doc.roundedRect(currentX, scaleY, section.width, scaleHeight, 2, 2, 'F', [0, 1, 1, 0]);
            } else {
                // Middle sections (no rounding)
                doc.rect(currentX, scaleY, section.width, scaleHeight, 'F');
            }
            currentX += section.width;
        });
        
        // Calculate and draw the pointer on the scale
        const minBMI = 16;
        const maxBMI = 40;
        const bmiValue = parseFloat(bmi);
        const pointerPosition = Math.max(0, Math.min(1, (bmiValue - minBMI) / (maxBMI - minBMI)));
        const pointerX = scaleX + (pointerPosition * scaleWidth);
        
        // Draw pointer triangle
        doc.setFillColor(0, 0, 0);
        doc.triangle(
            pointerX, scaleY - 2,
            pointerX - 3, scaleY - 6,
            pointerX + 3, scaleY - 6,
            'F'
        );
        
        // Add scale labels
        doc.setFontSize(8);
        doc.text('Underweight', scaleX + (scaleWidth * 0.075), scaleY + 12, { align: 'center' });
        doc.text('Normal', scaleX + (scaleWidth * 0.3), scaleY + 12, { align: 'center' });
        doc.text('Overweight', scaleX + (scaleWidth * 0.575), scaleY + 12, { align: 'center' });
        doc.text('Obese', scaleX + (scaleWidth * 0.85), scaleY + 12, { align: 'center' });

        // Add biological age comparison
        const bioAgeY = bmiSectionY + 70;
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(margin, bioAgeY, pageWidth - (margin * 2), 40, 3, 3, 'F');

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Biological Age Analysis', margin + 5, bioAgeY + 10);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        // Calculate age difference and set appropriate message
        const ageDiff = biologicalAge - age;
        let ageDiffText = '';
        let ageDiffColor = [0, 0, 0];
        
        if (ageDiff < -1) {
            ageDiffText = `Your biological age is ${Math.abs(ageDiff).toFixed(1)} years younger than your chronological age.`;
            ageDiffColor = [16, 185, 129]; // Green
        } else if (ageDiff > 1) {
            ageDiffText = `Your biological age is ${ageDiff.toFixed(1)} years older than your chronological age.`;
            ageDiffColor = [239, 68, 68]; // Red
        } else {
            ageDiffText = 'Your biological age matches your chronological age.';
            ageDiffColor = [59, 130, 246]; // Blue
        }
        
        doc.setTextColor(ageDiffColor[0], ageDiffColor[1], ageDiffColor[2]);
        doc.text(ageDiffText, margin + 10, bioAgeY + 25);
        doc.setTextColor(0, 0, 0);

        // Add health recommendations section
        const recsY = bioAgeY + 50;
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(margin, recsY, pageWidth - (margin * 2), 10 + (recommendations.length * 10), 3, 3, 'F');

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Personalized Health Recommendations', margin + 5, recsY + 10);

        // Add recommendations with icons
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let recY = recsY + 20;
        
        // Define recommendation icons based on content keywords
        const getIconForRec = (rec) => {
            if (rec.toLowerCase().includes('diet') || rec.toLowerCase().includes('food') || rec.toLowerCase().includes('caloric') || 
                rec.toLowerCase().includes('intake') || rec.toLowerCase().includes('nutrient')) {
                return '🍎'; // Food/Diet
            } else if (rec.toLowerCase().includes('exercise') || rec.toLowerCase().includes('physical') || 
                      rec.toLowerCase().includes('activity') || rec.toLowerCase().includes('training')) {
                return '🏃'; // Exercise
            } else if (rec.toLowerCase().includes('consult') || rec.toLowerCase().includes('healthcare') || 
                      rec.toLowerCase().includes('doctor')) {
                return '👨‍⚕️'; // Medical
            } else if (rec.toLowerCase().includes('calcium') || rec.toLowerCase().includes('vitamin') || 
                      rec.toLowerCase().includes('supplement')) {
                return '💊'; // Supplements
            } else if (rec.toLowerCase().includes('track') || rec.toLowerCase().includes('diary') || 
                      rec.toLowerCase().includes('monitor')) {
                return '📝'; // Tracking
            }
            return '✅'; // Default checkmark
        };
        
        recommendations.forEach((rec, index) => {
            if (recY > pageHeight - 20) {
                doc.addPage();
                recY = 20;
                
                // Add header to new page
                doc.setFillColor(41, 128, 185);
                doc.rect(0, 0, pageWidth, 20, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(14);
                doc.text('fitIN - BMI Health Report (Continued)', pageWidth / 2, 15, { align: 'center' });
                
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('Personalized Health Recommendations (Continued)', margin + 5, recY);
                recY += 10;
            }
            
            const icon = getIconForRec(rec);
            doc.text(`${icon} ${index + 1}. ${rec}`, margin + 10, recY);
            recY += 10;
        });
        
        // Add footer with disclaimer and website info
        const footerY = pageHeight - 15;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Disclaimer: This report is for informational purposes only and is not a substitute for professional medical advice.', 
                pageWidth / 2, footerY - 5, { align: 'center' });
        doc.text('© fitIN BMI Calculator | www.fitin-bmi.com', pageWidth / 2, footerY, { align: 'center' });
        
        // Save the PDF with enhanced filename
        const formattedDate = new Date().toISOString().slice(0, 10);
        doc.save(`fitIN_BMI_Report_${name}_${formattedDate}.pdf`);
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

// Enhanced function to handle result updates with improved animations
function updateResults(bmi, category, biologicalAge, chronologicalAge) {
    // Animate BMI value with improved animation
    const bmiResult = document.getElementById('bmi-result');
    const startBMI = 0;
    const duration = 1500;
    
    anime({
        targets: bmiResult,
        innerHTML: [startBMI, parseFloat(bmi)],
        round: 100,
        easing: 'easeOutElastic(1, .8)',
        duration: duration,
        begin: () => {
            bmiResult.classList.add('animate');
            bmiResult.innerHTML = '0.00';
        }
    });

    // Update BMI category with appropriate color and enhanced animation
    const bmiCategory = document.getElementById('bmi-category');
    bmiCategory.className = 'category-badge result-value';
    bmiCategory.classList.add(getCategoryClass(category));
    setTimeout(() => {
        bmiCategory.classList.add('animate');
        bmiCategory.textContent = category;
    }, 200);

    // Update circular progress indicator for BMI
    const bmiChart = document.getElementById('bmi-chart');
    const bmiProgressValue = document.getElementById('bmi-progress-value');
    
    // Set progress color based on BMI category
    let progressColor;
    switch(category.toLowerCase()) {
        case 'underweight': progressColor = '#3b82f6'; break; // Blue
        case 'normal weight': progressColor = '#10b981'; break; // Green
        case 'overweight': progressColor = '#f59e0b'; break; // Yellow/Orange
        case 'obesity': progressColor = '#ef4444'; break; // Red
        default: progressColor = '#3b82f6'; // Default blue
    }
    
    // Calculate progress percentage (BMI scale typically ranges from 16 to 40)
    const minBMI = 16;
    const maxBMI = 40;
    const progressPercentage = Math.min(100, Math.max(0, ((parseFloat(bmi) - minBMI) / (maxBMI - minBMI)) * 100));
    
    // Update the circular progress
    bmiChart.style.setProperty('--progress-color', progressColor);
    bmiChart.style.setProperty('--progress-value', `${progressPercentage}%`);
    
    // Update the progress value text
    bmiProgressValue.textContent = bmi;
    setTimeout(() => {
        bmiProgressValue.classList.add('animate');
    }, 300);

    // Update biological age with enhanced animation
    const bioAge = document.getElementById('biological-age');
    const chronoAge = document.getElementById('chronological-age');
    const bioAgeValue = document.getElementById('bio-age');
    const ageDifference = document.getElementById('age-difference');
    
    // Add bio-pulse class for attention-grabbing effect
    bioAge.classList.add('bio-pulse');
    
    anime({
        targets: bioAge,
        innerHTML: [0, biologicalAge],
        round: 1,
        easing: 'easeOutQuad',
        duration: duration,
        begin: () => {
            document.querySelector('.biological-age-indicator').classList.add('animate');
        }
    });

    chronoAge.textContent = `${chronologicalAge} years`;
    bioAgeValue.textContent = `${biologicalAge} years`;
    
    // Update the age comparison chart
    const chronoBar = document.querySelector('.chronological-bar');
    const bioBar = document.querySelector('.biological-bar');
    const chronoMarker = document.getElementById('chrono-marker');
    const bioMarker = document.getElementById('bio-marker');
    
    // Set data attributes for the health-insights.js animation
    chronoBar.setAttribute('data-age', chronologicalAge);
    bioBar.setAttribute('data-age', biologicalAge);
    
    // Calculate width percentages (max age 100)
    const maxAge = 100;
    const chronoWidth = Math.min(chronologicalAge / maxAge * 100, 100);
    const bioWidth = Math.min(biologicalAge / maxAge * 100, 100);
    
    // Animate the bars with a slight delay
    setTimeout(() => {
        chronoBar.style.width = `${chronoWidth}%`;
        chronoMarker.style.left = `${chronoWidth}%`;
        chronoMarker.textContent = `${chronologicalAge}y`;
        
        setTimeout(() => {
            bioBar.style.width = `${bioWidth}%`;
            bioMarker.style.left = `${bioWidth}%`;
            bioMarker.textContent = `${biologicalAge}y`;
            
            // Animate the markers
            chronoMarker.classList.add('animate');
            bioMarker.classList.add('animate');
        }, 500);
    }, 300);
    
    // Show age difference with appropriate styling
    const ageDiff = biologicalAge - chronologicalAge;
    let diffClass = 'same';
    let diffText = '';
    
    if (ageDiff < -1) {
        diffClass = 'younger';
        diffText = `${Math.abs(ageDiff).toFixed(1)} years younger than your actual age`;
    } else if (ageDiff > 1) {
        diffClass = 'older';
        diffText = `${ageDiff.toFixed(1)} years older than your actual age`;
    } else {
        diffText = 'Your biological age matches your chronological age';
    }
    
    ageDifference.textContent = diffText;
    ageDifference.className = `age-difference ${diffClass}`;
    
    setTimeout(() => {
        ageDifference.classList.add('animate');
    }, 1000);

    // Animate recommendations with improved timing
    setTimeout(animateRecommendations, duration);

    // Update BMI scale with enhanced visualization
    updateBMIScale(parseFloat(bmi), category);
    
    // Create age trends chart
    createAgeTrendsChart(chronologicalAge, biologicalAge);
}

function getCategoryClass(category) {
    switch(category.toLowerCase()) {
        case 'underweight': return 'underweight';
        case 'normal weight': return 'normal';
        case 'overweight': return 'overweight';
        case 'obesity': return 'obese';
        default: return '';
    }
}

// Function to create age trends chart
function createAgeTrendsChart(chronologicalAge, biologicalAge) {
    const ctx = document.getElementById('age-trends-chart').getContext('2d');
    
    // Generate age progression data
    const labels = [];
    const chronoData = [];
    const bioData = [];
    
    // Start from 5 years before current age, up to 15 years in future
    const startAge = Math.max(20, chronologicalAge - 5);
    const endAge = chronologicalAge + 15;
    
    for (let age = startAge; age <= endAge; age += 5) {
        labels.push(age);
        chronoData.push(age);
        
        // Calculate projected biological age
        // Current difference between bio and chrono age
        const currentDiff = biologicalAge - chronologicalAge;
        
        if (age < chronologicalAge) {
            // Past biological age (retrospective)
            const pastDiff = currentDiff * 0.8; // Assume difference was less in the past
            bioData.push(age + pastDiff);
        } else if (age === chronologicalAge) {
            // Current biological age
            bioData.push(biologicalAge);
        } else {
            // Future biological age projection
            // If biological age is currently higher, the gap widens with age
            // If biological age is currently lower, maintain the advantage
            const futureDiff = currentDiff > 0 
                ? currentDiff * (1 + 0.1 * ((age - chronologicalAge) / 5))
                : currentDiff * 0.9;
            bioData.push(age + futureDiff);
        }
    }
    
    // Destroy existing chart if it exists
    if (window.ageTrendsChart instanceof Chart) {
        window.ageTrendsChart.destroy();
    }
    
    // Create new chart
    window.ageTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Chronological Age',
                    data: chronoData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#3b82f6',
                    tension: 0.1
                },
                {
                    label: 'Biological Age',
                    data: bioData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#10b981',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + ' years';
                        }
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 6
                    }
                },
                title: {
                    display: true,
                    text: 'Age Progression Projection',
                    font: {
                        size: 14
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Age (years)'
                    },
                    min: startAge - 5,
                    ticks: {
                        stepSize: 5
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Chronological Age'
                    }
                }
            }
        }
    });
}

// Add share functionality
document.getElementById('share-results').addEventListener('click', function() {
    if (navigator.share) {
        navigator.share({
            title: 'My BMI Results',
            text: `My BMI is ${document.getElementById('bmi-result').textContent} (${document.getElementById('bmi-category').textContent}). Calculate yours at fitIN!`,
            url: window.location.href
        }).catch(console.error);
    } else {
        alert('Sharing is not available on your device');
    }
});

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

// Function to calculate BMI scale position
function calculateBMIScalePosition(bmi) {
    // BMI scale ranges from 16 to 40
    const minBMI = 16;
    const maxBMI = 40;
    const scaleWidth = 100; // percentage
    
    // Calculate position percentage
    let position = ((bmi - minBMI) / (maxBMI - minBMI)) * scaleWidth;
    
    // Clamp position between 0 and 100
    position = Math.max(0, Math.min(100, position));
    
    return position;
}

// Function to get BMI category color
function getBMICategoryColor(category) {
    switch(category.toLowerCase()) {
        case 'underweight':
            return 'from-blue-400 to-blue-500';
        case 'normal weight':
            return 'from-green-400 to-green-500';
        case 'overweight':
            return 'from-yellow-400 to-yellow-500';
        case 'obesity':
            return 'from-red-400 to-red-500';
        default:
            return 'from-gray-400 to-gray-500';
    }
}

// Enhanced function to update BMI scale with improved visualization
function updateBMIScale(bmi, category) {
    const bmiPointer = document.getElementById('bmi-pointer');
    const bmiScale = document.querySelector('.relative.h-12');
    
    // Calculate position with improved accuracy
    const position = calculateBMIScalePosition(bmi);
    
    // Update pointer position with enhanced animation
    bmiPointer.style.transition = 'left 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
    bmiPointer.style.left = `${position}%`;
    
    // Update scale with smoother gradient based on category
    bmiScale.className = `relative h-12 bmi-scale rounded-lg overflow-hidden`;
    
    // Add enhanced pulse animation to pointer
    bmiPointer.classList.add('pulse-animation');
    
    // Show the current BMI value above the pointer
    const bmiValue = document.createElement('div');
    bmiValue.className = 'absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-bold';
    bmiValue.textContent = bmi;
    bmiValue.style.opacity = '0';
    bmiValue.style.transition = 'opacity 0.5s ease';
    
    // Clear any existing BMI value display
    const existingValue = bmiPointer.querySelector('.absolute');
    if (existingValue) {
        existingValue.remove();
    }
    
    bmiPointer.appendChild(bmiValue);
    
    // Animate the BMI value display
    setTimeout(() => {
        bmiValue.style.opacity = '1';
    }, 300);
    
    // Remove pulse animation after delay
    setTimeout(() => {
        bmiPointer.classList.remove('pulse-animation');
    }, 3000);
    
    // Highlight the current BMI category on the scale
    const categories = document.querySelectorAll('.flex.justify-between.px-2.pt-1 span');
    categories.forEach(span => {
        span.classList.remove('font-bold', 'text-blue-600', 'text-green-600', 'text-yellow-600', 'text-red-600');
        
        if ((category.toLowerCase() === 'underweight' && span.textContent.includes('Underweight')) ||
            (category.toLowerCase() === 'normal weight' && span.textContent.includes('Normal')) ||
            (category.toLowerCase() === 'overweight' && span.textContent.includes('Overweight')) ||
            (category.toLowerCase() === 'obesity' && span.textContent.includes('Obese'))) {
            
            span.classList.add('font-bold');
            
            // Add appropriate color based on category
            if (category.toLowerCase() === 'underweight') {
                span.classList.add('text-blue-600');
            } else if (category.toLowerCase() === 'normal weight') {
                span.classList.add('text-green-600');
            } else if (category.toLowerCase() === 'overweight') {
                span.classList.add('text-yellow-600');
            } else if (category.toLowerCase() === 'obesity') {
                span.classList.add('text-red-600');
            }
        }
    });
}
