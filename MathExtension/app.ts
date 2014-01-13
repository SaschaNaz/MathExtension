class Matrix {
    static zeroBased = false;
    get isMatrix() {
        return !!this.columnLength && !!this.rowLength;
    }

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

    getFor(index: number): number;
    getFor(row: number, column: number): number;
    getFor(i1: number, i2?: number) {
        var row: number;
        var column: number;
        if (i2 === undefined) {
            var index = this.getInternalIndex(i1);
            column = index % this.columnLength;
            row = (index - column) / this.columnLength;
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
            column = index % this.columnLength;
            row = (index - column) / this.columnLength;
            input = i2;
        }
        else {
            row = this.getInternalIndex(i1);
            column = this.getInternalIndex(i2);
            input = i3;
        }

        this.array[row][column] = input;
        return this;
    }

    private clone() {
        var items: number[] = [];
        this.forEach((item) => {
            items.push(item);
        });
        return new Matrix(this.columnLength, items);
    }

    numericMap(func: Function, ...argArray: any[]) {
        return this.mapFor.apply(this, [func, null].concat(argArray));
    }

    mapFor(func: Function, condition: Function, ...argArray: any[]) {
        var newMatrix = this.clone();
        for (var row = 0; row < newMatrix.rowLength; row++) {
            for (var column = 0; column < newMatrix.columnLength; column++) {
                var item = newMatrix.array[row][column];
                if (!condition || condition(item))
                    newMatrix.array[row][column] = func.apply(null, [item].concat(argArray));
            }
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

    map(func: Function, input: any) {
        if (!input.isMatrix)
            return this.numericMap(func, input);
        else
            return this.matrixMap(func, input);
    }

    plus(input: number);
    plus(input: Matrix);
    plus(input: any) {
        return this.map(Matrix.add, input);
    }

    minus(input: number);
    minus(input: Matrix);
    minus(input: any) {
        return this.map(Matrix.subtract, input);
    }

    times(input: number);
    times(input: Matrix);
    times(input: any) {
        return this.map(Matrix.multiply, input);
    }

    dividedBy(input: number);
    dividedBy(input: Matrix);
    dividedBy(input: any) {
        return this.map(Matrix.divide, input);
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

    matrixMap(func: Function, input: Matrix) {
        if (this.columnLength !== input.columnLength || this.rowLength !== input.rowLength)
            throw new Error("Dimensions should match each other");
        var newMatrix = this.clone();
        for (var row = 0; row < newMatrix.rowLength; row++) {
            for (var column = 0; column < newMatrix.columnLength; column++) {
                var item = newMatrix.array[row][column];
                newMatrix.array[row][column] = func.apply(null, [item, input.array[row][column]]);
            }
        }
        return newMatrix;
    }
}