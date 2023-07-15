import {google, sheets_v4} from "googleapis";
import {GoogleSheetsAuth} from "../auth/google-sheets-auth";
import {DateTimeRenderOption, Dimension, InsertDataOption, ValueInputOption, ValueRenderOption} from "../types/types";
import {
    AppendRequestConfiguration,
    ClearRequestConfiguration,
    Configuration,
    GetRequestConfiguration,
    UpdateRequestConfiguration
} from "../config/configurations";
import {responseFormatter} from "../response-formatter/response-formatter";

export class SheetsConnection {
    private sheets: sheets_v4.Sheets = google.sheets("v4");
    public readonly sheetRange?: string;
    private readonly authWrapper: any;
    private readonly spreadsheetId: string;
    private readonly sheet?: string;
    private readonly range?: string;
    private readonly valueRenderOption: ValueRenderOption;
    private readonly valueInputOption: ValueInputOption;
    private readonly insertDataOption?: InsertDataOption;
    private readonly majorDimension: Dimension;
    private readonly dateTimeRenderOption: DateTimeRenderOption;
    private readonly includeValuesInResponse: boolean;
    private readonly responseDateTimeRenderOption: DateTimeRenderOption;
    private readonly responseValueRenderOption: ValueRenderOption;
    private readonly firstRowAsHeader: boolean;

    public constructor(cfg: Configuration) {
        this.spreadsheetId = cfg.spreadsheetId;
        this.sheet = cfg.sheet ?? undefined;
        this.range = cfg.range ?? undefined;
        this.authWrapper = cfg.auth;
        this.valueRenderOption = cfg.valueRenderOption ?? ValueRenderOption.FORMATTED_VALUE;
        this.insertDataOption = cfg.insertDataOption ?? undefined;
        this.valueInputOption = cfg.valueInputOption ?? ValueInputOption.RAW;
        this.majorDimension = cfg.majorDimension ?? Dimension.ROWS;
        this.dateTimeRenderOption = cfg.dateTimeRenderOption ?? DateTimeRenderOption.FORMATTED_STRING;
        this.includeValuesInResponse = cfg.includeValuesInResponse ?? false;
        this.responseDateTimeRenderOption = cfg.responseDateTimeRenderOption ?? DateTimeRenderOption.FORMATTED_STRING;
        this.responseValueRenderOption = cfg.responseValueRenderOption ?? ValueRenderOption.FORMATTED_VALUE;
        this.firstRowAsHeader = cfg.firstRowAsHeader ?? false;

        if (this.sheet && this.range) {
            this.sheetRange = `${this.sheet}!${this.range}`;
        }

        Object.setPrototypeOf(this, SheetsConnection.prototype);
    }

    public get = async (cfg?: GetRequestConfiguration) => {
        const res = await this.sheets.spreadsheets.values.get(this.getRequestPayload(cfg));

        return (this.firstRowAsHeader || cfg?.firstRowAsHeader) ? responseFormatter(res) : res;
    };

    public append = async (data: any[], cfg?: AppendRequestConfiguration) => {
        return await this.sheets.spreadsheets.values.append(this.appendRequestPayload(data, {...cfg}));
    };

    public update = async (data: any[], cfg?: UpdateRequestConfiguration) => {
        return await this.sheets.spreadsheets.values.update(this.updateRequestPayload(data, cfg));
    };

    public clear = async (cfg?: ClearRequestConfiguration) => {
        return await this.sheets.spreadsheets.values.clear(this.clearRequestPayload(cfg));
    };

    private readonly generalPayload = (cfg?: GetRequestConfiguration|AppendRequestConfiguration|UpdateRequestConfiguration|ClearRequestConfiguration): {
        spreadsheetId: string;
        auth: GoogleSheetsAuth;
        range: string;
    } => {
        const range = this.getSheetRange(cfg);

        return {
            spreadsheetId: this.spreadsheetId,
            auth: this.authWrapper,
            range,
        }
    };

    private getRequestPayload = (cfg?: GetRequestConfiguration): object => {

        return {
            ...this.generalPayload(cfg),
            majorDimension: cfg?.majorDimension ?? this.majorDimension,
            valueRenderOption: cfg?.valueRenderOption ?? this.valueRenderOption,
            dateTimeRenderOption: cfg?.dateTimeRenderOption ?? this.dateTimeRenderOption,
        }
    }

    private appendRequestPayload = (data: any[], cfg?: AppendRequestConfiguration): object => {
        return {
            ...this.generalPayload(cfg),
            valueInputOption: cfg?.valueInputOption ?? this.valueInputOption,
            insertDataOption: cfg?.insertDataOption ?? this.insertDataOption,
            includeValuesInResponse: cfg?.includeValuesInResponse ?? this.includeValuesInResponse,
            responseDateTimeRenderOption: cfg?.responseDateTimeRenderOption ?? this.responseDateTimeRenderOption,
            responseValueRenderOption: cfg?.responseValueRenderOption ?? this.responseValueRenderOption,
            requestBody: {
                values: data
            },
        }
    }

    private updateRequestPayload = (data: any[], cfg?: UpdateRequestConfiguration): object => {
        return {
            ...this.generalPayload(cfg),
            valueInputOption: cfg?.valueInputOption ?? this.valueInputOption,
            includeValuesInResponse: cfg?.includeValuesInResponse ?? this.includeValuesInResponse,
            responseDateTimeRenderOption: cfg?.responseDateTimeRenderOption ?? this.responseDateTimeRenderOption,
            responseValueRenderOption: cfg?.responseValueRenderOption ?? this.responseValueRenderOption,
            requestBody: {
                values: data
            },
        }
    }

    private clearRequestPayload = (cfg?: ClearRequestConfiguration): object => {
        return {
            ...this.generalPayload(cfg),
        }
    }

    private readonly getSheetRange = (cfg?: GetRequestConfiguration|AppendRequestConfiguration|UpdateRequestConfiguration|ClearRequestConfiguration): string => {
        if (
            (!this.sheetRange && (!cfg?.sheet && !cfg?.range)) ||
            (!this.sheetRange && cfg?.sheet && !cfg?.range) ||
            (this.sheet && !this.range && !cfg?.sheet && !cfg?.range) ||
            (this.sheet && !this.range && cfg?.sheet && !cfg?.range) ||
            (this.sheetRange && cfg?.sheet && !cfg?.range) ||
            (!this.sheet && !this.range && !cfg?.sheet && cfg?.range) ||
            (!this.sheet && this.range && !cfg?.sheet && cfg?.range)
        ) {
            throw new Error("Specify range or sheet in method or in constructor");
        }

        if(cfg) {
            if (cfg.sheet && cfg.range) {
                return `${cfg.sheet}!${cfg.range}`;
            } else if (cfg.range) {
                return `${this.sheet}!${cfg.range}`;
            }
        }

        return this.sheetRange!;
    }
}