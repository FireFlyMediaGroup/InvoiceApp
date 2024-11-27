import type { CurrencyAmount } from "./types";

export function formatCurrency({ amount, currency }: CurrencyAmount) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
	}).format(amount);
}
