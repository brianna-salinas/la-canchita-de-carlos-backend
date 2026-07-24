import { prisma } from "../../../../db.js";
// Adaptador de salida: implementa UserRepository contra Prisma/PostgreSQL.
export class PrismaUserRepository {
    async findByUsernameOrEmail(usernameOrEmail) {
        return prisma.user.findFirst({ where: { OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }] } });
    }
    async findByEmail(email) {
        return prisma.user.findUnique({ where: { email } });
    }
    async findByIdOrThrow(userId) {
        return prisma.user.findUniqueOrThrow({ where: { id: userId } });
    }
    async countOwners() {
        return prisma.user.count({ where: { isOwner: true } });
    }
    async create(data) {
        return prisma.user.create({ data });
    }
    async promoteToOwner(userId) {
        return prisma.user.update({ where: { id: userId }, data: { isOwner: true } });
    }
    async activate(userId) {
        return prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } });
    }
    async deactivate(userId) {
        return prisma.user.update({ where: { id: userId }, data: { status: "INACTIVE" } });
    }
    async updateLastAccess(userId) {
        await prisma.user.update({ where: { id: userId }, data: { lastAccess: new Date() } });
    }
    async updateEmail(userId, email) {
        return prisma.user.update({ where: { id: userId }, data: { email } });
    }
    async updatePasswordHash(userId, passwordHash) {
        await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    }
    async updateProfile(userId, data) {
        return prisma.user.update({ where: { id: userId }, data });
    }
    async listActiveAdmins() {
        // Antes no se seleccionaba photoUrl (se pensaba como "listado liviano"),
        // asi que ningun administrador mostraba su foto en la lista de
        // Administracion/Solicitudes de Acceso, aunque la tuviera subida.
        return prisma.user.findMany({
            where: { status: "ACTIVE" },
            select: { id: true, name: true, email: true, isOwner: true, lastAccess: true, photoUrl: true },
            orderBy: { name: "asc" },
        });
    }
    async listOwnerEmails() {
        const owners = await prisma.user.findMany({
            where: { isOwner: true, status: "ACTIVE" },
            select: { email: true },
        });
        return owners.map((o) => o.email);
    }
    async updatePhoto(userId, photoUrl) {
        return prisma.user.update({ where: { id: userId }, data: { photoUrl } });
    }
}
export const userRepository = new PrismaUserRepository();
//# sourceMappingURL=PrismaUserRepository.js.map