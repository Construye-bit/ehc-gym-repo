export interface BasicInfoData {
    name: string;
    status: "ACTIVE" | "INACTIVE" | "UNDER_CONSTRUCTION" | "TEMPORARILY_CLOSED";
    max_capacity: string;
}

export interface LocationContactData {
    cityId: string;
    addressId: string;
    phone: string;
    email: string;
}

export interface ScheduleAmenitiesData {
    opening_time: string;
    closing_time: string;
    metadata: {
        has_parking: boolean;
        has_pool: boolean;
        has_sauna: boolean;
        has_spa: boolean;
        has_locker_rooms: boolean;
        wifi_available: boolean;
    };
}

export interface FormErrors {
    [key: string]: string;
}