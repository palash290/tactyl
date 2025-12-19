import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonService } from '../../../services/common.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-my-task',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './my-task.component.html',
  styleUrl: './my-task.component.css'
})
export class MyTaskComponent {

  Form!: FormGroup;
  loading: boolean = false;
  minDate: any;
  phaseList: any;
  boardTasks: any;
  taskId: any;
  userId: any;
  userType: any;
  @ViewChild('closeModalAdd') closeModalAdd!: ElementRef;

  constructor(private service: CommonService, private toastr: NzMessageService, private router: Router) { }

  ngOnInit() {
    this.userType = localStorage.getItem('userType');
    this.userId = localStorage.getItem('userId');
    this.initForm();
    this.dateValidation();
    this.getPhaes();
    this.getTasks();
  }

  initForm() {
    this.Form = new FormGroup({
      title: new FormControl('', Validators.required),
      // selectedTeamId: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      priority: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      isPrivate: new FormControl(false),
      isGoalRevelant: new FormControl(false),
      // memberId: new FormControl('', Validators.required),
      phaseId: new FormControl('', Validators.required),
    },
      {
        validators: this.dateRangeValidator as any   // <-- FIX
      }
    );
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


  dateRangeValidator(group: FormGroup) {
    const from = group.get('startDate')?.value;
    const to = group.get('endDate')?.value;

    if (from && to && to < from) {
      return { dateInvalid: true };
    }

    return null;
  }


  getPhaes() {
    this.service.get(`user/fetchIndividualUserPhasesByUserId`).subscribe({
      next: (resp: any) => {
        this.phaseList = resp.data;
        // this.filterTable();
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  getTasks() {
    this.service.get(`user/fetchIndividualUserPhasesWithTaskByUserId`).subscribe({
      next: (resp: any) => {
        this.boardTasks = resp.data;
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
    this.filteredData = this.boardTasks.map((phase: any) => {
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


  dateValidation() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Ensure two-digit month
    const day = today.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    this.minDate = `${year}-${month}-${day}`; // Format as YYYY-MM-DD
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
      formURlData.append('team_id', '0');
      formURlData.append('user_id', this.userId);
      formURlData.append('phase_id', this.Form.value.phaseId);
      formURlData.append('start_date', this.Form.value.startDate);
      formURlData.append('due_date', this.Form.value.endDate);
      formURlData.append('priority', this.Form.value.priority);
      // formURlData.append('is_private', this.Form.value.isPrivate ? '1' : '0');
      formURlData.append('is_private', '0');
      formURlData.append('goal_relavent', this.Form.value.isGoalRevelant ? '1' : '0');

      this.service.post(this.taskId ? `user/editTaskById?id=${this.taskId}` : 'user/createTask', formURlData.toString()).subscribe({
        next: (resp: any) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.loading = false;
            this.closeModalAdd.nativeElement.click();
            this.getTasks();
            this.taskId = null;
            this.reset();
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
            this.getTasks();
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
    this.taskId = '';
    this.Form.patchValue({
      title: '',
      description: '',
      phaseId: '',
      priority: '',
      startDate: '',
      endDate: '',
      isPrivate: '',
      isGoalRevelant: '',
    });
  }

  get connectedDropLists(): string[] {
    return this.boardTasks.map((p: any) => `phase-${p.id}`);
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
            this.getTasks();
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
    this.router.navigate(['/individual/task-details'], {
      queryParams: { taskId: task.id }
    });
  }


}
