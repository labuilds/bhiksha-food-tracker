export function formatDateDDMMYYYY(dateString: string | Date | undefined | null): string {
    if (!dateString) return "";

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return String(dateString); // Return raw if invalid

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    } catch (e) {
        return String(dateString);
    }
}
