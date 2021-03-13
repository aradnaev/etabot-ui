import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import { EscapeHtmlPipe } from './components/pipe_html';
import { HttpModule, XSRFStrategy, CookieXSRFStrategy} from '@angular/http';

import { AppComponent } from './app.component';
import { UsersViewComponent } from './components/users-view/users-view.component';
import { IntroductionComponent } from './components/introduction/introduction.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
// import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { routing } from './routes/app.routing';

import { AuthGuard} from './auth_guard/auth.guard';
import { AuthService } from './services/auth-service.service';
import { EtabotApiService } from './services/etabot-api.service';
import { SignUpService } from './services/sign-up.service';
import { JiraService } from './services/jira.service';
import {MatIconModule} from '@angular/material/icon';
// import { materialExportModule } from './material-scheme/app.materialExportModule';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FlexLayoutModule } from '@angular/flex-layout';

import {
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatGridListModule,
    MatCardModule,
    MatExpansionModule,
    MatTabsModule,
    MatTooltipModule,
    MatMenuModule,
    MatRadioModule,
    MatProgressBarModule
} from '@angular/material';

    // MatProgressBarModule,
    // MatProgressBar
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { VerificationPendingComponent } from './components/register-page/verification-view/verification-pending/verification-pending.component';
import { VerificationActivateComponent } from './components/register-page/verification-view/verification-activate/verification-activate.component';
import { TermsConditionsFullComponent } from './components/register-page/terms-conditions-full/terms-conditions-full.component';
import { JiraCredentialsComponent } from './components/jira-credentials/jira-credentials.component';
import { ProjectsViewComponent } from './components/users-view/projects-view/projects-view.component';
import { NeedSignUpTokenComponent } from './components/need-sign-up-token/need-sign-up-token.component';
import { JiraIssueCollectorComponent } from './components/jira-issue-collector/jira-issue-collector.component';
import { TmsListComponent } from './components/tms-list/tms-list.component';
import { TmsCardComponent } from './components/tms-card/tms-card.component';
import { SettingsWindowComponent } from './components/settings-window/settings-window.component';
import { ProjectCardComponent } from './components/project-card/project-card.component';
import { AttentionIconComponent } from './components/attention-icon/attention-icon.component';
import { ProjectComponent } from './components/project/project.component';
import { ErrorBoxComponent } from './components/error-box/error-box.component';
import { TmsConnectComponent } from './components/tms-connect/tms-connect.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { TosppComponent } from './components/tospp/tospp.component';
import { JobsMonitorComponent } from './components/jobs-monitor/jobs-monitor.component';
import { JobCardComponent } from './components/jobs-monitor/job-card/job-card.component';
import { ReportComponent } from './components/report/report.component';
    // MatProgressBarModule,
@NgModule({
  declarations: [
    AppComponent,
    UsersViewComponent,
    IntroductionComponent,
    PageNotFoundComponent,
    HeaderComponent,
    RegisterPageComponent,
    TermsConditionsFullComponent,
    JiraCredentialsComponent,
    ProjectsViewComponent,
    VerificationPendingComponent,
    VerificationActivateComponent,
    NeedSignUpTokenComponent,
    JiraIssueCollectorComponent,
    TmsListComponent,
    TmsCardComponent,
    SettingsWindowComponent,
    ProjectCardComponent,
    AttentionIconComponent,
    ProjectComponent,
    ErrorBoxComponent,
    TmsConnectComponent,
    ErrorPageComponent,
    TosppComponent,
    JobsMonitorComponent,
    JobCardComponent,
    ReportComponent,
    // EscapeHtmlPipe
  ],
  entryComponents: [
    TermsConditionsFullComponent,
    SettingsWindowComponent,
    ReportComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    routing,

    BrowserAnimationsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatGridListModule,
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatTabsModule,
    MatTooltipModule,
    MatIconModule,
    MatProgressBarModule,
    MatMenuModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule
  ],
  exports: [
    RouterModule,

    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatProgressSpinnerModule

    ],
  providers: [EtabotApiService, AuthService, SignUpService, AuthGuard, JiraService,
       {
            provide: XSRFStrategy,
            useValue: new CookieXSRFStrategy('csrftoken', 'X-CSRFToken')
       }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
    // constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    //     matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('/assets/baseline-error_outline-24px.svg'));
    // }
}

