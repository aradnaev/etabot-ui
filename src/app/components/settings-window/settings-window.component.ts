import { Component, OnInit, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Project } from '../../project';
import { Router } from '@angular/router';
import { Settings } from 'http2';

@Component({
  selector: 'app-settings-window',
  templateUrl: './settings-window.component.html',
  styleUrls: ['./settings-window.component.css']
})
export class SettingsWindowComponent implements OnInit {
  tms: any;
  project_obj: Project;
  tms_service: any;
  api_service: any;
  confirmDelete: boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private dialogRef: MatDialogRef<SettingsWindowComponent>
    ) { }

  ngOnInit() {
    this.tms = this.data['tms'];
    this.project_obj = this.data['project'];
    this.tms_service = this.data['tms_service'];
    this.api_service = this.data['api_service']
    console.log('settings window inited.');
  }

  removeProject() {
    // Delete project from backend
    this.api_service.deleteProject(this.project_obj.project_id)
      .subscribe(
        success => {
          console.log(`Succesfully deleted project with ID: ${this.project_obj.project_id}`)
          // If the project is successfully deleted, remove it from projects_user_selected.
          let updatedProjects = this.tms.params.projects_user_selected.filter(project => project != this.project_obj.name);
          this.tms_service.patch_imported_projects(this.tms.id, this.tms.params, updatedProjects)
            .subscribe(
              success => {
                console.log(`Successfully removed project ${this.project_obj.name} from projects_user_selected`);
              },
              error => {
                console.log(`Error removing project ${this.project_obj.name} from projects_user_selected: ${error}`);
              }
            );
          // Close this dialog and reload the page
          this.dialogRef.close("Closing after deleting project");
          this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
            this.router.navigate(['/projects']);
          });
        },
        error => {
          console.log(`Failed to delete projects with ID: ${this.project_obj.project_id}: ${error}. Project will not be removed from projects_user_selected`)
        }
      );
  }

  close(message) {
    this.dialogRef.close(message);
  }
}
