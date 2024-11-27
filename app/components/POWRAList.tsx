"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

type POWRA = {
	id: string;
	createdAt: string;
	updatedAt: string;
	status: "DRAFT" | "SUBMITTED" | "APPROVED";
};

type POWRAListProps = {
	onEdit: (id: string) => void;
};

export default function POWRAList({ onEdit }: POWRAListProps) {
	const [powras, setPowras] = useState<POWRA[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchPOWRAs = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch("/api/powra");
				if (!response.ok) {
					if (response.status === 401) {
						throw new Error("Unauthorized. Please log in and try again.");
					}
					throw new Error("Failed to fetch POWRAs");
				}
				const data = await response.json();
				setPowras(data);
			} catch (error) {
				console.error("Error fetching POWRAs:", error);
				setError(
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPOWRAs();
	}, []);

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/powra?id=${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Failed to delete POWRA");
			}
			setPowras(powras.filter((powra) => powra.id !== id));
		} catch (error) {
			console.error("Error deleting POWRA:", error);
			setError(
				error instanceof Error
					? error.message
					: "An unexpected error occurred while deleting",
			);
		}
	};

	if (isLoading) {
		return <div>Loading POWRAs...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (powras.length === 0) {
		return <div>No POWRAs found.</div>;
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>ID</TableHead>
					<TableHead>Created At</TableHead>
					<TableHead>Updated At</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{powras.map((powra) => (
					<TableRow key={powra.id}>
						<TableCell>{powra.id}</TableCell>
						<TableCell>{new Date(powra.createdAt).toLocaleString()}</TableCell>
						<TableCell>{new Date(powra.updatedAt).toLocaleString()}</TableCell>
						<TableCell>{powra.status}</TableCell>
						<TableCell>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" className="h-8 w-8 p-0">
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Actions</DropdownMenuLabel>
									<DropdownMenuItem
										onClick={() => navigator.clipboard.writeText(powra.id)}
									>
										Copy ID
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => onEdit(powra.id)}>
										Edit
									</DropdownMenuItem>
									{powra.status === "DRAFT" && (
										<DropdownMenuItem>Submit</DropdownMenuItem>
									)}
									<DropdownMenuItem onClick={() => handleDelete(powra.id)}>
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
