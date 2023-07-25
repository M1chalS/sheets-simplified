import {DateTimeRenderOption, Dimension, InsertDataOption, ValueInputOption, ValueRenderOption} from "../types/types";

export interface GetRequestConfiguration {
    range?: string;
    sheet?: string;
    namedRange?: string;
    majorDimension?: Dimension;
    valueRenderOption?: ValueRenderOption;
    dateTimeRenderOption?: DateTimeRenderOption;
    firstRowAsHeader?: boolean;
}

export interface AppendRequestConfiguration {
    range?: string;
    sheet?: string;
    namedRange?: string;
    valueInputOption?: ValueInputOption;
    insertDataOption?: InsertDataOption;
    includeValuesInResponse?: boolean;
    responseDateTimeRenderOption?: DateTimeRenderOption;
    responseValueRenderOption?: ValueRenderOption;
}

export interface UpdateRequestConfiguration {
    range?: string;
    sheet?: string;
    namedRange?: string;
    valueInputOption?: ValueInputOption;
    includeValuesInResponse?: boolean;
    responseDateTimeRenderOption?: DateTimeRenderOption;
    responseValueRenderOption?: ValueRenderOption;
}

export interface ClearRequestConfiguration {
    range?: string;
    sheet?: string;
    namedRange?: string;
}

export interface Configuration {
    auth: any;
    spreadsheetId: string;
    sheet?: string;
    range?: string;
    namedRange?: string;
    valueRenderOption?: ValueRenderOption;
    valueInputOption?: ValueInputOption;
    insertDataOption?: InsertDataOption;
    majorDimension?: Dimension;
    dateTimeRenderOption?: DateTimeRenderOption;
    includeValuesInResponse?: boolean;
    responseDateTimeRenderOption?: DateTimeRenderOption;
    responseValueRenderOption?: ValueRenderOption;
    firstRowAsHeader?: boolean;
    allowSheetNameModifications?: boolean;
}

export interface CreateSheetConfiguration {
    sheetName: string;
    allowSheetNameModifications?: boolean;
}

export interface DeleteSheetConfiguration {
    sheetId?: number;
    sheetName?: string;
    allowSheetNameModifications?: boolean;
}

export interface CreateNamedRangeConfiguration {
    sheetId?: number;
    sheetName?: string;
    range?: string;
    name: string;
    startRowIndex?: number;
    endRowIndex?: number;
    startColumnIndex?: number;
    endColumnIndex?: number;
}

export interface DeleteNamedRangeConfiguration {
    name?: string;
    namedRangeId?: string;
}