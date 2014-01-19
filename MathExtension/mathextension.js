var AssertHelper = (function () {
    function AssertHelper() {
    }
    AssertHelper.assertParameter = function () {
        var parameters = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            parameters[_i] = arguments[_i + 0];
        }
        parameters.forEach(function (p) {
            AssertHelper.assert(p != null, "Argument not optional");
        });
    };

    AssertHelper.assertNumber = function () {
        var numbers = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            numbers[_i] = arguments[_i + 0];
        }
        numbers.forEach(function (n) {
            AssertHelper.assert(n !== undefined, "Argument not optional");
            AssertHelper.assert(!isNaN(n), "Invalid argument.");
        });
    };

    AssertHelper.assertArray = function () {
        var arrays = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            arrays[_i] = arguments[_i + 0];
        }
        arrays.forEach(function (array) {
            AssertHelper.assert(Array.isArray(array), "Invalid argument.");
        });
    };

    AssertHelper.assert = function (condition, message) {
        if (!condition)
            throw new Error(message);
    };
    return AssertHelper;
})();
var Matrix = (function () {
    function Matrix(columnLength, items) {
        this.array = [];
        if (columnLength === undefined)
            return;

        AssertHelper.assertNumber(columnLength);
        AssertHelper.assert(Array.isArray(items) && items.length > 0, "Items are required to make a matrix.");
        if (columnLength == null)
            columnLength = Number(items.length); // giving dynamic length

        //columnLength is a number
        AssertHelper.assert(columnLength >= 1, "Column length should be larger than or equal to 1.");
        AssertHelper.assert(items.length % columnLength == 0, "Invalid number of items");

        for (var row = 0; row < items.length / columnLength; row++) {
            this.array.push([]);
            for (var column = 0; column < columnLength; column++)
                this.array[row][column] = items[row * columnLength + column];
        }
    }
    Matrix.isMatrix = function (object) {
        //http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
        var funcNameRegex = /function\s+(.{1,})\s*\(/;
        var regexResults = funcNameRegex.exec(object.constructor.toString());
        var result = (regexResults && regexResults.length > 1) ? regexResults[1] : "";
        return result === "Matrix";
    };

    //this implicitly returns NaN if isNaN(i) is true
    Matrix.getZeroBasedIndex = function (i) {
        if (Matrix.isZeroBased)
            return i;
        else
            return i - 1;
    };

    Matrix.getUserFriendlyIndex = function (i) {
        if (Matrix.isZeroBased)
            return i;
        else
            return i + 1;
    };

    Object.defineProperty(Matrix.prototype, "columnLength", {
        get: function () {
            if (this.rowLength > 0)
                return this.array[0].length;
            else
                return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "rowLength", {
        get: function () {
            return this.array.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "size", {
        get: function () {
            var size = [];
            var targetArray = this.array;
            while (Array.isArray(targetArray)) {
                size.push(targetArray.length);
                targetArray = targetArray[0];
            }
            return size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "serialSize", {
        get: function () {
            var size = this.size;
            var serial = 1;
            size.forEach(function (dimensionSize) {
                serial *= dimensionSize;
            });
            return serial;
        },
        enumerable: true,
        configurable: true
    });
    Matrix.prototype.checkInternalCoordinateValidity = function (coordinate) {
        var size = this.size;
        AssertHelper.assertArray(coordinate);
        AssertHelper.assert(coordinate.length == size.length, "Coordinate dimension is not valid for this matrix.");
        var validity = true;
        return coordinate.every(function (dimensionIndex, dimension) {
            return dimensionIndex < size[dimension];
        });
    };

    Matrix.prototype.getInternalCoordinate = function (index) {
        var row;
        var column;
        index = Matrix.getZeroBasedIndex(index);
        if (this.columnLength > 0) {
            column = index % this.columnLength;
            row = (index - column) / this.columnLength;
        } else {
            column = index;
            row = 0;
        }
        return [row, column];
    };

    Matrix.prototype.getFor = function (coordinate) {
        AssertHelper.assertParameter(coordinate);
        var internalCoordinate = [];
        if (Array.isArray(coordinate) && coordinate.length >= 2) {
            internalCoordinate = coordinate.map(function (i) {
                return Matrix.getZeroBasedIndex(i);
            });
        } else {
            var index = coordinate;
            internalCoordinate = this.getInternalCoordinate(index);
        }

        if (this.checkInternalCoordinateValidity(internalCoordinate)) {
            var dimensioner = internalCoordinate.slice(0);
            var targetArray = this.array;
            while (dimensioner.length > 0) {
                targetArray = targetArray[dimensioner.shift()];
            }
            return targetArray;
        } else
            return undefined;
    };

    Matrix.prototype.setFor = function (coordinate, input) {
        AssertHelper.assertParameter(coordinate);
        var internalCoordinate = [];
        if (Array.isArray(coordinate) && coordinate.length >= 2) {
            internalCoordinate = coordinate.map(function (i) {
                return Matrix.getZeroBasedIndex(i);
            });
        } else {
            var index = coordinate;
            internalCoordinate = this.getInternalCoordinate(index);
        }

        if (this.checkInternalCoordinateValidity(internalCoordinate)) {
            //expand
        }

        var dimensioner = internalCoordinate.slice(0);
        var targetArray = this.array;
        while (dimensioner.length > 1) {
            targetArray = targetArray[dimensioner.shift()];
        }
        targetArray[dimensioner.shift()] = input;
        return this;
    };

    Matrix.prototype.expandRow = function (rowLength) {
        AssertHelper.assert(this.rowLength < rowLength, "columnLength is already large enough to expand.");
        while (this.array.length < rowLength) {
            var rowArray = [];
            while (rowArray.length < this.columnLength) {
                rowArray.push(0);
            }
            this.array.push(rowArray);
        }
    };

    Matrix.prototype.expandColumn = function (columnLength) {
        AssertHelper.assert(this.columnLength < columnLength, "columnLength is already large enough to expand.");
        this.array.forEach(function (rowArray) {
            while (rowArray.length < columnLength) {
                rowArray.push(0);
            }
        });
    };

    Matrix.expandArray = function (array, targetSize, fill) {
        var isChildToExpanded = targetSize.length > 1;
        var childSize = targetSize.slice(0);
        childSize.shift();

        if (targetSize.length > 1) {
            for (var i = 0; i < array.length; i++) {
                this.expandArray(array[i], childSize, fill);
            }
            for (var i = array.length; i < targetSize[0]; i++) {
                var childArray = [];
                this.expandArray(childArray, childSize, fill);
                array.push(childArray);
            }
        } else if (targetSize.length == 1) {
            for (var i = array.length; i < targetSize[0]; i++) {
                array.push(fill);
            }
        }
    };

    //should be more efficient
    Matrix.prototype.expandSize = function (targetSize, fill) {
        if (typeof fill === "undefined") { fill = 0; }
        var size = this.size;
        AssertHelper.assertArray(targetSize);
        AssertHelper.assert(targetSize.length >= size.length, "Target dimension should be larger than or equal with original dimension");

        if (this.serialSize > 0 && targetSize.length > size.length) {
            var dimensionDifference = targetSize.length - size.length;

            //targetSize[dimensionDifference - 1]--;
            var newArray = [];
            Matrix.expandArray(newArray, targetSize, fill);

            //AssertHelper.assert(size.length == targetSize.length, "Coordinate dimension is not valid for this matrix.");
            var targetArray = newArray;
            for (var i = 0; i < dimensionDifference - 1; i++) {
                targetArray = targetArray[0];
            }
            targetArray[0] = this.array;
            Matrix.expandArray(this.array, targetSize.slice(targetSize.length - size.length), fill);
            this.array = newArray;
        } else {
            Matrix.expandArray(this.array, targetSize, fill);
        }
    };

    Matrix.prototype.clone = function () {
        var items = [];
        this.forEach(function (item) {
            items.push(item);
        });
        return new Matrix(this.columnLength, items);
    };

    Matrix.prototype.map = function (func, input) {
        var argArray = [];
        for (var _i = 0; _i < (arguments.length - 2); _i++) {
            argArray[_i] = arguments[_i + 2];
        }
        return this.mapFor.apply(this, [func, null, input].concat(argArray));
    };

    Matrix.prototype.mapFor = function (func, condition, input) {
        var argArray = [];
        for (var _i = 0; _i < (arguments.length - 3); _i++) {
            argArray[_i] = arguments[_i + 3];
        }
        if (input != null && input.isMatrix)
            AssertHelper.assert(this.columnLength == input.columnLength && this.rowLength == input.rowLength, "Dimensions should match each other");

        var newMatrix = this.clone();
        newMatrix.forEach(function (item, row, column) {
            if (!condition || condition(item, row, column)) {
                if (input == null)
                    newMatrix.setFor([row, column], func.apply(null, [item]));
                else
                    newMatrix.setFor([row, column], func.apply(null, [item, input.isMatrix ? input.getFor([row, column]) : input].concat(argArray)));
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
    };

    Matrix.prototype.forEach = function (func) {
        this.array.forEach(function (rowArray, row) {
            rowArray.forEach(function (item, column) {
                func(item, Matrix.getUserFriendlyIndex(row), Matrix.getUserFriendlyIndex(column));
            });
        });
    };

    Matrix.prototype.toString = function () {
        var outputArray = [];
        for (var row = 0; row < this.rowLength; row++) {
            var strArray = ['['];
            for (var column = 0; column < this.columnLength; column++)
                strArray.push(this.array[row][column]);
            strArray.push(']');
            outputArray.push(strArray.join(' '));
        }
        if (outputArray.length > 0)
            return outputArray.join('\r\n');
        else
            return "(Empty matrix)";
    };

    Matrix.prototype.toMatlabString = function () {
        var outputArray = [];
        for (var row = 0; row < this.rowLength; row++) {
            var strArray = [];
            for (var column = 0; column < this.columnLength; column++)
                strArray.push(this.array[row][column]);
            outputArray.push(strArray.join(' '));
        }
        return '[' + outputArray.join('; ') + ']';
    };

    Matrix.getZeroMatrix = function (coordinate) {
        AssertHelper.assertArray(coordinate);
        var newMatrix = new Matrix();
        newMatrix.expandSize(coordinate, 0);
        return newMatrix;
    };

    Matrix.getIdentityMatrix = function (size) {
        AssertHelper.assertNumber(size);
        var newMatrix = new Matrix();
        newMatrix.expandRow(size);
        newMatrix.expandColumn(size);
        for (var i = 0; i < size; i++)
            newMatrix.array[i][i] = 1;
        return newMatrix;
    };

    Matrix.getLinearSpace = function (start, end, pointNumber) {
        AssertHelper.assertNumber(start, end, pointNumber);
        AssertHelper.assert(end > start, "End should be larger than start.");
        var newMatrix = new Matrix();
        newMatrix.expandRow(1);
        newMatrix.expandColumn(pointNumber);
        var gap = (end - start) / (pointNumber - 1);
        for (var i = 0; i < pointNumber; i++)
            newMatrix.array[0][i] = start + gap * i;
        return newMatrix;
    };

    Matrix.getGapSpace = function (start, end, gap) {
        AssertHelper.assertNumber(start, end);
        AssertHelper.assert(end > start, "End should be larger than start.");
        if (isNaN(gap))
            gap = 1;
        var newMatrix = new Matrix();
        var length = Math.floor((end - start) / gap) + 1;
        newMatrix.expandRow(1);
        newMatrix.expandColumn(length);
        for (var i = 0; i < length; i++)
            newMatrix.array[0][i] = start + gap * i;
        return newMatrix;
    };

    Matrix.prototype.plus = function (input) {
        return this.map(Math.add, input);
    };

    Matrix.prototype.minus = function (input) {
        return this.map(Math.subtract, input);
    };

    Matrix.prototype.times = function (input) {
        return this.map(Math.multiply, input);
    };

    Matrix.prototype.dividedBy = function (input) {
        return this.map(Math.divide, input);
    };

    Matrix.prototype.powerOf = function (input) {
        return this.map(Math.pow, input);
    };

    Matrix.prototype.replace = function (input) {
        return this.map(Math.substitute, input);
    };

    Matrix.prototype.matrixMultiply = function (input) {
        AssertHelper.assert(this.columnLength == input.rowLength, "Row length of the input matrix should be same with column length of the original one.");
        var newColumnLength = input.columnLength;
        var newItems = [];
        this.array.forEach(function (rowArray) {
            for (var column = 0; column < input.columnLength; column++) {
                var newItem = 0;
                for (var row = 0; row < input.rowLength; row++)
                    newItem += rowArray[row] * input.array[row][column];
                newItems.push(newItem);
            }
        });

        return new Matrix(newColumnLength, newItems);
    };

    Matrix.prototype.transpose = function () {
        var newMatrix = Matrix.getZeroMatrix([this.columnLength, this.rowLength]);
        this.forEach(function (i, r, c) {
            newMatrix.setFor([c, r], i);
        });
        return newMatrix;
    };
    Matrix.isZeroBased = false;
    return Matrix;
})();
Math.add = function (x, y) {
    return x + y;
};

Math.subtract = function (x, y) {
    return x - y;
};

Math.multiply = function (x, y) {
    return x * y;
};

Math.divide = function (x, y) {
    return x / y;
};

Math.substitute = function (x, y) {
    return y;
};

Math.factorial = function (x) {
    var result = 1;
    for (var i = 1; i <= x; i++)
        result *= i;
    return result;
};
//# sourceMappingURL=mathextension.js.map
