const express = require('express'); // Framework para criação de servidores HTTP
const cors = require('cors'); // Middleware para permitir requisições de diferentes origens
const bodyParser = require('body-parser'); // Middleware para análise do corpo das requisições
const fs = require('fs'); // Módulo do Node.js para interagir com o sistema de arquivos
const path = require('path'); // Módulo do Node.js para trabalhar com caminhos de arquivos

const app = express();
const port = 5000;

// Middleware
app.use(cors()); // Habilita CORS
app.use(bodyParser.json()); // Permite que o servidor entenda JSON nas requisições

// Caminho para os arquivos JSON que simulam o banco de dados
const produtosFilePath = path.join(__dirname, 'produtos.json');
const carrinhoFilePath = path.join(__dirname, 'carrinho.json');

// Função para ler dados de arquivos JSON
function readJSONFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return []; // Retorna um array vazio em caso de erro
  }
}

// Função para escrever dados no arquivo JSON
function writeJSONFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Endpoints para manipulação dos produtos
app.get('/produtos', (req, res) => {
  const produtos = readJSONFile(produtosFilePath); // Lê os produtos do arquivo
  res.json(produtos); // Retorna a lista de produtos
});

app.post('/produtos', (req, res) => {
  const { nome, preco, id, quantidade } = req.body; // Extrai dados do corpo da requisição
  const produtos = readJSONFile(produtosFilePath);
  produtos.push({ nome, preco, id, quantidade }); // Adiciona o novo produto à lista
  writeJSONFile(produtosFilePath, produtos); // Atualiza o arquivo
  res.status(201).send('Produto adicionado'); // Resposta de sucesso
});

// Endpoint para excluir um produto
app.delete('/produtos/:id', (req, res) => {
  const { id } = req.params; // Obtém o ID do produto a ser removido
  let produtos = readJSONFile(produtosFilePath);
  produtos = produtos.filter(p => p.id !== parseInt(id)); // Filtra o produto
  writeJSONFile(produtosFilePath, produtos); // Atualiza o arquivo
  res.send('Produto removido');
});

// Endpoints para manipulação do carrinho
app.post('/carrinho', (req, res) => {
  const { id } = req.body; // Recebe o ID do produto a ser adicionado ao carrinho
  const produtos = readJSONFile(produtosFilePath);
  const carrinho = readJSONFile(carrinhoFilePath);
  
  const produto = produtos.find(p => p.id === id); // Procura o produto pelo ID
  if (produto) {
    carrinho.push(produto); // Adiciona o produto ao carrinho
    writeJSONFile(carrinhoFilePath, carrinho); // Atualiza o arquivo do carrinho
    res.status(201).send('Produto adicionado ao carrinho');
  } else {
    res.status(404).send('Produto não encontrado');
  }
});

// Endpoint para listar os itens no carrinho
app.get('/carrinho', (req, res) => {
  const carrinho = readJSONFile(carrinhoFilePath);
  res.json(carrinho); // Retorna os itens do carrinho
});

// Endpoint para remover um produto do carrinho
app.delete('/carrinho/:id', (req, res) => {
  const { id } = req.params; // Obtém o ID do produto a ser removido
  let carrinho = readJSONFile(carrinhoFilePath);
  carrinho = carrinho.filter(p => p.id !== parseInt(id)); // Filtra o produto do carrinho
  writeJSONFile(carrinhoFilePath, carrinho); // Atualiza o arquivo do carrinho
  res.send('Produto removido do carrinho');
});

// Rota raiz (verifica se o servidor está funcionando)
app.get('/', (req, res) => {
  res.send('Servidor funcionando!');
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
