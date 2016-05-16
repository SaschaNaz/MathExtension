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
}
