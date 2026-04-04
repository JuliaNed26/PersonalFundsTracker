export function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function getTodayLocalDate(): string {
    return formatLocalDate(new Date());
}

export function getCurrentMonthDateRange(): { startOfMonth: string; endOfMonth: string } {
    const now = new Date();

    return {
        startOfMonth: formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        endOfMonth: formatLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
}
