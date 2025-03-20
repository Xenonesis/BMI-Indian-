/**
 * Health Insights Enhancement Script
 * Adds animations and interactive features to the Health Insights section
 */

document.addEventListener('DOMContentLoaded', () => {
    initHealthInsights();
});

/**
 * Initialize all Health Insights components
 */
function initHealthInsights() {
    // Initialize animations for health metrics when they come into view
    initMetricsAnimation();
    
    // Enhance recommendation items with staggered animations
    enhanceRecommendations();
    
    // Add color coding to metrics based on their values
    colorCodeMetrics();
    
    // Make health tips more interactive
    enhanceHealthTips();
}

/**
 * Add color coding to metrics based on their values
 */
function colorCodeMetrics() {
    const metricItems = document.querySelectorAll('.metric-item');
    
    metricItems.forEach(item => {
        // Get the metric value from the data attribute
        const value = parseFloat(item.getAttribute('data-value') || 0);
        const id = item.id;
        
        // Skip if no value or id
        if (!value || !id) return;
        
        // Apply hover effect with appropriate color
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(8px)';
            item.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
            item.style.boxShadow = 'none';
        });
        
        // Add pulse animation to the icon when the value is in a concerning range
        if (id === 'bmi-metric' && (value < 18.5 || value > 30)) {
            const icon = item.querySelector('.metric-icon');
            if (icon) {
                icon.classList.add('pulse-animation');
            }
        }
        
        if (id === 'visceral-fat-metric' && value > 14) {
            const icon = item.querySelector('.metric-icon');
            if (icon) {
                icon.classList.add('pulse-animation');
            }
        }
    });
}

/**
 * Initialize animations for health metrics using Intersection Observer
 */
function initMetricsAnimation() {
    const metricElements = document.querySelectorAll('.metric-value, .circular-progress .progress-value');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    metricElements.forEach(el => observer.observe(el));
    
    // Animate biological age comparison chart with enhanced effects
    const ageChart = document.querySelector('.age-comparison-chart');
    if (ageChart) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                const chronoBar = ageChart.querySelector('.chronological-bar');
                const bioBar = ageChart.querySelector('.biological-bar');
                const chronoMarker = document.getElementById('chrono-marker');
                const bioMarker = document.getElementById('bio-marker');
                const ageDifference = document.getElementById('age-difference');
                
                const chronoAge = parseInt(chronoBar.getAttribute('data-age') || 0);
                const bioAge = parseInt(bioBar.getAttribute('data-age') || 0);
                
                // Calculate width percentages (max age 100)
                const maxAge = 100;
                const chronoWidth = Math.min(chronoAge / maxAge * 100, 100);
                const bioWidth = Math.min(bioAge / maxAge * 100, 100);
                
                // Animate the bars with improved timing and easing
                anime({
                    targets: chronoBar,
                    width: `${chronoWidth}%`,
                    easing: 'easeOutExpo',
                    duration: 1200,
                    complete: function() {
                        // Position and animate the chronological marker
                        if (chronoMarker) {
                            chronoMarker.style.left = `${chronoWidth}%`;
                            chronoMarker.textContent = `${chronoAge}y`;
                            chronoMarker.classList.add('animate');
                        }
                        
                        // Animate the biological bar with a slight delay
                        anime({
                            targets: bioBar,
                            width: `${bioWidth}%`,
                            easing: 'easeOutElastic(1, .5)',
                            duration: 1500,
                            delay: 300,
                            complete: function() {
                                // Position and animate the biological marker
                                if (bioMarker) {
                                    bioMarker.style.left = `${bioWidth}%`;
                                    bioMarker.textContent = `${bioAge}y`;
                                    bioMarker.classList.add('animate');
                                }
                                
                                // Animate the age difference indicator
                                if (ageDifference) {
                                    ageDifference.classList.add('animate');
                                }
                            }
                        });
                    }
                });
                
                // Animate the age trends chart if it exists
                const ageTrendsChart = document.getElementById('age-trends-chart');
                if (ageTrendsChart) {
                    setTimeout(() => {
                        ageTrendsChart.classList.add('animate');
                    }, 2000);
                }
                
                observer.unobserve(ageChart);
            }
        }, { threshold: 0.5 });
        
        observer.observe(ageChart);
}

/**
 * Enhance recommendation items with staggered animations
 */
function enhanceRecommendations() {
    const recommendationItems = document.querySelectorAll('.recommendation-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Staggered animation
                setTimeout(() => {
                    entry.target.classList.add('animate');
                }, index * 150);