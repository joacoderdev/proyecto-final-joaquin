export class User {
    #first_name
    #last_name
    #email
    #age
    #password
    #cart
    #role
    constructor ({first_name, last_name, email, age, password, cart, role}){
        this.#first_name = first_name
        this.#last_name = last_name
        this.#email = email
        this.#age = age
        this.#password = password
        this.#cart = cart
        this.#role = role
    }

    getFirst_name(){ return this.#first_name}
    getLast_name(){ return this.#last_name}
    getEmail(){ return this.#email}
    getAge(){ return this.#age}
    getPassword(){ return this.#password}
    getCart(){ return this.#cart}
    getRole(){ return this.#role}
    
    getAllAttr() {
        return {
            first_name: this.#first_name,
            last_name: this.#last_name,
            email: this.#email,
            age: this.#age,
            password: this.#password,
            cart: this.#cart,
            role: this.#role,
        }
    }

    setRole(role){
        this.#role = role
    }


}

