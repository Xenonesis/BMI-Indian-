/**
 * Health Metrics Dashboard Enhancement
 * Provides functionality for populating and styling the Health Metrics Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize health metrics if the container exists
    const metricsContainer = document.getElementById('health-metrics-container');
    if (metricsContainer) {
        initializeHealthMetrics();
    }
});

/**
 * Initialize the health metrics dashboard with default data
 * This will be updated with real data when BMI is calculated
 */
function initializeHealthMetrics() {
    // Define default metrics to display
    const defaultMetrics = [
        {
            id: 'bmi-metric',
            name: 'Body Mass Index',
            value: '0.0',
            unit: '',
            icon: 'fas fa-weight',
            color: '#3b82f6', // Default blue
            description: 'Measures body fat based on height and weight'
        },
        {
            id: 'metabolic-age-metric',
            name: 'Metabolic Age',
            value: '0',
            unit: 'years',
            icon: 'fas fa-hourglass-half',
            color: '#10b981', // Default green
            description: 'Compares your BMR to average BMR for your chronological age'
        },
        {
            id: 'body-fat-metric',
            name: 'Est. Body Fat',
            value: '0.0',
            unit: '%',
            icon: 'fas fa-percentage',
            color: '#f59e0b', // Default amber
            description: 'Estimated percentage of body weight that is fat'
        },
        {
            id: 'visceral-fat-metric',
            name: 'Visceral Fat',
            value: '0',
            unit: 'rating',
            icon: 'fas fa-exclamation-circle',
            color: '#ef4444', // Default red
            description: 'Fat stored in the abdominal cavity around vital organs'
        },
        {
            id: 'hydration-metric',
            name: 'Hydration',
            value: '0.0',
            unit: '%',
            icon: 'fas fa-tint',
            color: '#3b82f6', // Default blue
            description: 'Percentage of body weight that is water'
        },
        {
            id: 'muscle-mass-metric',
            name: 'Muscle Mass',
            value: '0.0',
            unit: 'kg',
            icon: 'fas fa-dumbbell',
            color: '#8b5cf6', // Default purple
            description: 'Total weight of muscle in your body'
        }
    ];

    // Populate the metrics container with default metrics
    populateMetricsContainer(defaultMetrics);
}

/**
 * Populate the health metrics container with the provided metrics data
 * @param {Array} metrics - Array of metric objects to display
 */
function populateMetricsContainer(metrics) {
    const container = document.getElementById('health-metrics-container');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Add each metric to the container
    metrics.forEach(metric => {
        const metricItem = createMetricItem(metric);
        container.appendChild(metricItem);
    });

    // Initialize animations for the metrics
    initMetricAnimations();
}

/**
 * Create a metric item element based on the provided metric data
 * @param {Object} metric - Metric data object
 * @returns {HTMLElement} - The created metric item element
 */
function createMetricItem(metric) {
    const metricItem = document.createElement('div');
    metricItem.className = 'metric-item';
    metricItem.id = metric.id;
    metricItem.setAttribute('data-value', metric.value);
    
    // Set custom property for the metric color
    metricItem.style.setProperty('--metric-color', metric.color);

    // Create the metric icon
    const iconDiv = document.createElement('div');
    iconDiv.className = 'metric-icon';
    iconDiv.style.backgroundColor = metric.color;
    
    const icon = document.createElement('i');
    icon.className = metric.icon;
    iconDiv.appendChild(icon);

    // Create the metric content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'flex-1';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'text-sm font-medium text-gray-600';
    nameDiv.textContent = metric.name;

    const valueDiv = document.createElement('div');
    valueDiv.className = 'metric-value';
    valueDiv.textContent = `${metric.value}${metric.unit ? ' ' + metric.unit : ''}`;

    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'text-xs text-gray-500 mt-1';
    descriptionDiv.textContent = metric.description;

    contentDiv.appendChild(nameDiv);
    contentDiv.appendChild(valueDiv);
    contentDiv.appendChild(descriptionDiv);

    // Assemble the metric item
    metricItem.appendChild(iconDiv);
    metricItem.appendChild(contentDiv);

    return metricItem;
}

