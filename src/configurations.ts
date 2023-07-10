import {DateTimeRenderOption, Dimension, InsertDataOption, ValueInputOption, ValueRenderOption} from "./types";
import {GoogleSheetsAuth} from "./google-sheets-auth";

export interface GetRequestConfiguration {
    range?: string;
    majorDimension?: Dimension;
    valueRenderOption?: ValueRenderOption;
    dateTimeRenderOption?: DateTimeRenderOption;
}

export interface AppendRequestConfiguration {
    // range?: string;
    valueInputOption?: ValueInputOption;
    insertDataOption?: InsertDataOption;
    includeValuesInResponse?: boolean;
    responseDateTimeRenderOption?: DateTimeRenderOption;
    responseValueRenderOption?: ValueRenderOption;
}

export interface UpdateRequestConfiguration {
    range: string;
    valueInputOption?: ValueInputOption;
    includeValuesInResponse?: boolean;
    responseDateTimeRenderOption?: DateTimeRenderOption;
    responseValueRenderOption?: ValueRenderOption;
}

export interface ClearRequestConfiguration {
    range: string;
}

export interface Configuration {
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
