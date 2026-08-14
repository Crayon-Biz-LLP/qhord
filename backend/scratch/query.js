const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.client.findFirst();
  const o = await prisma.operator.findFirst();
  console.log("CLIENT_ID:", c?.id);
  console.log("OPERATOR_ID:", o?.id);
  
  if (o) {
    const token = jwt.sign({ id: o.id, email: o.email, role: o.role }, process.env.JWT_SECRET || "development-secret", { expiresIn: "12h" });
    console.log("TOKEN:", token);
  }
}
main().catch(console.error);
