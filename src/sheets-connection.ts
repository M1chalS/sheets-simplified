import {google, sheets_v4} from "googleapis";
import {GoogleSheetsAuth} from "./google-sheets-auth";
import {DateTimeRenderOption, Dimension, InsertDataOption, ValueInputOption, ValueRenderOption} from "./types";

interface GetRequestConfiguration {
    range?: string;
    majorDimension?: Dimension;
    valueRenderOption?: ValueRenderOption;
    dateTimeRenderOption?: DateTimeRenderOption;
}

interface AppendRequestConfiguration {
    // range?: string;
    valueInputOption?: ValueInputOption;
    insertDataOption?: InsertDataOption;
    includeValuesInResponse?: boolean;
    responseDateTimeRenderOption?: DateTimeRenderOption;
    responseValueRenderOption?: ValueRenderOption;
}

interface UpdateRequestConfiguration {
    range: string;
    valueInputOption?: ValueInputOption;
    includeValuesInResponse?: boolean;
    responseDateTimeRenderOption?: DateTimeRenderOption;
    responseValueRenderOption?: ValueRenderOption;
}

interface ClearRequestConfiguration {
    range: string;
}

interface Configuration {
    auth: GoogleSheetsAuth;
    spreadsheetId: string;
    sheet: string;
    range?: string;
    valueRenderOption?: ValueRenderOption;
    valueInputOption?: ValueInputOption;
    insertDataOption?: InsertDataOption;
    majorDimension?: Dimension;
    dateTimeRenderOption?: DateTimeRenderOption;
    includeValuesInResponse?: boolean;
    responseDateTimeRenderOption?: DateTimeRenderOption;
    responseValueRenderOption?: ValueRenderOption;
}

export class SheetsConnection {
    private sheets: sheets_v4.Sheets = google.sheets("v4");
    public readonly sheetRange: string | null = null;
    public readonly startingSheetIndex: number | null = null;
    private readonly authWrapper: GoogleSheetsAuth;
    private readonly spreadsheetId: string;
    private readonly sheet: string;
    private readonly range: string | null;
    private readonly valueRenderOption: ValueRenderOption;
    private readonly valueInputOption: ValueInputOption;
    private readonly insertDataOption?: InsertDataOption;
    private readonly majorDimension: Dimension;
    private readonly dateTimeRenderOption: DateTimeRenderOption;
    private readonly includeValuesInResponse: boolean;
    private readonly responseDateTimeRenderOption: DateTimeRenderOption;
    private readonly responseValueRenderOption: ValueRenderOption;

    public constructor(cfg: Configuration) {
        this.spreadsheetId = cfg.spreadsheetId;
        this.sheet = cfg.sheet;
        this.range = cfg.range ?? null;
        this.authWrapper = cfg.auth;
        this.valueRenderOption = cfg.valueRenderOption ?? ValueRenderOption.FORMATTED_VALUE;
        this.insertDataOption = cfg.insertDataOption ?? undefined;
        this.valueInputOption = cfg.valueInputOption ?? ValueInputOption.RAW;
        this.majorDimension = cfg.majorDimension ?? Dimension.ROWS;
        this.dateTimeRenderOption = cfg.dateTimeRenderOption ?? DateTimeRenderOption.FORMATTED_STRING;
        this.includeValuesInResponse = cfg.includeValuesInResponse ?? false;
        this.responseDateTimeRenderOption = cfg.responseDateTimeRenderOption ?? DateTimeRenderOption.FORMATTED_STRING;
        this.responseValueRenderOption = cfg.responseValueRenderOption ?? ValueRenderOption.FORMATTED_VALUE;

        if (this.range && this.range.split(":").length > 1) {
            const sheet_index = this.range.split(":")[0].slice(1);
            this.startingSheetIndex = parseInt(sheet_index);
            this.sheetRange = this.sheet + `!${this.range}`;
        }

        Object.setPrototypeOf(this, SheetsConnection.prototype);
    }

    public get = async (cfg?: GetRequestConfiguration) => {
        if (!cfg?.range) {
            if (!this.sheetRange) {
                throw new Error("Specify range in this method or in constructor");
            }

            return await this.sheets.spreadsheets.values.get(this.getRequestPayload({
                range: this.sheetRange,
                ...cfg
            }));
        }

        return await this.sheets.spreadsheets.values.get(this.getRequestPayload({
            ...cfg
        }));
    };

    public append = async (data: any[], cfg?: AppendRequestConfiguration) => {
        return await this.sheets.spreadsheets.values.append(this.appendRequestPayload(data,{
            ...cfg
        }));
    };

    public update = async (data: any[], cfg: UpdateRequestConfiguration) => {
        return await this.sheets.spreadsheets.values.update(this.updateRequestPayload(data,{
            ...cfg
        }));
    };

    public clear = async (cfg: ClearRequestConfiguration) => {
        return await this.sheets.spreadsheets.values.clear(this.clearRequestPayload(cfg));
    };

    private readonly generalPayload = () => ({
        spreadsheetId: this.spreadsheetId,
        auth: this.authWrapper,
    });

    private getRequestPayload = (cfg: GetRequestConfiguration): object => {
        return {
            ...this.generalPayload(),
            majorDimension: cfg.majorDimension ?? this.majorDimension,
            valueRenderOption: cfg.valueRenderOption ?? this.valueRenderOption,
            dateTimeRenderOption: cfg.dateTimeRenderOption ?? this.dateTimeRenderOption,
            ...cfg
        }
    }

    private appendRequestPayload = (data: any[], cfg: AppendRequestConfiguration): object => {
        return {
            ...this.generalPayload(),
            valueInputOption: cfg.valueInputOption ?? this.valueInputOption,
            insertDataOption: cfg.insertDataOption ?? this.insertDataOption,
            includeValuesInResponse: cfg.includeValuesInResponse ?? this.includeValuesInResponse,
            responseDateTimeRenderOption: cfg.responseDateTimeRenderOption ?? this.responseDateTimeRenderOption,
            responseValueRenderOption: cfg.responseValueRenderOption ?? this.responseValueRenderOption,
            range: this.sheetRange,
            requestBody: {
                values: data
            },
            ...cfg
        }
    }

    private updateRequestPayload = (data: any[], cfg: UpdateRequestConfiguration): object => {
        return {
            ...this.generalPayload(),
            valueInputOption: cfg.valueInputOption ?? this.valueInputOption,
            includeValuesInResponse: cfg.includeValuesInResponse ?? this.includeValuesInResponse,
            responseDateTimeRenderOption: cfg.responseDateTimeRenderOption ?? this.responseDateTimeRenderOption,
            responseValueRenderOption: cfg.responseValueRenderOption ?? this.responseValueRenderOption,
            requestBody: {
                values: data
            },
            ...cfg
        }
    }

    private clearRequestPayload = (cfg: ClearRequestConfiguration): object => {
        return {
            ...this.generalPayload(),
            ...cfg
        }
    }
}