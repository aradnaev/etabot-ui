import { Component, OnInit, Input } from '@angular/core';
import { JiraService } from '../../services/jira.service';
import { Router, ActivatedRoute} from '@angular/router';
import { ErrorBoxComponent } from '../error-box/error-box.component';
import { NONE_TYPE } from '@angular/compiler/src/output/output_ast';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { TutorialDialogComponent } from '../tutorial-dialog/tutorial-dialog.component';

// import { Job } from '../../job';
// import { EtabotApiService } from '../../services/etabot-api.service';

@Component({
  selector: 'app-tms-card',
  templateUrl: './tms-card.component.html',
  styleUrls: ['./tms-card.component.css']
})

export class TmsCardComponent implements OnInit {
  @Input() tms: any;
  @Input() tms_service: any;
  updating_tms: boolean;
  new_password: string;
  new_username: string;
  error_message: string;
  error: boolean;
  tms_status: any;
  message: string;
  projects: Array<{name: string, import: boolean}>;
  displayColumns: Array<string>;
  dataSource: MatTableDataSource<Object>;
  dialogRef: MatDialogRef<TutorialDialogComponent>;

  constructor(
      private jiraService: JiraService,
      private router: Router,
      private dialog: MatDialog
      // private etabotAPI: EtabotApiService
    ) {
    this.updating_tms = false;
    this.error = false;
  }

  ngOnInit() {
    console.log('TmsCardComponent Init tms: ' + this.tms.id + this.tms.connectivity_status + this.tms);
    if (this.tms.connectivity_status !== null) {
          this.tms_status = this.tms.connectivity_status;
    } else {
        this.tms_status = {'status': 'unknown', 'description': ''};
    }

    if (this.tms.params.projects_user_selected) {
      console.log('this.tms.params.projects_user_selected: ' + this.tms.params.projects_user_selected);
    } else {
      this.tms.params.projects_user_selected = [];
    }

    // Check if old tms-card never had projects importe
    if (Object.keys(this.tms.params).length <= 1 || !('projects_available' in this.tms.params)) {
      this.jiraService.patch_username_password_tms(this.tms.id, this.tms.username, this.tms.password)
        .subscribe(
          success => {
            console.log("Missing params, patchinig");
            this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
              this.router.navigate(["./tmss"]);
            });
          },
          error => {
            console.log("Missing params, failed to patch: ", error);
          }
        );
    }

    if (this.tms.params.projects_available) {
      console.log('this.tms.params.projects_available: ' + this.tms.params.projects_available);
      this.projects = this.tms.params.projects_available.map(project => {
        console.log('mapping project ' + project);
        return {name: project, import: this.tms.params.projects_user_selected.includes(project)};
      });
      console.log('set this.projects to ' + this.projects );
    } else {
      console.log('no "projects_available" in tms params');
      this.projects = [];
    }

    this.displayColumns = ['projects'];
    this.dataSource = new MatTableDataSource(this.projects);
  }

  remove_protocol_from_string(url) {
      return url.replace(/(^\w+:|^)\/\//, '');
  }

  username_not_null() {
      if (this.tms.username) {
          return true;
      } else {
          return false;
      }
  }


  update_password(tms_id) {
      // console.log('updating tms id ' + tms_id + ' with new password: ' + this.new_password);
    this.updating_tms = true;
    this.jiraService.patch_username_password_tms(tms_id, this.new_username, this.new_password)
    .subscribe(
      success => {
          console.log('update password is successful');
        this.updating_tms = false;
        this.error = false;
        if (this.tms_service) {
            this.tms_service.get_tms();
        }

      },
      error => {
        this.error_message = this.jiraService.parse_error(error);
        console.log(error);
        this.error = true;
        this.updating_tms = false;
      }
    );
  }


  parse_projects(tms_id) {
    // console.log('updating tms id ' + tms_id + ' with new password: ' + this.new_password);

    const finishedImportCallback = () => {
      // Make sure dialog exists
      if (this.dialogRef && this.dialogRef.componentInstance) {
        // Enable button to redirect ./projects
        this.dialogRef.componentInstance.showRedirect();
        // Hide loading bar when ready
        this.dialogRef.componentInstance.hideLoadingBar();
      }
    };

    this.updating_tms = true;
    this.jiraService.parse_projects(tms_id, finishedImportCallback)
    .subscribe(
      parse_result => {

        console.log(parse_result);
        console.log(typeof(parse_result));
        for (const job of parse_result) {
            console.log(job);
        }

        this.updating_tms = false;
        this.error = false;
      },
      error => {
        this.error_message = error;
        this.error_message = this.jiraService.parse_error(error);
        console.log(error);
        this.error = true;
        this.updating_tms = false;
        
        // Make sure dialog exists
        if (this.dialogRef && this.dialogRef.componentInstance) {
          // Show error
          this.dialogRef.componentInstance.showError(
            'Unable to connect.<br>Please try again later.<br>If the error persists report it to hello@etabot.ai.');
          // Hide loading bar on error
          this.dialogRef.componentInstance.hideLoadingBar();
        }
      }
    );

    // Display the tutorial dialog
    this.openTutorialDialog();
  }

  delete_tms(tms_id) {
      // console.log('updating tms id ' + tms_id + ' with new password: ' + this.new_password);
    if (confirm('Are you sure you want to remove this JIRA account and its projects from ETAbot? You can add it again later.')) {
        this.updating_tms = true;
        this.jiraService.delete_tms(tms_id)
        .subscribe(
          success => {
            this.updating_tms = false;
            this.error = false;
            console.log('redirecting to /tmss');
            this.router.navigate(['/projects']);
            // this.etabotAPI.get_real_projects();
          },
          error => {
            this.error_message = error;
            this.error_message = this.jiraService.parse_error(error);
            console.log(error);
            this.error = true;
            this.updating_tms = false;

          }
        );
    }
  }

  select_all_projects(select) {
    this.projects.forEach(project => {
      project.import = select;
    });
  }

  update_selected_projects(project) {
    project.import = !project.import;

    const projects_to_parse = this.projects.filter(
      project => { return project.import }).map(
        project => { return project.name });
    this.jiraService.patch_imported_projects(this.tms.id, this.tms.params, projects_to_parse)
      .subscribe(
        parse_result => {
          // for (const job of parse_result) {
          //   console.log(job)
          // }
          console.log('Patch Results: ', parse_result);
        },
        error => {
          this.error_message = error;
          this.error_message = this.jiraService.parse_error(error);
          console.log(error);
          this.error = true;
        }
      );
    console.log('Updating Selected Projects:', projects_to_parse);
  }

  applyFilter(event: Event) {
    const filter = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filter.trim().toLowerCase();
  }

  openTutorialDialog() {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.width = '50%';
      dialogConfig.height = 'auto';
      dialogConfig.panelClass = 'panel-class';

      this.dialogRef = this.dialog.open(TutorialDialogComponent, dialogConfig);

      this.dialogRef.afterClosed().subscribe(result => {
          console.log(`Tutorial Closed: ${result}`);
      });
  }
}
