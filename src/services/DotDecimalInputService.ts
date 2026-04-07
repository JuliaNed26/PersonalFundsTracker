export function parseDotDecimalInput(value: string): number | null {
    if (value === "" || value === ".") {
        return null;
    }

    const parsedValue = parseFloat(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function parseDotDecimalInputOrZero(value: string): number {
    return parseDotDecimalInput(value) ?? 0;
}

export function formatDotDecimalInput(
    value?: number | null,
    emptyWhenZero: boolean = false
): string {
    if (value === undefined || value === null) {
        return "";
    }

    if (emptyWhenZero && value === 0) {
        return "";
    }

    return value.toString();
}
