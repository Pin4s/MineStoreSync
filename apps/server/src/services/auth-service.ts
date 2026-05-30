import { compare } from "bcrypt";
import type { UserRepository } from "../repositories/user.repository";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";

interface AuthenticateRequest {
    email: string;
    password: string;
}

export class AuthService {
    constructor(private userRepository: UserRepository) { }

    async authenticate({ email, password }: AuthenticateRequest) {
        const user = await this.userRepository.findByEmail(email);

        if (!user) throw new InvalidCredentialsError();

        const passwordMatch = await compare(password, user.passwordHash);

        if (!passwordMatch) throw new InvalidCredentialsError();

        return { user };
    }
}