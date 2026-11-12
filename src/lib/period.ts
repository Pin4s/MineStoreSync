const TIME_ZONE = "America/Sao_Paulo"

function getYearMonth(date: Date) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit"
    }).formatToParts(date);

    const year = parts.find(p => p.type === "year")?.value;
    const month = parts.find(p => p.type === "month")?.value;

    if (!year || !month) {
        throw new Error(`Não foi possível calcular o período de ${date.toISOString()}`);
    }

    return { year: Number(year), month: Number(month) }
}

function formatPeriodKey(year: number, month: number) {
    return `${year}-${String(month).padStart(2, "0")}`
}

// Calendar month of the date in São Paulo, as "AAAA-MM".
export function getPeriodKey(date: Date) {
    const { year, month } = getYearMonth(date)
    return formatPeriodKey(year, month)
}

// Calendar month before the one the date falls in, in São Paulo, as "AAAA-MM".
export function previousPeriodKey(date: Date) {
    const { year, month } = getYearMonth(date)
    return month === 1 ? formatPeriodKey(year - 1, 12) : formatPeriodKey(year, month - 1)
}
