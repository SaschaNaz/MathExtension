declare class AssertHelper {
    static assertParameter(...parameters: any[]): void;
    static assertNumber(...numbers: number[]): void;
    static assertArray(...arrays: any[][]): void;
    static assert(condition: boolean, message: string): void;
}
declare class Matrix<T> {
    static isZeroBased: boolean;
    static isMatrix(object: any): boolean;
    private static _getZeroBasedIndex(i);
    private static _getUserFriendlyIndex(i);
    private _array;
    public columnLength : any;
    public rowLength : number;
    public size : number[];
    public serialSize : number;
    public dimension : number;
    private _checkInternalCoordinateValidity(coordinate);
    constructor();
    constructor(columnLength: number, items: T[]);
    private _getInternalCoordinateFromIndex(index);
    private _getInternalCoordinate(index);
    public getFor(index: number): number;
    public getFor(coordinate: number[]): number;
    public setFor(index: number, input: T): Matrix<T>;
    public setFor(coordinate: number[], input: T): Matrix<T>;
    private static _expandArray<T2>(array, targetSize, fill);
    public expandSize(targetSize: number[], fill?: T): void;
    public clone(): Matrix<any>;
    public map(func: Function, input?: any, ...argArray: any[]): Matrix<T>;
    public mapFor(func: Function, condition: (item: number, coordinate: number[]) => void, input?: any, ...argArray: any[]): Matrix<any>;
    private static _forEach<T2>(array, func, parentCoordinate, depth);
    public forEach(func: (item: T, coordinate: number[]) => void): void;
    public toString(): string;
    public toMatlabString(): string;
    static getZeroMatrix(coordinate: number[]): Matrix<{}>;
    static getIdentityMatrix(size: number): Matrix<{}>;
    static getLinearSpace(start: number, end: number, pointNumber: number): Matrix<{}>;
    static getGapSpace(start: number, end: number, gap?: number): Matrix<{}>;
    public plus(input: T): Matrix<T>;
    public plus(input: Matrix<T>): Matrix<T>;
    public minus(input: T): Matrix<T>;
    public minus(input: Matrix<T>): Matrix<T>;
    public times(input: T): Matrix<T>;
    public times(input: Matrix<T>): Matrix<T>;
    public dividedBy(input: T): Matrix<T>;
    public dividedBy(input: Matrix<T>): Matrix<T>;
    public powerOf(input: T): Matrix<T>;
    public powerOf(input: Matrix<T>): Matrix<T>;
    public replace(input: T): Matrix<T>;
    public replace(input: Matrix<T>): Matrix<T>;
    public matrixMultiply(input: Matrix<T>): Matrix<number>;
    public transpose(): Matrix<{}>;
}
interface Math {
    add(x: number, y: number): number;
    subtract(x: number, y: number): number;
    multiply(x: number, y: number): number;
    divide(x: number, y: number): number;
    substitute(x: number, y: number): number;
    factorial(x: number): number;
}
declare class BlobStream {
    public blob: Blob;
    private indexInSlice;
    private slice;
    private sliceIndex;
    private sliceSize;
    public left: number;
    constructor(blob: Blob);
    private readNextSlice(oncomplete);
    public readLine(oncomplete: (result: string) => any): void;
    public readLines(oneach: (result: string) => any, oncomplete: () => any): void;
}
declare class Matrix2DStream extends BlobStream {
    public dimension: number;
    constructor(blob: Blob, dimension?: number);
    public readRow(delimiter: string, oncomplete: (row: number[]) => any): void;
    public readRows(delimiter: string, oneach: (row: number[]) => any, oncomplete: () => any): void;
}
interface Number {
}
