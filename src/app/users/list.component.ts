import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    users?: any[];

    constructor(
      private accountService: AccountService,
      private alertService: AlertService
    ) { }

    ngOnInit() {
        this.accountService.getAll()
            .pipe(first())
            .subscribe(users => this.users = users);
    }

  deleteUser(_id: string) {
      const user = this.users!.find(x => x._id === _id);
      user.isDeleting = true;
      this.accountService.delete(_id)
        .pipe(first())
        .subscribe({
          next: () => {
            this.users = this.users!.filter(x => x._id !== _id);
            this.alertService.success('User Deleted Successfully!');
          },
          error: error => {
            this.alertService.error(error);
          }
        })
    }

}
