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