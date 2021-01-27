import { Pipe, PipeTransform } from '@angular/core';
import { MatChipList, MatChip } from '@angular/material/chips';

@Pipe({name: 'chipListType'})

export class ChipListType implements PipeTransform {
    transform(chipList: MatChip | MatChip[])  {
        return chipList instanceof MatChip ?
            [chipList] :
            chipList;
    }
    
}