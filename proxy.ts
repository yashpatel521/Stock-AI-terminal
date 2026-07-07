import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ideas/:path*",
    "/stock/:path*",
    "/api/watchlist/:path*",
    "/api/analyze/:path*",
    "/api/search/:path*",
  ],
};
