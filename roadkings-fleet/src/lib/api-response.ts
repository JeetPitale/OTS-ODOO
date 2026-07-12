import { NextResponse } from "next/server";

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: string[];
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T, message = "Success", status = 200) {
  return NextResponse.json(
    { success: true, message, data } satisfies ApiSuccessResponse<T>,
    { status }
  );
}

export function errorResponse(message: string, errors: string[] = [], status = 400) {
  return NextResponse.json(
    { success: false, message, errors } satisfies ApiErrorResponse,
    { status }
  );
}

export function notFoundResponse(entity = "Resource") {
  return errorResponse(`${entity} not found`, [], 404);
}

export function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";
  console.error("[API Error]", error);
  return errorResponse(message, [], 500);
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
}

export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const search = searchParams.get("search") || undefined;
  const sortBy = searchParams.get("sortBy") || undefined;
  const sortOrder = (searchParams.get("sortOrder") === "desc" ? "desc" : "asc") as "asc" | "desc";
  const status = searchParams.get("status") || undefined;

  return { page, limit, search, sortBy, sortOrder, status };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
