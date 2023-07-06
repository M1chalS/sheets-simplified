import { google, sheets_v4 } from "googleapis";

export class SheetsConnection {
    private sheets: sheets_v4.Sheets = google.sheets("v4");
    public readonly sheetRange: string;
    public readonly startingSheetIndex:number = 1;

    constructor(private authWrapper: any,
                private spreadsheetId: string,
                private sheet: string,
                private range: string) {

        const sheet_index = range.split(":")[0].slice(1);
        this.startingSheetIndex = parseInt(sheet_index);
        this.sheetRange = sheet + `!${ range }`;

        Object.setPrototypeOf(this, SheetsConnection.prototype);
    }

    public get = async (range?: string[]) => {
        if(!range || range.length < 1) {
            return await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                auth: this.authWrapper,
                range: this.sheetRange,
            });
        }

        const rangeHelper = this.range!.split(":");
        let range1: string;

        if (range && range[0] && range[1]) {
            range1 = this.sheet + "!" + rangeHelper[0].charAt(0) + range[0] + ":" + rangeHelper[1] + range[1];
        } else if(range && range[0] && !range[1]) {
            range1 = this.sheet + "!" + rangeHelper[0].charAt(0) + range[0] + ":" + rangeHelper[1] + range[0];
        } else {
            throw new Error("Invalid range");
        }

        return await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            auth: this.authWrapper,
            range: range1,
        });
    };

    public getCount = async () => {

        let range_letter: string = this.sheetRange.split("!")[1].split(":")[0].charAt(0);


        let data = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            auth: this.authWrapper,
            range: this.sheetRange,
        });

        if(!data || !data.data.values) {
            return 0;
            // range_letter = String.fromCharCode(range_letter.charCodeAt(0) + 1);
        }

        return (data.data.values?.length)+this.startingSheetIndex-1;

    };

    public post = async (values: any[], index?: number) => {
        if (index) {
            return this.update(values, index);
        }

        console.log("Creating...");
        return await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            auth: this.authWrapper,
            range: this.sheetRange,
            valueInputOption: "RAW",
            requestBody: {
                values
            }
        });
    };

    public refresh = async (values: any[]) => {
        console.log("Deleting old data");
        await this.sheets.spreadsheets.values.clear({
            spreadsheetId: this.spreadsheetId,
            auth: this.authWrapper,
            range: this.sheetRange
        });

        console.log("Posting fresh data");
        for (const row of values) {
            const index = row.pop();
            await this.post([ row ], index);
        }
        console.log('Data updated.');
    };

    public update = async (values: any[], index: number) => {
        console.log("Updating...");
        const rangeHelper = this.range!.split(":");
        const range = this.sheet+"!"+rangeHelper[0].charAt(0) + index + ":" + rangeHelper[1] + index;

        await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            auth: this.authWrapper,
            range: range,
            valueInputOption: "RAW",
            requestBody: {
                values
            }
        });
        console.log("Data updated.");
    };

    public delete = async (index: number) => {
        console.log("Deleting...");
        const rangeHelper = this.range!.split(":");
        const range = this.sheet+"!"+rangeHelper[0].charAt(0) + index + ":" + rangeHelper[1] + index;

        await this.sheets.spreadsheets.values.clear({
            spreadsheetId: this.spreadsheetId,
            auth: this.authWrapper,
            range: range,
        });
        console.log("Deleted.");
    };
}