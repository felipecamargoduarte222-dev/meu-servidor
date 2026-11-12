import { openDb } from "./database.js";

// Listas salvas na memória (para as rotas que continuam em memória)
const categorias = [];
const fornecedores = [];
const produtos = [];

// Contadores simples para gerar os IDs (1, 2, 3...)
let idCategoria = 1;
let idFornecedor = 1;
let idProduto = 1;

export const routes = [
  // ================= CLIENTES (COM SQLITE) =================
  {
    method: "GET",
    path: "/clientes",
    handler: async (req, res) => {
      try {
        const db = await openDb();
        const clientes = await db.all("SELECT * FROM clientes");
        return res.writeHead(200).end(JSON.stringify(clientes));
      } catch (erro) {
        return res.writeHead(500).end(
          JSON.stringify({
            erro: "Erro ao buscar clientes no banco de dados.",
          }),
        );
      }
    },
  },
  {
    method: "POST",
    path: "/clientes",
    handler: async (req, res) => {
      try {
        const { nome, email, telefone, ativo } = req.body || {};

        if (!nome || !email || !telefone) {
          return res.writeHead(400).end(
            JSON.stringify({
              erro: "Nome, email e telefone são obrigatórios.",
            }),
          );
        }

        const db = await openDb();

        // Verifica se o email já existe no banco
        const clienteExistente = await db.get(
          "SELECT * FROM clientes WHERE email = ?",
          [email],
        );
        if (clienteExistente) {
          return res
            .writeHead(409)
            .end(JSON.stringify({ erro: "Esse email já foi cadastrado!" }));
        }

        const ativoValor = ativo !== undefined ? (ativo ? 1 : 0) : 1;

        const resultado = await db.run(
          "INSERT INTO clientes (nome, email, telefone, ativo) VALUES (?, ?, ?, ?)",
          [nome, email, telefone, ativoValor],
        );

        const novoCliente = {
          id: resultado.lastID,
          nome,
          email,
          telefone,
          ativo: Boolean(ativoValor),
        };

        return res.writeHead(201).end(JSON.stringify(novoCliente));
      } catch (erro) {
        return res.writeHead(500).end(
          JSON.stringify({
            erro: "Erro interno ao salvar cliente no banco.",
          }),
        );
      }
    },
  },
  {
    method: "PUT",
    path: "/clientes/:id",
    handler: async (req, res) => {
      try {
        const id = Number(req.id);
        const { nome, email, telefone, ativo } = req.body || {};

        const db = await openDb();
        const cliente = await db.get("SELECT * FROM clientes WHERE id = ?", [
          id,
        ]);

        if (!cliente) {
          return res
            .writeHead(404)
            .end(JSON.stringify({ erro: "Cliente não encontrado" }));
        }

        const novoNome = nome ?? cliente.nome;
        const novoEmail = email ?? cliente.email;
        const novoTelefone = telefone ?? cliente.telefone;
        const novoAtivo = ativo !== undefined ? (ativo ? 1 : 0) : cliente.ativo;

        await db.run(
          "UPDATE clientes SET nome = ?, email = ?, telefone = ?, ativo = ? WHERE id = ?",
          [novoNome, novoEmail, novoTelefone, novoAtivo, id],
        );

        return res.writeHead(200).end(
          JSON.stringify({
            id,
            nome: novoNome,
            email: novoEmail,
            telefone: novoTelefone,
            ativo: Boolean(novoAtivo),
          }),
        );
      } catch (erro) {
        return res
          .writeHead(500)
          .end(JSON.stringify({ erro: "Erro ao atualizar cliente no banco." }));
      }
    },
  },
  {
    method: "DELETE",
    path: "/clientes/:id",
    handler: async (req, res) => {
      try {
        const id = Number(req.id);
        const db = await openDb();

        const resultado = await db.run("DELETE FROM clientes WHERE id = ?", [
          id,
        ]);

        if (resultado.changes === 0) {
          return res
            .writeHead(404)
            .end(JSON.stringify({ erro: "Cliente não encontrado" }));
        }

        return res.writeHead(204).end();
      } catch (erro) {
        return res
          .writeHead(500)
          .end(JSON.stringify({ erro: "Erro ao deletar cliente no banco." }));
      }
    },
  },

  // ================= CATEGORIAS (EM MEMÓRIA) =================
  {
    method: "GET",
    path: "/categorias",
    handler: (req, res) => {
      return res.writeHead(200).end(JSON.stringify(categorias));
    },
  },
  {
    method: "POST",
    path: "/categorias",
    handler: (req, res) => {
      const { nome, descricao } = req.body;

      const novaCategoria = {
        id: idCategoria++,
        nome,
        descricao,
      };

      categorias.push(novaCategoria);
      return res.writeHead(201).end(JSON.stringify(novaCategoria));
    },
  },
  {
    method: "PUT",
    path: "/categorias/:id",
    handler: (req, res) => {
      const id = Number(req.id);
      const { nome, descricao } = req.body;

      const categoria = categorias.find((c) => c.id === id);
      if (!categoria) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ erro: "Categoria não encontrada" }));
      }

      categoria.nome = nome ?? categoria.nome;
      categoria.descricao = descricao ?? categoria.descricao;

      return res.writeHead(200).end(JSON.stringify(categoria));
    },
  },
  {
    method: "DELETE",
    path: "/categorias/:id",
    handler: (req, res) => {
      const id = Number(req.id);
      const index = categorias.findIndex((c) => c.id === id);

      if (index === -1) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ erro: "Categoria não encontrada" }));
      }

      categorias.splice(index, 1);
      return res.writeHead(204).end();
    },
  },

  // ================= PRODUTOS (EM MEMÓRIA) =================
  {
    method: "GET",
    path: "/produtos",
    handler: (req, res) => {
      return res.writeHead(200).end(JSON.stringify(produtos));
    },
  },
  {
    method: "POST",
    path: "/produtos",
    handler: (req, res) => {
      const { nome, preco, categoriaId } = req.body;

      const categoriaExiste = categorias.some(
        (c) => c.id === Number(categoriaId),
      );
      if (!categoriaExiste) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ erro: "Categoria inválida ou inexistente!" }));
      }

      const novoProduto = {
        id: idProduto++,
        nome,
        preco,
        categoriaId: Number(categoriaId),
      };

      produtos.push(novoProduto);
      return res.writeHead(201).end(JSON.stringify(novoProduto));
    },
  },
  {
    method: "PUT",
    path: "/produtos/:id",
    handler: (req, res) => {
      const id = Number(req.id);
      const { nome, preco, categoriaId } = req.body;

      const produto = produtos.find((p) => p.id === id);
      if (!produto) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ erro: "Produto não encontrado" }));
      }

      if (categoriaId) {
        const categoriaExiste = categorias.some(
          (c) => c.id === Number(categoriaId),
        );
        if (!categoriaExiste) {
          return res
            .writeHead(400)
            .end(
              JSON.stringify({ erro: "Categoria inválida ou inexistente!" }),
            );
        }
      }

      produto.nome = nome ?? produto.nome;
      produto.preco = preco ?? produto.preco;
      produto.categoriaId = categoriaId
        ? Number(categoriaId)
        : produto.categoriaId;

      return res.writeHead(200).end(JSON.stringify(produto));
    },
  },
  {
    method: "DELETE",
    path: "/produtos/:id",
    handler: (req, res) => {
      const id = Number(req.id);
      const index = produtos.findIndex((p) => p.id === id);

      if (index === -1) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ erro: "Produto não encontrado" }));
      }

      produtos.splice(index, 1);
      return res.writeHead(204).end();
    },
  },

  //FORNECEDORES (EM MEMÓRIA)
  {
    method: "GET",
    path: "/fornecedores",
    handler: (req, res) => {
      return res.writeHead(200).end(JSON.stringify(fornecedores));
    },
  },
  {
    method: "POST",
    path: "/fornecedores",
    handler: (req, res) => {
      const { razaoSocial, cnpj, contato } = req.body;

      if (!cnpj || cnpj.length !== 14) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ erro: "O CNPJ precisa ter 14 caracteres!" }));
      }

      const novoFornecedor = {
        id: idFornecedor++,
        razaoSocial,
        cnpj,
        contato,
      };

      fornecedores.push(novoFornecedor);
      return res.writeHead(201).end(JSON.stringify(novoFornecedor));
    },
  },
  {
    method: "PUT",
    path: "/fornecedores/:id",
    handler: (req, res) => {
      const id = Number(req.id);
      const { razaoSocial, cnpj, contato } = req.body;

      const fornecedor = fornecedores.find((f) => f.id === id);
      if (!fornecedor) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ erro: "Fornecedor não encontrado" }));
      }

      if (cnpj && cnpj.length !== 14) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ erro: "O CNPJ precisa ter 14 caracteres!" }));
      }

      fornecedor.razaoSocial = razaoSocial ?? fornecedor.razaoSocial;
      fornecedor.cnpj = cnpj ?? fornecedor.cnpj;
      fornecedor.contato = contato ?? fornecedor.contato;

      return res.writeHead(200).end(JSON.stringify(fornecedor));
    },
  },
  {
    method: "DELETE",
    path: "/fornecedores/:id",
    handler: (req, res) => {
      const id = Number(req.id);
      const index = fornecedores.findIndex((f) => f.id === id);

      if (index === -1) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ erro: "Fornecedor não encontrado" }));
      }

      fornecedores.splice(index, 1);
      return res.writeHead(204).end();
    },
  },
];
