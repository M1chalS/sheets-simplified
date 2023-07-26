# Sheets Simplified Configuration Options

This file provides a comprehensive list of all available configuration options for each method and all available enums in the "Sheets Simplified" package, which simplifies and enhances working with Google Sheets API v4.

Important info! Package will always prioritize the config object passed to the method over the config object passed to the constructor. Named range will be used over `sheet` and `range`.

### Config Objects:

#### SheetsConnection Constructor Config

```
{
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
```

#### Get Method Config

```
{
    range?: string;
    sheet?: string;
    namedRange?: string;
    majorDimension?: Dimension;
    valueRenderOption?: ValueRenderOption;
    dateTimeRenderOption?: DateTimeRenderOption;
    firstRowAsHeader?: boolean;
}
```

#### Append Method Config

```
{
    range?: string;
    sheet?: string;
    namedRange?: string;
    valueInputOption?: ValueInputOption;
    insertDataOption?: InsertDataOption;
    includeValuesInResponse?: boolean;
    responseDateTimeRenderOption?: DateTimeRenderOption;
    responseValueRenderOption?: ValueRenderOption;
}
```

#### Update Method Config

```
    {
    range?: string;
    sheet?: string;
    namedRange?: string;
    valueInputOption?: ValueInputOption;
    includeValuesInResponse?: boolean;
    responseDateTimeRenderOption?: DateTimeRenderOption;
    responseValueRenderOption?: ValueRenderOption;
    }
```

#### Clear Method Config

```
{
    range?: string;
    sheet?: string;
    namedRange?: string;
}
```

#### Create Sheet Method Config

```
{
    sheetName: string;
    allowSheetNameModifications?: boolean;
}
```

#### Delete Sheet Method Config

```
{
    sheetId?: number;
    sheetName?: string;
    allowSheetNameModifications?: boolean;
}
```

#### Create Named Range Method Config

```
{
    sheetId?: number;
    sheetName?: string;
    range?: string;
    name: string;
    startRowIndex?: number;
    endRowIndex?: number;
    startColumnIndex?: number;
    endColumnIndex?: number;
}
```

#### Delete Named Range Method Config

```
{
    name?: string;
    namedRangeId?: string;
}
```

### Enums:

```typescript
enum ValueRenderOption {
    FORMATTED_VALUE = "FORMATTED_VALUE",
    UNFORMATTED_VALUE = "UNFORMATTED_VALUE",
    FORMULA = "FORMULA"
}
```

```typescript
enum ValueInputOption {
RAW = "RAW",
USER_ENTERED = "USER_ENTERED"
}
```

```typescript
enum InsertDataOption {
OVERWRITE = "OVERWRITE",
INSERT_ROWS = "INSERT_ROWS"
}
```

```typescript
enum Dimension {
ROWS = "ROWS",
COLUMNS = "COLUMNS"
}
```

```typescript
enum DateTimeRenderOption {
SERIAL_NUMBER = "SERIAL_NUMBER",
FORMATTED_STRING = "FORMATTED_STRING"
}
```