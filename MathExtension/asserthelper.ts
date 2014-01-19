class AssertHelper {
    static assertParameter(...parameters: any[]) {
        parameters.forEach((p) => {
            AssertHelper.assert(p != null, "Argument not optional");
        });
    }

    static assertNumber(...numbers: number[]) {
        numbers.forEach((n) => {
            AssertHelper.assert(n !== undefined, "Argument not optional");
            AssertHelper.assert(!isNaN(n), "Invalid argument.");
        });
    }

    static assertArray(...arrays: number[][]) {
        arrays.forEach((array) => {
            AssertHelper.assert(Array.isArray(array), "Invalid argument.");
        });
    }

    static assert(condition: boolean, message: string) {
        if (!condition)
            throw new Error(message);
    }
} 