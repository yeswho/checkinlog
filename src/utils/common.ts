export function toNepaliStartOfDayUTC(date: Date): Date {
    // Treat input as local Nepal time (even if it's UTC)
    const nepaliDate = new Date(date);
    
    // Set to Nepal's start of day (00:00:00)
    nepaliDate.setHours(0, 0, 0, 0);
    
    // Convert to UTC by subtracting the offset
    const utcDate = new Date(nepaliDate.getTime() - (5.75 * 60 * 60 * 1000));
    
    return utcDate;
}

export function toNepaliEndOfDayUTC(date: Date): Date {
    // Treat input as local Nepal time
    const nepaliDate = new Date(date);
    
    // Set to Nepal's end of day (23:59:59.999)
    nepaliDate.setHours(23, 59, 59, 999);
    
    // Convert to UTC by subtracting the offset
    const utcDate = new Date(nepaliDate.getTime() - (5.75 * 60 * 60 * 1000));
    
    return utcDate;
}