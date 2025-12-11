import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonService } from '../../../../../../services/common.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-members',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css'
})
export class MembersComponent {

  teamMembers: any;
  searchText: string = '';
  filteredData: any[] = [];
  searchAllText: string = '';
  filteredAllData: any[] = [];
  teamId: any;
  selectedMembers: any[] = [];
  individualMembers: any;
  selectedDrEmail: string[] = [];
  loading: boolean = false;
  memberId: any;
  userEmail: any;
  @ViewChild('drEmail') drEmail!: ElementRef<HTMLButtonElement>
  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>
  @ViewChild('closeModalDelete') closeModalDelete!: ElementRef;

  constructor(private service: CommonService, private router: Router, private fb: FormBuilder, private toastr: NzMessageService, private route: ActivatedRoute) { }


  ngOnInit() {
    this.teamId = this.route.snapshot.queryParamMap.get('teamId');
    this.userEmail = localStorage.getItem('teamEmail');
    this.getTeamMembers();
    // this.getAllMembers();
  }

  getTeamMembers() {
    this.service.get(`user/fetchTeamMembersByTeamId?teamId=${this.teamId}`).subscribe({
      next: (resp: any) => {
        this.teamMembers = resp.data;
        this.filterTable();
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  getAllMembers() {
    this.service.get(`user/fetchTeamMembersByTeamId?teamId=${this.teamId}&isTeamMembers=0`).subscribe({
      next: (resp: any) => {
        this.individualMembers = resp.data;
        this.filterAllTable();
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  filterTable() {
    let filtered = this.teamMembers;

    if (this.searchText.trim()) {
      const keyword = this.searchText.trim().toLowerCase();
      filtered = filtered.filter((item: { name: any; email: any; }) =>
      (item.name?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword))
      );
    }
    this.filteredData = filtered;
  }

  filterAllTable() {
    let filtered = this.individualMembers;

    if (this.searchAllText.trim()) {
      const keyword = this.searchAllText.trim().toLowerCase();
      filtered = filtered.filter((item: { name: any; email: any; }) =>
      (item.name?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword))
      );
    }
    this.filteredAllData = filtered;
  }

  // Capture checkbox selection
  toggleMember(email: string, event: any) {
    if (event.target.checked) {
      this.selectedMembers.push(email);
    } else {
      this.selectedMembers = this.selectedMembers.filter(e => e !== email);
    }
  }

  removeDrEmail(index: number) {
    this.selectedDrEmail.splice(index, 1);
  }

  addDrEmail(email: string) {
    const trimmedEmail = email.trim();

    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!trimmedEmail) {
      return;
    }

    // Check valid email
    if (!emailRegex.test(trimmedEmail)) {
      this.toastr.error('Please enter a valid email address');
      return;
    }

    //
    if (trimmedEmail === this.userEmail) {
      this.toastr.error('Your own email cannot be added.');
      return;
    }

    // Check duplicate email
    if (this.selectedDrEmail.includes(trimmedEmail)) {
      this.toastr.error('Email already added');
      return;
    }

    // Add email
    this.selectedDrEmail.push(trimmedEmail);
    this.drEmail.nativeElement.value = '';
  }

  submitForm() {

    const allEmails = [...new Set([
      ...this.selectedMembers,
      ...this.selectedDrEmail
    ])];

    if (allEmails.length === 0) {
      this.toastr.warning('Please add or select at least one member email');
      return;
    }

    this.loading = true;

    const payload = {
      team_id: this.teamId,
      members: allEmails.map(email => ({
        email: email
      }))
    };

    this.service.post('user/newAddMembersInTeams', payload).subscribe({
      next: (resp: any) => {
        this.loading = false;

        if (resp.success == true) {
          this.toastr.success(resp.message || 'Invitations sent successfully!');
          this.selectedMembers = [];
          this.selectedDrEmail = [];
          this.closeBtn.nativeElement.click();
        } else {
          this.toastr.warning(resp.message || 'Failed to send invitation!');
        }
      },
      error: (error) => {
        this.loading = false;

        const msg =
          error.error?.message ||
          error.error?.error ||
          error.message ||
          'Something went wrong!';

        this.toastr.error(msg);
      }
    });
  }

  getId(id: any) {
    this.memberId = id;
  }

  removeMem() {
    const formURlData = new URLSearchParams();
    formURlData.set('teamId', this.teamId);
    formURlData.set('user_id', this.memberId);
    this.service.post(`user/removeTeamMember`, formURlData.toString()).subscribe({
      next: (resp: any) => {
        this.closeModalDelete.nativeElement.click();
        this.toastr.success(resp.message);
        this.getTeamMembers();
      },
      error: error => {
        console.log(error.message);
      }
    });
  }


}
