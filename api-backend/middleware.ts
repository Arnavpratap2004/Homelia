import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Retrieve the current response
  const res = NextResponse.next();

  // If the request is an OPTIONS request, respond with 200 immediately
  if (request.method === "OPTIONS") {
    const preflightHeaders = {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
      "Access-Control-Allow-Credentials": "true",
    };
    return NextResponse.json({}, { status: 200, headers: preflightHeaders });
  }

  // Next.js config handles headers for normal requests, but we can set them here too just in case
  res.headers.set("Access-Control-Allow-Origin", "http://localhost:5173");
  res.headers.set("Access-Control-Allow-Credentials", "true");
  
  return res;
}

// Specify the paths the middleware should run on
export const config = {
  matcher: "/api/:path*",
};
