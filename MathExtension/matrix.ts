class Matrix {
    static isZeroBased = false;
    static isMatrix(object: any) {
        //http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
        var funcNameRegex = /function\s+(.{1,})\s*\(/;
        var regexResults = funcNameRegex.exec(object.constructor.toString());
        var result = (regexResults && regexResults.length > 1) ? regexResults[1] : "";
        return result === "Matrix";
    }

    private static assertParameter(...parameters: any[]) {
        parameters.forEach((p) => {
            Matrix.assert(p != null, "Argument not optional");
        });
    }

    private static assertNumber(...numbers: number[]) {
        numbers.forEach((n) => {
            Matrix.assert(n !== undefined, "Argument not optional");
            Matrix.assert(!isNaN(n), "Invalid argument.");
        });
    }

    private static assert(condition: boolean, message: string) {
        if (!condition)
            throw new Error(message);
    }

    //this implicitly returns NaN if isNaN(i) is true
    private static getInternalIndex(i: number) {
        if (Matrix.isZeroBased)
            return i;
        else
            return i - 1;
    }

    private static getExternalIndex(i: number) {
        if (Matrix.isZeroBased)
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
    get size() {
        var size: number[] = [];
        var targetArray = <any[]>this.array;
        while (Array.isArray(targetArray)) {
            size.push(targetArray.length);
            targetArray = targetArray[0];
        }
        return size;
    }
    get serialSize() {
        var size = this.size;
        var serial = 1;
        size.forEach((dimensionSize) => {
            serial *= dimensionSize;
        });
        return serial;
    }
    private checkInternalCoordinateValidity(coordinate: number[]) {
        var size = this.size;
        Matrix.assert(Array.isArray(coordinate), "Coordinate is invalid.");
        Matrix.assert(coordinate.length == size.length, "Coordinate dimension is not valid for this matrix.");
        var validity = true;
        return coordinate.every((dimensionIndex, dimension) => {
            return dimensionIndex < size[dimension];
        });
    }

    constructor();
    constructor(columnLength: number, items: number[])
    constructor(columnLength?: number, items?: number[]) {
        if (columnLength === undefined)
            return; // please do nothing, return an empty matrix

        Matrix.assertNumber(columnLength);
        Matrix.assert(Array.isArray(items) && items.length > 0, "Items are required to make a matrix.");
        if (columnLength == null)
            columnLength = Number(items.length); // giving dynamic length

        //columnLength is a number
        Matrix.assert(columnLength >= 1, "Column length should be larger than or equal to 1.");
        Matrix.assert(items.length % columnLength == 0, "Invalid number of items");

        //columnLength >= 1, items exist, items.length % columnLength == 0
        for (var row = 0; row < items.length / columnLength; row++) {
            this.array.push([]);
            for (var column = 0; column < columnLength; column++)
                this.array[row][column] = items[row * columnLength + column];
        }
    }

    private getInternalCoordinate(index: number) {
        var row: number;
        var column: number;
        index = Matrix.getInternalIndex(index);
        if (this.columnLength > 0) {
            column = index % this.columnLength;
            row = (index - column) / this.columnLength;
        }
        else {
            column = index;
            row = 0;
        }
        return [row, column];
    }

    //getFor(index: number): number;
    //getFor(row: number, column: number): number;
    getFor(index: number): number;
    getFor(coordinate: number[]): number;
    getFor(coordinate: any) {
        Matrix.assertParameter(coordinate);
        var internalCoordinate: number[] = [];
        if (Array.isArray(coordinate) && (<number[]>coordinate).length >= 2) {
            internalCoordinate = (<number[]>coordinate).map((i) => {
                return Matrix.getInternalIndex(i);
            });
        }
        else {
            var index = coordinate;
            internalCoordinate = this.getInternalCoordinate(index);
        }
        //if (i2 === undefined) {
        //    var index = Matrix.getInternalIndex(i1);
        //    if (this.columnLength > 0) {
        //        column = index % this.columnLength;
        //        row = (index - column) / this.columnLength;
        //    }
        //    else {
        //        column = index;
        //        row = 0;
        //    }
        //}
        //else {
        //    row = Matrix.getInternalIndex(i1);
        //    column = Matrix.getInternalIndex(i2);
        //}
        if (this.checkInternalCoordinateValidity(internalCoordinate)) {
            var dimensioner = (<number[]>internalCoordinate).slice(0);

            var targetArray = <any[]>this.array;
            while (Array.isArray(targetArray)) {
                targetArray = targetArray[dimensioner.shift()];
            }
            return <number><any>targetArray;
        }
        else
            return undefined;
    }

    setFor(index: number, input: number): Matrix;
    setFor(row: number, column: number, input: number): Matrix;
    setFor(i1: number, i2: number, i3?: number) {
        var row: number;
        var column: number;
        var input: number;
        if (i3 === undefined) {
            var index = Matrix.getInternalIndex(i1);
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
            row = Matrix.getInternalIndex(i1);
            column = Matrix.getInternalIndex(i2);
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
        Matrix.assert(this.rowLength < rowLength, "columnLength is already large enough to expand.");
        while (this.array.length < rowLength) {
            var rowArray: number[] = [];
            while (rowArray.length < this.columnLength) {
                rowArray.push(0);
            }
            this.array.push(rowArray);
        }
    }

    private expandColumn(columnLength: number) {
        Matrix.assert(this.columnLength < columnLength, "columnLength is already large enough to expand.");
        this.array.forEach((rowArray) => {
            while (rowArray.length < columnLength) {
                rowArray.push(0);
            }
        });
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

    mapFor(func: Function, condition: (item: number, row: number, column: number) => void, input?: any, ...argArray: any[]) {
        if (input != null && input.isMatrix)
            Matrix.assert(
                this.columnLength == input.columnLength && this.rowLength == input.rowLength,
                "Dimensions should match each other");

        var newMatrix = this.clone();
        newMatrix.forEach((item, row, column) => {
            if (!condition || condition(item, row, column)) {
                if (input == null)
                    newMatrix.setFor(row, column, func.apply(null, [item]));
                else
                    newMatrix.setFor(row, column, func.apply(null, [item, input.isMatrix ? (<Matrix>input).getFor([row, column]) : input].concat(argArray)));
            }
        });

        //for (var row = 0; row < newMatrix.rowLength; row++) {
        //    for (var column = 0; column < newMatrix.columnLength; column++) {
        //        var item = newMatrix.array[row][column];
        //        if (!condition || condition(item, Matrix.getExternalIndex(row), Matrix.getExternalIndex(column))) {
        //            if (input == null)
        //                newMatrix.array[row][column] = func.apply(null, [item]);
        //            else
        //                newMatrix.array[row][column] = func.apply(null, [item, input.isMatrix ? input.array[row][column] : input].concat(argArray));
        //        }
        //    }
        //}
        return newMatrix;
    }

    forEach(func: (item: number, row: number, column: number) => void) {
        this.array.forEach((rowArray: number[], row: number) => {
            rowArray.forEach((item: number, column: number) => {
                func(item, Matrix.getExternalIndex(row), Matrix.getExternalIndex(column));
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

    static getZeroMatrix(columnLength: number): Matrix;
    static getZeroMatrix(rowLength: number, columnLength: number): Matrix;
    static getZeroMatrix(rowLength: number, columnLength?: number) {
        Matrix.assertNumber(rowLength);
        var newMatrix = new Matrix();
        if (!isNaN(columnLength)) {
            newMatrix.expandRow(rowLength);
            newMatrix.expandColumn(columnLength);
        }
        else {
            columnLength = rowLength;
            newMatrix.expandRow(rowLength);
            newMatrix.expandColumn(columnLength);
        }
        return newMatrix;
    }

    static getIdentityMatrix(size: number) {
        Matrix.assertNumber(size);
        var newMatrix = new Matrix();
        newMatrix.expandRow(size);
        newMatrix.expandColumn(size);
        for (var i = 0; i < size; i++)
            newMatrix.array[i][i] = 1;
        return newMatrix;
    }

    static getLinearSpace(start: number, end: number, pointNumber: number) {
        Matrix.assertNumber(start, end, pointNumber);
        Matrix.assert(end > start, "End should be larger than start.");
        var newMatrix = new Matrix();
        newMatrix.expandRow(1);
        newMatrix.expandColumn(pointNumber);
        var gap = (end - start) / (pointNumber - 1);
        for (var i = 0; i < pointNumber; i++)
            newMatrix.array[0][i] = start + gap * i;
        return newMatrix;
    }

    static getGapSpace(start: number, end: number, gap?: number) {
        Matrix.assertNumber(start, end);
        Matrix.assert(end > start, "End should be larger than start.");
        if (isNaN(gap))
            gap = 1;
        var newMatrix = new Matrix();
        var length = Math.floor((end - start) / gap) + 1;
        newMatrix.expandRow(1);
        newMatrix.expandColumn(length);
        for (var i = 0; i < length; i++)
            newMatrix.array[0][i] = start + gap * i;
        return newMatrix;
    }

    plus(input: number): Matrix;
    plus(input: Matrix): Matrix;
    plus(input: any) {
        return this.map(Math.add, input);
    }

    minus(input: number): Matrix;
    minus(input: Matrix): Matrix;
    minus(input: any) {
        return this.map(Math.subtract, input);
    }

    times(input: number): Matrix;
    times(input: Matrix): Matrix;
    times(input: any) {
        return this.map(Math.multiply, input);
    }

    dividedBy(input: number): Matrix;
    dividedBy(input: Matrix): Matrix;
    dividedBy(input: any) {
        return this.map(Math.divide, input);
    }

    powerOf(input: number): Matrix;
    powerOf(input: Matrix): Matrix;
    powerOf(input: any) {
        return this.map(Math.pow, input);
    }

    replace(input: number): Matrix;
    replace(input: Matrix): Matrix;
    replace(input: any) {
        return this.map(Math.substitute, input);
    }

    matrixMultiply(input: Matrix) {
        Matrix.assert(this.columnLength == input.rowLength,
            "Row length of the input matrix should be same with column length of the original one.");
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

    transpose() {
        var newMatrix = Matrix.getZeroMatrix(this.columnLength, this.rowLength);
        this.forEach((i, r, c) => {
            newMatrix.setFor(c, r, i);
        });
        return newMatrix;
    }
}