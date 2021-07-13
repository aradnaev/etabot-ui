import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SettingsWindowComponent } from '../settings-window/settings-window.component';
import { ReportComponent } from '../report/report.component';
import { EtabotApiService } from '../../services/etabot-api.service';
import { Project } from '../../project';
import { Job } from '../../job';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css']
})
export class ProjectCardComponent implements OnInit {
  @Input() project: any;
  @Input() tms: any;
  @Input() tms_service: any;
  @Input() api_service: any;
  @Input() show_report_on_init: any;
  @Output() project_update_needed: EventEmitter<any> = new EventEmitter();
  project_obj: Project;
  update_eta_tooltip: string;
  project_jobs_ids = [];
  update_button_disabled = true;
  projectUpdated: EventEmitter<any>;
  update_active_sprints: true;
  update_future_sprints: true;
  update_backlog: false;
  push_updates_to_tms: true;
  update_velocity: false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private etabotAPI: EtabotApiService
    ) {
      console.log('constructor update_backlog=' + this.update_backlog);
  }

  ngOnInit() {
    this.update_active_sprints = true;
    this.update_future_sprints = true;
    this.update_backlog = false;
    this.push_updates_to_tms = true;
    this.update_velocity = false;


    console.log('initing Project Card with project: ');
    console.log(this.project);
    console.log('tms:');
    console.log(this.tms);
    console.log('ngOnInit update_backlog=' + this.update_backlog);
    this.project_obj = new Project(this.project);
    this.try_enable_update_button();
    console.log('show_report_on_init: ' + this.show_report_on_init);
    if (this.show_report_on_init.has(this.project_obj.name)) {
        console.log('need to show report');
        this.show_report();
    }
  }


  openSettings(tms, project): void {
    const dialogRef = this.dialog.open(SettingsWindowComponent, {
      width: '800px',
      height: '500px',
      data: {
        tms: tms,
        project: project,
        tms_service: this.tms_service,
        api_service: this.etabotAPI
      }
    });
  }


  try_enable_update_button() {
    console.log('try_enable_update_button');
    this.update_button_disabled = false; // enable button regardless of individual velocity availability.
    // if (this.project_obj.velocity_available) {
    //     this.update_eta_tooltip = 'Submit job to update ETAs';
    //     this.update_button_disabled = false;
    // } else {
    //     this.update_eta_tooltip = 'Need to accumulate velocity data before making ETA predictions.';
    //     this.update_button_disabled = true;
    // }
  }

  estimate(project) {
      project['eta_in_progress'] = true;
      this.project.include_active_sprints = this.update_active_sprints;
      this.project.include_future_sprints = this.update_future_sprints;
      this.project.include_backlog = this.update_backlog;
      this.project.push_updates_to_tms = this.push_updates_to_tms;
      this.project.update_velocity = this.update_velocity;
      this.etabotAPI.estimate(project).subscribe(
                jobs => {
                    console.log('estimate job submission successful');
                    console.log(jobs);
                    for (const job of jobs) {
                        this.project_jobs_ids.push(job.get_id());
                        job.callback = () => {
                            console.log('project callback called for job ' + job.get_id());

                            const index = this.project_jobs_ids.indexOf(job.get_id(), 0);
                            if (index > -1) {
                               this.project_jobs_ids.splice(index, 1);
                            }
                            if (this.project_jobs_ids.length === 0) {
                                project['eta_in_progress'] = false;
                                project['result_message'] = 'Done!';
                                console.log('emitting project_update_needed');
                                this.try_enable_update_button();
                                this.project_update_needed.emit(this.project_obj.name);
                            }
                        };
                    }
                    project['error_message'] = null;
                    project['last_updated'] = Date.now();
                    project['result_message'] = 'ETAs update started!';
                    this.update_button_disabled = true;
                    this.update_eta_tooltip = 'Updating ETAs is already in progress. Wait for completion, or change the options.';
                },
                error => {
                    console.log('estimate job submission error' + error);
                    project['error_message'] = error;
                    this.try_enable_update_button();
                    project['result_message'] = 'Error occured: ' + error;
                }
            );
  }

  get_connectivity_status() {
    // console.log('parsing "' + this.tms.connectivity_status + "'");
    // console.log(typeof(this.tms.connectivity_status));
    // console.log('"'+this.tms.connectivity_status+'"')
    // const cs = JSON.parse(this.tms.connectivity_status);
    // console.log(cs)
    return this.tms.connectivity_status;
  }

  show_report(): void {
    this.download_report();
      // console.log('navigating to report with project_id = ' + this.project.project_id);
     // this.router.navigate(['./report', this.project_obj.project_id]);
     // todo: pass this.project_obj.get_html_report() to html_report

    // console.log('showing report in dialog window');
    // const dialogRef = this.dialog.open(
    //     ReportComponent,
    //         {
    //           width: '800px',
    //           height: '500px',
    //           data: {
    //               'html_report': this.project_obj.get_html_report()
    //           }
    //         });
  }
  download_report() {
    const report = this.project_obj.get_html_report();
    const file = new Blob([report], {type: '.html'});
    console.log('Report: \n', report);
    console.log('File: \n', file);

    const a = document.createElement('a'),
      url = URL.createObjectURL(file)

    let filename = 'Report';
    
    console.log('169: ', this.project_obj.get_report_date());
    if (this.project_obj.get_report_date()) {
      const reportDate = this.project_obj.get_report_date();
      const date = formatTimeUTC(`${reportDate.split(".")[0]} UTC`);
    
      filename = `${filename}_${date}`;
    }
    
    a.href = url;
    a.download = filename + '.html';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

function formatTimeUTC(dateTime) {
  const dateTimeSplit = dateTime.split(" ");
  const convertedDateTime = `${dateTimeSplit[0]}T${dateTimeSplit[1]}.000000Z`;

  const date = new Date(convertedDateTime)
  const hours = date.getHours() < 10 ? '0'+date.getHours() : date.getHours();
  const minutes = date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes();
  const seconds = date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds();
  const time = `${hours}-${minutes}-${seconds}`;

  const dateLeadingZeros = date.toLocaleDateString().split('/').map(num => {
    return parseInt(num) < 10 ? '0'+num : num;
  });

  const dateTimeFormatted = `${dateLeadingZeros.join('-')}_${time}_TZ${UTCOffset()}`;

  return dateTimeFormatted;
}

function UTCOffset() {
  const now = new Date();

  const offsetMinutes = now.getTimezoneOffset();
  const offsetHours = offsetMinutes * (100/60);

  const offsetHoursLeadingZero = Math.abs(offsetHours) < 1000 ? '0' + offsetHours : offsetHours
  const offsetFormatted = offsetHours <= 0 ? '+' + String(offsetHoursLeadingZero) : '-' + String(offsetHoursLeadingZero);
  
  return offsetFormatted;
}
