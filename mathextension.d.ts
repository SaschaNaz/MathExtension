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
    private static _getOneBasedIndex(i);
    public baseArray: any[];
    public columnLength : any;
    public rowLength : number;
    public size : number[];
    public serialSize : number;
    public dimension : number;
    private _isValidInternalCoordinate(coordinate);
    constructor();
    constructor(size: number[], items?: T[]);
    private static _getArrayMatrix<T2>(size, itemChunk, subchunkLength);
    private _getInternalCoordinateFromIndex(index);
    private _getInternalCoordinate(index);
    private _getBaseArrayCoordinate(coordinate);
    public get(index: number): T;
    public get(coordinate: number[]): T;
    public set(index: number, input: T): void;
    public set(coordinate: number[], input: T): void;
    private static _expandArray<T2>(array, targetSize, fill);
    public expand(targetSize: number[], fill?: T): void;
    private _getFinalExpandedSize(targetSize);
    public clone(): Matrix<any>;
    static isSameSize(x: Matrix<any>, y: Matrix<any>): boolean;
    public map(func: Function, input?: any, ...argArray: any[]): Matrix<T>;
    public mapFor(func: Function, condition: (item: number, coordinate: number[]) => void, input?: any, ...argArray: any[]): Matrix<any>;
    private static _forEach<T2>(array, func, parentCoordinate, depth);
    public forEach(func: (item: T, coordinate: number[]) => void): void;
    public toString(): string;
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
    public transpose(): Matrix<{}>;
    private _coordinateStartOffset;
    private _coordinateEndOffset;
    public coordinateOffset : number[];
    public isSizeFixed : boolean;
    public submatrix(start: number[], end?: number[]): Matrix<{}>;
    private _getProperSnippingCoordinate(coordinate);
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
