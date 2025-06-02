import { createServer } from "http";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mime from "mime-types";

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = createServer(async (req, res) => {
  try {
    // Remove query parameters and hash from URL
    const path = req.url.split("?")[0].split("#")[0];

    // Map root to index.html
    const filePath =
      path === "/" ? join(__dirname, "index.html") : join(__dirname, path);

    // Get MIME type
    const contentType = mime.lookup(filePath) || "text/plain";

    const content = await readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.writeHead(404);
      res.end("File not found");
    } else {
      res.writeHead(500);
      res.end("Internal server error");
    }
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
