# Sheets Simplified

TypeScript classes based package that eases and increases safety of working with Google Sheets API v4.

## Usage recommendation

### Auth and `SheetsConnection` object setup

Create `google-auth-wrapper.ts` that contains your GoogleCloud login info.

```typescript
import {GoogleSheetsAuth} from 'sheets-simplified';

const googleAuthWrapper = new GoogleSheetsAuth({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_SECRET_KEY,
}).login();

export {googleAuthWrapper};
```

Create object the minimal required info to connect to a spreadsheet is the `auth` and `spreadsheetId`, you can also at
this point provide more specific info like `sheet`, `range` or even more specific options like `valueRenderOption` etc.

```typescript 
const sheetsConnection = new SheetsConnection({
    auth: googleAuthWrapper,
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    sheet: "Sheet1",
    range: "A1:D12",
});
```

### Main methods

#### Get data

To get data from sheet you can simply use `get` method.

```typescript
const data = await sheetsConnection.get();
```

If you haven't provided `sheet` and `range` in `SheetsConnection` constructor or want to use different values you can
provide them in `get` method.

```typescript
const data = await sheetsConnection.get({
    sheet: "Sheet1",
    range: "A1:D4",
});
```

You can provide more specific options like `majorDimension`, `valueRenderOption` or `dateTimeRenderOption` in `get`
method.

```typescript
const data = await sheetsConnection.get({
    majorDimension: "COLUMNS",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
});
```

#### Append data

To append data to sheet you can use `append` method for first argument providing array of data you want to add to sheet.

```typescript
const response = await sheetsConnection.append([
    ["A4", "B4", "C4", "D4"]
    ["A5", "B5", "C5", "D5"]
]);
```

Inserted will look like this:

<table>
    <tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>
    <tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>
    <tr><td>A3</td><td>B3</td><td>C3</td><td>D3</td></tr>
    <tr style="font-weight: bold"><td>A4</td><td>B4</td><td>C4</td><td>D4</td></tr>
    <tr style="font-weight: bold"><td>A5</td><td>B5</td><td>C5</td><td>D5</td></tr>
</table>

You can also provide special config object as second argument to `append` method.

```typescript
const response = await sheetsConnection.append([
    ["A1", "B1", "C1", "D1"],
    ["A2", "B2", "C2", "D2"],
    ["A3", "B3", "C3", "D3"],
    ["A4", "B4", "C4", "D4"],
], {
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    includeValuesInResponse: true,
    responseDateTimeRenderOption: "FORMATTED_STRING",
    responseValueRenderOption: "FORMATTED_VALUE",
});
```

#### Update data

To update data in sheets you can use `update` method for first argument providing array of data you want to add to sheets, also if you want to use different sheet or range you can provide them in second parameter by creating configuration object specifying `sheet` and `range`.

```typescript
const response = await sheetsConnection.update(
    [
        ["E2", "F2", "G2", "H2"],
        ["E3", "F3", "G3", "H3"],
    ],
    {
        sheet: "Sheet1",
        range: "A2:D3",
    }
);
```

Updated data will look like this:
<table>
    <tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>
    <tr style="font-weight: bold"><td>E2</td><td>F2</td><td>G2</td><td>H2</td></tr>
    <tr style="font-weight: bold"><td>E3</td><td>F3</td><td>G3</td><td>H3</td></tr>
    <tr><td>A4</td><td>B4</td><td>C4</td><td>D4</td></tr>
    <tr><td>A5</td><td>B5</td><td>C5</td><td>D5</td></tr>
</table>

#### Clear data

To clear data in sheets you can use `clear` method, if you provided `sheet` and `range` in constructor you don't have to provide any arguments, but if you want to use different values you can provide them in first parameter by creating configuration object specifying `sheet` and `range`.

```typescript
const response = await sheetsConnection.clear({
    sheet: "Sheet1",
    range: "A2:D3",
});
```

Cleared data will look like this:
<table>
    <tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>
    <tr style="height: 2rem"><td></td><td></td><td></td><td></td></tr>
    <tr style="height: 2rem"><td></td><td></td><td></td><td></td></tr>
    <tr><td>A4</td><td>B4</td><td>C4</td><td>D4</td></tr>
    <tr><td>A5</td><td>B5</td><td>C5</td><td>D5</td></tr>
</table>

### Create new sheet

To create new sheet you can use `createSheet` method, you need to provide `sheetName` in configuration object.

```typescript
const response = await sheetsConnection.createSheet({
    sheetName: "New Sheet",
});
```

If you want to change sheet provided in the constructor you can provide `allowSheetNameModifications` in configuration object or in constructor (this is set to true as default).

```typescript
const response = await sheetsConnection.createSheet({
    sheetName: "New Sheet",
    allowSheetNameModifications: true,
});
```

### Delete sheet

To delete sheet you can use `deleteSheet` method, you need to provide `sheetName` or `sheetId` in configuration object. If none of them is provided constructors `sheet` value will be used (if it's set). 

If you want to change sheet provided in the constructor you can provide `allowSheetNameModifications` in configuration object or in constructor (this is set to true as default).

With sheet name:
```typescript
const response = await sheetsConnection.deleteSheet({
    sheetName: "New Sheet",
});
```

With sheet id:
```typescript
const response = await sheetsConnection.deleteSheet({
    sheetName: 12345678,
    allowSheetNameModifications: true,
});
```

#### Special Features
When getting data you can set `firstRowAsHeader` as true to get data formatted as object with keys from first row. You can do it in constructor or in `get` method.

Example normal response:
```typescript
[
    ["A1", "B1", "C1", "D1"],
    ["A2", "B2", "C2", "D2"],
    ["A3", "B3", "C3", "D3"],
]
```
Response with firstRowAsHeader set to true
```typescript
[
    {
        A1: "A2",
        B1: "B2",
        C1: "C2",
        D1: "D2",
    },
    {
        A1: "A3",
        B1: "B3",
        C1: "C3",
        D1: "D3",
    },
]
```

# Development setup

### Install dependencies

```shell
npm install
```

### Build

```shell
npm run build
```

### Run tests

```shell
npm run test
```

Compiled JavaScript will be placed in `/build` folder.

_Made by [Michał Szajner](https://github.com/M1chalS)_