import {describe, expect, test} from '@jest/globals';
import {GoogleSheetsAuth} from "../../auth/google-sheets-auth";
import {SheetsConnection} from "../sheets-connection";
import dotenv from 'dotenv';

dotenv.config();

// Auth setup
const key = process.env.GOOGLE_KEY!.toString().split('\\n').map(i => i + "\n").join("");

const googleAuthWrapper = new GoogleSheetsAuth({
    email: process.env.GOOGLE_EMAIL!,
    key: key
}).login();

describe('SheetsConnection main methods', () => {

    const sheetsConnection = new SheetsConnection({
        spreadsheetId: process.env.SHEET_ID!,
        auth: googleAuthWrapper,
        sheet: "Sheet1",
        range: "A1:B"
    });

    test('Expect get method to work', async () => {
        expect(await sheetsConnection.get()).toBeTruthy();
    });

    test('Expect append method to work', async () => {
        expect(await sheetsConnection.append([[
            "test1",
            "test2"
        ]])).toBeTruthy();
    });

    test('Expect update method to work', async () => {
        expect(await sheetsConnection.update([[
            "test3",
            "test4"
        ]])).toBeTruthy();
    });

    test('Expect clear method to work', async () => {
        expect(await sheetsConnection.clear()).toBeTruthy();
    });

    test('Expect createSheet method to work', async () => {
        expect(await sheetsConnection.createSheet({sheetName: "test1234"})).toBeTruthy();
    });

    test('Expect deleteSheet method to work', async () => {
        expect(await sheetsConnection.deleteSheet({ sheetName: "test1234"})).toBeTruthy();
    });

    test('Expect name or sheet id must to be provided in deleteSheet', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            range: "A1:B",
        });

        await expect(sheetsConnection.deleteSheet()).rejects.toThrow("Sheet name or sheet id must be provided");
    });

    test('Expect sheet name and sheet id to not be provided at the same time in deleteSheet', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            range: "A1:B",
        });

        await expect(sheetsConnection.deleteSheet({sheetName: "test1234", sheetId: 12345678})).rejects.toThrow("Sheet name and sheet id cannot be provided at the same time");
    });

    test('Expect createNamedRange method to work', async () => {
        expect(await sheetsConnection.createNamedRange({
            sheetName: "Sheet1",
            name: "testtest576432",
            range: "A1:B4"
        })).toBeTruthy();
    });

    test('Expect deleteNamedRange method to work', async () => {
        expect(await sheetsConnection.deleteNamedRange({name: "testtest576432"})).toBeTruthy();
    });
});

