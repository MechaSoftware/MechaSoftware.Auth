export class NewUserReturn {
    status: number = 0;
    statusText: string = "";
    success: boolean = false;
    data: string;

    constructor(_success: boolean, _status: number, _statusText: string, _data: string = "") {
        this.status = _status,
        this.success = _success,
        this.statusText = _statusText,
        this.data = _data
    }
}