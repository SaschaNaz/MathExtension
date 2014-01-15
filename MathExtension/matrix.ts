class Matrix {
    static zeroBased = false;
    get isMatrix() {
        return true;
    }

    private getInternalIndex(i: number) {
        if (Matrix.zeroBased)
            return i;
        else if (i <= 0)
            throw new Error("Index should be larger than 0");
        else
            return i - 1;
    }
    private getExternalIndex(i: number) {
        if (Matrix.zeroBased)
            return i;
        else
            return i + 1;
    }

    private array: number[][] = [];
    get columnLength() {
        if (this.rowLength > 0)
            return this.array[0].length;
        else
            return 0;
    }
    get rowLength() {
        return this.array.length;
    }

    constructor();
    constructor(columnLength: number, items: number[])
    constructor(columnLength?: number, items?: number[]) {
        if (!isNaN(columnLength)) 
            columnLength = Number(columnLength);
        if (items && !isNaN(items.length))
            columnLength = Number(items.length);

        if (!isNaN(columnLength))
        {
            //columnLength now is really number
            if (columnLength < 1)
                throw new Error("Column length should be larger than or equal to 1.");
            if (items.length == 0)//
                throw new Error("Items are required to make a matrix.");
            if (items.length % columnLength != 0)
                throw new Error("Invalid number of items");

            //columnLength > 1, items exist, items.length % columnLength == 0
            for (var row = 0; row < items.length / columnLength; row++) {
                this.array.push([]);
                for (var column = 0; column < columnLength; column++)
                    this.array[row][column] = items[row * columnLength + column];
            }
        }
    }    

    getFor(index: number): number;
    getFor(row: number, column: number): number;
    getFor(i1: number, i2?: number) {
        var row: number;
        var column: number;
        if (i2 === undefined) {
            var index = this.getInternalIndex(i1);
            if (this.columnLength > 0) {
                column = index % this.columnLength;
                row = (index - column) / this.columnLength;
            }
            else {
                column = index;
                row = 0;
            }
        }
        else {
            row = this.getInternalIndex(i1);
            column = this.getInternalIndex(i2);
        }
        return this.array[row][column];
    }

    setFor(index: number, input: number): Matrix;
    setFor(row: number, column: number, input: number): Matrix;
    setFor(i1: number, i2: number, i3?: number) {
        var row: number;
        var column: number;
        var input: number;
        if (i3 === undefined) {
            var index = this.getInternalIndex(i1);
            if (this.columnLength > 0) {
                column = index % this.columnLength;
                row = (index - column) / this.columnLength;
            }
            else {
                column = index;
                row = 0;
            }
            input = i2;
        }
        else {
            row = this.getInternalIndex(i1);
            column = this.getInternalIndex(i2);
            input = i3;
        }

        if (row > this.rowLength - 1)
            this.expandRow(row + 1);
        if (column > this.columnLength - 1)
            this.expandColumn(column + 1);
        this.array[row][column] = input;
        return this;
    }

    private expandRow(rowLength: number) {
        if (this.rowLength < rowLength) {
            while (this.array.length < rowLength) {
                var rowArray: number[] = [];
                while (rowArray.length < this.columnLength) {
                    rowArray.push(0);
                }
                this.array.push(rowArray);
            }
        }
        else
            throw new Error("columnLength is already large enough to expand.");
    }

    private expandColumn(columnLength: number) {
        if (this.columnLength < columnLength) {
            this.array.forEach((rowArray) => {
                while (rowArray.length < columnLength) {
                    rowArray.push(0);
                }
            });
        }
        else
            throw new Error("columnLength is already large enough to expand.");
    }

    private clone() {
        var items: number[] = [];
        this.forEach((item) => {
            items.push(item);
        });
        return new Matrix(this.columnLength, items);
    }

    map(func: Function, input?: any, ...argArray: any[]) {
        return <Matrix>this.mapFor.apply(this, [func, null, input].concat(argArray));
    }

    mapFor(func: Function, condition: Function, input?: any, ...argArray: any[]) {
        if (input != null && input.isMatrix &&
            (this.columnLength !== input.columnLength || this.rowLength !== input.rowLength))
                throw new Error("Dimensions should match each other");

        var newMatrix = this.clone();
        for (var row = 0; row < newMatrix.rowLength; row++) {
            for (var column = 0; column < newMatrix.columnLength; column++) {
                var item = newMatrix.array[row][column];
                if (!condition || condition(item, this.getExternalIndex(row), this.getExternalIndex(column))) {
                    if (input == null)
                        newMatrix.array[row][column] = func.apply(null, [item]);
                    else
                        newMatrix.array[row][column] = func.apply(null, [item, input.isMatrix ? input.array[row][column] : input].concat(argArray));
                }
            }
        }
        return newMatrix;
    }

    forEach(func: (item: number) => void) {
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
        if (outputArray.length > 0)
            return outputArray.join('\r\n');
        else
            return "(Empty matrix)";
    }

    toMatlabString() {
        var outputArray: string[] = [];
        for (var row = 0; row < this.rowLength; row++) {
            var strArray: any[] = [];
            for (var column = 0; column < this.columnLength; column++)
                strArray.push(this.array[row][column]);
            outputArray.push(strArray.join(' '));
        }
        return '[' + outputArray.join('; ') + ']';
    }

    plus(input: number): Matrix;
    plus(input: Matrix): Matrix;
    plus(input: any) {
        return this.map(Matrix.add, input);
    }

    minus(input: number): Matrix;
    minus(input: Matrix): Matrix;
    minus(input: any) {
        return this.map(Matrix.subtract, input);
    }

    times(input: number): Matrix;
    times(input: Matrix): Matrix;
    times(input: any) {
        return this.map(Matrix.multiply, input);
    }

    dividedBy(input: number): Matrix;
    dividedBy(input: Matrix): Matrix;
    dividedBy(input: any) {
        return this.map(Matrix.divide, input);
    }

    replace(input: number): Matrix;
    replace(input: Matrix): Matrix;
    replace(input: any) {
        return this.map(Matrix.substitute, input);
    }

    static add(item: number, input: number) {
        return item + input;
    }

    static subtract(item: number, input: number) {
        return item - input;
    }

    static multiply(item: number, input: number) {
        return item * input;
    }

    static divide(item: number, input: number) {
        return item / input;
    }

    static substitute(item: number, input: number) {
        return input;
    }

    matrixMultiply(input: Matrix) {
        if (this.columnLength != input.rowLength)
            throw new Error("Row length of the input matrix should be same with column length of the original one.");
        var newColumnLength = input.columnLength;
        var newItems: number[] = [];
        this.array.forEach((rowArray) => {
            for (var column = 0; column < input.columnLength; column++) {
                var newItem = 0;
                for (var row = 0; row < input.rowLength; row++)
                    newItem += rowArray[row] * input.array[row][column];
                newItems.push(newItem);
            }
        });

        return new Matrix(newColumnLength, newItems);
    }
}