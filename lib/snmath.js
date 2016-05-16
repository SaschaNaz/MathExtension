var SNMath;
(function (SNMath) {
    var AssertHelper;
    (function (AssertHelper) {
        function assertParameter(...parameters) {
            for (const parameter of parameters) {
                AssertHelper.assert(parameter != null, "Argument not optional");
            }
        }
        AssertHelper.assertParameter = assertParameter;
        function assertNumber(...numbers) {
            for (const n of numbers) {
                AssertHelper.assert(n !== undefined, "Argument not optional");
                AssertHelper.assert(!isNaN(n), "Invalid argument.");
            }
        }
        AssertHelper.assertNumber = assertNumber;
        function assertArray(...arrays) {
            for (const array of arrays) {
                AssertHelper.assert(Array.isArray(array), "Invalid argument.");
            }
        }
        AssertHelper.assertArray = assertArray;
        function assert(condition, message) {
            if (!condition) {
                throw new Error(message);
            }
        }
        AssertHelper.assert = assert;
    })(AssertHelper = SNMath.AssertHelper || (SNMath.AssertHelper = {}));
})(SNMath || (SNMath = {}));
var SNMath;
(function (SNMath) {
    function add(x, y) {
        return x + y;
    }
    SNMath.add = add;
    function subtract(x, y) {
        return x - y;
    }
    SNMath.subtract = subtract;
    function multiply(x, y) {
        return x * y;
    }
    SNMath.multiply = multiply;
    function divide(x, y) {
        return x / y;
    }
    SNMath.divide = divide;
    function substitute(x, y) {
        return y;
    }
    SNMath.substitute = substitute;
    function factorial(x) {
        let result = 1;
        for (let i = 1; i <= x; i++)
            result *= i;
        return result;
    }
    SNMath.factorial = factorial;
})(SNMath || (SNMath = {}));
var SNMath;
(function (SNMath) {
    class Matrix {
        constructor(size, items = []) {
            if (!Array.isArray(size)) {
                this.baseArray = [];
                return; // please do nothing, return an empty matrix
            }
            for (let i = 1; i < size.length; i++) {
                if (size[i] === undefined) {
                    throw new Error("Undefined number is allowed only on the highest matrix dimension length.");
                }
            }
            let subchunkSize = 1;
            for (let i = 1; i < size.length; i++) {
                subchunkSize *= size[i];
            }
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
        //static isZeroBased = false;
        static isMatrix(object) {
            //http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
            const funcNameRegex = /function\s+(.{1,})\s*\(/;
            const regexResults = funcNameRegex.exec(object.constructor.toString());
            const result = (regexResults && regexResults.length > 1) ? regexResults[1] : "";
            return result === "Matrix";
        }
        static deserialize() {
        }
        //this implicitly returns NaN if isNaN(i) is true
        static _getZeroBasedIndex(i) {
            //if (Matrix.isZeroBased)
            //    return i;
            //else
            //    return i - 1;
            return i - 1;
        }
        static _getOneBasedIndex(i) {
            //if (Matrix.isZeroBased)
            //    return i;
            //else
            //    return i + 1;
            return i + 1;
        }
        get columnLength() {
            if (this.rowLength > 0) {
                return this.baseArray[0].length;
            }
            else {
                return 0;
            }
        }
        get rowLength() {
            return this.baseArray.length;
        }
        get size() {
            const size = [];
            if (!this.isSizeFixed) {
                let targetArray = this.baseArray;
                while (Array.isArray(targetArray)) {
                    size.push(targetArray.length);
                    targetArray = targetArray[0];
                }
            }
            else {
                const startOffset = this._coordinateStartOffset;
                const endOffset = this._coordinateEndOffset;
                for (let i = 0; i < endOffset.length; i++) {
                    size[i] = endOffset[i] - startOffset[i];
                }
            }
            return size;
        }
        get serialSize() {
            const size = this.size;
            let serial = 1;
            for (const dimensionSize of size) {
                serial *= dimensionSize;
            }
            return serial;
        }
        get dimension() {
            return this.size.length;
        }
        _isValidInternalCoordinate(coordinate) {
            const size = this.size;
            SNMath.AssertHelper.assertArray(coordinate);
            return coordinate.every((n, dimension) => {
                return n < size[dimension] && n >= 0;
            });
        }
        static _getArrayMatrix(size, itemChunk, subchunkLength) {
            //if (subchunkSize === undefined) {
            //    subchunkSize = 1;
            //    for (var i = 1; i < size.length; i++)
            //        subchunkSize *= size[i];
            //}
            if (size.length > 1) {
                const array = [];
                const childSize = size.slice(1);
                const nextSubchunkLength = subchunkLength / childSize[0];
                for (let i = 0; i < size[0]; i++) {
                    const subchunk = itemChunk.slice(subchunkLength * i, subchunkLength * (i + 1));
                    array.push(this._getArrayMatrix(childSize, subchunk, nextSubchunkLength));
                }
                return array; //var nextSubchunkSize = subchunkSize / 
            }
            else {
                itemChunk = itemChunk.slice(0, size[0]);
                if (itemChunk.length < size[0]) {
                    while (itemChunk.length != size[0]) {
                        itemChunk.push(undefined);
                    }
                }
                return itemChunk;
            }
            //for (var i = 0; i < size
        }
        _getZeroBasedCoordinateFromIndex(index) {
            SNMath.AssertHelper.assertNumber(index);
            index = Matrix._getZeroBasedIndex(index);
            const size = this.size;
            const dimension = size.length;
            const coordinate = [];
            let higherIndex = index;
            while (coordinate.length < dimension) {
                const currentDimensionSize = size.pop();
                if (currentDimensionSize > 0) {
                    coordinate.unshift(higherIndex % currentDimensionSize);
                }
                else {
                    coordinate.unshift(higherIndex);
                }
                higherIndex = Math.floor(higherIndex / currentDimensionSize);
            }
            return coordinate;
        }
        _getZeroBasedCoordinate(coordinate) {
            SNMath.AssertHelper.assertParameter(coordinate);
            let internalCoordinate = [];
            if (Array.isArray(coordinate)) {
                internalCoordinate = coordinate.map((n) => Matrix._getZeroBasedIndex(n));
            }
            else {
                const index = coordinate;
                internalCoordinate = this._getZeroBasedCoordinateFromIndex(index);
            }
            return internalCoordinate;
        }
        _getOneBasedCoordinate(coordinate) {
            SNMath.AssertHelper.assertArray(coordinate);
            return coordinate.map(n => Matrix._getOneBasedIndex(n));
        }
        _getBaseArrayCoordinate(coordinate) {
            const startOffset = this.coordinateOffset;
            return coordinate.map((n, dimension) => n + startOffset[dimension]);
        }
        _getSurfaceCoordinate(coordinate) {
            const startOffset = this.coordinateOffset;
            return coordinate.map((n, dimension) => n - startOffset[dimension]);
        }
        get(coordinate) {
            SNMath.AssertHelper.assertParameter(coordinate);
            const zeroBasedCoordinate = this._getZeroBasedCoordinate(coordinate);
            if (this._isValidInternalCoordinate(zeroBasedCoordinate)) {
                const dimensioner = this._getBaseArrayCoordinate(zeroBasedCoordinate).slice();
                let targetArray = this.baseArray;
                while (dimensioner.length > 0) {
                    targetArray = targetArray[dimensioner.shift()];
                }
                return targetArray;
            }
            else
                return undefined;
        }
        set(coordinate, input) {
            SNMath.AssertHelper.assertParameter(coordinate);
            const zeroBasedCoordinate = this._getZeroBasedCoordinate(coordinate);
            if (!this._isValidInternalCoordinate(zeroBasedCoordinate)) {
                if (!this.isSizeFixed) {
                    this.expand(this._getOneBasedCoordinate(zeroBasedCoordinate));
                }
                else {
                    return;
                }
            }
            const dimensioner = this._getBaseArrayCoordinate(zeroBasedCoordinate).slice(0);
            let targetArray = this.baseArray;
            while (dimensioner.length > 1) {
                targetArray = targetArray[dimensioner.shift()];
            }
            targetArray[dimensioner.shift()] = input;
        }
        static _expandArray(array, targetSize, fill) {
            if (targetSize.length > 1) {
                const childSize = targetSize.slice(1);
                for (let i = 0; i < array.length; i++) {
                    this._expandArray(array[i], childSize, fill);
                }
                for (let i = array.length; i < targetSize[0]; i++) {
                    const childArray = [];
                    this._expandArray(childArray, childSize, fill);
                    array.push(childArray);
                }
            }
            else if (targetSize.length == 1) {
                for (let i = array.length; i < targetSize[0]; i++) {
                    array.push(fill);
                }
            }
        }
        //should be more efficient
        expand(targetSize, fill = undefined) {
            SNMath.AssertHelper.assert(!this.isSizeFixed, "Size-fixed matrices including submatrices cannot be expanded. Try cloning those ones.");
            SNMath.AssertHelper.assertArray(targetSize);
            const size = this.size;
            SNMath.AssertHelper.assert(targetSize.length >= size.length, "Target dimension should be larger than or equal with original dimension");
            const finalExpandedSize = this._defineExpandedSize(targetSize);
            if (this.serialSize > 0 && finalExpandedSize.length > size.length) {
                const dimensionDifference = finalExpandedSize.length - size.length;
                //targetSize[dimensionDifference - 1]--;
                const newArray = [];
                Matrix._expandArray(newArray, finalExpandedSize, fill);
                //AssertHelper.assert(size.length == targetSize.length, "Coordinate dimension is not valid for this matrix.");
                let targetArray = newArray;
                for (let i = 0; i < dimensionDifference - 1; i++) {
                    targetArray = targetArray[0];
                }
                targetArray[0] = this.baseArray;
                Matrix._expandArray(this.baseArray, finalExpandedSize.slice(finalExpandedSize.length - size.length), fill);
                this.baseArray = newArray;
            }
            else {
                Matrix._expandArray(this.baseArray, finalExpandedSize, fill);
            }
        }
        _defineExpandedSize(targetSize) {
            const finalSize = targetSize.slice();
            const size = this.size;
            const dimensionDifference = finalSize.length - size.length;
            for (let i = 0; i < finalSize.length - dimensionDifference; i++) {
                if (finalSize[dimensionDifference + i] < size[i]) {
                    finalSize[dimensionDifference + i] = size[i];
                }
            }
            return finalSize;
        }
        clone() {
            const items = [];
            this.forEach(item => items.push(item));
            return new Matrix(this.size, items);
        }
        overwrite(input, offset = new Array(this.size.length).fill(1)) {
            offset = this._getZeroBasedCoordinate(offset);
            const sub = this.size.length - input.size.length;
            if (sub < 0 || this.size.length !== offset.length) {
                throw new Error();
            }
            input.forEach((item, coordinates) => {
                coordinates = offset.map((value, index) => index < sub ? value : value + coordinates[index - sub]);
                this.set(coordinates, item);
            });
            return this;
        }
        static hasSameSize(x, y) {
            const xsize = x.size;
            const ysize = y.size;
            for (let i = 0; i < xsize.length; i++) {
                if (xsize[i] != ysize[i]) {
                    return false;
                }
            }
            return true;
        }
        map(func, input, ...argArray) {
            return this.mapFor(func, null, input, ...argArray);
        }
        mapFor(func, condition, input, ...argArray) {
            if (input != null && Matrix.isMatrix(input))
                SNMath.AssertHelper.assert(Matrix.hasSameSize(this, input), "Dimensions should match each other");
            const newMatrix = this.clone();
            newMatrix.forEach((item, coordinate) => {
                if (!condition || condition(item, coordinate)) {
                    if (input == null)
                        newMatrix.set(coordinate, func(item));
                    else
                        newMatrix.set(coordinate, func(item, Matrix.isMatrix(input) ? input.get(coordinate) : input, ...argArray));
                }
            });
            return newMatrix;
        }
        /*
        2. forEach에서 this.baseArray를 통째로 보내지 말고 coordinateStartOffset과 EndOffset을 이용해 잘라 보내고
        _forEach에서도 마찬가지로 잘라 보낸다
        */
        _forEach(getItem, getDeeper, getSwallower) {
            const stack = [this.baseArray];
            const startOffset = this.coordinateOffset;
            const endOffset = this._coordinateEndOffset || this.size;
            const indices = [];
            let currentIndex = startOffset[0];
            const dimension = this.dimension;
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
        forEach(func) {
            this._forEach((item, coordinate) => { func(item, coordinate, this); });
        }
        toString() {
            const outputArray = ['['];
            this._forEach(item => outputArray.push(item), () => outputArray.push('['), () => outputArray.push(']'));
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
        static getZeroMatrix(coordinate) {
            SNMath.AssertHelper.assertArray(coordinate);
            const newMatrix = new Matrix();
            newMatrix.expand(coordinate, 0);
            return newMatrix;
        }
        static getIdentityMatrix(size) {
            SNMath.AssertHelper.assertNumber(size);
            const newMatrix = Matrix.getZeroMatrix([size, size]);
            for (let i = 0; i < size; i++) {
                newMatrix.baseArray[i][i] = 1;
            }
            return newMatrix;
        }
        static getLinearSpace(start, end, pointNumber) {
            SNMath.AssertHelper.assertNumber(start, end, pointNumber);
            SNMath.AssertHelper.assert(end > start, "End should be larger than start.");
            const newMatrix = new Matrix();
            newMatrix.expand([pointNumber]);
            const gap = (end - start) / (pointNumber - 1);
            for (let i = 0; i < pointNumber; i++) {
                newMatrix.baseArray[i] = start + gap * i;
            }
            return newMatrix;
        }
        static getGapSpace(start, end, gap) {
            SNMath.AssertHelper.assertNumber(start, end);
            SNMath.AssertHelper.assert(end > start, "End should be larger than start.");
            if (isNaN(gap)) {
                gap = 1;
            }
            const newMatrix = new Matrix();
            const length = Math.floor((end - start) / gap) + 1;
            newMatrix.expand([length]);
            for (let i = 0; i < length; i++) {
                newMatrix.baseArray[i] = start + gap * i;
            }
            return newMatrix;
        }
        plus(input) {
            return this.map(SNMath.add, input);
        }
        minus(input) {
            return this.map(SNMath.subtract, input);
        }
        times(input) {
            return this.map(SNMath.multiply, input);
        }
        dividedBy(input) {
            return this.map(SNMath.divide, input);
        }
        powerOf(input) {
            return this.map(Math.pow, input);
        }
        replace(input) {
            return this.map(SNMath.substitute, input);
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
            const newMatrix = new Matrix(this.size.reverse());
            this.forEach((item, coordinate) => {
                newMatrix.set(coordinate.reverse(), item);
            });
            return newMatrix;
        }
        serialize() {
            const serial = [];
            this.forEach((item) => {
                serial.push(item);
            });
            return serial;
        }
        get coordinateOffset() {
            if (this.isSizeFixed) {
                return this._coordinateStartOffset.slice(0);
            }
            else {
                const offset = [];
                const dimension = this.dimension;
                for (let i = 0; i < dimension; i++) {
                    offset.push(0);
                }
                return offset;
            }
        }
        get isSizeFixed() {
            return this._coordinateEndOffset !== undefined;
        }
        //should support sub-dimension matrix (milestone)
        submatrix(start, end) {
            const matrix = new Matrix();
            matrix.baseArray = this.baseArray;
            SNMath.AssertHelper.assertArray(start);
            matrix._coordinateStartOffset = this._defineSnippingCoordinate(this._getZeroBasedCoordinate(start));
            if (Array.isArray(end)) {
                matrix._coordinateEndOffset = this._defineSnippingCoordinate(end); //do not convert end coordinate so that the whole area would include end position in ONE-BASED system.
            }
            else {
                matrix._coordinateEndOffset = this.size.slice();
            }
            return matrix;
        }
        _defineSnippingCoordinate(coordinate) {
            const thisSize = this.size;
            SNMath.AssertHelper.assert(thisSize.length == coordinate.length, "Snipping coordinate's dimension should be same as original one, even if you want to get a sub-dimensional matrix.");
            const proper = coordinate.slice(0);
            for (let i = 0; i < proper.length; i++) {
                if (proper[i] < 0) {
                    proper[i] = thisSize[i] + proper[i];
                    if (proper[i] < 0) {
                        proper[i] = 0;
                    }
                }
                else if (proper[i] > thisSize[i] || proper[i] === undefined) {
                    proper[i] = thisSize[i];
                }
            }
            return proper;
            //process minus number 
            //reduce numbers so that they fit in the current size
        }
    }
    SNMath.Matrix = Matrix;
})(SNMath || (SNMath = {}));
//# sourceMappingURL=snmath.js.map