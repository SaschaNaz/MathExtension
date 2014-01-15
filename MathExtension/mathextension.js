var Matrix = (function () {
    function Matrix(columnLength, items) {
        this.array = [];
        if (!isNaN(columnLength))
            columnLength = Number(columnLength);
        if (items && !isNaN(items.length))
            columnLength = Number(items.length);

        if (!isNaN(columnLength)) {
            //columnLength now is really number
            if (columnLength < 1)
                throw new Error("Column length should be larger than or equal to 1.");
            if (items.length == 0)
                throw new Error("Items are required to make a matrix.");
            if (items.length % columnLength != 0)
                throw new Error("Invalid number of items");

            for (var row = 0; row < items.length / columnLength; row++) {
                this.array.push([]);
                for (var column = 0; column < columnLength; column++)
                    this.array[row][column] = items[row * columnLength + column];
            }
        }
    }
    Object.defineProperty(Matrix.prototype, "isMatrix", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });

    Matrix.assertParameter = function () {
        var parameters = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            parameters[_i] = arguments[_i + 0];
        }
        parameters.forEach(function (p) {
            Matrix.assert(p != null, "Argument not optional");
        });
    };

    Matrix.assertNumber = function () {
        var numbers = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            numbers[_i] = arguments[_i + 0];
        }
        numbers.forEach(function (n) {
            Matrix.assert(n !== undefined, "Argument not optional");
            Matrix.assert(!isNaN(n), "Invalid argument.");
        });
    };

    Matrix.assert = function (condition, message) {
        if (!condition)
            throw new Error(message);
    };

    Matrix.getInternalIndex = function (i) {
        if (Matrix.zeroBased)
            return i;
        else if (i <= 0)
            throw new Error("Index should be larger than 0");
        else
            return i - 1;
    };
    Matrix.getExternalIndex = function (i) {
        if (Matrix.zeroBased)
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

    Matrix.prototype.getFor = function (i1, i2) {
        var row;
        var column;
        if (i2 === undefined) {
            var index = Matrix.getInternalIndex(i1);
            if (this.columnLength > 0) {
                column = index % this.columnLength;
                row = (index - column) / this.columnLength;
            } else {
                column = index;
                row = 0;
            }
        } else {
            row = Matrix.getInternalIndex(i1);
            column = Matrix.getInternalIndex(i2);
        }
        return this.array[row][column];
    };

    Matrix.prototype.setFor = function (i1, i2, i3) {
        var row;
        var column;
        var input;
        if (i3 === undefined) {
            var index = Matrix.getInternalIndex(i1);
            if (this.columnLength > 0) {
                column = index % this.columnLength;
                row = (index - column) / this.columnLength;
            } else {
                column = index;
                row = 0;
            }
            input = i2;
        } else {
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
    };

    Matrix.prototype.expandRow = function (rowLength) {
        if (this.rowLength < rowLength) {
            while (this.array.length < rowLength) {
                var rowArray = [];
                while (rowArray.length < this.columnLength) {
                    rowArray.push(0);
                }
                this.array.push(rowArray);
            }
        } else
            throw new Error("columnLength is already large enough to expand.");
    };

    Matrix.prototype.expandColumn = function (columnLength) {
        if (this.columnLength < columnLength) {
            this.array.forEach(function (rowArray) {
                while (rowArray.length < columnLength) {
                    rowArray.push(0);
                }
            });
        } else
            throw new Error("columnLength is already large enough to expand.");
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
        if (input != null && input.isMatrix && (this.columnLength !== input.columnLength || this.rowLength !== input.rowLength))
            throw new Error("Dimensions should match each other");

        var newMatrix = this.clone();
        for (var row = 0; row < newMatrix.rowLength; row++) {
            for (var column = 0; column < newMatrix.columnLength; column++) {
                var item = newMatrix.array[row][column];
                if (!condition || condition(item, Matrix.getExternalIndex(row), Matrix.getExternalIndex(column))) {
                    if (input == null)
                        newMatrix.array[row][column] = func.apply(null, [item]);
                    else
                        newMatrix.array[row][column] = func.apply(null, [item, input.isMatrix ? input.array[row][column] : input].concat(argArray));
                }
            }
        }
        return newMatrix;
    };

    Matrix.prototype.forEach = function (func) {
        this.array.forEach(function (row) {
            row.forEach(function (item) {
                func(item);
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

    Matrix.getZeroMatrix = function (rowLength, columnLength) {
        Matrix.assertNumber(rowLength);
        var newMatrix = new Matrix();
        if (!isNaN(columnLength)) {
            newMatrix.expandRow(rowLength);
            newMatrix.expandColumn(columnLength);
        } else {
            columnLength = rowLength;
            newMatrix.expandRow(1);
            newMatrix.expandColumn(columnLength);
        }
        return newMatrix;
    };

    Matrix.getIdentityMatrix = function (size) {
        Matrix.assertNumber(size);
        var newMatrix = new Matrix();
        newMatrix.expandRow(size);
        newMatrix.expandColumn(size);
        for (var i = 0; i < size; i++)
            newMatrix.array[i][i] = 1;
        return newMatrix;
    };

    Matrix.getLinearSpace = function (start, end, pointNumber) {
        Matrix.assertNumber(start, end, pointNumber);
        Matrix.assert(end > start, "End should be larger than start.");
        var newMatrix = new Matrix();
        newMatrix.expandRow(1);
        newMatrix.expandColumn(pointNumber);
        var gap = (end - start) / (pointNumber - 1);
        for (var i = 0; i < pointNumber; i++)
            newMatrix.array[0][i] = start + gap * i;
        return newMatrix;
    };

    Matrix.getGapSpace = function (start, end, gap) {
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
    };

    Matrix.prototype.plus = function (input) {
        return this.map(Matrix.add, input);
    };

    Matrix.prototype.minus = function (input) {
        return this.map(Matrix.subtract, input);
    };

    Matrix.prototype.times = function (input) {
        return this.map(Matrix.multiply, input);
    };

    Matrix.prototype.dividedBy = function (input) {
        return this.map(Matrix.divide, input);
    };

    Matrix.prototype.replace = function (input) {
        return this.map(Matrix.substitute, input);
    };

    Matrix.add = function (item, input) {
        return item + input;
    };

    Matrix.subtract = function (item, input) {
        return item - input;
    };

    Matrix.multiply = function (item, input) {
        return item * input;
    };

    Matrix.divide = function (item, input) {
        return item / input;
    };

    Matrix.substitute = function (item, input) {
        return input;
    };

    Matrix.prototype.matrixMultiply = function (input) {
        if (this.columnLength != input.rowLength)
            throw new Error("Row length of the input matrix should be same with column length of the original one.");
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
    Matrix.zeroBased = false;
    return Matrix;
})();
//# sourceMappingURL=mathextension.js.map
