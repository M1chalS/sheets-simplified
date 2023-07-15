export const responseFormatter = (res: any) => {
    const {data, ...rest } = res;

    data.values = data.values.map((row: any[], index: number) => {
        const newRow: any = {};
        row.forEach((value: any, index: number) => {
            newRow[data.values[0][index]] = value;
        });
        return newRow;
    }).filter((val: any[], index: number) => index !== 0);

    return {
        data,
        ...rest
    }
};