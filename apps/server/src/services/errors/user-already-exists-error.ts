export class UserAlreadyExistsError extends Error{
    constructor(){
        super('An user with this email already exists.')
    }
}