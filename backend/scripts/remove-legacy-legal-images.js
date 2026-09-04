const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const legacyImage = /<img\b[^>]*src=["']http:\/\/localhost:4000\/uploads\/[^"']+["'][^>]*>/gi;

async function main() {
  for (const key of ["privacidad", "terminos"]) {
    const section = await prisma.siteSection.findUnique({ where: { key } });
    if (!section) {
      throw new Error(`No existe la sección ${key}`);
    }

    const data = { ...section.data };
    if (typeof data.content !== "string") {
      throw new Error(`Contenido inválido en ${key}`);
    }

    const content = data.content.replace(legacyImage, "");
    if (content !== data.content) {
      await prisma.siteSection.update({
        where: { key },
        data: { data: { ...data, content } },
      });
      console.log(`Imagen eliminada de ${key}`);
    } else {
      console.log(`Sin cambios en ${key}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
