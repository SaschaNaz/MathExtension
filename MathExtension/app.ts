class Matrix {
    static zeroBased = false;
    private getInternalIndex(i: number) {
        if (Matrix.zeroBased)
            return i;
        else if (i <= 0)
            throw new Error("Index should be larger than 0");
        else
            return i - 1;
    }

    private array: number[][];
    get columnLength() {
        return this.array[0].length;
    }
    get rowLength() {
        return this.array.length;
    }

    constructor(columnLength: number, items: number[]) {
        if (!(columnLength >= 1))//
            throw new Error("Column length should be larger than or equal to 1.");
        if (items.length == 0)//
            throw new Error("Items are required to make a matrix.");
        if (items.length % columnLength != 0)
            throw new Error("Invalid number of items");
        //columnLength > 1, items exist, items.length % columnLength == 0
        this.array = [];
        for (var row = 0; row < items.length / columnLength; row++) {
            this.array.push([]);
            for (var column = 0; column < columnLength; column++)
                this.array[row][column] = items[row * columnLength + column];
        }
    }    

    item(index: number);
    item(row: number, column?: number) {
        if (column === undefined) {
            var index = this.getInternalIndex(row);
            column = index % this.columnLength;
            row = (index - column) / this.columnLength;
        }
        else {
            row = this.getInternalIndex(row);
            column = this.getInternalIndex(column);
        }
        return this.array[row][column];
    }

    private clone() {
        var items: number[] = [];
        this.forEach((item) => {
            items.push(item);
        });
        return new Matrix(this.columnLength, items);
    }

    map(func: Function, ...argArray: any[]) {
        var newMatrix = this.clone();
        for (var row = 0; row < newMatrix.rowLength; row++) {
            for (var column = 0; column < newMatrix.columnLength; column++)
                newMatrix.array[row][column] = func.apply(null, [newMatrix.array[row][column]].concat(argArray));
        }
        return newMatrix;
    }

    forEach(func: Function) {
        this.array.forEach((row: number[]) => {
            row.forEach((item: number) => {
                func(item);
            });
        });
    }

    toString() {
        var outputArray: string[] = [];
        for (var row = 0; row < this.rowLength; row++) {
            var strArray: any[] = ['['];
            for (var column = 0; column < this.columnLength; column++)
                strArray.push(this.array[row][column]);
            strArray.push(']');
            outputArray.push(strArray.join(' '));
        }
        return outputArray.join('\r\n');
    }

    plus(input: number) {
        return this.map((i) => { return i + input; });
    }

    minus(input: number) {
        return this.map((i) => { return i - input; });
    }

    multiply(input: number) {
        return this.map((i) => { return i * input; });
    }

    divide(input: number) {
        return this.map((i) => { return i * input; });
    }

    
}