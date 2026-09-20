import { bootstrapApplication } from '@angular/platform-browser';
import { Component, Injectable, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, HttpClient, HttpHeaders } from '@angular/common/http';
import { provideRouter, Router, RouterLink, RouterOutlet, Routes, ActivatedRoute } from '@angular/router';
import { CdkDrag, CdkDropList, CdkDropListGroup, DragDropModule, CdkDragDrop, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';

const API='/api';

@Injectable({providedIn:'root'})
class Api {
  http=inject(HttpClient);
  user:any=JSON.parse(localStorage.getItem('user')||'null');
  get token(){return localStorage.getItem('token')||''}
  h(){return new HttpHeaders({Authorization:`Bearer ${this.token}`})}
  login(x:any){return this.http.post<any>(`${API}/auth/login`,x)}
  projects(){return this.http.get<any[]>(`${API}/projects`,{headers:this.h()})}
  project(id:number){return this.http.get<any>(`${API}/projects/${id}`,{headers:this.h()})}
  createProject(x:any){return this.http.post(`${API}/projects`,x,{headers:this.h()})}
  tasks(id:number){return this.http.get<any[]>(`${API}/tasks/project/${id}`,{headers:this.h()})}
  createTask(id:number,x:any){return this.http.post(`${API}/tasks/project/${id}`,x,{headers:this.h()})}
  updateTask(id:number,x:any){return this.http.patch(`${API}/tasks/${id}`,x,{headers:this.h()})}
  reorder(projectId:number,changes:any[]){return this.http.post(`${API}/tasks/reorder`,{projectId,changes},{headers:this.h()})}
  analytics(id:number){return this.http.get<any>(`${API}/projects/${id}/analytics`,{headers:this.h()})}
  users(){return this.http.get<any[]>(`${API}/users`,{headers:this.h()})}
  changeRole(id:number,role:string){return this.http.patch(`${API}/users/${id}/role`,{role},{headers:this.h()})}
  comments(taskId:number){return this.http.get<any[]>(`${API}/comments/task/${taskId}`,{headers:this.h()})}
  addComment(taskId:number,body:string){return this.http.post(`${API}/comments/task/${taskId}`,{body},{headers:this.h()})}
  notifications(){return this.http.get<any[]>(`${API}/notifications`,{headers:this.h()})}
  upload(taskId:number,file:File){
    const fd=new FormData(); fd.append('file',file);
    return this.http.post(`${API}/attachments/task/${taskId}`,fd,{headers:this.h()});
  }
}

@Component({
  selector:'app-login', standalone:true, imports:[FormsModule],
  template:`<div class="auth"><form class="auth-card" (ngSubmit)="submit()"><div class="logo">PF</div><h1>ProjectFlow</h1><p>Enterprise project management workspace</p><input [(ngModel)]="form.email" name="email" placeholder="Email"><input [(ngModel)]="form.password" name="password" type="password" placeholder="Password"><button>Sign in</button><small>Demo admin: admin&#64;projectflow.dev / Admin&#64;123</small><div class="error">{{error}}</div></form></div>`
})
class Login {
  api=inject(Api); router=inject(Router); form={email:'admin@projectflow.dev',password:'Admin@123'}; error='';
  submit(){this.api.login(this.form).subscribe({next:r=>{localStorage.setItem('token',r.token);localStorage.setItem('user',JSON.stringify(r.user));this.api.user=r.user;this.router.navigateByUrl('/')},error:e=>this.error=e.error?.message||'Login failed'})}
}

@Component({
  selector:'app-dashboard', standalone:true, imports:[CommonModule,RouterLink],
  template:`<div class="page-title"><div><span class="kicker">OVERVIEW</span><h1>Portfolio dashboard</h1></div><a *ngIf="canManage" class="primary" routerLink="/projects">New project</a></div>
  <div class="metric-grid"><div class="metric"><span>Total projects</span><b>{{projects.length}}</b></div><div class="metric"><span>Active</span><b>{{active}}</b></div><div class="metric"><span>Completed</span><b>{{done}}</b></div><div class="metric"><span>Your role</span><b class="role">{{api.user?.role}}</b></div></div>
  <div class="panel"><h2>Recent projects</h2><a class="project-row" *ngFor="let p of projects" [routerLink]="['/project',p.id]"><div><strong>{{p.name}}</strong><small>{{p.description||'No description'}}</small></div><div><span class="pill">{{p.status}}</span><small>{{p._count?.tasks||0}} tasks</small></div></a></div>`
})
class Dashboard {
 api=inject(Api); projects:any[]=[]; active=0;done=0;
 get canManage(){return ['ADMIN','MANAGER'].includes(this.api.user?.role)}
 ngOnInit(){this.api.projects().subscribe(x=>{this.projects=x;this.active=x.filter(p=>p.status==='ACTIVE').length;this.done=x.filter(p=>p.status==='COMPLETED').length})}
}

@Component({
 selector:'app-projects',standalone:true,imports:[CommonModule,FormsModule,RouterLink],
 template:`<div class="page-title"><div><span class="kicker">WORKSPACE</span><h1>Projects</h1></div></div>
 <form *ngIf="canManage" class="panel inline-form" (ngSubmit)="create()"><input [(ngModel)]="form.name" name="name" placeholder="Project name" required><input [(ngModel)]="form.description" name="description" placeholder="Description"><select [(ngModel)]="form.status" name="status"><option>PLANNING</option><option>ACTIVE</option><option>ON_HOLD</option><option>COMPLETED</option></select><button class="primary">Create</button></form>
 <div class="cards"><a class="project-card" *ngFor="let p of projects" [routerLink]="['/project',p.id]"><div><span class="pill">{{p.status}}</span><h3>{{p.name}}</h3><p>{{p.description||'No description'}}</p></div><footer><span>{{p._count?.tasks||0}} tasks</span><span>{{p.members?.length||0}} members</span></footer></a></div>`
})
class Projects {
 api=inject(Api);projects:any[]=[];form:any={name:'',description:'',status:'PLANNING'};
 get canManage(){return ['ADMIN','MANAGER'].includes(this.api.user?.role)}
 ngOnInit(){this.load()} load(){this.api.projects().subscribe(x=>this.projects=x)}
 create(){this.api.createProject(this.form).subscribe(()=>{this.form={name:'',description:'',status:'PLANNING'};this.load()})}
}

@Component({
 selector:'app-project',standalone:true,imports:[CommonModule,FormsModule,DragDropModule],
 template:`<ng-container *ngIf="project">
 <div class="page-title"><div><span class="kicker">PROJECT</span><h1>{{project.name}}</h1><p>{{project.description}}</p></div><span class="pill">{{project.status}}</span></div>
 <div class="tabs"><button [class.active]="tab==='board'" (click)="tab='board'">Kanban</button><button [class.active]="tab==='analytics'" (click)="tab='analytics';loadAnalytics()">Analytics</button></div>

 <section *ngIf="tab==='board'">
  <form *ngIf="canManage" class="panel inline-form" (ngSubmit)="createTask()"><input [(ngModel)]="newTask.title" name="title" placeholder="New task title" required><select [(ngModel)]="newTask.priority" name="priority"><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select><button class="primary">Add task</button></form>
  <div class="board" cdkDropListGroup>
   <div class="column" *ngFor="let col of columns">
    <div class="column-head"><strong>{{col.label}}</strong><span>{{col.items.length}}</span></div>
    <div class="dropzone" cdkDropList [cdkDropListData]="col.items" (cdkDropListDropped)="drop($event,col.status)">
     <article class="task" *ngFor="let t of col.items" cdkDrag (click)="openTask(t)">
      <span class="priority" [attr.data-p]="t.priority">{{t.priority}}</span><h4>{{t.title}}</h4>
      <p>{{t.description||'No description'}}</p><footer><span>{{t.assignee?.name||'Unassigned'}}</span><span>💬 {{t._count?.comments||0}} · 📎 {{t._count?.attachments||0}}</span></footer>
     </article>
    </div>
   </div>
  </div>
 </section>

 <section *ngIf="tab==='analytics' && stats" class="analytics">
   <div class="metric-grid"><div class="metric"><span>Total tasks</span><b>{{stats.total}}</b></div><div class="metric"><span>Completion</span><b>{{stats.completion}}%</b></div><div class="metric"><span>Overdue</span><b>{{stats.overdue}}</b></div><div class="metric"><span>In progress</span><b>{{stats.byStatus.IN_PROGRESS}}</b></div></div>
   <div class="panel"><h2>Status breakdown</h2><div class="bar-row" *ngFor="let s of statusKeys"><span>{{s}}</span><div class="bar"><i [style.width.%]="pct(stats.byStatus[s])"></i></div><b>{{stats.byStatus[s]}}</b></div></div>
 </section>

 <div class="modal-backdrop" *ngIf="selected" (click)="selected=null"><div class="modal" (click)="$event.stopPropagation()"><button class="close" (click)="selected=null">×</button><span class="priority">{{selected.priority}}</span><h2>{{selected.title}}</h2><p>{{selected.description||'No description'}}</p>
 <div class="upload"><input type="file" (change)="pickFile($event)"><button (click)="upload()" [disabled]="!file">Upload attachment</button></div>
 <h3>Comments</h3><div class="comments"><div *ngFor="let c of comments"><b>{{c.user.name}}</b><span>{{c.body}}</span></div></div>
 <form class="comment-form" (ngSubmit)="comment()"><input [(ngModel)]="commentText" name="comment" placeholder="Write a comment"><button>Send</button></form></div></div>
 </ng-container>`
})
class Project {
 api=inject(Api);route=inject(ActivatedRoute);id=0;project:any;tasks:any[]=[];tab='board';stats:any;selected:any;comments:any[]=[];commentText='';file?:File;
 newTask:any={title:'',priority:'MEDIUM'};
 columns:any[]=[{status:'TODO',label:'To do',items:[]},{status:'IN_PROGRESS',label:'In progress',items:[]},{status:'REVIEW',label:'Review',items:[]},{status:'DONE',label:'Done',items:[]}];
 statusKeys=['TODO','IN_PROGRESS','REVIEW','DONE'];
 get canManage(){return ['ADMIN','MANAGER'].includes(this.api.user?.role)}
 ngOnInit(){this.id=Number(this.route.snapshot.paramMap.get('id'));this.api.project(this.id).subscribe(x=>this.project=x);this.loadTasks()}
 loadTasks(){this.api.tasks(this.id).subscribe(x=>{this.tasks=x;for(const c of this.columns)c.items=x.filter(t=>t.status===c.status)})}
 createTask(){this.api.createTask(this.id,this.newTask).subscribe(()=>{this.newTask={title:'',priority:'MEDIUM'};this.loadTasks()})}
 drop(e:CdkDragDrop<any[]>,status:string){if(e.previousContainer===e.container)moveItemInArray(e.container.data,e.previousIndex,e.currentIndex);else transferArrayItem(e.previousContainer.data,e.container.data,e.previousIndex,e.currentIndex); const changes:any[]=[];for(const c of this.columns)c.items.forEach((t:any,i:number)=>changes.push({id:t.id,status:c.status,position:i}));this.api.reorder(this.id,changes).subscribe()}
 loadAnalytics(){this.api.analytics(this.id).subscribe(x=>this.stats=x)}
 pct(n:number){return this.stats?.total?Math.round(n/this.stats.total*100):0}
 openTask(t:any){this.selected=t;this.api.comments(t.id).subscribe(x=>this.comments=x)}
 comment(){if(!this.commentText.trim())return;this.api.addComment(this.selected.id,this.commentText).subscribe(()=>{this.commentText='';this.openTask(this.selected)})}
 pickFile(e:any){this.file=e.target.files?.[0]}
 upload(){if(this.file)this.api.upload(this.selected.id,this.file).subscribe(()=>{this.file=undefined;this.loadTasks()})}
}

@Component({
 selector:'app-admin',standalone:true,imports:[CommonModule,FormsModule],
 template:`<div class="page-title"><div><span class="kicker">ADMINISTRATION</span><h1>User roles</h1></div></div><div class="panel"><div class="user-row" *ngFor="let u of users"><div><b>{{u.name}}</b><small>{{u.email}}</small></div><select [(ngModel)]="u.role" (change)="save(u)"><option>ADMIN</option><option>MANAGER</option><option>DEVELOPER</option></select></div></div>`
})
class Admin {
 api=inject(Api);users:any[]=[];ngOnInit(){this.api.users().subscribe(x=>this.users=x)}save(u:any){this.api.changeRole(u.id,u.role).subscribe()}
}

@Component({
 selector:'app-root',standalone:true,imports:[CommonModule,RouterOutlet,RouterLink],
 template:`<ng-container *ngIf="isLogin;else shell"><router-outlet/></ng-container><ng-template #shell><aside><div class="brand"><span>PF</span><b>ProjectFlow</b></div><nav><a routerLink="/">Overview</a><a routerLink="/projects">Projects</a><a *ngIf="api.user?.role==='ADMIN'" routerLink="/admin">Admin</a></nav><div class="profile"><div>{{initial}}</div><span><b>{{api.user?.name}}</b><small>{{api.user?.role}}</small></span><button (click)="logout()">↗</button></div></aside><main><router-outlet/></main></ng-template>`
})
class App {
 api=inject(Api);router=inject(Router);
 get isLogin(){return this.router.url==='/login'}
 get initial(){return (this.api.user?.name||'U')[0]}
 logout(){localStorage.clear();this.api.user=null;this.router.navigateByUrl('/login')}
}

const routes:Routes=[
 {path:'login',component:Login},
 {path:'',component:Dashboard},
 {path:'projects',component:Projects},
 {path:'project/:id',component:Project},
 {path:'admin',component:Admin},
 {path:'**',redirectTo:''}
];

bootstrapApplication(App,{providers:[provideHttpClient(),provideRouter(routes)]}).catch(console.error);
