import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualPhasesComponent } from './individual-phases.component';

describe('IndividualPhasesComponent', () => {
  let component: IndividualPhasesComponent;
  let fixture: ComponentFixture<IndividualPhasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndividualPhasesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndividualPhasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
