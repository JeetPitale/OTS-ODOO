import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
export const runtime = "nodejs"; // Prisma + SQLite does not run on edge runtime, so force nodejs runtime for API route
