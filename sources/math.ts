interface Math {
    add(x: number, y: number): number;
    subtract(x: number, y: number): number;
    multiply(x: number, y: number): number;
    divide(x: number, y: number): number;
    substitute(x: number, y: number): number;
    factorial(x: number): number;
}

Math.add = (x: number, y: number) => {
    return x + y;
}

Math.subtract = (x: number, y: number) => {
    return x - y;
}

Math.multiply = (x: number, y: number) => {
    return x * y;
}

Math.divide = (x: number, y: number) => {
    return x / y;
}

Math.substitute = (x: number, y: number) => {
    return y;
}

Math.factorial = (x: number) => {
    var result = 1;
    for (var i = 1; i <= x; i++)
        result *= i;
    return result;
};
