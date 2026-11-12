import { randomUUID } from "node:crypto";

// Arrays em memória (Banco de dados)
const clientes = [];
const categorias = [];
const fornecedores = [];
const produtos = [];

// Função auxiliar para capturar o :id na URL (ex: /clientes/123)
function buildRoutePath(path) {
  const routeParametersRegex = /:([a-zA-Z]+)/g;
  const pathWithParams = path.replaceAll(
    routeParametersRegex,
    "(?<$1>[a-z0-9\\-_]+)",
  );
  return new RegExp(`^${pathWithParams}$`);
}

export const routes = [
  // ROTAS DE CLIENTES (/clientes)

  {
    method: "GET",
    path: buildRoutePath("/clientes"),
    handler: (req, res) => {
      return res.end(JSON.stringify(clientes));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/clientes"),
    handler: (req, res) => {
      const { nome, email, telefone, ativo } = req.body || {};

      if (!nome || !email || !telefone) {
        return res.writeHead(400).end(
          JSON.stringify({
            erro: "Nome, email e telefone são obrigatórios.",
          }),
        );
      }

      //Impedir cadastro se já existir cliente com o mesmo email usando .some()
      const emailJaExiste = clientes.some((cliente) => cliente.email === email);
      if (emailJaExiste) {
        return res.writeHead(409).end(
          JSON.stringify({
            erro: "Já existe um cliente cadastrado com este email.",
          }),
        );
      }

      const novoCliente = {
        id: randomUUID(),
        nome,
        email,
        telefone,
        ativo: ativo !== undefined ? Boolean(ativo) : true,
      };

      clientes.push(novoCliente);
      return res.writeHead(201).end(JSON.stringify(novoCliente));
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/clientes/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { nome, email, telefone, ativo } = req.body || {};

      const index = clientes.findIndex((c) => c.id === id);
      if (index === -1) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ erro: "Cliente não encontrado." }));
      }

      // Verifica se o novo email já pertence a outro cliente
      if (email) {
        const emailEmUso = clientes.some(
          (c) => c.email === email && c.id !== id,
        );
        if (emailEmUso) {
          return res.writeHead(409).end(
            JSON.stringify({
              erro: "Email já está em uso por outro cliente.",
            }),
          );
        }
      }

      clientes[index] = {
        ...clientes[index],
        nome: nome ?? clientes[index].nome,
        email: email ?? clientes[index].email,
        telefone: telefone ?? clientes[index].telefone,
        ativo: ativo !== undefined ? Boolean(ativo) : clientes[index].ativo,
      };

      return res.writeHead(200).end(JSON.stringify(clientes[index]));
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/clientes/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const index = clientes.findIndex((c) => c.id === id);

      if (index === -1) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ erro: "Cliente não encontrado." }));
      }

      clientes.splice(index, 1);
      return res.writeHead(204).end();
    },
  },

  // ROTAS DE CATEGORIAS (/categorias)

  {
    method: "GET",
    path: buildRoutePath("/categorias"),
    handler: (req, res) => {
      return res.end(JSON.stringify(categorias));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/categorias"),
    handler: (req, res) => {
      const { nome, descricao } = req.body || {};

      if (!nome || !descricao) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ erro: "Nome e descrição são obrigatórios." }));
      }

      const novaCategoria = {
        id: randomUUID(),
        nome,
        descricao,
      };

      categorias.push(novaCategoria);
      return res.writeHead(201).end(JSON.stringify(novaCategoria));
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/categorias/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { nome, descricao } = req.body || {};

      const index = categorias.findIndex((cat) => cat.id === id);
      if (index === -1) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ erro: "Categoria não encontrada." }));
      }

      categorias[index] = {
        ...categorias[index],
        nome: nome ?? categorias[index].nome,
        descricao: descricao ?? categorias[index].descricao,
      };

      return res.writeHead(200).end(JSON.stringify(categorias[index]));
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/categorias/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const index = categorias.findIndex((cat) => cat.id === id);

      if (index === -1) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ erro: "Categoria não encontrada." }));
      }

      categorias.splice(index, 1);
      return res.writeHead(204).end();
    },
  },

  // ROTAS DE PRODUTOS (/produtos) Para testar o desafio de Categoria

  {
    method: "GET",
    path: buildRoutePath("/produtos"),
    handler: (req, res) => {
      return res.end(JSON.stringify(produtos));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/produtos"),
    handler: (req, res) => {
      const { nome, preco, categoriaId } = req.body || {};

      if (!nome || preco === undefined || !categoriaId) {
        return res.writeHead(400).end(
          JSON.stringify({
            erro: "Nome, preço e categoriaId são obrigatórios.",
          }),
        );
      }

      //Validar se a categoria enviada realmente existe no array de categorias
      const categoriaExiste = categorias.some((cat) => cat.id === categoriaId);
      if (!categoriaExiste) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ erro: "A categoria informada não existe." }));
      }

      const novoProduto = {
        id: randomUUID(),
        nome,
        preco,
        categoriaId,
      };

      produtos.push(novoProduto);
      return res.writeHead(201).end(JSON.stringify(novoProduto));
    },
  },

  // ROTAS DE FORNECEDORES (/fornecedores)

  {
    method: "GET",
    path: buildRoutePath("/fornecedores"),
    handler: (req, res) => {
      return res.end(JSON.stringify(fornecedores));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/fornecedores"),
    handler: (req, res) => {
      const { razaoSocial, cnpj, contato } = req.body || {};

      if (!razaoSocial || !cnpj || !contato) {
        return res.writeHead(400).end(
          JSON.stringify({
            erro: "razão social, CNPJ e contato são obrigatórios.",
          }),
        );
      }

      // DESAFIO EXTRA: Validar se o CNPJ tem exatamente 14 caracteres
      if (String(cnpj).length !== 14) {
        return res.writeHead(400).end(
          JSON.stringify({
            erro: "O CNPJ deve conter exatamente 14 caracteres.",
          }),
        );
      }

      const novoFornecedor = {
        id: randomUUID(),
        razaoSocial,
        cnpj: String(cnpj),
        contato,
      };

      fornecedores.push(novoFornecedor);
      return res.writeHead(201).end(JSON.stringify(novoFornecedor));
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/fornecedores/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { razaoSocial, cnpj, contato } = req.body || {};

      const index = fornecedores.findIndex((f) => f.id === id);
      if (index === -1) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ erro: "fornecedor não encontrado." }));
      }

      if (cnpj !== undefined && String(cnpj).length !== 14) {
        return res.writeHead(400).end(
          JSON.stringify({
            erro: "O CNPJ deve conter exatamente 14 caracteres.",
          }),
        );
      }

      fornecedores[index] = {
        ...fornecedores[index],
        razaoSocial: razaoSocial ?? fornecedores[index].razaoSocial,
        cnpj: cnpj ? String(cnpj) : fornecedores[index].cnpj,
        contato: contato ?? fornecedores[index].contato,
      };

      return res.writeHead(200).end(JSON.stringify(fornecedores[index]));
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/fornecedores/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const index = fornecedores.findIndex((f) => f.id === id);

      if (index === -1) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ erro: "Fornecedor não encontrado." }));
      }

      fornecedores.splice(index, 1);
      return res.writeHead(204).end();
    },
  },
];
