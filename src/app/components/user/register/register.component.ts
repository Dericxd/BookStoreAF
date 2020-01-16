import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private router: Router, private authService: AuthService, private storege: AngularFireStorage) { }

  @ViewChild('imageUser') inputImageUser: ElementRef;
  public email: string = '';
  public pass: string = '';

  uploadPercent: Observable<number>;
  urlImage: Observable<string>;

  ngOnInit() {
  }

  onUpload(e) {
    // console.log('subir', e.target.files[0]);
    const id = Math.random().toString(36).substring(2);
    const file = e.target.files[0];
    const filePath = `uploads/profile_${id}`;
    const ref = this.storege.ref(filePath); //ruta de la imagen
    const task = this.storege.upload(filePath, file); //tarea, es donde se sube la imagen
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize (() => this.urlImage = ref.getDownloadURL())
      ).subscribe();
  }

  onAddUser() {
    this.authService.registerUser(this.email,  this.pass).
      then( (res) => {
        this.authService.isAuth().subscribe(user => {
          if (user) {
            user.updateProfile({
              displayName: '',
              photoURL: this.inputImageUser.nativeElement.value
            }).then( function () {
              console.log('User Update!!', res);
            }).catch( function (error) {
              console.log('error', error);
            });
          }
        });
        // this.router.navigate(['admin/list-books']);
    }).catch(err => console.log('err', err.message));
  }

  onLoginGoogle(): void {
    this.authService.loginGoogleUser().
    then( (res) => {
      // console.log('resUser', res);
      this.onLoginRedirect();
    }).catch( err => console.log('err', err.massage) );
  }

  onLoginFacebook(): void {
    this.authService.loginFacebookUser().
    then((res) => {
      // console.log('resUser', res);
      this.onLoginRedirect();
    }).catch(err => console.log('err', err.massage));
  }

  onLoginTwitter(): void {
    this.authService.loginTwitterUser()
      .then((res) => {
        // console.log('resUser', res);
        this.onLoginRedirect();
      }).catch(err => console.log('err', err.message));
  }

  onLoginRedirect(): void {
    this.router.navigate(['admin/list-books']); // todo: verificar esto
  }

}
