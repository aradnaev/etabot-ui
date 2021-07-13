import { Injectable, Output, EventEmitter } from '@angular/core';

import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { map } from 'rxjs/operators';
// import {Observable} from 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { AuthService } from './auth-service.service';
import { Job } from '../job';
import { JobStatus } from '../job';
import { JobsServiceService } from './jobs-service.service';
import { copyStyles } from '@angular/animations/browser/src/util';

@Injectable()
export class EtabotApiService {

  public loginCheck = false;
  private token: string;
  @Output() projects: EventEmitter<any> = new EventEmitter();
  @Output() projectsReceived: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private http: Http,
    private jobs_service: JobsServiceService,
    private authService: AuthService) {
    // depending on the environment (e.g. production or local) api end point could be different
    // this.service_api_end_point = environment.apiUrl;

  authService.getLoggedIn.subscribe(
    response => this.logInChange(response));
  }

  logInChange(response) {
    this.loginCheck = true;
    console.log('logInChange response: ' + response);
    console.log('authService.token: ' + this.authService.token);
  }


  get_real_projects() {

    return this.http.get(environment.apiUrl + 'projects/', this.authService.construct_options())
      .subscribe((response: Response) => {
        if (response.status === 200) {
          console.log('get_real_projects response: ');
          console.log(response);
          const res = response.json();
          Object.entries(res).forEach(
            ([key, value]) => {
              console.log(key);
              console.log(value);
            }
          );
        // Object.entries(res).forEach(
        //     ([key, value]) => {
        //         // value['velocities'] = value['velocities']['mean'];
        //         console.log(typeof(value['velocities']) + value['velocities']);
        //         console.log(typeof(value['work_hours']) + value['work_hours']);
        //         // console.log(key + typeof(JSON.parse(value['velocities'].replace("'","\""))));
        //     });
          console.log(
              'get_real_projects 200 response status: '
              + response.status
              + 'json type: '
              + typeof(res)
              + 'json: '
              + JSON.stringify(res));
          // console.log(res['scope_field_name_message']);
          // console.log(res['scope_field_name_message']['scope_field_name']);
          this.projects.emit(res);
          this.projectsReceived.emit(true);
          return true;
        } else {
          console.log('get_real_projects non-200 response status ' + response.status);
          return false;
        }
    });
  }

  deleteProject(projectID) {
    const url = environment.apiUrl + 'projects/' + projectID +'/';

    return this.http.delete(
      url,
      this.authService.construct_options()
    )
    .pipe(
      map((response: Response) => {
        console.log("Delete Project Response: ", response);
        return response.status;
      })
    )
  }

  /*
  Takes in an object with the following parameters
    { subject, body, to, from }
    if to is not included the default is hello@etabot.ai
    if from is not included the default is 
  */
  userCommunication(params) {
    console.log('etabot api service userCommunication started');
    const url = environment.apiUrl + 'user_communication/';
    console.log(`User Communication Params ${params}`);

    const json_params = JSON.stringify(params);
    console.log(`User Communication JSON Params ${json_params}`);

    return this.http.post(
      url,
      json_params,
      this.authService.construct_options()
    )
    .pipe(
      map((response: Response) => {
        console.log('Response: ' + response);
        return response.status;
      })
    );
  }

  estimate(project) {
    let url = environment.apiUrl + 'estimate/';
    if (project.project_tms != null) {
        url = url + '?tms=' + project.project_tms;
        if (project.id != null) {
            url = url + '&project_id=' + project.id;
        }
    }
    console.log('url: ' + url);
    const json_params = JSON.stringify(
        {params:
            {
                include_active_sprints: project.include_active_sprints,
                include_future_sprints: project.include_future_sprints,
                include_backlog: project.include_backlog,
                push_updates_to_tms: project.push_updates_to_tms,
                update_velocity: project.update_velocity
            }
        });
    const job_scope = [];
    if (project.include_active_sprints) {
        job_scope.push('active sprints');
    }
    if (project.include_future_sprints) {
        job_scope.push('future sprints');
    }
    if (project.include_backlog) {
        job_scope.push('backlog');
    }
    console.log('json_params: ' + json_params);
    const api_call = url + json_params;
    return this.http.post(
        url,
        json_params,
        this.authService.construct_options()).pipe(
            map((response: Response) => {
              console.log('Response: ' + response);
              project['eta_in_progress'] = true;

            const response_json = response.json();
            // console.log('parse_projects response: ' + res + 'type = ' + typeof(res));
            // console.log(res);
            // const response_json = JSON.parse(res);
            console.log(response_json);
            // const celery_task_ids = response_json['celery_task_ids'];
            // console.log(celery_task_ids);
            const jobs = [];
            for (const tms_id in response_json) {
                const celery_task_id = response_json[tms_id];
                console.log('celery_task_id ' + celery_task_id);
                const new_job = new Job(
                    celery_task_id,
                    'updating ETAs for ' + project.name,
                    JobStatus.in_progress,
                    api_call,
                    {
                        'tms_id': tms_id,
                        'project_id': project.id,
                        'details': 'tasks in: ' + job_scope.join(', '),
                    });
                this.jobs_service.add_job(new_job);
                jobs.push(new_job);
            }

              if (String(response.status) === '201') {
                  console.log('estimate get returns 201');
              } else {
                console.log('estimate get returns not 201');
              }
              return jobs;
      }));
  }

}

