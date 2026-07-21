import { prisma } from "../../../../db.js";
import type { UserRepository, NewUserData } from "../../domain/ports/UserRepository.js";
import type { User } from "../../domain/model/User.js";

// Adaptador de salida: implementa UserRepository contra Prisma/PostgreSQL.
export class PrismaUserRepository implements UserRepository {
  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }] } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByIdOrThrow(userId: number): Promise<User> {
    return prisma.user.findUniqueOrThrow({ where: { id: userId } });
  }

  async countOwners(): Promise<number> {
    return prisma.user.count({ where: { isOwner: true } });
  }

  async create(data: NewUserData): Promise<User> {
    return prisma.user.create({ data });
  }

  async promoteToOwner(userId: number): Promise<User> {
    return prisma.user.update({ where: { id: userId }, data: { isOwner: true } });
  }

  async activate(userId: number): Promise<User> {
    return prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } });
  }

  async updateLastAccess(userId: number): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { lastAccess: new Date() } });
  }

  async updateEmail(userId: number, email: string): Promise<User> {
    return prisma.user.update({ where: { id: userId }, data: { email } });
  }

  async updatePasswordHash(userId: number, passwordHash: string): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  async listActiveAdmins() {
    return prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, email: true, isOwner: true, lastAccess: true },
      orderBy: { name: "asc" },
    });
  }
}

export const userRepository: UserRepository = new PrismaUserRepository();
