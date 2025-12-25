import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-view-board',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './view-board.component.html',
  styleUrl: './view-board.component.css'
})
export class ViewBoardComponent {

  Form!: FormGroup;
  loading: boolean = false;
  boardId: any;
  teamId: any;
  minDate: any;
  @ViewChild('closeModalAdd') closeModalAdd!: ElementRef;

  constructor(private location: Location, private service: CommonService, private route: ActivatedRoute
    , private toastr: NzMessageService, private router: Router
  ) { }

  ngOnInit() {
    this.boardId = this.route.snapshot.queryParamMap.get('boardId');
    this.teamId = this.route.snapshot.queryParamMap.get('teamId');
    this.getPhaes();
    this.dateValidation();
    this.initForm();
    this.getAllMembers();
  }

  initForm() {
    const numberOnlyValidator = [
      Validators.required,
      Validators.pattern(/^\d+$/) // allows 0, 00, 01, 10
    ];

    this.Form = new FormGroup({
      title: new FormControl('', Validators.required),
      // selectedTeamId: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      priority: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      isPrivate: new FormControl(false),
      isGoalRevelant: new FormControl(false),
      memberId: new FormControl('', Validators.required),
      phaseId: new FormControl('', Validators.required),
      estimatedHours: new FormControl('', numberOnlyValidator),
      estimatedMinutes: new FormControl('', numberOnlyValidator),
      is_urgent: new FormControl(false),
    },
      {
        validators: this.dateRangeValidator as any   // <-- FIX
      }
    );
  }

  teamMembersList: any;

  getAllMembers() {
    this.service
      .get(`user/fetchTeamMembersByTeamId?teamId=${this.teamId}`)
      .subscribe({
        next: (resp: any) => {
          // keep only team members
          this.teamMembersList = (resp.data || []).filter(
            (member: any) => member.is_team_member === 1
          );
        },
        error: (error) => {
          console.log(error.message);
        },
      });
  }

  dateRangeValidator(group: FormGroup) {
    const from = group.get('startDate')?.value;
    const to = group.get('endDate')?.value;

    if (from && to && to < from) {
      return { dateInvalid: true };
    }

    return null;
  }

  dateValidation() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;
  }

  phaseList: any;

  getPhaes() {
    this.service.get(`user/fetchPhasesByThereBoardId?team_id=${this.teamId}&board_id=${this.boardId}`).subscribe({
      next: (resp: any) => {
        this.phaseList = resp.data;
        this.filterList()
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  searchText: string = '';
  filteredData: any[] = [];
  selectedPriority = '';
  sortOrder = 'desc';

  filterList() {
    this.filteredData = this.phaseList.map((phase: any) => {
      let tasks = [...phase.taskList];

      // 🔍 Search filter
      if (this.searchText.trim()) {
        const keyword = this.searchText.toLowerCase();
        tasks = tasks.filter(task =>
          task.title?.toLowerCase().includes(keyword) ||
          task.description?.toLowerCase().includes(keyword)
        );
      }

      // 🎯 Priority filter
      if (this.selectedPriority) {
        tasks = tasks.filter(
          task => task.priority === this.selectedPriority
        );
      }

      // ⏱ Sort by date
      if (this.sortOrder) {
        tasks.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return this.sortOrder === 'desc'
            ? dateB - dateA
            : dateA - dateB;
        });
      }

      return {
        ...phase,
        taskList: tasks,
        taskCount: tasks.length,
        isTaskExists: tasks.length > 0
      };
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
      formURlData.append('title', title);
      formURlData.append('description', this.Form.value.description);
      formURlData.append('team_id', this.teamId);
      formURlData.append('user_id', this.Form.value.memberId);
      formURlData.append('phase_id', this.Form.value.phaseId);
      formURlData.append('start_date', this.Form.value.startDate);
      formURlData.append('due_date', this.Form.value.endDate);
      formURlData.append('priority', this.Form.value.priority);
      formURlData.append('is_private', '0');
      formURlData.append('estimated_hours', this.Form.value.estimatedHours);
      formURlData.append('estimated_minutes', this.Form.value.estimatedMinutes);
      formURlData.append('is_urgent', this.Form.value.is_urgent ? '1' : '0');
      formURlData.append('goal_relavent', this.Form.value.isGoalRevelant ? '1' : '0');

      this.service.post('user/createTask', formURlData.toString()).subscribe({
        next: (resp: any) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.loading = false;
            this.closeModalAdd.nativeElement.click();
            this.getPhaes();
            this.reset();
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

  reset() {
    this.Form.patchValue({
      title: '',
      description: '',
      estimated_minutes: '',
      estimated_hours: '',
      phaseId: '',
      priority: '',
      startDate: '',
      endDate: '',
      isPrivate: false,
      isGoalRevelant: false,
      is_urgent: false
    });
  }

  getPriorityStyle(priority: string) {
    switch (priority) {
      case 'P1':
        return { backgroundColor: '#FEF2F2', color: '#EF4444' };
      case 'P2':
        return { backgroundColor: '#EFF6FF', color: '#3B82F6' };
      case 'P3':
        return { backgroundColor: '#FEFCE8', color: '#EAB308' };
      case 'P4':
        return { backgroundColor: '#F9FAFB', color: '#6B7280' };
      default:
        return {};
    }
  }

  get connectedDropLists(): string[] {
    return this.phaseList.map((p: any) => `phase-${p.id}`);
  }

  drop(event: CdkDragDrop<any[]>, targetPhase: any) {

    // 1️⃣ Reorder inside same phase
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      return;
    }

    const previousList = event.previousContainer.data;
    const currentList = event.container.data;

    const movedTask = previousList[event.previousIndex];

    transferArrayItem(
      previousList,
      currentList,
      event.previousIndex,
      event.currentIndex
    );

    movedTask.phase_id = targetPhase.id;

    this.updateTaskPhase(
      movedTask.id,
      targetPhase.id,
      previousList,
      currentList,
      event
    );
  }

  updateTaskPhase(
    taskId: number,
    phaseId: number,
    previousList: any[],
    currentList: any[],
    event: CdkDragDrop<any[]>
  ) {
    const formURlData = new URLSearchParams();
    formURlData.append('task_id', String(taskId));
    formURlData.append('phase_id', String(phaseId));

    this.service.post('user/changePhasesTaskByDragAndDrop', formURlData.toString())
      .subscribe({
        next: (resp: any) => {
          if (!resp.success) {
            this.rollback(event, previousList, currentList);
            this.toastr.warning(resp.message);

          } else {
            //this.toastr.success(resp.message);
            this.getPhaes();
          }
        },
        error: () => {
          this.rollback(event, previousList, currentList);
          this.toastr.error('Something went wrong');
        }
      });
  }

  rollback(
    event: CdkDragDrop<any[]>,
    previousList: any[],
    currentList: any[]
  ) {
    transferArrayItem(
      currentList,
      previousList,
      event.currentIndex,
      event.previousIndex
    );
    //this.updateTaskCounts();
  }

  openTask(task: any) {
    this.router.navigate(['/team/task-details'], {
      queryParams: { taskId: task.id, teamId: this.teamId, boardId: this.boardId }
    });
  }


  backClicked() {
    this.location.back();
  }

}
