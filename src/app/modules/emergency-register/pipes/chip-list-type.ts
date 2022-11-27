import { Pipe, PipeTransform } from '@angular/core';
import { MatLegacyChipList as MatChipList, MatLegacyChip as MatChip } from '@angular/material/legacy-chips';

@Pipe({name: 'chipListType'})

export class ChipListType implements PipeTransform {
    transform(chipList: MatChip | MatChip[])  {
        return chipList instanceof MatChip ?
            [chipList] :
            chipList;
    }
    
}