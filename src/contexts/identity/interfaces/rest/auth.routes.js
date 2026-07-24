import { Router } from "express";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { userRepository } from "../../infrastructure/persistence/PrismaUserRepository.js";
import { sessionRepository } from "../../infrastructure/persistence/PrismaSessionRepository.js";
import { makeLogin } from "../../application/login.usecase.js";
import { makeLogout } from "../../application/logout.usecase.js";
import { makeBootstrapOwner } from "../../application/bootstrapOwner.usecase.js";
import { SupabaseFileStorage } from "../../../../platform/storage/SupabaseFileStorage.js";
import { withSignedPhotoUrl } from "../../../../platform/storage/photoUrl.helper.js";
const storage = new SupabaseFileStorage();
const login = makeLogin({ users: userRepository, sessions: sessionRepository });
const logout = makeLogout({ sessions: sessionRepository });
const bootstrapOwner = makeBootstrapOwner({ users: userRepository });
export const authRouter = Router();
authRouter.post("/bootstrap-dueno", async (req, res, next) => {
    try {
        const owner = await bootstrapOwner(req.body);
        res.status(201).json(owner);
    }
    catch (err) {
        next(err);
    }
});
// TS02 — POST /auth/login
authRouter.post("/login", async (req, res, next) => {
    try {
        const { usernameOrEmail, password } = req.body;
        const result = await login({
            usernameOrEmail,
            password,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });
        // El photoUrl que devuelve el usecase es el path guardado en DB, no una
        // URL usable (bucket privado): hay que resolverlo a signed URL aca, igual
        // que en el resto de endpoints que devuelven fotos.
        res.status(200).json({ ...result, user: await withSignedPhotoUrl(storage, result.user) });
    }
    catch (err) {
        next(err);
    }
});
// POST /auth/logout
authRouter.post("/logout", requireAuth, async (req, res, next) => {
    try {
        const token = req.headers.authorization.slice("Bearer ".length);
        await logout(req.user.userId, token);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=auth.routes.js.map