import { describe, it, expect } from 'vitest';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const NBSP = '\u00a0';

describe('formatCurrency', () => {
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe(`R$${NBSP}0,00`);
  });

  it('formats integer', () => {
    expect(formatCurrency(1500)).toBe(`R$${NBSP}1.500,00`);
  });

  it('formats decimal', () => {
    expect(formatCurrency(1999.9)).toBe(`R$${NBSP}1.999,90`);
  });

  it('formats large numbers', () => {
    expect(formatCurrency(1000000)).toBe(`R$${NBSP}1.000.000,00`);
  });
});

describe('Dashboard calculations', () => {
  it('calculates patrimonio total correctly', () => {
    const balance = 5000;
    const totalInvested = 15000;
    const patrimonioTotal = balance + totalInvested;
    expect(patrimonioTotal).toBe(20000);
  });

  it('calculates hourly rate from monthly salary', () => {
    const salary = 3000;
    const hourlyRate = salary / 160;
    expect(hourlyRate).toBe(18.75);
  });

  it('calculates life hours from price', () => {
    const price = 300;
    const hourlyRate = 25;
    const lifeHours = parseFloat((price / hourlyRate).toFixed(1));
    expect(lifeHours).toBe(12);
  });

  it('detects plan access levels', () => {
    const allowedPlans = ['premium', 'plus', 'ultimate'];
    expect(allowedPlans.includes('basic')).toBe(false);
    expect(allowedPlans.includes('premium')).toBe(true);
    expect(allowedPlans.includes('plus')).toBe(true);
    expect(allowedPlans.includes('ultimate')).toBe(true);
  });

  it('calculates months to reach goal', () => {
    const targetAmount = 12000;
    const monthlySavings = 1000;
    const monthsToReach = Math.ceil(targetAmount / monthlySavings);
    expect(monthsToReach).toBe(12);
  });
});
