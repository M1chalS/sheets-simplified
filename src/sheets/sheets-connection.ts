import {google, sheets_v4} from "googleapis";
import {GoogleSheetsAuth} from "../auth/google-sheets-auth";
import {DateTimeRenderOption, Dimension, InsertDataOption, ValueInputOption, ValueRenderOption} from "../types/types";
import {
    AppendRequestConfiguration,
    ClearRequestConfiguration,
    Configuration,
    CreateNamedRangeConfiguration,
    CreateSheetConfiguration,
    DeleteNamedRangeConfiguration,
    DeleteSheetConfiguration,
    GetRequestConfiguration,
    UpdateRequestConfiguration
} from "../config/configurations";
import {responseFormatter} from "../response-formatter/response-formatter";

export class SheetsConnection {
    private sheets: sheets_v4.Sheets = google.sheets("v4");
    private sheet?: string;
    private sheetRange?: string;
    private readonly authWrapper: any;
    private readonly spreadsheetId: string;
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
    private readonly allowSheetNameModifications: boolean;

    public getSheetName() : string | undefined {
        return this.sheet;
    }

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
        this.allowSheetNameModifications = cfg.allowSheetNameModifications ?? true;

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

    public createSheet = async (cfg: CreateSheetConfiguration) => {
        const res= await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            auth: this.authWrapper,
            requestBody: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: cfg.sheetName,
                            }
                        }
                    }
                ]
            }
        });

        if(res.status !== 200) {
            return res;
        }

        if(cfg.allowSheetNameModifications ?? this.allowSheetNameModifications) {
            this.sheet = cfg.sheetName;

            if(this.range) {
                this.sheetRange = `${this.sheet}!${this.range}`;
            }
        }

        return res;
    }

    public deleteSheet = async (cfg?: DeleteSheetConfiguration) => {
        const sheetName = cfg?.sheetName ?? this.sheet;

        if(!sheetName && !cfg?.sheetId) {
            throw new Error(`Sheet name or sheet id must be provided`);
        }

        if(cfg?.sheetName && cfg?.sheetId) {
            throw new Error(`Sheet name and sheet id cannot be provided at the same time`);
        }

        const res = await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            auth: this.authWrapper,
            requestBody: {
                requests: [
                    {
                        deleteSheet: {
                            sheetId: cfg?.sheetId ? cfg.sheetId : await this.getSheetId(sheetName!),
                        }
                    }
                ]
            }
        });

        if(res.status !== 200) {
            return res;
        }

        if(cfg?.allowSheetNameModifications ?? this.allowSheetNameModifications) {
            this.sheet = undefined;
            this.sheetRange = undefined;
        }

        return res;
    }

    private getSheetId = async (sheetName: string) => {
        const sheet = await this.getSheet(sheetName);

        if(!sheet) {
            throw new Error(`Sheet: ${sheetName} not found`);
        }

        return sheet.properties?.sheetId;
    }

    private getNamedRanges = async () => {
        const namedRanges = await this.sheets.spreadsheets.get({
            spreadsheetId: this.spreadsheetId,
            auth: this.authWrapper,
        }).then(res => res.data.namedRanges);

        if(!namedRanges) {
            throw new Error(`Error getting named ranges`);
        }

        return namedRanges;
    }

    private getSheet = async (sheetName: string) => {
        const sheets = await this.sheets.spreadsheets.get({
            spreadsheetId: this.spreadsheetId,
            auth: this.authWrapper,
        }).then(res => res.data.sheets)

        if (!sheets) {
            throw new Error(`Error getting sheets`);
        }

        return sheets.find(sheet => sheet.properties?.title === sheetName);
    }

    public createNamedRange = async (cfg: CreateNamedRangeConfiguration) => {
        const [firstRangeHalf, secondRangeHalf] = cfg.range.split(":");
        let startRowIndex: number | undefined;
        let endRowIndex: number | undefined;
        let startColumnIndex: number | undefined;
        let endColumnIndex: number | undefined;
        const sheetName = cfg?.sheetName ?? this.sheet;

        if(!firstRangeHalf || !secondRangeHalf) {
            throw new Error(`Invalid range`);
        }

        const [firstRangeHalfColumn, firstRangeHalfRow] = firstRangeHalf;
        const [secondRangeHalfColumn, secondRangeHalfRow] = secondRangeHalf;

        const alphabet = "abcdefghijklmnopqrstuvwxyz";

        startRowIndex = Number(firstRangeHalfRow) - 1;
        endRowIndex = Number(secondRangeHalfRow);

        alphabet.split("").forEach((letter, index) => {
            if(letter.toUpperCase() === firstRangeHalfColumn.toUpperCase()) {
                startColumnIndex = index;
                return;
            }
        });

        alphabet.split("").forEach((letter, index) => {
            if(letter.toUpperCase() === secondRangeHalfColumn.toUpperCase()) {
                endColumnIndex = index + 1;
                return;
            }
        });

        return await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            auth: this.authWrapper,
            requestBody: {
                requests: [
                    {
                        addNamedRange: {
                            namedRange: {
                                name: cfg.name,
                                range: {
                                    sheetId: cfg?.sheetId ? cfg.sheetId : await this.getSheetId(sheetName!),
                                    startRowIndex,
                                    endRowIndex,
                                    startColumnIndex,
                                    endColumnIndex,
                                }
                            }
                        }
                    }
                ]
            }
        });
    }

    public deleteNamedRange = async (cfg: DeleteNamedRangeConfiguration) => {
        const namedRanges = await this.getNamedRanges();

        const namedRange = namedRanges?.find(namedRange => namedRange.name === cfg.name);

        if(!namedRange) {
            throw new Error(`Named range: ${cfg.name} not found`);
        }

        return await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            auth: this.authWrapper,
            requestBody: {
                requests: [
                    {
                        deleteNamedRange: {
                            namedRangeId: namedRange.namedRangeId,
                        }
                    }
                ]
            }
        });
    }

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