class PeriodTracker {
    constructor() {
        this.settings = {
            minCycleLength: 21,
            maxCycleLength: 35,
            avgPeriodLength: 5,
            ovulationOffset: 14,      // Days before next period
            fertileWindowStart: 5,    // Days before ovulation
            fertileWindowEnd: 1       // Days after ovulation
        };
    }

    predictNextPeriods(lastPeriod, cycleLength = 28, regularity = 'regular') {
        if (!this.validateInputs(lastPeriod, cycleLength)) {
            throw new Error('Invalid input parameters');
        }
        const lastDate = new Date(lastPeriod);
        const predictions = [];
        const regularityFactors = {
            'regular':   { certainty: 0.95 },
            'somewhat':  { certainty: 0.85 },
            'irregular': { certainty: 0.75 }
        };

        for (let i = 1; i <= 3; i++) {
            const periodStart = new Date(lastDate);
            periodStart.setDate(lastDate.getDate() + (cycleLength * i));

            const ovulation = new Date(periodStart);
            ovulation.setDate(periodStart.getDate() - this.settings.ovulationOffset);

            const fertileStart = new Date(ovulation);
            fertileStart.setDate(ovulation.getDate() - this.settings.fertileWindowStart);

            const fertileEnd = new Date(ovulation);
            fertileEnd.setDate(ovulation.getDate() + this.settings.fertileWindowEnd);

            const periodEnd = new Date(periodStart);
            periodEnd.setDate(periodStart.getDate() + this.settings.avgPeriodLength);

            const base = regularityFactors[regularity].certainty;
            const certainty = Math.round(base * 100 * (1 - (i - 1) * 0.15));
            predictions.push({
                cycleNumber: i,
                periodStart,
                periodEnd,
                ovulation,
                fertility: { start: fertileStart, end: fertileEnd },
                certainty: Math.min(Math.max(certainty, 60), 95)
            });
        }
        return predictions;
    }

    validateInputs(lastPeriod, cycleLength) {
        const today = new Date();
        const lpDate = new Date(lastPeriod);
        if (lpDate > today) throw new Error('Last period date cannot be in the future');
        if (cycleLength < this.settings.minCycleLength || cycleLength > this.settings.maxCycleLength) {
            throw new Error(`Cycle length must be between ${this.settings.minCycleLength} and ${this.settings.maxCycleLength} days`);
        }
        return true;
    }

    getSymptomRecommendations(symptoms) {
        const recs = {
            cramps: ['Apply heat therapy', 'Do gentle yoga', 'Stay hydrated', 'Use OTC pain relievers'],
            headache: ['Rest in a quiet room', 'Stay hydrated', 'Use cold/hot compress', 'Relaxation techniques'],
            bloating: ['Avoid salty foods', 'Eat small frequent meals', 'Light exercise', 'Try ginger tea'],
            fatigue: ['Rest adequately', 'Eat iron-rich foods', 'Stay hydrated', 'Light walking'],
            moodSwings: ['Practice stress reduction', 'Regular exercise', 'Keep a sleep schedule', 'Consider B vitamins']
        };
        return symptoms.reduce((acc, s) => recs[s] ? acc.concat(recs[s]) : acc, []);
    }

    formatDateRange(start, end) {
        const options = { month: 'short', day: 'numeric' };
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    }
}

window.PeriodTracker = PeriodTracker;
