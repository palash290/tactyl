import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subject } from 'rxjs';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-phases',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule, DragDropModule],
  templateUrl: './phases.component.html',
  styleUrl: './phases.component.css'
})
export class PhasesComponent {

  Form!: FormGroup;
  boardList: any;
  phaseList: any;
  loading: boolean = false;
  teamId: any;
  filteredData: any[] = [];
  searchText: string = '';
  p: any = 1;
  selectedPhaseId: any = '';
  phaseId: any;
  //userType: any;
  is_admin: any;
  @ViewChild('closeModalDelete') closeModalDelete!: ElementRef;
  @ViewChild('closeModalAdd') closeModalAdd!: ElementRef;

  constructor(private service: CommonService, private toastr: NzMessageService, private route: ActivatedRoute) { }

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.teamId = this.route.snapshot.queryParamMap.get('teamId');
    this.is_admin = this.route.snapshot.queryParamMap.get('is_admin');
    //this.userType = localStorage.getItem('userType');
    this.initForm();
    this.getPhaes();
    this.getBoards();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm() {
    this.Form = new FormGroup({
      title: new FormControl('', Validators.required),
      boardId: new FormControl('', Validators.required),
      description: new FormControl(''),
    });
  }

  fetchBoardDetails(item: any) {
    this.phaseId = item.id;
    this.Form.patchValue({
      title: item.phase_name,
      description: item.description || '',
      boardId: item.board_id
    });
  }

  reset() {
    this.phaseId = '';
    this.Form.patchValue({
      title: '',
      description: '',
      boardId: ''
    });
  }

  getPhaes() {
    this.service.get(`user/phases?team_id=${this.teamId}`).subscribe({
      next: (resp: any) => {
        this.phaseList = resp.data;
        this.filterTable();
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  filterTable() {
    this.p = 1;
    let filtered = this.phaseList;

    if (this.searchText.trim()) {
      const keyword = this.searchText.trim().toLowerCase();
      filtered = filtered.filter((item: { phase_name: any; }) =>
        (item.phase_name?.toLowerCase().includes(keyword))
      );
    }
    this.filteredData = filtered;
  }

  getBoards() {
    this.service.get(`user/boards?team_id=${this.teamId}`).subscribe({
      next: (resp: any) => {
        this.boardList = resp.data;
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  onSubmit() {
    this.Form.markAllAsTouched();

    const title = this.Form.value.title?.trim();

    if (!title) {
      return;
    }

    if (this.Form.valid) {
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.append('phase_name', title);
      formURlData.append('phase_description', this.Form.value.description);
      formURlData.append('board_id', this.Form.value.boardId);
      // formURlData.append('team_id', this.teamId);

      this.service.post(this.phaseId ? `user/phases/${this.phaseId}` : 'user/phases', formURlData.toString()).subscribe({
        next: (resp: any) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.loading = false;
            this.closeModalAdd.nativeElement.click();
            this.getPhaes();
            this.phaseId = null;
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
            this.getPhaes();
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

  id: any;
  isTaskExists: boolean = false;
  reassignPhasedList: any;

  // getId(id: any) {
  //   this.id = id;
  // }

  getId(item: any) {
    this.id = item.phase_id;
    this.isTaskExists = item.total_tasks > 0 ? true : false;

    this.service.get(`user/fetchPhaseByTeamId?team_id=${this.teamId}`).subscribe({
      next: (resp: any) => {

        this.reassignPhasedList = resp.data.filter(
          (board: any) => board.phase_id !== this.id
        );

        this.filterTable();
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  deleteTeam() {
    if (!this.selectedPhaseId && this.isTaskExists) {
      this.toastr.warning('Please select phase first.');
      return
    }

    const formURlData = new URLSearchParams();
    formURlData.append('assign_phase_id', this.selectedPhaseId);

    this.service.post(`user/delete-phases?id=${this.id}`, formURlData.toString()).subscribe({
      next: (resp: any) => {
        this.closeModalDelete.nativeElement.click();
        this.toastr.success(resp.message);
        this.getPhaes();
      },
      error: error => {
        console.log(error.message);
      }
    });
  }


  drop(event: CdkDragDrop<any[]>) {
    if (event.previousIndex === event.currentIndex) return;

    // Reorder array
    moveItemInArray(
      this.filteredData,
      event.previousIndex,
      event.currentIndex
    );

    // Call API with updated sequence
    this.updatePhasePosition();
  }

  updatePhasePosition() {
    this.loading = true;

    const payload = {
      phases: this.filteredData.map((item, index) => ({
        phase_id: item.id,
        sequence: index + 1
      }))
    };

    this.service.post(
      'user/updatePhaseSequence',
      payload
    ).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.toastr.success(resp.message);
        } else {
          this.toastr.warning(resp.message);
          this.getPhaes();
        }
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Something went wrong');
        console.error(err);
        this.loading = false;
        this.getPhaes();
      }
    });
  }


}
