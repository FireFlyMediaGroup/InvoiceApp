import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	const updatedBob = await prisma.user.update({
		where: { email: "bob@example.com" },
		data: { isAllowed: false },
	});

	console.log("Updated Bob:", updatedBob);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
