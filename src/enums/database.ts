export enum GENDER {
    MALE = 'Male',
    FEMALE = 'Female',
    OTHER = 'Other'
}

export enum PAYMENT_MODE{
    CASH = 'Cash',
    CARD = 'Card',
    ONLINE = 'Online',
    UPI = 'UPI',
    CHEQUE = 'Cheque',
    OTHER = 'Other'
}

export enum ROOM_STATUS{
    AVAILABLE = 'Available',
    OCCUPIED = 'Occupied',
    UNDER_MAINTAINANCE = 'Under maintainance',
    UNAVAILABLE = 'Unavailable'
}

export enum BOOKING_STATUS{
    CANCELLED = 'Cancelled',
    COMPLETED = 'Completed',
    NO_SHOW = 'No show',
    CHECKED_OUT = 'Checked out',
    CHECKED_IN = 'Checked in',
    BOOKED = 'Booked'
}

export enum TAX_RATES{
    TAX_RATE = 0.10,
    VAT_RATE = 0.13,
    SERVICE_CHARGE = 0.05
}
