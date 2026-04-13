export function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function getTodayLocalDate(): string {
    return formatLocalDate(new Date());
}

export function getMonthDateRange(date?: Date): { startOfMonth: string; endOfMonth: string } {
    const d = date ?? new Date();
    return {
        startOfMonth: formatLocalDate(new Date(d.getFullYear(), d.getMonth(), 1)),
        endOfMonth: formatLocalDate(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
    };
}

export function getCurrentMonthDateRange(): { startOfMonth: string; endOfMonth: string } {
    return getMonthDateRange();
}

export function getPreviousMonthDateRange(date?: Date): { startOfMonth: string; endOfMonth: string } {
    const d = date ?? new Date();
    const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    return getMonthDateRange(prev);
}

export function getMonthKey(date?: Date): string {
    const d = date ?? new Date();
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    return `${year}-${month}`;
}
