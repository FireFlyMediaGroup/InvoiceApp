import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	try {
		// Attempt to get the count of users
		const userCount = await prisma.user.count();
		console.log(
			`Successfully connected to the database. User count: ${userCount}`,
		);
	} catch (error) {
		console.error("Error connecting to the database:", error);
	} finally {
		await prisma.$disconnect();
	}
}

main();
