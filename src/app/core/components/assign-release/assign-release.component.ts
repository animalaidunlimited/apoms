import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { DropdownService } from '../../services/dropdown/dropdown.service';

@Component({
  selector: 'app-assign-release',
  templateUrl: './assign-release.component.html',
  styleUrls: ['./assign-release.component.scss']
})
export class AssignReleaseComponent implements OnInit {

  releasers$!: Observable<User[]>;
  constructor(private dropdown: DropdownService) { }

  ngOnInit() {
    this.releasers$ = this.dropdown.getRescuers();
  }

}
