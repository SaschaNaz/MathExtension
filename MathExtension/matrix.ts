class Matrix {
    static isZeroBased = false;
    static isMatrix(object: any) {
        //http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
        var funcNameRegex = /function\s+(.{1,})\s*\(/;
        var regexResults = funcNameRegex.exec(object.constructor.toString());
        var result = (regexResults && regexResults.length > 1) ? regexResults[1] : "";
        return result === "Matrix";
    }

    //this implicitly returns NaN if isNaN(i) is true
    private static _getZeroBasedIndex(i: number) {
        if (Matrix.isZeroBased)
            return i;
        else
            return i - 1;
    }

    private static _getUserFriendlyIndex(i: number) {
        if (Matrix.isZeroBased)
            return i;
        else
            return i + 1;
    }

    private _array: number[][] = [];
    get columnLength() {
        if (this.rowLength > 0)
            return this._array[0].length;
        else
            return 0;
    }
    get rowLength() {
        return this._array.length;
    }
    get size() {
        var size: number[] = [];
        var targetArray = <any[]>this._array;
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
    get dimension() {
        return this.size.length;
    }

    private _checkInternalCoordinateValidity(coordinate: number[]) {
        var size = this.size;
        AssertHelper.assertArray(coordinate);
        AssertHelper.assert(coordinate.length == size.length, "Coordinate dimension is not valid for this matrix.");
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

        AssertHelper.assertNumber(columnLength);
        AssertHelper.assert(Array.isArray(items) && items.length > 0, "Items are required to make a matrix.");
        if (columnLength == null)
            columnLength = Number(items.length); // giving dynamic length

        //columnLength is a number
        AssertHelper.assert(columnLength >= 1, "Column length should be larger than or equal to 1.");
        AssertHelper.assert(items.length % columnLength == 0, "Invalid number of items");

        //columnLength >= 1, items exist, items.length % columnLength == 0
        for (var row = 0; row < items.length / columnLength; row++) {
            this._array.push([]);
            for (var column = 0; column < columnLength; column++)
                this._array[row][column] = items[row * columnLength + column];
        }
    }

    private _getInternalCoordinate(index: number) {
        var row: number;
        var column: number;
        index = Matrix._getZeroBasedIndex(index);
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

    getFor(index: number): number;
    getFor(coordinate: number[]): number;
    getFor(coordinate: any) {
        AssertHelper.assertParameter(coordinate);
        var internalCoordinate: number[] = [];
        if (Array.isArray(coordinate)) {
            internalCoordinate = (<number[]>coordinate).map((i) => {
                return Matrix._getZeroBasedIndex(i);
            });
        }
        else {
            var index = coordinate;
            internalCoordinate = this._getInternalCoordinate(index);
        }

        if (this._checkInternalCoordinateValidity(internalCoordinate)) {
            var dimensioner = (<number[]>internalCoordinate).slice(0);
            var targetArray = <any[]>this._array;
            while (dimensioner.length > 0) {
                targetArray = targetArray[dimensioner.shift()];
            }
            return <number><any>targetArray;
        }
        else
            return undefined;
    }

    setFor(index: number, input: number): Matrix;
    setFor(coordinate: number[], input: number): Matrix;
    setFor(coordinate: any, input: number) {
        AssertHelper.assertParameter(coordinate);
        AssertHelper.assertNumber(input);
        var internalCoordinate: number[] = [];
        if (Array.isArray(coordinate)) {
            internalCoordinate = (<number[]>coordinate).map((i) => {
                return Matrix._getZeroBasedIndex(i);
            });
        }
        else {
            var index = coordinate;
            internalCoordinate = this._getInternalCoordinate(index);
        }

        if (!this._checkInternalCoordinateValidity(internalCoordinate)) {
            this.expandSize(coordinate, 0);
        }

        var dimensioner = (<number[]>internalCoordinate).slice(0);
        var targetArray = <any[]>this._array;
        while (dimensioner.length > 1) {
            targetArray = targetArray[dimensioner.shift()];
        }
        targetArray[dimensioner.shift()] = input;
        return this;
    }

    private static _expandArray(array: any[], targetSize: number[], fill: number) {
        var childSize = targetSize.slice(0);
        childSize.shift();

        if (targetSize.length > 1) {
            for (var i = 0; i < array.length; i++) {
                this._expandArray(array[i], childSize, fill);
            }
            for (var i = array.length; i < targetSize[0]; i++) {
                var childArray: any[] = [];
                this._expandArray(childArray, childSize, fill);
                array.push(childArray);
            }
        }
        else if (targetSize.length == 1) {
            for (var i = array.length; i < targetSize[0]; i++) {
                array.push(fill);
            }
        }
    }

    //should be more efficient
    expandSize(targetSize: number[], fill = 0) {
        var size = this.size;
        AssertHelper.assertArray(targetSize);
        AssertHelper.assert(targetSize.length >= size.length, "Target dimension should be larger than or equal with original dimension");

        if (this.serialSize > 0 && targetSize.length > size.length) {
            var dimensionDifference = targetSize.length - size.length;
            //targetSize[dimensionDifference - 1]--;
            var newArray: any[] = [];
            Matrix._expandArray(newArray, targetSize, fill);
            //AssertHelper.assert(size.length == targetSize.length, "Coordinate dimension is not valid for this matrix.");

            var targetArray = newArray;
            for (var i = 0; i < dimensionDifference - 1; i++) {
                targetArray = <any[]>targetArray[0];
            }
            targetArray[0] = this._array;
            Matrix._expandArray(this._array, targetSize.slice(targetSize.length - size.length), fill);
            this._array = newArray;
        }
        else {
            Matrix._expandArray(this._array, targetSize, fill);
        }
    }

    clone() {
        var items: number[] = [];
        this.forEach((item) => {
            items.push(item);
        });
        return new Matrix(this.columnLength, items);
    }

    map(func: Function, input?: any, ...argArray: any[]) {
        return <Matrix>this.mapFor.apply(this, [func, null, input].concat(argArray));
    }

    mapFor(func: Function, condition: (item: number, coordinate: number[]) => void, input?: any, ...argArray: any[]) {
        if (input != null && input.isMatrix)
            AssertHelper.assert(
                this.columnLength == input.columnLength && this.rowLength == input.rowLength,
                "Dimensions should match each other");

        var newMatrix = this.clone();
        newMatrix.forEach((item, coordinate) => {
            if (!condition || condition(item, coordinate)) {
                if (input == null)
                    newMatrix.setFor(coordinate, func.apply(null, [item]));
                else
                    newMatrix.setFor(coordinate, func.apply(null, [item, input.isMatrix ? (<Matrix>input).getFor(coordinate) : input].concat(argArray)));
            }
        });

        return newMatrix;
    }

    private static _forEach(array: any[], func: (item: number, coordinate: number[]) => void, parentCoordinate: number[], depth: number) {
        if (depth == 1) {
            (<number[]>array).forEach((item, index) => {
                func(item, parentCoordinate.concat(Matrix._getUserFriendlyIndex(index)));
            });
        }
        else if (depth > 1) {
            var shallower = depth - 1;
            (<any[][]>array).forEach((childArray, index) => {
                this._forEach(childArray, func, parentCoordinate.concat(Matrix._getUserFriendlyIndex(index)), shallower);
            });
        }
    }

    forEach(func: (item: number, coordinate: number[]) => void) {
        Matrix._forEach(this._array, func, [], this.dimension);
        //this._array.forEach((rowArray: number[], row: number) => {
        //    rowArray.forEach((item: number, column: number) => {
        //        func(item, [Matrix._getUserFriendlyIndex(row), Matrix._getUserFriendlyIndex(column)]);
        //    });
        //});
    }

    toString() {
        var outputArray: string[] = [];
        for (var row = 0; row < this.rowLength; row++) {
            var strArray: any[] = ['['];
            for (var column = 0; column < this.columnLength; column++)
                strArray.push(this._array[row][column]);
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
                strArray.push(this._array[row][column]);
            outputArray.push(strArray.join(' '));
        }
        return '[' + outputArray.join('; ') + ']';
    }

    static getZeroMatrix(coordinate: number[]) {
        AssertHelper.assertArray(coordinate);
        var newMatrix = new Matrix();
        newMatrix.expandSize(coordinate, 0);
        return newMatrix;
    }

    static getIdentityMatrix(size: number) {
        AssertHelper.assertNumber(size);
        var newMatrix = Matrix.getZeroMatrix([size, size]);
        for (var i = 0; i < size; i++)
            newMatrix._array[i][i] = 1;
        return newMatrix;
    }

    static getLinearSpace(start: number, end: number, pointNumber: number) {
        AssertHelper.assertNumber(start, end, pointNumber);
        AssertHelper.assert(end > start, "End should be larger than start.");
        var newMatrix = new Matrix();
        newMatrix.expandSize([1, pointNumber]);
        var gap = (end - start) / (pointNumber - 1);
        for (var i = 0; i < pointNumber; i++)
            newMatrix._array[0][i] = start + gap * i;
        return newMatrix;
    }

    static getGapSpace(start: number, end: number, gap?: number) {
        AssertHelper.assertNumber(start, end);
        AssertHelper.assert(end > start, "End should be larger than start.");
        if (isNaN(gap))
            gap = 1;
        var newMatrix = new Matrix();
        var length = Math.floor((end - start) / gap) + 1;
        newMatrix.expandSize([1, length]);
        for (var i = 0; i < length; i++)
            newMatrix._array[0][i] = start + gap * i;
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
        AssertHelper.assert(this.columnLength == input.rowLength,
            "Row length of the input matrix should be same with column length of the original one.");
        var newColumnLength = input.columnLength;
        var newItems: number[] = [];
        this._array.forEach((rowArray) => {
            for (var column = 0; column < input.columnLength; column++) {
                var newItem = 0;
                for (var row = 0; row < input.rowLength; row++)
                    newItem += rowArray[row] * input._array[row][column];
                newItems.push(newItem);
            }
        });

        return new Matrix(newColumnLength, newItems);
    }

    transpose() {
        AssertHelper.assert(this.dimension == 2, "Transpose function only supports two-dimensional matrices.");
        var newMatrix = Matrix.getZeroMatrix([this.columnLength, this.rowLength]);
        this.forEach((item, coordinate) => {
            newMatrix.setFor([coordinate[1], coordinate[0]], item);
        });
        return newMatrix;
    }
}