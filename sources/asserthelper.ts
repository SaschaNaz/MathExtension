namespace SNMath.AssertHelper {
    export function assertParameter(...parameters: any[]) {
        for (const parameter of parameters) {
            AssertHelper.assert(parameter != null, "Argument not optional");
        }
    }

    export function assertNumber(...numbers: number[]) {
        for (const n of numbers) {
            AssertHelper.assert(n !== undefined, "Argument not optional");
            AssertHelper.assert(!isNaN(n), "Invalid argument.");
        }
    }

    export function assertArray(...arrays: any[][]) {
        for (const array of arrays) {
            AssertHelper.assert(Array.isArray(array), "Invalid argument.");
        }
    }

    export function assert(condition: boolean, message: string) {
        if (!condition) {
            throw new Error(message);
        }
    }
} 