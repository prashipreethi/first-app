import {Component, OnInit} from '@angular/core';
import {User} from "./models/user";
import {UserService} from "./services/user.service";
import { debounceTime } from 'rxjs/operators';
import {Subject} from "rxjs";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'Github Data!!!';


    cache = {
        users: [],
        selectedUser: [],
    };

    users: User[] = [];
    search: Subject<string> = new Subject<string>();
    selectedUser: User = new User();
    loadingRepos: boolean = false;
    userDetailsFlag: boolean = true;
    public page: number = 1;
    public size: number = 100;
    public totalCount: number = 5000;
    public since: number;

    constructor(private userService: UserService) {

        this.search.pipe(debounceTime(200)).subscribe((searchTerm) => {

            // call to user service and search by query

            this.userService.search(searchTerm).subscribe(res => {

                this.users = res.items as User[];
            });
        })
    }

    ngOnInit() {
        this.listUser();
    }

    listUser(){
        this.since = (this.page-1) * 100;
      this.userService.getUsers(this.page - 1, this.size,this.since).subscribe(res => {
        this.userDetailsFlag = true;

          this.cache.users = res; // store cached for next time.

          this.users = res;
      }, error => {

          console.log(error); // for development only.
      });
    }

    changePages(page) {
		this.page = page;
		this.listUser();
	}

    /**
     * On user typing key to search.
     */
    onSearch(q: string) {

        if (q !== "") {
            this.search.next(q);
        } else {
            //if empty search box we restore first users
            this.users = this.cache.users;
        }

    }

    viewUser(user: User) {
      this.userDetailsFlag = false;

        this.selectedUser = user;

        let userInCache: User = this.findUserInCache(user);
        // let find if existing in cache we return and no longer call to api again
        if (userInCache) {
            this.selectedUser = userInCache;
        } else {
            // get Repos of this user
            this.loadingRepos = true;

            this.userService.getUserRepos(user.login).subscribe(res => {
                this.selectedUser.Repos = res as User[];

                this.cacheSelectUser(this.selectedUser);

                this.loadingRepos = false;

            }, err => {
                console.log(err);
                this.loadingRepos = false;
            });

        }


    }

    back(){
      this.listUser();
    }

    /**
     * we storage selected user and dont again to api. just simply function for now.
     * */

    cacheSelectUser(user: User) {
        if (!this.findUserInCache(user)) {
            this.cache.selectedUser.push(user);
        }

    }

    /**
     * Find user if exist in cache we return user object
     * @param user
     * @returns {boolean}
     */
    findUserInCache(user: User): User {

        for (var i = 0; i < this.cache.selectedUser.length; i++) {
            if (this.cache.selectedUser[i].login == user.login) {
                return this.cache.selectedUser[i];
            }
        }

        return null;
    }
}