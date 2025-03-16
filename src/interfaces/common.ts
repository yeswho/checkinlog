import { GENDER } from "@src/enums/database";

export interface CustomerData {
    firstname: string | undefined;
    lastname: string;
    address?: string | null;
    dateofbirth: Date;
    contact: string;
    gender?: GENDER;
    company?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface RoomDetails {
    id: number;
    name: string;
    floor: {
        id: number;
        name: string;
    } | null;
    room_type: {
        id: number;
        name: string;
    } | null;
    status: string;
    rate: number;
    occupiedDetails?: {
        customer: {
            firstName: string;
            lastName: string;
            contact: string;
        };
        checkIn: string;
        checkOut: string;
    } | null;
    maintenanceDetails?: {
        reason: string;
        startDate: string;
        expectedEndDate: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}