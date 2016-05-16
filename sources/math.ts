namespace SNMath {
    export function add(x: number, y: number) {
        return x + y;
    }

    export function subtract(x: number, y: number) {
        return x - y;
    }

    export function multiply(x: number, y: number) {
        return x * y;
    }

    export function divide(x: number, y: number) {
        return x / y;
    }

    export function substitute(x: number, y: number) {
        return y;
    }

    export function factorial(x: number) {
        let result = 1;
        for (let i = 1; i <= x; i++)
            result *= i;
        return result;
    }
}
