import { NextResponse } from "next/server";
import roles from "./lib/roles";

async function getRole(request) {
  const apiUrl = process.env.NODE_ENV === "production"
  ? new URL("/api/session", `https://${request.headers.get("host")}`).toString()
  : new URL("/api/session", request.url).toString();

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Cookie": request.headers.get("cookie") || "", 
    },
    credentials: "include", 
  });

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  const data = await response.json();
  return data.user.role;
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  let role;
  try {
    role = await getRole(request); 
  } catch (error) {
    if (!["/signin", "/signup"].includes(pathname)) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    return NextResponse.next();
  }

  const roleBasedRedirections = {
    "/signup": {
      [roles.TEACHER]: "/teacher",
      [roles.STUDENT]: "/student"
    },
    "/signin": {
      [roles.TEACHER]: "/teacher",
      [roles.STUDENT]: "/student"
    },
    "/": {
      [roles.TEACHER]: "/teacher",
      [roles.STUDENT]: "/student"
    },
    "/text": {
      [roles.TEACHER]: "/teacher/text",
      [roles.STUDENT]: "/student/text"
    },
    "/class": {
      [roles.TEACHER]: "/teacher/class",
      [roles.STUDENT]: "/student/class"
    }
  };

  if (pathname in roleBasedRedirections) {
    return NextResponse.redirect(new URL(roleBasedRedirections[pathname][role], request.url));
  }

  const protectedRoutes = [
    { path: "/student", role: roles.STUDENT },
    { path: "/teacher", role: roles.TEACHER },
  ];

  for (const route of protectedRoutes) {
    if (pathname.includes(route.path) && role !== route.role) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/signin",
    "/signup",
    "/",
    "/teacher",
    "/student",
    "/text",
    "/teacher/text",
    "/teacher/text/new",
    "/class",
    "/teacher/class",
    "/teacher/class/new",
    "/student/text",
    "/student/text/id",
    "/student/class",
    "/student/class/id",
    "/user"
  ],
};
