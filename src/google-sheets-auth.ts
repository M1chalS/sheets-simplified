import { AuthPlus } from "googleapis/build/src/googleapis";

export class GoogleSheetsAuth extends AuthPlus {
    constructor(
        private email: string,
        private key: string
    ) {
        super();

        Object.setPrototypeOf(this, GoogleSheetsAuth.prototype);
    }

    public login = () => {
        return new this.JWT({
            email: this.email,
            key: this.key,
            scopes: [ "https://www.googleapis.com/auth/spreadsheets" ]
        });
    };

}