/**
 * Initialize animations for metric values
 */
function initMetricAnimations() {
    const metricValues = document.querySelectorAll('.metric-value');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    metricValues.forEach(el => observer.observe(el));
}

/**
 * Update health metrics with calculated values based on BMI and other factors
 * @param {number} bmi - Body Mass Index value
 * @param {string} category - BMI category
 * @param {number} biologicalAge - Calculated biological age
 * @param {number} chronologicalAge - Actual chronological age
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {string} gender - Gender of the person
 */
function updateHealthMetrics(bmi, category, biologicalAge, chronologicalAge, weight, height, gender) {
    // Calculate derived metrics based on available data
    const heightM = height / 100;
    
    // Estimate body fat percentage based on BMI and gender
    // Using the Deurenberg equation: BF% = 1.2(BMI) + 0.23(age) - 10.8(gender) - 5.4
    // where gender is 1 for males and 0 for females
    const genderFactor = gender.toLowerCase() === 'male' ? 1 : 0;
    const bodyFat = (1.2 * bmi + 0.23 * chronologicalAge - 10.8 * genderFactor - 5.4).toFixed(1);
    
    // Estimate visceral fat rating (1-59 scale, with healthy being 1-12)
    // This is a simplified estimation
    let visceralFat;
    if (bmi < 18.5) {
        visceralFat = Math.max(1, Math.round(5 + (bmi - 18.5)));
    } else if (bmi < 25) {
        visceralFat = Math.round(5 + (bmi - 18.5) * 0.8);
    } else if (bmi < 30) {
        visceralFat = Math.round(10 + (bmi - 25) * 1.2);
    } else {
        visceralFat = Math.round(16 + (bmi - 30) * 1.5);
    }
    visceralFat = Math.min(59, Math.max(1, visceralFat));
    
    // Estimate hydration percentage (typically 45-65%)
    // Lower BMI and younger age typically correlate with higher hydration
    const baseHydration = gender.toLowerCase() === 'male' ? 60 : 55;
    let hydration;
    if (bmi < 18.5) {
        hydration = baseHydration + 2;
    } else if (bmi < 25) {
        hydration = baseHydration;
    } else if (bmi < 30) {
        hydration = baseHydration - 3;
    } else {
        hydration = baseHydration - 6;
    }
    // Adjust for age
    hydration -= Math.min(10, Math.max(0, (chronologicalAge - 25) / 5));
    hydration = hydration.toFixed(1);
    
    // Estimate muscle mass (as a percentage of weight)
    // This is a very simplified estimation
    const baseMuscle = gender.toLowerCase() === 'male' ? 40 : 35;
    let muscleMass;
    if (bmi < 18.5) {
        muscleMass = baseMuscle - 3;
    } else if (bmi < 25) {
        muscleMass = baseMuscle;
    } else if (bmi < 30) {
        muscleMass = baseMuscle - 2;
    } else {
        muscleMass = baseMuscle - 5;
    }
    // Convert percentage to kg
    muscleMass = ((muscleMass / 100) * weight).toFixed(1);
    
    // Create updated metrics array
    const updatedMetrics = [
        {
            id: 'bmi-metric',
            name: 'Body Mass Index',
            value: bmi,
            unit: '',
            icon: 'fas fa-weight',
            color: getBMICategoryColor(category),
            description: `Category: ${category}`
        },
        {
            id: 'metabolic-age-metric',
            name: 'Metabolic Age',
            value: Math.round(biologicalAge),
            unit: 'years',
            icon: 'fas fa-hourglass-half',
            color: getMetabolicAgeColor(biologicalAge, chronologicalAge),
            description: `${getAgeDifferenceText(biologicalAge, chronologicalAge)}`
        },
        {
            id: 'body-fat-metric',
            name: 'Est. Body Fat',
            value: bodyFat,
            unit: '%',
            icon: 'fas fa-percentage',
            color: getBodyFatColor(bodyFat, gender),
            description: getBodyFatCategory(bodyFat, gender)
        },
        {
            id: 'visceral-fat-metric',
            name: 'Visceral Fat',
            value: visceralFat,
            unit: 'rating',
            icon: 'fas fa-exclamation-circle',
            color: getVisceralFatColor(visceralFat),
            description: getVisceralFatCategory(visceralFat)
        },
        {
            id: 'hydration-metric',
            name: 'Hydration',
            value: hydration,
            unit: '%',
            icon: 'fas fa-tint',
            color: getHydrationColor(hydration, gender),
            description: getHydrationCategory(hydration, gender)
        },
        {
            id: 'muscle-mass-metric',
            name: 'Muscle Mass',
            value: muscleMass,
            unit: 'kg',
            icon: 'fas fa-dumbbell',
            color: getMuscleMassColor(muscleMass, weight, gender),
            description: getMuscleMassCategory(muscleMass, weight, gender)
        }
    ];
    
    // Update the metrics container with the new values
    populateMetricsContainer(updatedMetrics);
}

