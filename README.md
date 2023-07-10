# Sheets Simplified

TypeScript classes based interface that eases and increases safety of working with Google Sheets API v4.

## Example use

### Setup

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

### Usage

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

To update data in sheets you can use `update` method for first argument providing array of data you want to add to sheets and as a second argument providing configuration object containing at least `range` and if you haven't specified it in constructor also `sheet`.

```typescript
const response = await sheetsConnection.update(
    [
        ["E2", "F2", "G2", "H2"],
        ["E3", "F3", "G3", "H3"],
    ],
    {
        sheet: "Sheet1",
        range: "B1:C4",
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

To clear data in sheets you can use `clear` method for first argument providing configuration object containing at least `range` and if you haven't specified it in constructor also `sheet`.

```typescript
const response = await sheetsConnection.clear({
    sheet: "Sheet1",
    range: "B1:C4",
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

_Made by Michał Szajner_