import { LoginApiResponse } from './api/interfaces';
import { ProfileApiResponse } from './api/interfaces';

class LocalDataStorage {
    public get data(): LoginApiResponse {
        if (window.localStorage.getItem('data') === null) {
            return {} as LoginApiResponse;
        }
        return JSON.parse(window.localStorage.getItem('data')!);
    }

    public set data(value: LoginApiResponse) {
        window.localStorage.setItem('data', JSON.stringify(value));
    }

    public get profile(): ProfileApiResponse {
        if (window.localStorage.getItem('profile') === null) {
            return {} as ProfileApiResponse;
        }
        return JSON.parse(window.localStorage.getItem('profile')!);
    }

    public set profile(value: ProfileApiResponse) {
        window.localStorage.setItem('profile', JSON.stringify(value));
    }
}

class AuthData {
    private localDataStorage: LocalDataStorage;

    constructor() {
        this.localDataStorage = new LocalDataStorage();
    }
    public get token(): string {
        if (this.localDataStorage.data.token !== undefined) {
            return this.localDataStorage.data.token;
        }
        return "";
    }

    public set token(value: string) {
        this.localDataStorage.data = { ...this.localDataStorage.data, 'token': value }
    }

    public IsLoggedIn() {
        return (this.token !== "")
    }
}

class ProfileData {
    private localDataStorage: LocalDataStorage;

    constructor() {
        this.localDataStorage = new LocalDataStorage();
    }

    public get name(): string {
        if (this.localDataStorage.profile.fullName !== undefined) {
            return this.localDataStorage.profile.fullName;
        }
        return "";
    }
    public set name(value: string) {
        this.localDataStorage.profile = { ...this.localDataStorage.profile, 'fullName': value }
    }

    public get birthday(): string {
        if (this.localDataStorage.profile.birthDate !== undefined) {
            return this.localDataStorage.profile.birthDate;
        }
        return "";
    }
    public set birthday(value: string) {
        this.localDataStorage.profile = { ...this.localDataStorage.profile, 'birthDate': value }
    }

//     public get email(): string {
//         if (this.localDataStorage.profile.email !== undefined) {
//             return this.localDataStorage.profile.email;
//         }
//         return "";
//     }
//     public set email(value: string) {
//         this.localDataStorage.profile = { ...this.localDataStorage.profile, 'email': value }
//     }

}

export { LocalDataStorage, AuthData, ProfileData };
export type { LoginApiResponse, ProfileApiResponse };