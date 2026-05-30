import type { User } from "../domain/entities/user"

export interface CreateUserDTO {
    id?: string,
    name: string,
    email: string,
    passwordHash: string
}


export interface UserRepository {
    create(data: CreateUserDTO): Promise<User>
    findByEmail(email:string): Promise<User | null>
}