import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OverviewComponent } from './overview/overview.component';
import { BoardComponent } from './board/board.component';
import { MembersComponent } from './settings/members/members.component';
import { PermissionsComponent } from './settings/permissions/permissions.component';
import { PhasesComponent } from './settings/phases/phases.component';
import { CommonService } from '../../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
@Component({
  selector: 'app-team-overview',
  imports: [CommonModule, FormsModule, OverviewComponent, BoardComponent, MembersComponent, PermissionsComponent,
    PhasesComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './team-overview.component.html',
  styleUrl: './team-overview.component.css'
})
export class TeamOverviewComponent {

  Form!: FormGroup;
  teamName: any;
  teamId: any;
  loading: boolean = false;
  userEmail: any;
  userType: any;
  activeMainTab: 'overview' | 'board' | 'settings' = 'overview';
  activeSettingsTab: 'users' | 'permissions' | 'phases' = 'users';

  @ViewChild('closeModalDelete') closeModalDelete!: ElementRef;
  @ViewChild('closeModalAdd') closeModalAdd!: ElementRef;

  constructor(private location: Location, private service: CommonService, private route: ActivatedRoute, private router: Router, private toastr: NzMessageService) { }

  ngOnInit() {
    this.userType = localStorage.getItem('userType');
    this.teamId = this.route.snapshot.queryParamMap.get('teamId');
    this.route.queryParams.subscribe(params => {
      this.teamName = params['teamName'];
    });

    this.initForm();
  }

  initForm() {
    this.Form = new FormGroup({
      name: new FormControl(this.teamName, Validators.required),
    });
  }

  onSubmit() {
    this.Form.markAllAsTouched();

    const first_name = this.Form.value.name?.trim();

    if (!first_name) {
      return;
    }

    if (this.Form.valid) {
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.append('teamId', this.teamId);
      formURlData.append('team_name', this.Form.value.name);

      this.service.post('user/editTeamByTeamId', formURlData.toString()).subscribe({
        next: (resp: any) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.loading = false;
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { teamName: this.Form.value.name },
              queryParamsHandling: 'merge',
              replaceUrl: true
            });
            this.closeModalAdd.nativeElement.click();
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
          }
        },
        error: (error) => {
          this.toastr.warning('Something went wrong.');
          console.log(error.message);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      this.toastr.warning('Please check all the fields!');
    }
  }


  backClicked() {
    this.location.back();
  }

  deleteTeam() {
    this.service.get(`user/deleteTeamByTeamId?teamId=${this.teamId}`).subscribe({
      next: (resp: any) => {
        this.router.navigateByUrl('/team/teams');
        this.closeModalDelete.nativeElement.click();
        this.toastr.success(resp.message);
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  set(){
    this.activeMainTab = 'settings';
    this.activeSettingsTab = 'users';
  }

}
