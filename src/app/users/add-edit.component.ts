import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    _id?: string;
    title!: string;
    loading = false;
    submitting = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this._id = this.route.snapshot.params['_id'];

        // form with validation rules
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            email: ['', Validators.required],
            // password only required in add mode
            password: ['', [Validators.minLength(6), ...(!this._id ? [Validators.required] : [])]]
        });

        this.title = 'Add User';
        if (this._id) {
            // edit mode
            this.title = 'Edit User';
            this.loading = true;
            this.accountService.getById(this._id)
              .pipe(first())
              .subscribe({
                next: (x) => {
                    this.form.patchValue(x);
                    this.loading = false;
                },
                error: error => {
                  this.alertService.error(error)
                }
              })
        }
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.submitting = true;
        this.saveUser()
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Operation Successfully!', { keepAfterRouteChange: true });
                    this.router.navigateByUrl('/users');
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            })
    }

    private saveUser() {
        // create or update user based on id param
        return this._id
            ? this.accountService.update(this._id!, this.form.value)
            : this.accountService.register(this.form.value);
    }
}