describe('Range logic checks', () => {

    test('Expect range to be this.sheetRange when sheet and range in constructor', async () => {
        const range = "A1:B2";
        const sheet = "Sheet1";

        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet,
            range
        });

        const response = await sheetsConnection.get();

        expect(response.data.range).toBe(sheet + "!" + range);
    });

    test('Expect range to be `${cfg.sheet}!${cfg.range}` when sheet and range in method', async () => {
        const range = "A1:B2";
        const sheet = "Sheet1";

        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
        });

        const response = await sheetsConnection.get({
            sheet,
            range
        });

        expect(response.data.range).toBe(sheet + "!" + range);
    });

    test('Expect range to be `${cfg.sheet}!${cfg.range}` when sheet and range in method and constructor', async () => {
        const range = "A1:B2";
        const sheet = "Sheet1";

        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet2",
            range: "C1:D2"
        });

        const response = await sheetsConnection.get({
            sheet,
            range
        });

        expect(response.data.range).toBe(sheet + "!" + range);
    });

    test('Expect range to be `${this.sheet}!${cfg.range}` when sheet and range in constructor and range in method', async () => {
        const range = "A1:B2";
        const sheet = "Sheet1";

        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet,
            range: "C1:D2"
        });

        const response = await sheetsConnection.get({
            range
        });

        expect(response.data.range).toBe(sheet + "!" + range);
    });

    test('Expect range to be `${this.sheet}!${cfg.range}` when sheet in constructor and range in method', async () => {
        const range = "A1:B2";
        const sheet = "Sheet1";

        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet,
        });

        const response = await sheetsConnection.get({
            range
        });

        expect(response.data.range).toBe(sheet + "!" + range);
    });

    test('Expect error when sheet only in constructor', async () => {
        const sheet = "Sheet1";

        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet,
        });

        await expect(sheetsConnection.get()).rejects.toThrowError("Specify range or sheet in method or in constructor");
    });

    test('Expect error when range only in constructor', async () => {
        const range = "A1:B2";

        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            range,
        });

        await expect(sheetsConnection.get()).rejects.toThrowError("Specify range or sheet in method or in constructor");
    });

    test('Expect error when sheet only in method', async () => {
        const sheet = "Sheet1";

        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
        });

        await expect(sheetsConnection.get({sheet})).rejects.toThrowError("Specify range or sheet in method or in constructor");
    });

    test('Expect error when range only in method', async () => {
        const range = "A1:B2";

        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
        });

        await expect(sheetsConnection.get({range})).rejects.toThrowError("Specify range or sheet in method or in constructor");
    });

    test('Expect error when sheet and range in constructor and sheet in method', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1",
            range: "A1:B2"
        });

        await expect(sheetsConnection.get({sheet: "Sheet2"})).rejects.toThrowError("Specify range or sheet in method or in constructor");
    });

    test('Expect error when range in constructor and sheet in method', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            range: "A1:B2"
        });

        await expect(sheetsConnection.get({sheet: "Sheet2"})).rejects.toThrowError("Specify range or sheet in method or in constructor");
    });

    test('Expect error when range in constructor and range in method', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            range: "A1:B2"
        });

        await expect(sheetsConnection.get({range: "C1:D2"})).rejects.toThrowError("Specify range or sheet in method or in constructor");
    });

    test('Expect error when sheet in constructor and sheet in method', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1"
        });

        await expect(sheetsConnection.get({sheet: "Sheet2"})).rejects.toThrowError("Specify range or sheet in method or in constructor");
    });

});

describe('Response formatter checks', () => {

    test('Expect response to not be formatted', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1",
            range: "A1:B"
        });

        await sheetsConnection.append([[
            "test1",
            "test2"
        ], [
            "test3",
            "test4"
        ]]);

        const res = await sheetsConnection.get();

        expect(res.data.values[0][0] === "test1").toBeTruthy();
        expect(res.data.values[0][1] === "test2").toBeTruthy();
        expect(res.data.values[1][0] === "test3").toBeTruthy();
        expect(res.data.values[1][1] === "test4").toBeTruthy();

        await sheetsConnection.clear();
    });

    test('Expect response to be formatted (set in constructor)', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1",
            range: "A1:B",
            firstRowAsHeader: true
        });

        await sheetsConnection.append([[
            "test1",
            "test2"
        ], [
            "test3",
            "test4"
        ]]);

        const res = await sheetsConnection.get();

        expect(res.data.values[0].test1 === "test3").toBeTruthy();
        expect(res.data.values[0].test2 === "test4").toBeTruthy();

        await sheetsConnection.clear();
    });

    test('Expect response to be formatted (set in method)', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1",
            range: "A1:B",
        });

        await sheetsConnection.append([[
            "test1",
            "test2"
        ], [
            "test3",
            "test4"
        ]]);

        const res = await sheetsConnection.get({
            firstRowAsHeader: true
        });

        expect(res.data.values[0].test1 === "test3").toBeTruthy();
        expect(res.data.values[0].test2 === "test4").toBeTruthy();

        await sheetsConnection.clear();
    });

    test('Expect response to be formatted (set in both)', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1",
            range: "A1:B",
            firstRowAsHeader: true
        });

        await sheetsConnection.append([[
            "test1",
            "test2"
        ], [
            "test3",
            "test4"
        ]]);

        const res = await sheetsConnection.get({
            firstRowAsHeader: true
        });

        expect(res.data.values[0].test1 === "test3").toBeTruthy();
        expect(res.data.values[0].test2 === "test4").toBeTruthy();

        await sheetsConnection.clear();
    });
});

