import { Component, OnInit, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Project } from '../../project';

@Component({
  selector: 'app-settings-window',
  templateUrl: './settings-window.component.html',
  styleUrls: ['./settings-window.component.css']
})
export class SettingsWindowComponent implements OnInit {
  tms: any;
  project_obj: Project;
  tms_service: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

  ngOnInit() {
    console.log(this.data);
    this.tms = this.data['tms'];
    this.project_obj = this.data['project'];
    this.tms_service = this.data['tms_service'];
    console.log('settings window inited.');
  }

}
