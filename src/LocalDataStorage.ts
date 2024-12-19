import { LoginApiResponse } from './api/interfaces';
import { ProfileApiResponse } from './api/interfaces';
import { PatientPagedListModel } from './api/interfaces';
import {Patient} from './api/interfaces';

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

    public get patientPagedListModel(): PatientPagedListModel {
        if (window.localStorage.getItem('patientPagedListModel') === null) {
            return {} as PatientPagedListModel;
        }
        return JSON.parse(window.localStorage.getItem('patientPagedListModel')!);
    }

    public set patientPagedListModel(value: PatientPagedListModel) {
        window.localStorage.setItem('patientPagedListModel', JSON.stringify(value));
    }
}

class PaginationData {
    //TODO
}

class PatientsData {
    private localDataStorage: LocalDataStorage;

    constructor() {
        this.localDataStorage = new LocalDataStorage();
    }

    public get patients(): Patient[] {
        if ( this.localDataStorage.patientPagedListModel.patients !== undefined ) {
            return this.localDataStorage.patientPagedListModel.patients;
        }
        return [];
    }

    public set patients(value: Patient[]) {
        this.localDataStorage.patientPagedListModel = { ...this.localDataStorage.patientPagedListModel, 'patients': value }
    }

    public getPatient(id: string): Patient {
        const result = this.localDataStorage.patientPagedListModel.patients.find(x => x.id === id);
        if ( result !== undefined ) {
            return result;
        }
        return {} as Patient;
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
        if (this.localDataStorage.profile.name !== undefined) {
            return this.localDataStorage.profile.name;
        }
        return "";
    }
    public set name(value: string) {
        this.localDataStorage.profile = { ...this.localDataStorage.profile, 'name': value }
    }

    public get birthday(): string {
        if (this.localDataStorage.profile.birthday !== undefined) {
            return this.localDataStorage.profile.birthday;
        }
        return "";
    }
    public set birthday(value: string) {
        this.localDataStorage.profile = { ...this.localDataStorage.profile, 'birthday': value }
    }

    public get gender(): string {
        if (this.localDataStorage.profile.gender !== undefined) {
            return this.localDataStorage.profile.gender;
        }
        return "";
    }
    public set gender(value: string) {
        this.localDataStorage.profile = { ...this.localDataStorage.profile, 'gender': value }
    }

    public get email(): string {
        if (this.localDataStorage.profile.email !== undefined) {
            return this.localDataStorage.profile.email;
        }
        return "";
    }
    public set email(value: string) {
        this.localDataStorage.profile = { ...this.localDataStorage.profile, 'email': value }
    }

    public get phone(): string {
        if (this.localDataStorage.profile.phone !== undefined) {
            return this.localDataStorage.profile.phone;
        }
        return "";
    }
    public set phone(value: string) {
        this.localDataStorage.profile = { ...this.localDataStorage.profile, 'phone': value }
    }
}

export { LocalDataStorage, AuthData, ProfileData, PatientsData };
export type { LoginApiResponse, ProfileApiResponse };