describe('Allow sheet modification checks', () => {

    test('Expect to modify sheet name by default', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1",
            range: "A1:B"
        });

        expect(await sheetsConnection.createSheet({sheetName: "test1234"})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe("test1234");
        expect(await sheetsConnection.deleteSheet({ sheetName: "test1234"})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe(undefined);
    });

    test('Expect allow sheet modification to modify sheet name when set to true in constructor', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1",
            range: "A1:B",
            allowSheetNameModifications: true
        });

        expect(await sheetsConnection.createSheet({sheetName: "test1234"})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe("test1234");
        expect(await sheetsConnection.deleteSheet({ sheetName: "test1234"})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe(undefined);
    });

    test('Expect allow sheet modification to not modify sheet name when set to false in constructor', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1",
            range: "A1:B",
            allowSheetNameModifications: false
        });

        expect(await sheetsConnection.createSheet({sheetName: "test1234"})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe("Sheet1");
        expect(await sheetsConnection.deleteSheet({ sheetName: "test1234"})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe("Sheet1");
    });

    test('Expect allow sheet modification to modify sheet name when set to true in method variant 1', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1",
            range: "A1:B",
            allowSheetNameModifications: false
        });

        expect(await sheetsConnection.createSheet({sheetName: "test1234", allowSheetNameModifications: true})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe("test1234");
        expect(await sheetsConnection.deleteSheet({ sheetName: "test1234"})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe("test1234");
    });

    test('Expect allow sheet modification to modify sheet name when set to true in method variant 2', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1",
            range: "A1:B",
            allowSheetNameModifications: false
        });

        expect(await sheetsConnection.createSheet({sheetName: "test1234"})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe("Sheet1");
        expect(await sheetsConnection.deleteSheet({ sheetName: "test1234", allowSheetNameModifications: true})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe(undefined);
    });

    test('Expect allow sheet modification to modify sheet name when set to true in method variant 3', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1",
            range: "A1:B",
            allowSheetNameModifications: false
        });

        expect(await sheetsConnection.createSheet({sheetName: "test1234", allowSheetNameModifications: true})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe("test1234");
        expect(await sheetsConnection.deleteSheet({ sheetName: "test1234", allowSheetNameModifications: true})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe(undefined);
    });

    test('Expect allow sheet modification to not modify sheet name when set to false in method variant 1', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1",
            range: "A1:B",
        });

        expect(await sheetsConnection.createSheet({sheetName: "test1234", allowSheetNameModifications: false})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe("Sheet1");
        expect(await sheetsConnection.deleteSheet({ sheetName: "test1234"})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe(undefined);
    });

    test('Expect allow sheet modification to not modify sheet name when set to false in method variant 2', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1",
            range: "A1:B",
        });

        expect(await sheetsConnection.createSheet({sheetName: "test1234"})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe("test1234");
        expect(await sheetsConnection.deleteSheet({ sheetName: "test1234", allowSheetNameModifications: false})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe("test1234");
    });

    test('Expect allow sheet modification to not modify sheet name when set to false in method variant 3', async () => {
        const sheetsConnection = new SheetsConnection({
            spreadsheetId: process.env.SHEET_ID!,
            auth: googleAuthWrapper,
            sheet: "Sheet1",
            range: "A1:B",
        });

        expect(await sheetsConnection.createSheet({sheetName: "test1234", allowSheetNameModifications: false})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe("Sheet1");
        expect(await sheetsConnection.deleteSheet({ sheetName: "test1234", allowSheetNameModifications: false})).toBeTruthy();
        expect(sheetsConnection.getSheetName()).toBe("Sheet1");
    });
});