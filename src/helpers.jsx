export const formatGameTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
        // weekday: 'short',
        // month: 'short',
        // day: 'numeric',
        hour12: true
    });
};

export const getInterestLevel = (score) => {
    if (score >= 0.8) return { label: "Must Watch", className: "must-watch" };
    if (score >= 0.6) return { label: "High Interest", className: "high-interest" };
    if (score >= 0.4) return { label: "Decent", className: "decent" };
    return { label: "Low Interest", className: "low-interest" };
};
