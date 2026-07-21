import "dotenv/config";
import { prisma } from "../src/db.js";
import { hashPassword } from "../src/platform/security/password.js";

// Crea el primer usuario dueno (owner) directamente, sin pasar por AccessRequest,
// ya que autorizar una solicitud requiere requireOwner (necesitamos uno ya existente).
async function main() {
  const email = process.env.SEED_OWNER_EMAIL ?? "carlos@lacanchita.com";
  const username = process.env.SEED_OWNER_USERNAME ?? "carlos";
  const password = process.env.SEED_OWNER_PASSWORD ?? "Cambiar123!";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Ya existe un usuario con ese correo (id ${existing.id}). No se creo nada.`);
    return;
  }

  const passwordHash = await hashPassword(password);
  const owner = await prisma.user.create({
    data: {
      name: "Carlos Maldonado",
      username,
      email,
      passwordHash,
      status: "ACTIVE",
      isOwner: true,
    },
  });

  console.log("Owner creado:");
  console.log({ id: owner.id, username, email, password });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
