declare class AssertHelper {
    static assertParameter(...parameters: any[]): void;
    static assertNumber(...numbers: number[]): void;
    static assertArray(...arrays: number[][]): void;
    static assert(condition: boolean, message: string): void;
}
declare class Matrix {
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
    constructor(columnLength: number, items: number[]);
    private _getInternalCoordinateFromIndex(index);
    private _getInternalCoordinate(index);
    public getFor(index: number): number;
    public getFor(coordinate: number[]): number;
    public setFor(index: number, input: number): Matrix;
    public setFor(coordinate: number[], input: number): Matrix;
    private static _expandArray(array, targetSize, fill);
    public expandSize(targetSize: number[], fill?: number): void;
    public clone(): Matrix;
    public map(func: Function, input?: any, ...argArray: any[]): Matrix;
    public mapFor(func: Function, condition: (item: number, coordinate: number[]) => void, input?: any, ...argArray: any[]): Matrix;
    private static _forEach(array, func, parentCoordinate, depth);
    public forEach(func: (item: number, coordinate: number[]) => void): void;
    public toString(): string;
    public toMatlabString(): string;
    static getZeroMatrix(coordinate: number[]): Matrix;
    static getIdentityMatrix(size: number): Matrix;
    static getLinearSpace(start: number, end: number, pointNumber: number): Matrix;
    static getGapSpace(start: number, end: number, gap?: number): Matrix;
    public plus(input: number): Matrix;
    public plus(input: Matrix): Matrix;
    public minus(input: number): Matrix;
    public minus(input: Matrix): Matrix;
    public times(input: number): Matrix;
    public times(input: Matrix): Matrix;
    public dividedBy(input: number): Matrix;
    public dividedBy(input: Matrix): Matrix;
    public powerOf(input: number): Matrix;
    public powerOf(input: Matrix): Matrix;
    public replace(input: number): Matrix;
    public replace(input: Matrix): Matrix;
    public matrixMultiply(input: Matrix): Matrix;
    public transpose(): Matrix;
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
