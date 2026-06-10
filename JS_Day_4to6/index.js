class Animal {
    constructor(name, age) {
        this.name = name;
        this.age = age;
        this.alive = true;
    }
    eat() {
        return `${this.name} is consuming nutrients.`;
    }
    sleep() {
        return `${this.name} has initiated structural rest cycles.`;
    }
}
class Rabbit extends Animal {
    constructor(name, age, runSpeed) {
        super(name, age);
        this.runSpeed = runSpeed;
    }
    run() {
        return `${this.name} is sprinting at a velocity of ${this.runSpeed} km/h!`;
    }
}
class Fish extends Animal {
    constructor(name, age, swimSpeed) {
        super(name, age);
        this.swimSpeed = swimSpeed;
    }
    swim() {
        return `${this.name} is gliding through liquid layers at ${this.swimSpeed} knots.`;
    }
}
class Hawk extends Animal {
    constructor(name, age, flySpeed) {
        super(name, age);
        this.flySpeed = flySpeed;
    }
    fly() {
        return `${this.name} expanded wings, cruising altitude tracking at ${this.flySpeed} mph.`;
    }
}
const terminalScreen = document.getElementById("terminalScreen");
const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");
const btn3 = document.getElementById("btn3");
btn1.onclick = function() {
    const bunny = new Rabbit("Bugs", 2, 45);
    terminalScreen.textContent = `[Rabbit Object Initialized]\nName: ${bunny.name}\nAge: ${bunny.age} years\nStatus Alive: ${bunny.alive}\n\n${bunny.eat()}\n${bunny.sleep()}\n${bunny.run()}`;
};
btn2.onclick = function() {
    const goldy = new Fish("Nemo", 1, 12);
    terminalScreen.textContent = `[Fish Object Initialized]\nName: ${goldy.name}\nAge: ${goldy.age} year\nStatus Alive: ${goldy.alive}\n\n${goldy.eat()}\n${goldy.sleep()}\n${goldy.swim()}`;
};
btn3.onclick = function() {
    const talon = new Hawk("SkyRipper", 4, 120);
    terminalScreen.textContent = `[Hawk Object Initialized]\nName: ${talon.name}\nAge: ${talon.age} years\nStatus Alive: ${talon.alive}\n\n${talon.eat()}\n${talon.sleep()}\n${talon.fly()}`;
};