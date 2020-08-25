import { map } from "rxjs/operators";
import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {User} from "../models/user";
import {ApiService} from "./api.service";


@Injectable()
export class UserService {

    constructor(private api: ApiService) {

    }

    getUsers(page,size,since): Observable<User[]> {

        let endPoint = '/users?page='+page+'&per_page='+size+'&since='+since;

        return this.api.get(endPoint).pipe(map(res => res.json() as User[]));
    }

    search(q: string): Observable<any> {
        let endPoint = '/search/users?q=' + q;
        return this.api.get(endPoint).pipe(map(res => res.json()));

    }

    getUserRepos(user: string): Observable<any> {

        let endPoint = '/users/' + user + '/repos';
        return this.api.get(endPoint).pipe(map(res => res.json()));
    }

}