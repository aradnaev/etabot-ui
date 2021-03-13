import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsWindowComponent } from './settings-window.component';

describe('SettingsWindowComponent', () => {
  let component: SettingsWindowComponent;
  let fixture: ComponentFixture<SettingsWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
