﻿class Matrix<T> {
    //static isZeroBased = false;
    static isMatrix(object: any) {
        //http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
        var funcNameRegex = /function\s+(.{1,})\s*\(/;
        var regexResults = funcNameRegex.exec(object.constructor.toString());
        var result = (regexResults && regexResults.length > 1) ? regexResults[1] : "";
        return result === "Matrix";
    }

    //this implicitly returns NaN if isNaN(i) is true
    private static _getZeroBasedIndex(i: number) {
        //if (Matrix.isZeroBased)
        //    return i;
        //else
        //    return i - 1;
        return i - 1;
    }

    private static _getOneBasedIndex(i: number) {
        //if (Matrix.isZeroBased)
        //    return i;
        //else
        //    return i + 1;
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
        var size: number[] = [];
        if (!this.isSizeFixed) {
            var targetArray = <any[]>this.baseArray;
            while (Array.isArray(targetArray)) {
                size.push(targetArray.length);
                targetArray = targetArray[0];
            }
        }
        else {
            var startOffset = this._coordinateStartOffset;
            var endOffset = this._coordinateEndOffset;
            for (var i = 0; i < endOffset.length; i++)
                size[i] = endOffset[i] - startOffset[i];
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

    private _isValidInternalCoordinate(coordinate: number[]) {
        var size = this.size;
        AssertHelper.assertArray(coordinate);
        return coordinate.every((n, dimension) => {
            return n < size[dimension] && n >= 0;
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
            if (size[i] === undefined)
                throw new Error("Undefined number is allowed only on the highest matrix dimension length.");
        }

        var subchunkSize = 1;
        for (var i = 1; i < size.length; i++)
            subchunkSize *= size[i];
        if (size[0] === undefined) {
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

    private static _getArrayMatrix<T2>(size: number[], itemChunk: T2[], subchunkLength: number) {
        //if (subchunkSize === undefined) {
        //    subchunkSize = 1;
        //    for (var i = 1; i < size.length; i++)
        //        subchunkSize *= size[i];
        //}
        if (size.length > 1) {
            var array: any[] = [];
            
            var childSize = size.slice(1);
            var nextSubchunkLength = subchunkLength / childSize[0];
            for (var i = 0; i < size[0]; i++) {
                var subchunk = itemChunk.slice(subchunkLength * i, subchunkLength * (i + 1));
                array.push(this._getArrayMatrix(childSize, subchunk, nextSubchunkLength));
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

    private _getZeroBasedCoordinateFromIndex(index: number) {
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

    private _getZeroBasedCoordinate(index: number): number[];
    private _getZeroBasedCoordinate(coordinate: number[]): number[];
    private _getZeroBasedCoordinate(coordinate: any) {
        AssertHelper.assertParameter(coordinate);
        var internalCoordinate: number[] = [];
        if (Array.isArray(coordinate)) {
            internalCoordinate = (<number[]>coordinate).map((n) => Matrix._getZeroBasedIndex(n));
        }
        else {
            var index = coordinate;
            internalCoordinate = this._getZeroBasedCoordinateFromIndex(index);
        }

        return internalCoordinate;
    }

    private _getOneBasedCoordinate(coordinate: number[]) {
        AssertHelper.assertArray(coordinate);
        return coordinate.map((n) => Matrix._getOneBasedIndex(n));
    }

    private _getBaseArrayCoordinate(coordinate: number[]) {
        var startOffset = this.coordinateOffset;
        return coordinate.map((n, dimension) => n + startOffset[dimension]);
    }
    private _getSurfaceCoordinate(coordinate: number[]) {
        var startOffset = this.coordinateOffset;
        return coordinate.map((n, dimension) => n - startOffset[dimension]);
    }

    get(index: number): T;
    get(coordinate: number[]): T;
    get(coordinate: any) {
        AssertHelper.assertParameter(coordinate);
        var zeroBasedCoordinate = this._getZeroBasedCoordinate(coordinate);

        if (this._isValidInternalCoordinate(zeroBasedCoordinate)) {
            var dimensioner = this._getBaseArrayCoordinate(<number[]>zeroBasedCoordinate).slice(0);
            var targetArray = <any[]>this.baseArray;
            while (dimensioner.length > 0) {
                targetArray = targetArray[dimensioner.shift()];
            }
            return <T><any>targetArray;
        }
        else
            return undefined;
    }

    set(index: number, input: T): void;
    set(coordinate: number[], input: T): void;
    set(coordinate: any, input: T) {
        AssertHelper.assertParameter(coordinate);
        var zeroBasedCoordinate = this._getZeroBasedCoordinate(coordinate);

        if (!this._isValidInternalCoordinate(zeroBasedCoordinate)) {
            if (!this.isSizeFixed)
                this.expand(this._getOneBasedCoordinate(zeroBasedCoordinate));
            else
                return;
        }

        var dimensioner = this._getBaseArrayCoordinate(<number[]>zeroBasedCoordinate).slice(0);
        var targetArray = <any[]>this.baseArray;
        while (dimensioner.length > 1) {
            targetArray = targetArray[dimensioner.shift()];
        }
        targetArray[dimensioner.shift()] = input;
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
    expand(targetSize: number[], fill: T = undefined) {
        AssertHelper.assert(!this.isSizeFixed, "Size-fixed matrices including submatrices cannot be expanded. Try cloning those ones.");
        AssertHelper.assertArray(targetSize);
        var size = this.size;
        AssertHelper.assert(targetSize.length >= size.length, "Target dimension should be larger than or equal with original dimension");

        var finalExpandedSize = this._defineExpandedSize(targetSize);

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

    private _defineExpandedSize(targetSize: number[]) {
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

    mapFor(func: Function, condition: (item: number, coordinate: number[]) => boolean, input?: any, ...argArray: any[]) {
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

    /*
    2. forEach에서 this.baseArray를 통째로 보내지 말고 coordinateStartOffset과 EndOffset을 이용해 잘라 보내고
    _forEach에서도 마찬가지로 잘라 보낸다
    */

    private _forEach(getItem: (item: T, coordinate: number[]) => any, getDeeper?: () => any, getSwallower?: () => any) {
        var stack = [this.baseArray];
        var startOffset = this.coordinateOffset;
        var endOffset = this._coordinateEndOffset || this.size;

        var indices: number[] = [];
        var currentIndex = startOffset[0];

        var dimension = this.dimension;
        while (stack.length > 0) {
            if (currentIndex < endOffset[indices.length]) {
                if (stack.length == dimension) {
                    getItem(stack[0][currentIndex], this._getSurfaceCoordinate(this._getOneBasedCoordinate(indices.concat(currentIndex))));
                    currentIndex++;
                }
                else {
                    if (getDeeper)
                        getDeeper();
                    stack.unshift(stack[0][currentIndex]);
                    indices.push(currentIndex);
                    currentIndex = startOffset[indices.length];
                }
            }
            else {
                stack.shift();
                currentIndex = indices.pop() + 1;
                if (getSwallower)
                    getSwallower();
            }
        }
    }

    forEach(func: (item: T, coordinate: number[], matrix: Matrix<T>) => any) {
        this._forEach((item, coordinate) => { func(item, coordinate, this) });
    }

    toString() {
        var outputArray: string[] = ['['];
        this._forEach(
            (item) => { outputArray.push(<any>item) },
            () => { outputArray.push('[') },
            () => { outputArray.push(']') });

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
        var newMatrix = new Matrix(this.size.reverse());
        this.forEach((item, coordinate) => {
            newMatrix.set(coordinate.reverse(), item);
        });
        return newMatrix;
    }

    private _coordinateStartOffset: number[];
    private _coordinateEndOffset: number[];
    get coordinateOffset() {
        if (this.isSizeFixed)
            return this._coordinateStartOffset.slice(0);
        else {
            var offset: number[] = [];
            var dimension = this.dimension;
            for (var i = 0; i < dimension; i++)
                offset.push(0);
            return offset;
        }
    }
    get isSizeFixed() {
        return this._coordinateEndOffset !== undefined;
    }

    //should support sub-dimension matrix (milestone)
    submatrix(start: number[], end?: number[]) {
        var matrix = new Matrix<T>();
        matrix.baseArray = this.baseArray;

        AssertHelper.assertArray(start);
        matrix._coordinateStartOffset = this._defineSnippingCoordinate(this._getZeroBasedCoordinate(start));
        if (Array.isArray(end))
            matrix._coordinateEndOffset = this._defineSnippingCoordinate(end);//do not convert end coordinate so that the whole area would include end position in ONE-BASED system.
        else
            matrix._coordinateEndOffset = this.size.slice(0);

        return matrix;
    }
    private _defineSnippingCoordinate(coordinate: number[]) {
        var thisSize = this.size;
        AssertHelper.assert(thisSize.length == coordinate.length, "Snipping coordinate's dimension should be same as original one, even if you want to get a sub-dimensional matrix.");
        var proper = coordinate.slice(0);
        for (var i = 0; i < proper.length; i++) {
            if (proper[i] < 0) {//processing minus coordinate
                proper[i] = thisSize[i] + proper[i];
                if (proper[i] < 0)//still minus
                    proper[i] = 0;
            }
            else if (proper[i] > thisSize[i] || proper[i] === undefined)
                proper[i] = thisSize[i];
        }
        return proper;
        //process minus number 
        //reduce numbers so that they fit in the current size
    }
}