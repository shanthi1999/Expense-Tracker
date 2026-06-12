const clampDayOfMonth = (dayOfMonth, year, month) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Math.min(dayOfMonth, lastDay);
};

const computeNextRunAt = (dayOfMonth, fromDate = new Date()) => {
    const reference = new Date(fromDate);

    let year = reference.getFullYear();
    let month = reference.getMonth();
    const day = clampDayOfMonth(dayOfMonth, year, month);
    let candidate = new Date(year, month, day, 9, 0, 0, 0);

    if (candidate <= reference) {
        month += 1;
        if (month > 11) {
            month = 0;
            year += 1;
        }
        const nextDay = clampDayOfMonth(dayOfMonth, year, month);
        candidate = new Date(year, month, nextDay, 9, 0, 0, 0);
    }

    return candidate;
};

const computeReminderAt = (nextRunAt) => {
    const reminder = new Date(nextRunAt);
    reminder.setDate(reminder.getDate() - 1);
    reminder.setHours(9, 0, 0, 0);
    return reminder;
};

export default {
    clampDayOfMonth,
    computeNextRunAt,
    computeReminderAt,
};
