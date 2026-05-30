import { hash } from "bcrypt";
import type { UserRepository } from "../repositories/user.repository";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";

interface RegisterUserService {
    name: string,
    email: string,
    password: string
}

export class UserService {
    constructor(private userRepository: UserRepository) { }

    async register({ name, email, password }: RegisterUserService) {

        const userAlreadyExists = await this.userRepository.findByEmail(email)

        if (userAlreadyExists) {
            throw new UserAlreadyExistsError()
        }

        const passwordHash = await hash(password, 6)

        //Implementar findByEmail

        const createdUser = await this.userRepository.create({
            name,
            email,
            passwordHash
        })

        return createdUser;

    }
}