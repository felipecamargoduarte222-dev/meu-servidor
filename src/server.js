import http from "node:http";
import { json } from "./middlewares/json.js";
import { routes } from "./routes.js";
import { initDb } from "./database.js";

// Inicializa o banco de dados e cria a tabela
initDb();

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  await json(req, res);

  const partesUrl = url.split("/");
  const recurso = `/${partesUrl[1]}`;
  const id = partesUrl[2];

  const caminhoRota = id ? `${recurso}/:id` : recurso;
  const route = routes.find(
    (r) => r.method === method && r.path === caminhoRota,
  );

  if (route) {
    req.id = id;
    return route.handler(req, res);
  }

  return res
    .writeHead(404)
    .end(JSON.stringify({ mensagem: "Rota não encontrada" }));
});

server.listen(3333, () => {
  console.log("Servidor rodando na porta 3333 com SQLite!");
});
