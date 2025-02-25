const healthTips = [
    {
        icon: 'fa-glass-water',
        title: 'Smart Hydration',
        tip: 'Drink water 30 minutes before meals to improve digestion and control portions. Aim for 8 glasses daily.',
        category: 'nutrition'
    },
    {
        icon: 'fa-apple-whole',
        title: 'Color Theory',
        tip: 'Eat fruits and vegetables of different colors to get a wide variety of nutrients and antioxidants.',
        category: 'nutrition'
    },
    {
        icon: 'fa-heart-pulse',
        title: 'Heart Health',
        tip: 'Include 30 minutes of moderate cardio activity daily to strengthen your heart and improve circulation.',
        category: 'fitness'
    },
    {
        icon: 'fa-bed',
        title: 'Sleep Quality',
        tip: 'Maintain a consistent sleep schedule. Avoid screens 1 hour before bedtime for better sleep quality.',
        category: 'wellness'
    },
    {
        icon: 'fa-dumbbell',
        title: 'Strength Training',
        tip: 'Include resistance training 2-3 times per week to build muscle and boost metabolism.',
        category: 'fitness'
    },
    {
        icon: 'fa-brain',
        title: 'Mental Wellness',
        tip: 'Practice 10 minutes of mindfulness or meditation daily to reduce stress and improve focus.',
        category: 'wellness'
    },
    {
        icon: 'fa-bowl-food',
        title: 'Portion Control',
        tip: 'Use smaller plates and bowls to naturally control portion sizes without feeling deprived.',
        category: 'nutrition'
    },
    {
        icon: 'fa-person-walking',
        title: 'Movement Breaks',
        tip: 'Take a 5-minute walking break every hour to reduce sedentary time and boost energy.',
        category: 'fitness'
    },
    {
        icon: 'fa-sun',
        title: 'Morning Routine',
        tip: 'Start your day with 5 minutes of stretching to improve flexibility and reduce muscle tension.',
        category: 'wellness'
    },
    {
        icon: 'fa-leaf',
        title: 'Plant Power',
        tip: 'Add leafy greens to at least two meals daily for essential vitamins and minerals.',
        category: 'nutrition'
    },
    {
        icon: 'fa-stairs',
        title: 'Active Choices',
        tip: 'Choose stairs over elevator for short trips to add natural exercise to your day.',
        category: 'fitness'
    },
    {
        icon: 'fa-moon',
        title: 'Evening Ritual',
        tip: 'Create a relaxing bedtime routine to signal your body it\'s time to wind down.',
        category: 'wellness'
    },
    // Additional Tips
    {
        icon: 'fa-carrot',
        title: 'Balanced Meals',
        tip: 'Follow the 50-25-25 rule: 50% vegetables, 25% lean protein, 25% whole grains for optimal nutrition.',
        category: 'nutrition'
    },
    {
        icon: 'fa-fish',
        title: 'Healthy Fats',
        tip: 'Include omega-3 rich foods like salmon, chia seeds, and walnuts twice a week for brain health.',
        category: 'nutrition'
    },
    {
        icon: 'fa-seedling',
        title: 'Fiber Intake',
        tip: 'Aim for 25-30g of fiber daily through whole grains, legumes, fruits, and vegetables.',
        category: 'nutrition'
    },
    {
        icon: 'fa-person-running',
        title: 'HIIT Benefits',
        tip: 'Incorporate high-intensity interval training for efficient fat burning and improved cardiovascular health.',
        category: 'fitness'
    },
    {
        icon: 'fa-person-swimming',
        title: 'Low Impact Exercise',
        tip: 'Try swimming or cycling for joint-friendly cardio that builds endurance without stress on joints.',
        category: 'fitness'
    },
    {
        icon: 'fa-stopwatch',
        title: 'Recovery Time',
        tip: 'Allow 48 hours between strength training sessions for the same muscle groups to optimize recovery.',
        category: 'fitness'
    },
    {
        icon: 'fa-face-smile',
        title: 'Stress Management',
        tip: 'Practice deep breathing exercises: inhale for 4 seconds, hold for 4, exhale for 4, repeat 5 times.',
        category: 'wellness'
    },
    {
        icon: 'fa-eye',
        title: 'Digital Wellness',
        tip: 'Follow the 20-20-20 rule: Every 20 minutes, look 20 feet away for 20 seconds to reduce eye strain.',
        category: 'wellness'
    },
    {
        icon: 'fa-droplet',
        title: 'Hydration Check',
        tip: 'Monitor urine color - pale yellow indicates good hydration, darker means drink more water.',
        category: 'wellness'
    }
];

class TipsCarousel {
    constructor(containerId) {
        this.container = document.querySelector(containerId);
        this.currentIndex = 0;
        this.updateInterval = 5000; // 5 seconds between auto-updates
        this.intervalId = null;
    }

    init() {
        this.renderTips();
        this.setupControls();
        this.startAutoPlay();
        this.setupFilterButtons();
    }

    renderTips(filteredTips = healthTips) {
        const slider = this.container.querySelector('.quick-tips-slider');
        slider.innerHTML = filteredTips.map(tip => `
            <div class="flex-shrink-0 w-full p-4">
                <div class="bg-white rounded-xl p-6 shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div class="flex items-center space-x-3 mb-2">
                        <i class="fas ${tip.icon} text-blue-500 text-2xl"></i>
                        <h5 class="font-bold text-gray-800">${tip.title}</h5>
                    </div>
                    <p class="text-sm text-gray-600">${tip.tip}</p>
                </div>
            </div>
        `).join('');

        this.updateProgressDots(filteredTips.length);
    }

    setupControls() {
        const prevBtn = this.container.querySelector('.prev-tip');
        const nextBtn = this.container.querySelector('.next-tip');

        prevBtn.addEventListener('click', () => this.navigate('prev'));
        nextBtn.addEventListener('click', () => this.navigate('next'));
    }

    navigate(direction) {
        const slider = this.container.querySelector('.quick-tips-slider');
        const itemCount = slider.children.length;
        
        this.currentIndex = direction === 'next' 
            ? (this.currentIndex + 1) % itemCount
            : (this.currentIndex - 1 + itemCount) % itemCount;

        this.updateSliderPosition();
        this.updateProgressDots(itemCount);
        this.resetAutoPlay();
    }

    updateSliderPosition() {
        const slider = this.container.querySelector('.quick-tips-slider');
        slider.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }

    updateProgressDots(count) {
        const dotsContainer = this.container.querySelector('.progress-dots');
        if (!dotsContainer) return;

        dotsContainer.innerHTML = Array(count).fill(0).map((_, i) => `
            <span class="indicator w-3 h-3 ${i === this.currentIndex ? 'bg-blue-500' : 'bg-gray-300'} 
                  rounded-full transition-all duration-300"></span>
        `).join('');
    }

    startAutoPlay() {
        this.intervalId = setInterval(() => this.navigate('next'), this.updateInterval);
    }

    resetAutoPlay() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.startAutoPlay();
        }
    }

    setupFilterButtons() {
        const filterButtons = this.container.querySelectorAll('.tip-filter');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                const filteredTips = category === 'all' 
                    ? healthTips 
                    : healthTips.filter(tip => tip.category === category);
                
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentIndex = 0;
                this.renderTips(filteredTips);
                this.updateSliderPosition();
                this.resetAutoPlay();
            });
        });
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const carousel = new TipsCarousel('#quick-tips-section');
    carousel.init();
});
