/** Budget usage label — over 100% uses "+ N%" when under 2x total, "+ Nx" when at/above 2x. */
export function formatBudgetUsageLabel(totalSpent, budget) {
    if (budget == null || budget <= 0) return 'Set in profile';

    const percent = (totalSpent / budget) * 100;

    if (percent <= 100) {
        return `${Math.round(percent)}% of budget spent (recent)`;
    }

    const overMultiplier = (totalSpent - budget) / budget;

    if (overMultiplier < 1) {
        const overPercent = Math.round(overMultiplier * 100);
        return `100% + ${overPercent}% of budget spent (recent)`;
    }

    const multiplierLabel = Number.isInteger(overMultiplier)
        ? `${overMultiplier}x`
        : `${parseFloat(overMultiplier.toFixed(1))}x`;

    return `100% + ${multiplierLabel} of budget spent (recent)`;
}

/** Expense IDs that push cumulative spending over the budget (chronological order). */
export function getOverBudgetExpenseIds(expenses, budget) {
    const overBudgetIds = new Set();

    if (budget == null || budget <= 0 || !expenses.length) {
        return overBudgetIds;
    }

    const chronological = [...expenses].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let runningTotal = 0;

    for (const expense of chronological) {
        runningTotal += expense.amount;
        if (runningTotal > budget) {
            overBudgetIds.add(expense.expenseId);
        }
    }

    return overBudgetIds;
}
