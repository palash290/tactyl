import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CurrentPlan {
  user_plan_id?: number;
  plan_id?: number;
  user_id?: number;
  start_time?: string;
  end_time?: string;
  purchased_price?: string;
  purchased_at?: string;
  plan_name?: string;
  plan_description?: string;
  plan_price?: string;
  number_of_days?: number;
  plan_points?: any[];
  is_active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PlanService {
  private planSubject = new BehaviorSubject<CurrentPlan | null>(this.readPlan());
  plan$ = this.planSubject.asObservable();

  private lastPlanSubject = new BehaviorSubject<CurrentPlan | null>(this.readLastPlan());
  lastPlan$ = this.lastPlanSubject.asObservable();

  private freeTrialSubject = new BehaviorSubject<string | null>(this.readFreeTrial());
  freeTrial$ = this.freeTrialSubject.asObservable();

  get currentPlan(): CurrentPlan | null {
    return this.planSubject.value;
  }

  get lastPlan(): CurrentPlan | null {
    return this.lastPlanSubject.value;
  }

  get freeTrialStatus(): string | null {
    return this.freeTrialSubject.value;
  }

  setCurrentPlan(plan: CurrentPlan | null): void {
    if (plan) {
      localStorage.setItem('current_plan', JSON.stringify(plan));
    } else {
      localStorage.setItem('current_plan', 'null');
    }
    this.planSubject.next(plan);
  }

  setLastPlan(plan: CurrentPlan | null): void {
    if (plan) {
      localStorage.setItem('last_plan', JSON.stringify(plan));
    } else {
      localStorage.setItem('last_plan', 'null');
    }
    this.lastPlanSubject.next(plan);
  }

  setFreeTrialStatus(status: string | null): void {
    if (status === null || status === undefined || status === '') {
      localStorage.removeItem('free_trial');
      this.freeTrialSubject.next(null);
      return;
    }
    localStorage.setItem('free_trial', status);
    this.freeTrialSubject.next(status);
  }

  refreshFromStorage(): void {
    this.planSubject.next(this.readPlan());
    this.lastPlanSubject.next(this.readLastPlan());
    this.freeTrialSubject.next(this.readFreeTrial());
  }

  hasPlan(): boolean {
    return !!this.currentPlan;
  }

  isBronze(): boolean {
    return this.currentPlan?.plan_name === 'Bronze';
  }

  isGold(): boolean {
    return this.currentPlan?.plan_name === 'Gold';
  }

  isTrial(): boolean {
    return this.currentPlan?.plan_name === 'Free Trial' || this.currentPlan?.plan_id === 1;
  }

  isPlanActive(): boolean {
    const plan = this.currentPlan;
    if (!plan) return false;
    if (plan.is_active === false) return false;
    return true;
  }

  isTrialExpired(): boolean {
    if (!this.isTrial()) return false;
    if (!this.isPlanActive()) return true;
    if (this.freeTrialStatus === 'Inactivated') return true;
    const endTime = this.currentPlan?.end_time;
    if (!endTime) return false;
    return Date.now() > Date.parse(endTime);
  }

  isTrialActive(): boolean {
    if (!this.isTrial()) return false;
    if (!this.isPlanActive()) return false;
    if (this.freeTrialStatus === 'Inactivated') return false;
    const startTime = this.currentPlan?.start_time;
    const endTime = this.currentPlan?.end_time;
    const now = Date.now();
    if (startTime && now < Date.parse(startTime)) return false;
    if (endTime && now > Date.parse(endTime)) return false;
    return true;
  }

  hasGoldAccess(): boolean {
    if (this.currentPlan) {
      return this.isGold() || this.isTrialActive();
    }
    const lastPlan = this.lastPlan?.plan_name;
    return lastPlan === 'Gold' || lastPlan === 'Free Trial';
  }

  hasActiveGoldAccess(): boolean {
    if (!this.currentPlan) return false;
    if (this.isTrialActive()) return true;
    return this.isGold() && this.isPlanActive();
  }

  hasTeamAccess(): boolean {
    return this.hasGoldAccess();
  }

  hasIndividualAccess(): boolean {
    if (this.currentPlan) {
      return this.hasGoldAccess() || this.isBronze();
    }
    const lastPlan = this.lastPlan?.plan_name;
    return lastPlan === 'Bronze' || lastPlan === 'Gold' || lastPlan === 'Free Trial';
  }

  needsGoldUpgrade(): boolean {
    return !this.hasActiveGoldAccess();
  }

  private readPlan(): CurrentPlan | null {
    const raw = localStorage.getItem('current_plan');
    if (!raw || raw === 'null' || raw === 'undefined') return null;
    try {
      return JSON.parse(raw) as CurrentPlan;
    } catch {
      return null;
    }
  }

  private readLastPlan(): CurrentPlan | null {
    const raw = localStorage.getItem('last_plan');
    if (!raw || raw === 'null' || raw === 'undefined') return null;
    try {
      return JSON.parse(raw) as CurrentPlan;
    } catch {
      return null;
    }
  }

  private readFreeTrial(): string | null {
    const raw = localStorage.getItem('free_trial');
    if (!raw) return null;
    return raw;
  }
}
