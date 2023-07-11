import {AuthPlus} from "googleapis/build/src/googleapis";

export class GoogleSheetsAuth extends AuthPlus {
    private readonly email: string;
    private readonly key: string;

    constructor(cfg: {
        email: string;
        key: string;
    }) {
        super();
        this.email = cfg.email;
        this.key = cfg.key;

        Object.setPrototypeOf(this, GoogleSheetsAuth.prototype);
    }

    public login = () => {
        return new this.JWT({
            email: this.email,
            key: this.key,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"]
        });
    };

}