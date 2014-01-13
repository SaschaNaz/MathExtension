var Matrix = (function () {
    function Matrix(columnLength, items) {
        if (!(columnLength >= 1))
            throw new Error("Column length should be larger than or equal to 1.");
        if (items.length == 0)
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
    Object.defineProperty(Matrix.prototype, "isMatrix", {
        get: function () {
            return !!this.columnLength && !!this.rowLength;
        },
        enumerable: true,
        configurable: true
    });

    Matrix.prototype.getInternalIndex = function (i) {
        if (Matrix.zeroBased)
            return i;
        else if (i <= 0)
            throw new Error("Index should be larger than 0");
        else
            return i - 1;
    };

    Object.defineProperty(Matrix.prototype, "columnLength", {
        get: function () {
            return this.array[0].length;
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
            var index = this.getInternalIndex(i1);
            column = index % this.columnLength;
            row = (index - column) / this.columnLength;
        } else {
            row = this.getInternalIndex(i1);
            column = this.getInternalIndex(i2);
        }
        return this.array[row][column];
    };

    Matrix.prototype.setFor = function (i1, i2, i3) {
        var row;
        var column;
        var input;
        if (i3 === undefined) {
            var index = this.getInternalIndex(i1);
            column = index % this.columnLength;
            row = (index - column) / this.columnLength;
            input = i2;
        } else {
            row = this.getInternalIndex(i1);
            column = this.getInternalIndex(i2);
            input = i3;
        }

        this.array[row][column] = input;
        return this;
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
        if (input.isMatrix && (this.columnLength !== input.columnLength || this.rowLength !== input.rowLength))
            throw new Error("Dimensions should match each other");

        var newMatrix = this.clone();
        for (var row = 0; row < newMatrix.rowLength; row++) {
            for (var column = 0; column < newMatrix.columnLength; column++) {
                var item = newMatrix.array[row][column];
                if (!condition || condition(item))
                    newMatrix.array[row][column] = func.apply(null, [item, input.isMatrix ? input.array[row][column] : input].concat(argArray));
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
        return outputArray.join('\r\n');
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
    Matrix.zeroBased = false;
    return Matrix;
})();
//# sourceMappingURL=app.js.map
