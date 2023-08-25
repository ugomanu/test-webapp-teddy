import { Injectable } from "@angular/core";
import { PersonalData } from "../interfaces/personal-data";
import { PersonalDataFilter } from "../interfaces/personal-data-filter";
import { PersonalDataSort } from "../interfaces/personal-data-sort";

export interface PaginatedPersonalData {
    personalData: PersonalData[];
    totalCount: number;
}

@Injectable({
    providedIn: "root",
})
export class PersonalDataService {
    baseUrl = "http://localhost:3000";
    personalDataUrl = `${this.baseUrl}/personal-data`;

    async getPaginatedPersonalData(
        page: number,
        limit: number,
        filters: PersonalDataFilter[] = [],
        sort: PersonalDataSort = { key: "firstname", order: "ascending" }
    ): Promise<PaginatedPersonalData> {
        const filterString = filters.reduce((filterString, filter) => {
            return filterString + `&${filter.type}_like=${filter.value}`;
        }, "");

        const sortString = `&_sort=${sort.key}&_order=${
            sort.order == "ascending" ? "asc" : "desc"
        }`;

        const data = await fetch(
            `${this.personalDataUrl}?_page=${page}&_limit=${limit}${filterString}${sortString}`
        );

        return {
            personalData: (await data.json()) ?? [],
            totalCount: parseInt(data.headers.get("x-total-count") ?? ""),
        };
    }

    async getPersonalDataById(id: string): Promise<PersonalData> {
        const data = await fetch(`${this.personalDataUrl}/${id}`);
        return (await data.json()) ?? {};
    }

    async createPersonalData(data: PersonalData): Promise<string> {
        data.id = this.generateRandomId();
        await fetch(`${this.personalDataUrl}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        return data.id;
    }

    async editPersonalData(data: PersonalData) {
        await fetch(`${this.personalDataUrl}/${data.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
    }

    async deletePersonalData(id: string) {
        await fetch(`${this.personalDataUrl}/${id}`, {
            method: "DELETE",
        });
    }

    async findRowIndexOfId(id: string): Promise<number> {
        const response = await fetch(
            `${this.personalDataUrl}?_sort=firstname&_order=asc`
        );
        const personalData: PersonalData[] = (await response.json()) ?? [];

        return personalData.findIndex((data) => data.id === id);
    }

    private generateRandomId(): string {
        return Math.random().toString(36).slice(2);
    }
}