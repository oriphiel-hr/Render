import jwt from "jsonwebtoken";
export function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).send("No token");
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev");
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
}
