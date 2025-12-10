import { Routes } from '@angular/router';

export const individualRoutes: Routes = [
      {
            path: '',
            loadComponent: () =>
                  import('./individual-main/individual-main.component').then(m => m.IndividualMainComponent),
            children: [
                  {
                        path: 'dashboard',
                        loadComponent: () =>
                              import('./individual-dashboard/individual-dashboard.component').then(m => m.IndividualDashboardComponent),
                  },
                  {
                        path: 'change-password',
                        loadComponent: () =>
                              import('../shared/change-password/change-password.component').then(m => m.ChangePasswordComponent),
                  },
                  {
                        path: 'edit-profile',
                        loadComponent: () =>
                              import('../shared/edit-profile/edit-profile.component').then(m => m.EditProfileComponent),
                  },
                  {
                        path: 'my-task',
                        loadComponent: () =>
                              import('./my-task/my-task.component').then(m => m.MyTaskComponent),
                  },
                  {
                        path: 'task-details',
                        loadComponent: () =>
                              import('./my-task/task-details/task-details.component').then(m => m.TaskDetailsComponent),
                  },
                  {
                        path: 'my-performance',
                        loadComponent: () =>
                              import('./my-performance/my-performance.component').then(m => m.MyPerformanceComponent),
                  },
                  {
                        path: 'tactyl-compass',
                        loadComponent: () =>
                              import('../team/tactyl-compass/tactyl-compass.component').then(m => m.TactylCompassComponent),
                  },
                  {
                        path: 'boards',
                        loadComponent: () =>
                              import('../team/boards/boards.component').then(m => m.BoardsComponent),
                  },
                  {
                        path: 'view-board',
                        loadComponent: () =>
                              import('../team/boards/view-board/view-board.component').then(m => m.ViewBoardComponent),
                  },
                  {
                        path: 'notes',
                        loadComponent: () =>
                              import('../team/notes/notes.component').then(m => m.NotesComponent),
                  },
                  {
                        path: 'view-notes',
                        loadComponent: () =>
                              import('../team/notes/view-notes/view-notes.component').then(m => m.ViewNotesComponent),
                  },
                  {
                        path: 'notifications',
                        loadComponent: () =>
                              import('../shared/notifications/notifications.component').then(m => m.NotificationsComponent),
                  },
                    {
                        path: 'team-requests',
                        loadComponent: () =>
                              import('../individual/team-requests/team-requests.component').then(m => m.TeamRequestsComponent),
                  },
            ],
      },
];