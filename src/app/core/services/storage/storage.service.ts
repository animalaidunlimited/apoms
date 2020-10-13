import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    private storage: Storage;

    constructor() {
        this.storage = localStorage;
    }

    public save(key: string, value: any) {
        value = JSON.stringify(value);
        this.storage.setItem(key, value);
    }

    public read(key: string): string | null {
        const value = this.storage.getItem(key);

        if(value){
            return JSON.parse(value);
        }
        else{
            return null;
        }

    }

    public remove(key: string) {
        return this.storage.removeItem(key);
    }

    public getItemArray(type: string) {
        const result = [];

        for (let i = 0; i < this.storage.length; i++) {
            const item = this.storage.key(i);

            if (item?.substr(0, type.length) === type) {
                result.push({ key: item, value: this.storage.getItem(item) });
            }
        }

        return result;
    }

    public clear() {
        this.storage.clear();
    }
}
