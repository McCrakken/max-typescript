function Logger(logString: string) {
    return function(constructor: Function) {
        console.log(logString);
        console.log(constructor);
    }
}

@Logger('LOGGING - PERSON')     // Executes when your class is defined
class Person {
    name = 'McKay';

    constructor() {
        console.log('Constructor creating person object...');
    }
}

const pers = new Person();
console.log(pers);