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
    BOOKED = 'Booked',
    PENDING = "Pending"
}

export enum TAX_RATES{
    TAX_RATE = 0.10,
    VAT_RATE = 0.13,
    SERVICE_CHARGE = 0.05
}

export enum DESIGNATIONS {
    OWNER = 'Owner',
    MANAGER = 'Manager',
    RECEPTIONIST = 'Receptionist',
    ACCOUNTANT = 'Accountant',
    COOK = 'Cook',
    SECURITY = 'Security',
    HELPER = 'Helper',
    HOUSEKEEPER = 'House Keeper',
    CLEANER = 'Cleaner',
    GARDENER = 'Gardener',
    DRIVER = 'Driver',
    TECHNICIAN = 'Technician',
    WAITER = 'Waiter',
    BARTENDER = 'Bartender',
    OTHER = 'Other'
}

export enum EXPENSE_CATEGORY {
    SALARY = 'Salary',
    SUPPLIER = 'Supplier',
    MAINTENANCE = 'Maintenance',
    UTILITIES = 'Utilities',
    HOUSEKEEPING = 'Housekeeping',
    FOOD_AND_BEVERAGE = 'Food and Beverage',
    MARKETING = 'Marketing',
    LICENSING_AND_FEES = 'Licensing and Fees',
    TRANSPORTATION = 'Transportation',
    SECURITY = 'Security',
    TRAINING_AND_DEVELOPMENT = 'Training and Development',
    FURNITURE_AND_EQUIPMENT = 'Furniture and Equipment',
    INSURANCE = 'Insurance',
    MISCELLANEOUS = 'Miscellaneous',
}

export enum BOOKING_SOURCE {
  WEB = 'Web',
  WALK_IN = 'Walk-in'
}