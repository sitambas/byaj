export class InterestCalculator {
  /**
   * Calculate simple interest
   */
  static simpleInterest(
    principal: number,
    rate: number,
    days: number,
    interestEvery: 'DAILY' | 'WEEKLY' | 'HALF_MONTHLY' | 'MONTHLY'
  ): number {
    const periods = this.getPeriods(days, interestEvery);
    return (principal * rate * periods) / 100;
  }

  /**
   * Calculate compound interest
   */
  static compoundInterest(
    principal: number,
    rate: number,
    days: number,
    interestEvery: 'DAILY' | 'WEEKLY' | 'HALF_MONTHLY' | 'MONTHLY',
    compoundingFrequency: 'DAILY' | 'WEEKLY' | 'HALF_MONTHLY' | 'MONTHLY' = 'MONTHLY'
  ): number {
    const periods = this.getPeriods(days, interestEvery);
    const n = this.getCompoundingPeriods(compoundingFrequency);
    return principal * (Math.pow(1 + rate / (100 * n), n * periods) - 1);
  }

  /**
   * Monthly calculation - rounds up partial months
   */
  static monthlyCalculation(
    principal: number,
    rate: number,
    startDate: Date,
    endDate: Date
  ): number {
    const months = this.getMonthsBetween(startDate, endDate);
    return (principal * rate * months) / 100;
  }

  /**
   * Daily calculation - exact days
   */
  static dailyCalculation(
    principal: number,
    rate: number,
    days: number
  ): number {
    return (principal * rate * days) / (100 * 365);
  }

  /**
   * Half Monthly calculation - rounds up partial half-months
   */
  static halfMonthlyCalculation(
    principal: number,
    rate: number,
    startDate: Date,
    endDate: Date
  ): number {
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const halfMonths = Math.ceil(days / 15);
    return (principal * rate * halfMonths) / (100 * 24); // 24 half-months per year
  }

  /**
   * Weekly calculation - rounds up partial weeks
   */
  static weeklyCalculation(
    principal: number,
    rate: number,
    days: number
  ): number {
    const weeks = Math.ceil(days / 7);
    return (principal * rate * weeks) / (100 * 52); // 52 weeks per year
  }

  /**
   * Calculate interest based on loan configuration
   */
  static calculateInterest(
    principal: number,
    rate: number,
    startDate: Date,
    endDate: Date | null,
    loanType: 'WITH_INTEREST' | 'FIXED_AMOUNT',
    interestCalc: 'MONTHLY' | 'HALF_MONTHLY' | 'WEEKLY' | 'DAILY',
    interestEvery: 'DAILY' | 'WEEKLY' | 'HALF_MONTHLY' | 'MONTHLY',
    hasCompounding: boolean
  ): number {
    if (loanType === 'FIXED_AMOUNT') {
      return 0;
    }

    if (!endDate) {
      // Calculate from start date to today
      endDate = new Date();
    }

    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (hasCompounding) {
      return this.compoundInterest(
        principal,
        rate,
        days,
        interestEvery,
        interestEvery
      );
    }

    if (interestCalc === 'MONTHLY') {
      return this.monthlyCalculation(principal, rate, startDate, endDate);
    } else if (interestCalc === 'HALF_MONTHLY') {
      return this.halfMonthlyCalculation(principal, rate, startDate, endDate);
    } else if (interestCalc === 'WEEKLY') {
      return this.weeklyCalculation(principal, rate, days);
    } else {
      return this.dailyCalculation(principal, rate, days);
    }
  }

  /**
   * Get number of periods based on interest frequency
   */
  private static getPeriods(
    days: number,
    interestEvery: 'DAILY' | 'WEEKLY' | 'HALF_MONTHLY' | 'MONTHLY'
  ): number {
    switch (interestEvery) {
      case 'DAILY':
        return days;
      case 'WEEKLY':
        return Math.ceil(days / 7);
      case 'HALF_MONTHLY':
        return Math.ceil(days / 15);
      case 'MONTHLY':
        return Math.ceil(days / 30);
      default:
        return days;
    }
  }

  /**
   * Get compounding periods per year
   */
  private static getCompoundingPeriods(
    frequency: 'DAILY' | 'WEEKLY' | 'HALF_MONTHLY' | 'MONTHLY'
  ): number {
    switch (frequency) {
      case 'DAILY':
        return 365;
      case 'WEEKLY':
        return 52;
      case 'HALF_MONTHLY':
        return 24;
      case 'MONTHLY':
        return 12;
      default:
        return 12;
    }
  }

  /**
   * Calculate months between two dates (rounds up)
   */
  private static getMonthsBetween(startDate: Date, endDate: Date): number {
    const years = endDate.getFullYear() - startDate.getFullYear();
    const months = endDate.getMonth() - startDate.getMonth();
    const days = endDate.getDate() - startDate.getDate();

    let totalMonths = years * 12 + months;
    if (days > 0) {
      totalMonths += 1; // Round up if there are extra days
    }

    return totalMonths;
  }
}