/**
 * Get color for BMI category
 * @param {string} category - BMI category
 * @returns {string} - Color code
 */
function getBMICategoryColor(category) {
    switch(category.toLowerCase()) {
        case 'underweight': return '#3b82f6'; // Blue
        case 'normal weight': return '#10b981'; // Green
        case 'overweight': return '#f59e0b'; // Amber
        case 'obesity': return '#ef4444'; // Red
        default: return '#6b7280'; // Gray
    }
}

/**
 * Get color for metabolic age comparison
 * @param {number} biologicalAge - Biological age
 * @param {number} chronologicalAge - Chronological age
 * @returns {string} - Color code
 */
function getMetabolicAgeColor(biologicalAge, chronologicalAge) {
    const diff = biologicalAge - chronologicalAge;
    if (diff < -5) return '#10b981'; // Significantly younger - Green
    if (diff < -2) return '#34d399'; // Younger - Light green
    if (diff < 2) return '#60a5fa'; // Similar - Blue
    if (diff < 5) return '#f59e0b'; // Older - Amber
    return '#ef4444'; // Significantly older - Red
}

/**
 * Get text description for age difference
 * @param {number} biologicalAge - Biological age
 * @param {number} chronologicalAge - Chronological age
 * @returns {string} - Description text
 */
function getAgeDifferenceText(biologicalAge, chronologicalAge) {
    const diff = biologicalAge - chronologicalAge;
    if (diff < -5) return 'Significantly younger than chronological age';
    if (diff < -2) return 'Younger than chronological age';
    if (diff < 2) return 'Similar to chronological age';
    if (diff < 5) return 'Older than chronological age';
    return 'Significantly older than chronological age';
}

/**
 * Get color for body fat percentage
 * @param {number} bodyFat - Body fat percentage
 * @param {string} gender - Gender
 * @returns {string} - Color code
 */
function getBodyFatColor(bodyFat, gender) {
    const isMale = gender.toLowerCase() === 'male';
    
    // Different ranges for males and females
    if (isMale) {
        if (bodyFat < 6) return '#3b82f6'; // Too low - Blue
        if (bodyFat < 14) return '#10b981'; // Athletic - Green
        if (bodyFat < 18) return '#34d399'; // Fitness - Light green
        if (bodyFat < 25) return '#60a5fa'; // Average - Blue
        if (bodyFat < 30) return '#f59e0b'; // Above average - Amber
        return '#ef4444'; // High - Red
    } else {
        if (bodyFat < 14) return '#3b82f6'; // Too low - Blue
        if (bodyFat < 21) return '#10b981'; // Athletic - Green
        if (bodyFat < 25) return '#34d399'; // Fitness - Light green
        if (bodyFat < 32) return '#60a5fa'; // Average - Blue
        if (bodyFat < 38) return '#f59e0b'; // Above average - Amber
        return '#ef4444'; // High - Red
    }
}

/**
 * Get category description for body fat percentage
 * @param {number} bodyFat - Body fat percentage
 * @param {string} gender - Gender
 * @returns {string} - Category description
 */
