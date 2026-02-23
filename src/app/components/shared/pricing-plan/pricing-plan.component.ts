import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pricing-plan',
  imports: [CommonModule],
  templateUrl: './pricing-plan.component.html',
  styleUrl: './pricing-plan.component.css'
})
export class PricingPlanComponent {

  userPackage: any = 'Silver';

  loading: boolean = false;

  constructor(private service: CommonService, private router: Router) { }

  ngOnInit() {
    this.getPlans();
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
