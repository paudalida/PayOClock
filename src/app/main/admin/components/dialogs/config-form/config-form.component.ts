import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../../services/data/data.service';

@Component({
  selector: 'app-config-form',
  templateUrl: './config-form.component.html',
  styleUrl: './config-form.component.scss'
})
export class ConfigFormComponent implements OnInit {

  constructor(
    private ds: DataService
  ) {}

  records: any;

  ngOnInit(): void {
    // this.ds.request('GET', )
  }
}
