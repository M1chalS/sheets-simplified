## Sheets Simplified

TypeScript classes based package that eases and increases safety of working with Google Sheets API v4.

### Usage recommendation

#### `Auth` and `SheetsConnection` setup

Create a `google-auth-wrapper.ts` file that contains your Google Cloud login info.

```typescript
import { GoogleSheetsAuth } from 'sheets-simplified';

const googleAuthWrapper = new GoogleSheetsAuth({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_SECRET_KEY,
}).login();

export { googleAuthWrapper };
```
Create a `SheetsConnection` object. The minimal required info to connect to a spreadsheet is the `auth` and `spreadsheetId`. You can also provide more info at this point, like sheet, range, or even more specific options like valueRenderOption. List of available options can be found in [this file](https://github.com/M1chalS/sheets-simplified/blob/master/config-options.md).

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

To retrieve data from sheet you can simply use `get` method.

```typescript
const data = await sheetsConnection.get();
```

If you haven't provided `sheet` and `range` in the `SheetsConnection` constructor or if you want to use different values, you can provide them directly within the `get` method.

```typescript
const data = await sheetsConnection.get({
    sheet: "Sheet1",
    range: "A1:D4",
});
```

You can also provide additional options like `majorDimension`, `valueRenderOption`, or `dateTimeRenderOption` in the `get` method to customize the data retrieval.

```typescript
const data = await sheetsConnection.get({
    majorDimension: "COLUMNS",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
});
```

#### Append data

To append data to a sheet, you can use the `append` method. Provide an array of data you want to add to the sheet as the first argument. Each inner array represents a row in the sheet.

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
    <tr><td>A4</td><td>B4</td><td>C4</td><td>D4</td></tr>
    <tr><td>A5</td><td>B5</td><td>C5</td><td>D5</td></tr>
</table>

You can also provide a special config object as the second argument to the `append` method, allowing you to specify various options:

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

To update data in sheets, you can use the update method. Provide an array of data you want to update in the specified sheet range as the first argument.

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

To clear data in sheets, you can use the `clear` method. If you've already provided `sheet` and `range` in the constructor, you don't need to provide any additional arguments. However, if you want to use different values, you can specify them in the first parameter by creating a configuration object with the `sheet` and `range` properties.

```typescript
const response = await sheetsConnection.clear({
    sheet: "Sheet1",
    range: "A2:D3",
});
```

Cleared data will look like this:
<table>
    <tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>
    <tr><td></td><td></td><td></td><td></td></tr>
    <tr><td></td><td></td><td></td><td></td></tr>
    <tr><td>A4</td><td>B4</td><td>C4</td><td>D4</td></tr>
    <tr><td>A5</td><td>B5</td><td>C5</td><td>D5</td></tr>
</table>

### Create new sheet

To create a new sheet, you can use the `createSheet` method. Simply provide the desired `sheetName` in the configuration object.

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

To delete a sheet, you can use the `deleteSheet` method. Provide either the `sheetName` or `sheetId` in the configuration object. If neither is provided, the constructor's `sheet` value will be used (if it's set).

If you want to change sheet provided in the constructor you can provide `allowSheetNameModifications` in configuration object or in constructor (this is set to true as default).

With sheet name:
```typescript
const response = await sheetsConnection.deleteSheet({
    sheetName: "New Sheet",
});
```

With sheet ID:
```typescript
const response = await sheetsConnection.deleteSheet({
    sheetId: 12345678,
});
```

#### Special Features

When retrieving data, you can set `firstRowAsHeader` to true to format the data as an object with keys derived from the first row. You can enable this feature either in the constructor or in the `get` method.

Example of a normal response:
```typescript
[
    ["A1", "B1", "C1", "D1"],
    ["A2", "B2", "C2", "D2"],
    ["A3", "B3", "C3", "D3"],
]
```
Response with `firstRowAsHeader` set to true:
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
