/** Budget usage label — splits over 100% as "100% + 25%". */
export function formatBudgetUsageLabel(totalSpent, budget) {
    if (budget == null || budget <= 0) return 'Set in profile';

    const percent = (totalSpent / budget) * 100;

    if (percent <= 100) {
        return `${Math.round(percent)}% of budget spent (recent)`;
    }

    const overPercent = Math.round(percent - 100);
    return `100% + ${overPercent}% of budget spent (recent)`;
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
