const getMonthsRemaining = (deadline, from = new Date()) => {
    const end = new Date(deadline);
    const start = new Date(from);

    if (end <= start) return 0;

    let months =
        (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

    if (end.getDate() < start.getDate()) {
        months -= 1;
    }

    return Math.max(1, months);
};

const toPlainGoal = (goal) => {
    if (!goal) return goal;
    return typeof goal.toObject === 'function' ? goal.toObject() : { ...goal };
};

const enrichSavingsGoal = (goal) => {
    const plain = toPlainGoal(goal);
    const targetAmount = Number(plain.targetAmount) || 0;
    const savedAmount = Number(plain.savedAmount) || 0;
    const remaining = Math.max(0, targetAmount - savedAmount);
    const monthsRemaining = getMonthsRemaining(plain.deadline);
    const monthlyNeeded =
        remaining > 0 && monthsRemaining > 0 ? Math.ceil(remaining / monthsRemaining) : 0;
    const progressPercent =
        targetAmount > 0 ? Math.min(100, Math.round((savedAmount / targetAmount) * 100)) : 0;
    const isComplete = savedAmount >= targetAmount && targetAmount > 0;
    const isOverdue = new Date(plain.deadline) < new Date() && !isComplete;

    return {
        ...plain,
        remaining,
        monthlyNeeded,
        progressPercent,
        monthsRemaining,
        isComplete,
        isOverdue,
    };
};

export default {
    getMonthsRemaining,
    enrichSavingsGoal,
};