function getBodyFatCategory(bodyFat, gender) {
    const isMale = gender.toLowerCase() === 'male';
    
    if (isMale) {
        if (bodyFat < 6) return 'Essential fat (too low)';
        if (bodyFat < 14) return 'Athletic';
        if (bodyFat < 18) return 'Fitness';
        if (bodyFat < 25) return 'Average';
        if (bodyFat < 30) return 'Above average';
        return 'High';
    } else {
        if (bodyFat < 14) return 'Essential fat (too low)';
        if (bodyFat < 21) return 'Athletic';
        if (bodyFat < 25) return 'Fitness';
        if (bodyFat < 32) return 'Average';
        if (bodyFat < 38) return 'Above average';
        return 'High';
    }
}

/**
 * Get color for visceral fat rating
 * @param {number} visceralFat - Visceral fat rating
 * @returns {string} - Color code
 */
function getVisceralFatColor(visceralFat) {
    if (visceralFat <= 9) return '#10b981'; // Healthy - Green
    if (visceralFat <= 14) return '#f59e0b'; // Borderline high - Amber
    return '#ef4444'; // High - Red
}

/**
 * Get category description for visceral fat rating
 * @param {number} visceralFat - Visceral fat rating
 * @returns {string} - Category description
 */
function getVisceralFatCategory(visceralFat) {
    if (visceralFat <= 9) return 'Healthy range';
    if (visceralFat <= 14) return 'Borderline high';
    return 'High (health risk)';
}

/**
 * Get color for hydration percentage
 * @param {number} hydration - Hydration percentage
 * @param {string} gender - Gender
 * @returns {string} - Color code
 */
function getHydrationColor(hydration, gender) {
    const isMale = gender.toLowerCase() === 'male';
    const baseOptimal = isMale ? 60 : 55;
    
    if (hydration < baseOptimal - 10) return '#ef4444'; // Low - Red
    if (hydration < baseOptimal - 5) return '#f59e0b'; // Below optimal - Amber
    if (hydration <= baseOptimal + 5) return '#10b981'; // Optimal - Green
    return '#3b82f6'; // Above optimal - Blue
}

/**
 * Get category description for hydration percentage
 * @param {number} hydration - Hydration percentage
 * @param {string} gender - Gender
 * @returns {string} - Category description
 */
function getHydrationCategory(hydration, gender) {
    const isMale = gender.toLowerCase() === 'male';
    const baseOptimal = isMale ? 60 : 55;
    
    if (hydration < baseOptimal - 10) return 'Low hydration';
    if (hydration < baseOptimal - 5) return 'Below optimal';
    if (hydration <= baseOptimal + 5) return 'Optimal hydration';
    return 'Above optimal';
}

/**
 * Get color for muscle mass
 * @param {number} muscleMass - Muscle mass in kg
 * @param {number} weight - Total weight in kg
 * @param {string} gender - Gender
 * @returns {string} - Color code
 */
function getMuscleMassColor(muscleMass, weight, gender) {
    // Calculate muscle mass as percentage of total weight
    const musclePercentage = (muscleMass / weight) * 100;
    const isMale = gender.toLowerCase() === 'male';
    
    // Different optimal ranges for males and females
    const baseOptimal = isMale ? 40 : 35;
    
    if (musclePercentage < baseOptimal - 10) return '#ef4444'; // Low - Red
    if (musclePercentage < baseOptimal - 5) return '#f59e0b'; // Below average - Amber
    if (musclePercentage < baseOptimal + 5) return '#10b981'; // Average/good - Green
    return '#8b5cf6'; // Above average - Purple
}

/**
 * Get category description for muscle mass
 * @param {number} muscleMass - Muscle mass in kg
 * @param {number} weight - Total weight in kg
 * @param {string} gender - Gender
 * @returns {string} - Category description
 */
function getMuscleMassCategory(muscleMass, weight, gender) {
    // Calculate muscle mass as percentage of total weight
    const musclePercentage = (muscleMass / weight) * 100;
    const isMale = gender.toLowerCase() === 'male';
    
    // Different optimal ranges for males and females
    const baseOptimal = isMale ? 40 : 35;
    
    if (musclePercentage < baseOptimal - 10) return 'Low muscle mass';
    if (musclePercentage < baseOptimal - 5) return 'Below average';
    if (musclePercentage < baseOptimal + 5) return 'Average/good';
    return 'Above average';
}