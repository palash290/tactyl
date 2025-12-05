import { Routes } from '@angular/router';

export const routes: Routes = [
      {
            path: '',
            loadComponent: () => import('./components/core/landing-page/landing-page.component').then(m => m.LandingPageComponent)
      },
      {
            path: 'login',
            loadComponent: () => import('./components/core/log-in/log-in.component').then(m => m.LogInComponent)
      },
      {
            path: 'forgot-password',
            loadComponent: () => import('./components/core/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
            path: 'choose-login',
            loadComponent: () => import('./components/core/log-in/choose-login/choose-login.component').then(m => m.ChooseLoginComponent)
      },
      {
            path: 'choose-signup',
            loadComponent: () => import('./components/core/choose-signup/choose-signup.component').then(m => m.ChooseSignupComponent)
      },
      {
            path: 'single-signup',
            loadComponent: () => import('./components/core/choose-signup/single-signup/single-signup.component').then(m => m.SingleSignupComponent)
      },
      {
            path: 'verify-email',
            loadComponent: () => import('./components/core/choose-signup/single-signup/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
      },
      {
            path: 'team-signup',
            loadComponent: () => import('./components/core/choose-signup/team-signup/team-signup.component').then(m => m.TeamSignupComponent)
      },
      {
            path: 'create-team',
            loadComponent: () => import('./components/core/choose-signup/team-signup/create-team/create-team.component').then(m => m.CreateTeamComponent)
      },
      {
            path: 'invited-signup',
            loadComponent: () => import('./components/core/choose-signup/invited-signup/invited-signup.component').then(m => m.InvitedSignupComponent)
      },
      {
            path: 'join-team',
            loadComponent: () => import('./components/core/choose-signup/invited-signup/join-team/join-team.component').then(m => m.JoinTeamComponent)
      },
      {
            path: 'set-password',
            loadComponent: () => import('./components/core/choose-signup/invited-signup/set-password/set-password.component').then(m => m.SetPasswordComponent)
      },
      {
            path: 'complete-profile',
            loadComponent: () => import('./components/core/choose-signup/invited-signup/complete-profile/complete-profile.component').then(m => m.CompleteProfileComponent)
      },
      {
            path: 'individual',
            loadChildren: () => import('./components/individual/individual.routes').then(m => m.individualRoutes),
      },
      {
            path: 'team',
            loadChildren: () => import('./components/team/team.routes').then(m => m.teamRoutes)
      },
      // {
      //       path: 'main',
      //       loadComponent: () => import('./components/main/main.component').then(m => m.MainComponent),
      //       children: [

      //       ]
      // }
];
