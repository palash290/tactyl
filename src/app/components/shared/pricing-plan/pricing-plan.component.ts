import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '../../../services/plan.service';

@Component({
  selector: 'app-pricing-plan',
  imports: [CommonModule],
  templateUrl: './pricing-plan.component.html',
  styleUrl: './pricing-plan.component.css'
})
export class PricingPlanComponent {

  userPackage: any = 'Silver';
  user_id: any;
  loading: boolean = false;

  constructor(
    private service: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public planService: PlanService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.user_id = params['user_id'];
    });
    this.getPlans();
  }

  goBack(): void {
    window.history.back();
  }

  hasRestrictedView(): boolean {
    return !this.planService.currentPlan && !!this.planService.lastPlan?.plan_name;
  }

  isTrialExpiredView(): boolean {
    return !this.planService.currentPlan && this.planService.lastPlan?.plan_name === 'Free Trial';
  }

  showBackButton(): boolean {
    return this.isTrialExpiredView();
  }

  get visiblePlanCount(): number {
    let count = 0;
    if (this.canViewBronze()) count++;
    if (this.canViewGold()) count++;
    return count;
  }

  canViewBronze(): boolean {
    if (!this.hasRestrictedView()) return true;
    const lastPlan = this.planService.lastPlan?.plan_name;
    return lastPlan === 'Bronze' || lastPlan === 'Free Trial';
  }

  canViewGold(): boolean {
    if (!this.hasRestrictedView()) return true;
    const lastPlan = this.planService.lastPlan?.plan_name;
    return lastPlan === 'Gold' || lastPlan === 'Free Trial';
  }

  continueWithoutPlan(): void {
    const lastPlan = this.planService.lastPlan?.plan_name;
    if (lastPlan === 'Bronze') {
      this.router.navigateByUrl('/individual/dashboard');
      return;
    }
    if (lastPlan === 'Gold' || lastPlan === 'Free Trial') {
      this.router.navigateByUrl('/team/dashboard');
      return;
    }
    this.router.navigate(['/pricing-plan'], {
      queryParams: { user_id: this.user_id }
    });
  }

  getPlans() {
    this.service.get('public/plans').subscribe({
      next: (resp: any) => {

      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  purchasePlan(planId: any) {
    this.loading = true;
    const formURlData = new URLSearchParams();
    formURlData.set('plan_id', planId);
    this.service.post('user/purchase-subscription-stripe', formURlData.toString()).subscribe({
      next: (resp: any) => {
        this.loading = false;
        if (resp.success && resp.data?.payment_url) {
          // 🔹 Redirect to Stripe checkout
          window.location.href = resp.data.payment_url;
        }
      },
      error: (error) => {
        this.loading = false;
        console.log(error.message);
      }
    });
  }

  activateTrial(planId: any) {
    this.loading = true;
    const formURlData = new URLSearchParams();
    formURlData.set('plan_id', planId);
    this.service.post('user/purchase-subscription', formURlData.toString()).subscribe({
      next: (resp: any) => {
        this.loading = false;
        this.router.navigateByUrl('/team/dashboard');
      },
      error: (error) => {
        this.loading = false;
        console.log(error.message);
      }
    });
  }

}
