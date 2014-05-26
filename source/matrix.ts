class Matrix<T> {
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

    baseArray: any[];
    get columnLength() {
        if (this.rowLength > 0)
            return this.baseArray[0].length;
        else
            return 0;
    }
    get rowLength() {
        return this.baseArray.length;
    }
    get size() {
        if (!this.isSizeFixed) {
            var size: number[] = [];
            var targetArray = <any[]>this.baseArray;
            while (Array.isArray(targetArray)) {
                size.push(targetArray.length);
                targetArray = targetArray[0];
            }
            return size;
        }
        else
            return this._snippedSize.slice(0);
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

    private _isValidInternalCoordinate(coordinate: number[]) {
        var size = this.size;
        AssertHelper.assertArray(coordinate);
        return coordinate.every((dimensionIndex, dimension) => {
            return dimensionIndex < size[dimension];
        });
    }

    constructor();
    constructor(size: number[], items?: T[])
    constructor(size?: number[], items: T[] = []) {
        if (!Array.isArray(size)) {
            this.baseArray = [];
            return; // please do nothing, return an empty matrix
        }

        for (var i = 1; i < size.length; i++) {
            if (isNaN(size[i]))
                throw new Error("NaN is allowed only on the highest matrix dimension length.");
        }

        var subchunkSize = 1;
        for (var i = 1; i < size.length; i++)
            subchunkSize *= size[i];
        if (isNaN(size[0])) {
            size = size.slice(0);
            size[0] = Math.ceil(items.length / subchunkSize);
        }
        this.baseArray = Matrix._getArrayMatrix(size, items, subchunkSize);


        ////columnLength is a number
        //AssertHelper.assert(columnLength >= 1, "Column length should be larger than or equal to 1.");
        //AssertHelper.assert(items.length % columnLength == 0, "Invalid number of items");

        ////columnLength >= 1, items exist, items.length % columnLength == 0
        //for (var row = 0; row < items.length / columnLength; row++) {
        //    this._array.push([]);
        //    for (var column = 0; column < columnLength; column++)
        //        this._array[row][column] = items[row * columnLength + column];
        //}
    }

    private static _getArrayMatrix<T2>(size: number[], itemChunk: T2[], subchunkSize: number) {
        //if (subchunkSize === undefined) {
        //    subchunkSize = 1;
        //    for (var i = 1; i < size.length; i++)
        //        subchunkSize *= size[i];
        //}
        if (size.length > 1) {
            var array: any[] = [];
            
            var childSize = size.slice(1);
            var nextSubchunkSize = subchunkSize / size[0];
            for (var i = 0; i < size[0]; i++) {
                var subchunk = itemChunk.slice(subchunkSize * i, subchunkSize * (i + 1));
                array.push(this._getArrayMatrix(childSize, subchunk, nextSubchunkSize));
            }
            return array;//var nextSubchunkSize = subchunkSize / 
        }
        else {
            itemChunk = itemChunk.slice(0, size[0]);
            if (itemChunk.length < size[0]) {
                while (itemChunk.length != size[0])
                    itemChunk.push(undefined);
                
            }
            return itemChunk;
        }
        //for (var i = 0; i < size
    }

    private _getInternalCoordinateFromIndex(index: number) {
        AssertHelper.assertNumber(index);
        index = Matrix._getZeroBasedIndex(index);

        var size = this.size;
        var dimension = size.length;
        var coordinate: number[] = [];
        var higherIndex = index;

        while (coordinate.length < dimension) {
            var currentDimensionSize = size.pop();
            if (currentDimensionSize > 0)
                coordinate.unshift(higherIndex % currentDimensionSize);
            else
                coordinate.unshift(higherIndex);
            higherIndex = Math.floor(higherIndex / currentDimensionSize);
        }

        return coordinate;
    }

    private _getInternalCoordinate(index: number): number[];
    private _getInternalCoordinate(coordinate: number[]): number[];
    private _getInternalCoordinate(coordinate: any) {
        AssertHelper.assertParameter(coordinate);
        var internalCoordinate: number[] = [];
        if (Array.isArray(coordinate)) {
            internalCoordinate = (<number[]>coordinate).map((i) => {
                return Matrix._getZeroBasedIndex(i);
            });
        }
        else {
            var index = coordinate;
            internalCoordinate = this._getInternalCoordinateFromIndex(index);
        }

        return internalCoordinate;
    }

    get(index: number): T;
    get(coordinate: number[]): T;
    get(coordinate: any) {
        AssertHelper.assertParameter(coordinate);
        var internalCoordinate = this._getInternalCoordinate(coordinate);

        if (this._isValidInternalCoordinate(internalCoordinate)) {
            var dimensioner = (<number[]>internalCoordinate).slice(0);
            var targetArray = <any[]>this.baseArray;
            while (dimensioner.length > 0) {
                targetArray = targetArray[dimensioner.shift()];
            }
            return <T><any>targetArray;
        }
        else
            return undefined;
    }

    set(index: number, input: T): Matrix<T>;
    set(coordinate: number[], input: T): Matrix<T>;
    set(coordinate: any, input: T) {
        AssertHelper.assertParameter(coordinate);
        var internalCoordinate = this._getInternalCoordinate(coordinate);

        if (!this._isValidInternalCoordinate(internalCoordinate)) {
            this.expand(internalCoordinate.map((i: number) => { return i + 1 }), undefined);
        }

        var dimensioner = (<number[]>internalCoordinate).slice(0);
        var targetArray = <any[]>this.baseArray;
        while (dimensioner.length > 1) {
            targetArray = targetArray[dimensioner.shift()];
        }
        targetArray[dimensioner.shift()] = input;
        return this;
    }

    private static _expandArray<T2>(array: any[], targetSize: number[], fill: T2) {
        if (targetSize.length > 1) {
            var childSize = targetSize.slice(1);

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
    expand(targetSize: number[], fill?: T) {
        AssertHelper.assert(!this.isSizeFixed, "Size-fixed matrices including submatrices cannot be expanded. Try cloning those ones.");
        AssertHelper.assertArray(targetSize);
        var size = this.size;
        AssertHelper.assert(targetSize.length >= size.length, "Target dimension should be larger than or equal with original dimension");

        var finalExpandedSize = this._getFinalExpandedSize(targetSize);

        if (this.serialSize > 0 && finalExpandedSize.length > size.length) {
            var dimensionDifference = finalExpandedSize.length - size.length;
            //targetSize[dimensionDifference - 1]--;
            var newArray: any[] = [];
            Matrix._expandArray(newArray, finalExpandedSize, fill);
            //AssertHelper.assert(size.length == targetSize.length, "Coordinate dimension is not valid for this matrix.");

            var targetArray = newArray;
            for (var i = 0; i < dimensionDifference - 1; i++) {
                targetArray = <any[]>targetArray[0];
            }
            targetArray[0] = this.baseArray;
            Matrix._expandArray(this.baseArray, finalExpandedSize.slice(finalExpandedSize.length - size.length), fill);
            this.baseArray = newArray;
        }
        else {
            Matrix._expandArray(this.baseArray, finalExpandedSize, fill);
        }
    }

    private _getFinalExpandedSize(targetSize: number[]) {
        var finalSize = targetSize.slice(0);
        var size = this.size;
        var dimensionDifference = finalSize.length - size.length;
        for (var i = 0; i < finalSize.length - dimensionDifference; i++)
            if (finalSize[dimensionDifference + i] < size[i])
                finalSize[dimensionDifference + i] = size[i];
        return finalSize;
    }

    clone() {
        var items: T[] = [];
        this.forEach((item) => {
            items.push(item);
        });
        return new Matrix(this.size, items);
    }

    static isSameSize(x: Matrix<any>, y: Matrix<any>) {
        var xsize = x.size;
        var ysize = y.size;
        for (var i = 0; i < xsize.length; i++) {
            if (xsize[i] != ysize[i])
                return false;
        }
        return true;
    }

    map(func: Function, input?: any, ...argArray: any[]) {
        return <Matrix<T>>this.mapFor.apply(this, [func, null, input].concat(argArray));
    }

    mapFor(func: Function, condition: (item: number, coordinate: number[]) => void, input?: any, ...argArray: any[]) {
        if (input != null && Matrix.isMatrix(input))
            AssertHelper.assert(Matrix.isSameSize(this, input), "Dimensions should match each other");

        var newMatrix = this.clone();
        newMatrix.forEach((item, coordinate) => {
            if (!condition || condition(item, coordinate)) {
                if (input == null)
                    newMatrix.set(coordinate, func.apply(null, [item]));
                else
                    newMatrix.set(coordinate, func.apply(null, [item, Matrix.isMatrix(input) ? (<Matrix<T>>input).get(coordinate) : input].concat(argArray)));
            }
        });

        return newMatrix;
    }

    private static _forEach<T2>(array: any[], func: (item: T2, coordinate: number[]) => void, parentCoordinate: number[], depth: number) {
        if (depth == 1) {
            (<T2[]>array).forEach((item, index) => {
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

    forEach(func: (item: T, coordinate: number[]) => void) {
        //var stack = [this._array];
        //var indexes = [0];

        //var dimension = this.dimension;
        //while (stack.length > 0) {
        //    if (indexes[0] < stack[0].length) {
        //        if (stack.length == dimension) {
        //            outputArray.push(stack[0][indexes[0]]);
        //            indexes[0]++;
        //        }
        //        else {
        //            outputArray.push('[');
        //            stack.unshift(stack[0][indexes[0]]);
        //            indexes[0]++;
        //            indexes.unshift(0);
        //        }
        //    }
        //    else {
        //        stack.shift();
        //        indexes.shift();
        //    }
        //}

        Matrix._forEach(this.baseArray, func, [], this.dimension);
    }

    toString() {
        var outputArray: string[] = ['['];
        var stack = [this.baseArray];
        var indexes = [0];

        var dimension = this.dimension;
        while (stack.length > 0) {
            if (indexes[0] < stack[0].length) {
                if (stack.length == dimension) {
                    outputArray.push(stack[0][indexes[0]]);
                    indexes[0]++;
                }
                else {
                    outputArray.push('[');
                    stack.unshift(stack[0][indexes[0]]);
                    indexes[0]++;
                    indexes.unshift(0);
                }
            }
            else {
                stack.shift();
                indexes.shift();
                outputArray.push(']');
            }
        }

        return outputArray.join(' ');
    }

    //toMatlabString() {
    //    var outputArray: string[] = [];
    //    for (var row = 0; row < this.rowLength; row++) {
    //        var strArray: any[] = [];
    //        for (var column = 0; column < this.columnLength; column++)
    //            strArray.push(this._array[row][column]);
    //        outputArray.push(strArray.join(' '));
    //    }
    //    return '[' + outputArray.join('; ') + ']';
    //}

    static getZeroMatrix(coordinate: number[]) {
        AssertHelper.assertArray(coordinate);
        var newMatrix = new Matrix();
        newMatrix.expand(coordinate, 0);
        return newMatrix;
    }

    static getIdentityMatrix(size: number) {
        AssertHelper.assertNumber(size);
        var newMatrix = Matrix.getZeroMatrix([size, size]);
        for (var i = 0; i < size; i++)
            newMatrix.baseArray[i][i] = 1;
        return newMatrix;
    }

    static getLinearSpace(start: number, end: number, pointNumber: number) {
        AssertHelper.assertNumber(start, end, pointNumber);
        AssertHelper.assert(end > start, "End should be larger than start.");
        var newMatrix = new Matrix();
        newMatrix.expand([pointNumber]);
        var gap = (end - start) / (pointNumber - 1);
        for (var i = 0; i < pointNumber; i++)
            newMatrix.baseArray[i] = start + gap * i;
        return newMatrix;
    }

    static getGapSpace(start: number, end: number, gap?: number) {
        AssertHelper.assertNumber(start, end);
        AssertHelper.assert(end > start, "End should be larger than start.");
        if (isNaN(gap))
            gap = 1;
        var newMatrix = new Matrix();
        var length = Math.floor((end - start) / gap) + 1;
        newMatrix.expand([length]);
        for (var i = 0; i < length; i++)
            newMatrix.baseArray[i] = start + gap * i;
        return newMatrix;
    }

    plus(input: T): Matrix<T>;
    plus(input: Matrix<T>): Matrix<T>;
    plus(input: any) {
        return this.map(Math.add, input);
    }

    minus(input: T): Matrix<T>;
    minus(input: Matrix<T>): Matrix<T>;
    minus(input: any) {
        return this.map(Math.subtract, input);
    }

    times(input: T): Matrix<T>;
    times(input: Matrix<T>): Matrix<T>;
    times(input: any) {
        return this.map(Math.multiply, input);
    }

    dividedBy(input: T): Matrix<T>;
    dividedBy(input: Matrix<T>): Matrix<T>;
    dividedBy(input: any) {
        return this.map(Math.divide, input);
    }

    powerOf(input: T): Matrix<T>;
    powerOf(input: Matrix<T>): Matrix<T>;
    powerOf(input: any) {
        return this.map(Math.pow, input);
    }

    replace(input: T): Matrix<T>;
    replace(input: Matrix<T>): Matrix<T>;
    replace(input: any) {
        return this.map(Math.substitute, input);
    }

    /*
    Two-dimensional matrices multiply: column-row x row-column
    Multi-dimensional matrices might be able to be multiplied as: (1)dim-(2)dim-...-(n)dim x (n)dim-(n-1)dim-...-(1)dim
    */
    //matrixMultiply(input: Matrix<T>) {
    //    var thisSize = this.size;
    //    var inputSize = input.size;
    //    AssertHelper.assert(thisSize.length == inputSize.length,
    //        "Transpose function only supports two-dimensional matrices.");
    //    for (var i = 0; i < thisSize.length; i++)
    //        AssertHelper.assert(thisSize[i] == inputSize[inputSize.length - i - 1],
    //            "(i)dimensional length of original matrix should match (n-i)dimensional length of input matrix.");

    //    //AssertHelper.assert(thisSize[1] == inputSize[0],
    //    //    "Row length of the input matrix should be same with column length of the original one.");
    //    //var newColumnLength = inputSize[1];
    //    //var newItems: number[] = [];
    //    //this._array.forEach((rowArray) => {
    //    //    for (var column = 0; column < input.columnLength; column++) {
    //    //        var newItem = 0;
    //    //        for (var row = 0; row < input.rowLength; row++)
    //    //            newItem += rowArray[row] * input._array[row][column];
    //    //        newItems.push(newItem);
    //    //    }
    //    //});

    //    return new Matrix(newColumnLength, newItems);
    //}

    //private static _matrixMultiply<T>(x: Matrix<T>, y: Matrix<T>) {
    //    if (x.dimension
    //}

    transpose() {
        AssertHelper.assert(this.dimension == 2, "Transpose function only supports two-dimensional matrices.");
        var newMatrix = Matrix.getZeroMatrix([this.columnLength, this.rowLength]);
        this.forEach((item, coordinate) => {
            newMatrix.set([coordinate[1], coordinate[0]], item);
        });
        return newMatrix;
    }

    coordinateOffset: number[];
    get isSizeFixed() {
        return this._snippedSize !== undefined;
    }
    private _snippedSize: number[];

    //should support sub-dimension matrix (milestone)
    submatrix(begin: number[], end?: number[]) {
        var matrix = new Matrix();
        matrix.baseArray = this.baseArray;

        AssertHelper.assertArray(begin);
        matrix.coordinateOffset = this._getProperSnippingCoordinate(begin);

        var resultSize: number[] = [];
        var resultingEnd: number[];
        if (Array.isArray(end))
            resultingEnd = this._getProperSnippingCoordinate(end);
        else
            resultingEnd = this.size;

        for (var i = 0; i < resultingEnd.length; i++)
            resultSize[i] = resultingEnd[i] - begin[i];

        matrix._snippedSize = resultSize;
        matrix.isSizeFixed = true;
        return matrix;
    }
    private _getProperSnippingCoordinate(coordinate: number[]) {
        var thisSize = this.size;
        AssertHelper.assert(thisSize.length == coordinate.length, "Snipping coordinate's dimension should be same as original one, even if you want to get a sub-dimensional matrix.");
        var proper = coordinate.slice(0);
        for (var i = 0; i < proper.length; i++) {
            if (proper[i] < 0) {//processing minus coordinate
                proper[i] = thisSize[i] + proper[i];
                if (proper[i] < 0)//still minus
                    proper[i] = 0;
            }
            else if (proper[i] > thisSize[i])
                proper[i] = thisSize[i];
            else if (isNaN(proper[i]))
                proper[i] = 0;
        }
        return proper;
        //process minus number 
        //reduce numbers so that they fit in the current size
    }
}