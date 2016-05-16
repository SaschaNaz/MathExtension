declare namespace SNMath.AssertHelper {
    function assertParameter(...parameters: any[]): void;
    function assertNumber(...numbers: number[]): void;
    function assertArray(...arrays: any[][]): void;
    function assert(condition: boolean, message: string): void;
}
declare namespace SNMath {
    function add(x: number, y: number): number;
    function subtract(x: number, y: number): number;
    function multiply(x: number, y: number): number;
    function divide(x: number, y: number): number;
    function substitute(x: number, y: number): number;
    function factorial(x: number): number;
}
declare namespace SNMath {
    class Matrix<T> {
        static isMatrix(object: any): object is Matrix<any>;
        static deserialize(): void;
        private static _getZeroBasedIndex(i);
        private static _getOneBasedIndex(i);
        baseArray: any[];
        columnLength: any;
        rowLength: number;
        size: number[];
        serialSize: number;
        dimension: number;
        private _isValidInternalCoordinate(coordinate);
        constructor();
        constructor(size: number[], items?: T[]);
        private static _getArrayMatrix<T2>(size, itemChunk, subchunkLength);
        private _getZeroBasedCoordinateFromIndex(index);
        private _getZeroBasedCoordinate(index);
        private _getZeroBasedCoordinate(coordinate);
        private _getOneBasedCoordinate(coordinate);
        private _getBaseArrayCoordinate(coordinate);
        private _getSurfaceCoordinate(coordinate);
        get(index: number): T;
        get(coordinate: number[]): T;
        set(index: number, input: T): void;
        set(coordinate: number[], input: T): void;
        private static _expandArray<T2>(array, targetSize, fill);
        expand(targetSize: number[], fill?: T): void;
        private _defineExpandedSize(targetSize);
        clone(): Matrix<T>;
        overwrite(input: Matrix<T>, offset?: any[]): this;
        static hasSameSize(x: Matrix<any>, y: Matrix<any>): boolean;
        map(func: Function, input?: any, ...argArray: any[]): Matrix<T>;
        mapFor(func: Function, condition: (item: T, coordinate: number[]) => boolean, input?: any, ...argArray: any[]): Matrix<T>;
        private _forEach(getItem, getDeeper?, getSwallower?);
        forEach(func: (item: T, coordinate: number[], matrix: Matrix<T>) => any): void;
        toString(): string;
        static getZeroMatrix(coordinate: number[]): Matrix<{}>;
        static getIdentityMatrix(size: number): Matrix<{}>;
        static getLinearSpace(start: number, end: number, pointNumber: number): Matrix<{}>;
        static getGapSpace(start: number, end: number, gap?: number): Matrix<{}>;
        plus(input: T): Matrix<T>;
        plus(input: Matrix<T>): Matrix<T>;
        minus(input: T): Matrix<T>;
        minus(input: Matrix<T>): Matrix<T>;
        times(input: T): Matrix<T>;
        times(input: Matrix<T>): Matrix<T>;
        dividedBy(input: T): Matrix<T>;
        dividedBy(input: Matrix<T>): Matrix<T>;
        powerOf(input: T): Matrix<T>;
        powerOf(input: Matrix<T>): Matrix<T>;
        replace(input: T): Matrix<T>;
        replace(input: Matrix<T>): Matrix<T>;
        transpose(): Matrix<{}>;
        serialize(): T[];
        private _coordinateStartOffset;
        private _coordinateEndOffset;
        coordinateOffset: number[];
        isSizeFixed: boolean;
        submatrix(start: number[], end?: number[]): Matrix<T>;
        private _defineSnippingCoordinate(coordinate);
    }
}
