import Customer, { ICustomer } from "@/models/Customer";
import { findWebsiteById } from "@/models/WebsiteModel";
import dbConnect from "@/lib/db";

export type BillingAccountError = {
  error: string;
  status: 400 | 404;
};

export type ResolvedBillingAccount = {
  email: string;
  customerId: string;
  customer: ICustomer;
};

export async function resolveWebsiteBillingAccount(
  websiteId: string
): Promise<ResolvedBillingAccount | BillingAccountError> {
  await dbConnect();
  const id = websiteId.trim();
  if (!id) {
    return { error: "Website ID is required", status: 400 };
  }

  const website = await findWebsiteById(id);
  if (!website?.email) {
    return { error: "No website found for that ID", status: 404 };
  }

  const email = website.email.toLowerCase();
  const customer = await Customer.findOne({ email });
  if (!customer?.customerId) {
    return { error: "No billing account found for that website", status: 404 };
  }

  return { email, customerId: customer.customerId, customer };
}

export function isBillingAccountError(
  result: ResolvedBillingAccount | BillingAccountError
): result is BillingAccountError {
  return "error" in result;
}
