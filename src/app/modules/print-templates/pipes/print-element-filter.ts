import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Pipe({
    name: 'printTemplateFilter',
    pure: false
})
export class PrintElementFilter implements PipeTransform {
    transform(items: AbstractControl[], filter: AbstractControl[]): any {
        if (!items || !filter) {
            return items;
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter(item => !item.get("deleted").value);
    }
}