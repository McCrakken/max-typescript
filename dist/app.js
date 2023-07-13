"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/*
 * Decorators are used for metaprogramming to add extra logic and configuration that's taken into account by this
 * new framework when you run your code.
 *
 * Ways to add code to your code, to help you code... code.
 */
function Logger(logString) {
    return function (constructor) {
        console.log(logString);
        console.log(constructor);
    };
}
function WithTemplate(template, hookId) {
    return function (originalConstructor) {
        // Can return a new originalConstructor that would over-write our decorated class
        // Extending and returning in this way creates a new specialized version of the class and will only be called
        // when we instantiate our class.
        return class extends originalConstructor {
            constructor(...args) {
                super();
                const hookEl = document.getElementById(hookId);
                if (hookEl) {
                    hookEl.innerHTML = template;
                    // No longer need to
                    hookEl.querySelector('h1').textContent = this.name;
                }
            }
        };
    };
}
// multiple decorator functions will run bottom up, with the one above the class first then moving up
let Person = class Person {
    constructor() {
        this.name = 'McKay';
        console.log('Constructor creating person object...');
    }
};
Person = __decorate([
    Logger('Logging'),
    WithTemplate('<h1>My Person</h1>', 'app') // Executes when your class is defined
], Person);
const pers = new Person();
console.log(pers);
// All these run when a class is defined, not when it's instantiated.
function LogProperty(target, propertyName) {
    console.log('Property decorator!');
    console.log(target, propertyName);
}
function LogAccessor(target, name, descriptor) {
    console.log('Accessor decorator');
    console.log(target, name, descriptor);
    //Can return something that TypeScript uses
}
function LogMethod(target, name, descriptor) {
    console.log('Method decorator');
    console.log(target, name, descriptor);
    //Can return something that TypeScript uses
}
function LogParameter(target, name, position) {
    console.log('Parameter decorator');
    console.log(target, name, position);
}
class Product {
    set price(val) {
        if (val > 0) {
            this._price = val;
        }
        else {
            throw new Error('Invalid Price');
        }
    }
    constructor(t, p) {
        this.title = t;
        this._price = p;
    }
    getPriceWithTax(tax) {
        return this.price * (1 + tax);
    }
}
__decorate([
    LogProperty
], Product.prototype, "title", void 0);
__decorate([
    LogAccessor
], Product.prototype, "price", null);
__decorate([
    LogMethod,
    __param(0, LogParameter)
], Product.prototype, "getPriceWithTax", null);
const book1 = new Product('Book', 19);
const book2 = new Product('book', 29);
//Method decorator in action
function AutoBind(target, methodName, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            // This will always be referring to the object to which it belongs, the instance of the class
            return originalMethod.bind(this);
        }
    };
    return adjDescriptor;
}
class Printer {
    constructor() {
        this.message = 'Button Working';
    }
    showMessage() {
        console.log(this.message);
    }
}
__decorate([
    AutoBind
], Printer.prototype, "showMessage", null);
const p = new Printer();
const button = document.querySelector('button');
button.addEventListener('click', p.showMessage);
const registeredValidators = {};
function Required(target, propName) {
    registeredValidators[target.constructor.name] = Object.assign(Object.assign({}, registeredValidators[target.constructor.name]), { [propName]: ['required'] });
}
function PositiveNumber(target, propName) {
    registeredValidators[target.constructor.name] = Object.assign(Object.assign({}, registeredValidators[target.constructor.name]), { [propName]: ['positive'] });
}
function validate(obj) {
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
    constructor(t, p) {
        this.title = t;
        this.price = p;
    }
}
__decorate([
    Required
], Course.prototype, "title", void 0);
__decorate([
    PositiveNumber
], Course.prototype, "price", void 0);
const courseForm = document.querySelector('form');
courseForm.addEventListener('submit', event => {
    event.preventDefault();
    const titleEl = document.getElementById('title');
    const priceEl = document.getElementById('price');
    const title = titleEl.value;
    const price = +priceEl.value;
    const createdCourse = new Course(title, price);
    if (!validate(createdCourse)) {
        alert('Invalid input, please try again!');
        return;
    }
    console.log(createdCourse);
});
