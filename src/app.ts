/*
 * Decorators are used for metaprogramming to add extra logic and configuration that's taken into account by this
 * new framework when you run your code.
 *
 * Ways to add code to your code, to help you code... code.
 */
function Logger(logString: string) {
    return function(constructor: Function) {
        console.log(logString);
        console.log(constructor);
    }
}

function WithTemplate(template: string, hookId: string) {
    return function<T extends {new(...args: any[]): {name: string}} >(originalConstructor: T) {
        // Can return a new originalConstructor that would over-write our decorated class
        // Extending and returning in this way creates a new specialized version of the class and will only be called
        // when we instantiate our class.
        return class extends originalConstructor {
            constructor(...args: any[]) {
                super();
                const hookEl = document.getElementById(hookId);
                if (hookEl) {
                    hookEl.innerHTML = template;
                    // No longer need to
                    hookEl.querySelector('h1')!.textContent = this.name;
                }
            }
        }
    }
}

// multiple decorator functions will run bottom up, with the one above the class first then moving up
@Logger('Logging')
@WithTemplate('<h1>My Person</h1>', 'app')     // Executes when your class is defined
class Person {
    name = 'McKay';

    constructor() {
        console.log('Constructor creating person object...');
    }
}

const pers = new Person();
console.log(pers);

// All these run when a class is defined, not when it's instantiated.
function LogProperty(target: any, propertyName: string | Symbol) {
    console.log('Property decorator!');
    console.log(target, propertyName);
}

function LogAccessor(target: any, name: string, descriptor: PropertyDescriptor) {
    console.log('Accessor decorator');
    console.log(target, name, descriptor);
    //Can return something that TypeScript uses
}

function LogMethod(target: any, name: string | Symbol, descriptor: PropertyDescriptor) {
    console.log('Method decorator');
    console.log(target, name, descriptor);
    //Can return something that TypeScript uses
}

function LogParameter(target: any, name: string | Symbol, position: number) {
    console.log('Parameter decorator');
    console.log(target, name, position);
}
class Product {
    @LogProperty
    title: string;
    private _price: number;

    @LogAccessor
    set price(val: number) {
        if (val > 0) {
            this._price = val;
        }
        else {
            throw new Error('Invalid Price');
        }
    }
    constructor(t: string, p: number) {
        this.title = t;
        this._price = p;
    }

    @LogMethod
    getPriceWithTax(@LogParameter tax: number) {
        return this.price * (1 + tax);
    }
}

const book1 = new Product('Book', 19);
const book2 = new Product('book', 29);

//Method decorator in action
function AutoBind(target: any, methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            // This will always be referring to the object to which it belongs, the instance of the class
            return originalMethod.bind(this);
        }
    }
    return adjDescriptor;
}

class Printer {
    message = 'Button Working';

    @AutoBind
    showMessage() {
        console.log(this.message);
    }
}

const p = new Printer();
const button = document.querySelector('button')!;
button.addEventListener('click', p.showMessage);

interface ValidateConfig {
    [property: string]: {
        [validatableProp: string]: string[] //['required', 'positive']
    }
}

const registeredValidators: ValidateConfig = {}
function Required(target: any, propName: string) {
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name],
        [propName]: ['required']
    };
}

function PositiveNumber(target: any, propName: string) {
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name],
        [propName]: ['positive']
    };
}

function validate(obj: any) {
    const objValidatorConfig = registeredValidators[obj.constructor.name];
    if (!objValidatorConfig) {
        return true;
    }
    let isValid = true;
    for (const prop in objValidatorConfig) {
        for (const validator of objValidatorConfig[prop]) {
            switch (validator) {
                case 'required':
                    isValid = isValid && !!obj[prop];
                    break;
                case 'positive':
                    isValid = isValid && obj[prop] > 0;
                    break;
            }
        }
    }
    // No validators were found...
    return isValid;
}
class Course {
    @Required
    title: string;
    @PositiveNumber
    price: number;

    constructor(t: string, p: number) {
        this.title = t;
        this.price = p;
    }
}

const courseForm = document.querySelector('form')!;
courseForm.addEventListener('submit', event => {
    event.preventDefault();
    const titleEl = document.getElementById('title') as HTMLInputElement;
    const priceEl = document.getElementById('price') as HTMLInputElement;

    const title = titleEl.value;
    const price = +priceEl.value;

    const createdCourse = new Course(title, price);
    if (!validate(createdCourse)) {
        alert('Invalid input, please try again!');
        return;
    }
    console.log(createdCourse);
})