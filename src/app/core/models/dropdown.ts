import { AnimalType } from "./animal-type";

export interface AnimalTypeResponse {
    data: AnimalType[];
}

export interface EditableDropdown {
    dropdown: string;
    displayName: string;
    request: string;
    tableName: string;
}

export interface EditableDropdownElement {
    elementId: number;
    value: string;
    isDeleted: boolean;
    sortOrder: number,
    saving: boolean
}