import type { PrismaClient } from "@prisma/client";
import prisma from "./app/utils/db";

// Define a custom type that includes the POWRA model
type PrismaClientWithPOWRA = PrismaClient & {
	POWRA: {
		findMany: (args?: { take?: number }) => Promise<unknown[]>;
	};
};

async function testPOWRAQuery(): Promise<void> {
	try {
		// Cast prisma to the custom type
		const prismaWithPOWRA = prisma as PrismaClientWithPOWRA;

		const powras = await prismaWithPOWRA.POWRA.findMany({
			take: 5,
		});
		console.log("Successfully queried POWRA table:");
		console.log(powras);
	} catch (error: unknown) {
		console.error(
			"Error querying POWRA table:",
			error instanceof Error ? error.message : String(error),
		);
	} finally {
		await prisma.$disconnect();
	}
}

testPOWRAQuery().catch((error: unknown) => {
	console.error(
		"Unhandled error:",
		error instanceof Error ? error.message : String(error),
	);
	process.exit(1);
});
