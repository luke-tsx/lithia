<div align="center">
  <a href="https://github.com/lithiajs/lithia">
    <img alt="Lithia logo" src="https://raw.githubusercontent.com/lithiajs/lithia/main/studio/public/logo.svg" height="128">
  </a>
  <h1>Lithia</h1>

<a href="https://github.com/lithiajs/lithia"><img alt="GitHub repository" src="https://img.shields.io/badge/GITHUB-000000.svg?style=for-the-badge&logo=GitHub&labelColor=000"></a>
<a href="https://www.npmjs.com/package/lithia"><img alt="NPM version" src="https://img.shields.io/npm/v/lithia.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://github.com/lithiajs/lithia/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/lithia.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://opencollective.com/lithiajs"><img alt="Support Lithia" src="https://img.shields.io/badge/Support%20Lithia-blueviolet.svg?style=for-the-badge&logo=OpenCollective&labelColor=000000&logoWidth=20"></a>

</div>

## 🚀 Sobre o Lithia

Lithia é um framework **next-generation** para construir aplicações server-side com Node.js e TypeScript. Projetado com foco em **simplicidade**, **performance** e **developer experience**, o Lithia oferece uma abordagem moderna para desenvolvimento de APIs RESTful.

### ✨ Características Principais

- **🎯 File-based Routing** - Sistema de roteamento baseado em arquivos intuitivo e poderoso
- **⚡ TypeScript First** - Suporte completo ao TypeScript com tipagem forte
- **🔧 CLI Integrado** - Ferramentas de linha de comando para desenvolvimento e produção
- **🎨 Lithia Studio** - Interface web para desenvolvimento, debugging e monitoramento
- **🪝 Sistema de Hooks** - Lifecycle hooks para extensibilidade máxima
- **🛡️ Middleware System** - Sistema robusto de middleware com suporte a async/await
- **📊 OpenAPI Integration** - Geração automática de documentação OpenAPI
- **🌍 CORS Ready** - Configuração CORS integrada e flexível
- **📝 Logging Avançado** - Sistema de logging colorido e estruturado
- **⚙️ Hot Reload** - Recarga automática durante desenvolvimento

## 🏁 Começando

### Instalação

```bash
# Instalar globalmente
npm install -g lithia

# Ou usar com npx
npx lithia@latest
```

### Primeiro Projeto

```bash
# Criar novo projeto
mkdir meu-projeto-lithia
cd meu-projeto-lithia

# Inicializar projeto
npm init -y
npm install lithia

# Criar estrutura básica
mkdir -p src/routes
```

### Exemplo Básico

**`src/routes/hello/route.ts`**

```typescript
import type { LithiaRequest, LithiaResponse } from "lithia";

export default async function handler(_: LithiaRequest, res: LithiaResponse) {
  res.json({
    message: "Hello, from Lithia! 🚀",
    timestamp: new Date().toISOString(),
  });
}
```

**`lithia.config.ts`**

```typescript
import { defineLithiaConfig } from "lithia";

export default defineLithiaConfig({
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  debug: true,
  studio: {
    enabled: true,
  },
});
```

**Executar o projeto:**

```bash
# Modo desenvolvimento
lithia dev

# Modo produção
lithia build
lithia start
```

## 📁 File-based Routing

O Lithia utiliza um sistema de roteamento baseado em arquivos que transforma a estrutura de pastas em rotas da API:

```
src/routes/
├── users/
│   ├── route.ts          # GET /users
│   ├── route.post.ts     # POST /users
│   └── [id]/
│       ├── route.ts      # GET /users/:id
│       └── route.put.ts  # PUT /users/:id
├── posts/
│   └── [...slug]/
│       └── route.ts      # GET /posts/* (catch-all)
└── api/
    └── health/
        └── route.get.ts  # GET /api/health
```

### Convenções de Roteamento

- **`route.ts`** - Rota padrão (GET)
- **`route.{method}.ts`** - Método HTTP específico (POST, PUT, DELETE, etc.)
- **`[param]`** - Parâmetros dinâmicos
- **`[...slug]`** - Catch-all routes
- **`(group)`** - Route groups (não afetam a URL)

## 🛠️ Configuração

### Configuração Básica

```typescript
import { defineLithiaConfig } from "lithia";

export default defineLithiaConfig({
  // Servidor
  server: {
    port: 3000,
    host: "0.0.0.0",
    request: {
      queryParser: {
        array: { enabled: true, delimiter: "," },
        number: { enabled: true },
        boolean: { enabled: true },
      },
      maxBodySize: 1048576, // 1MB
    },
  },

  // CORS
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },

  // Build
  build: {
    mode: "no-bundle", // ou "full-bundle"
    externalPackages: ["lodash", "axios"],
  },

  // Studio
  studio: {
    enabled: true,
  },

  // Debug
  debug: process.env.NODE_ENV === "development",
});
```

## 🪝 Sistema de Hooks

O Lithia oferece um sistema de hooks poderoso para interceptar e modificar o comportamento da aplicação:

```typescript
export default defineLithiaConfig({
  hooks: {
    // Antes de processar a requisição
    "request:before": (req, res) => {
      console.log(`Incoming request: ${req.method} ${req.url}`);
    },

    // Após processar a requisição
    "request:after": (req, res) => {
      console.log(`Request completed: ${res.statusCode}`);
    },

    // Em caso de erro
    "request:error": (req, res, error) => {
      console.error(`Request failed:`, error);
    },

    // Middleware lifecycle
    "middleware:beforeExecute": (middleware, req, res) => {
      console.log(`Executing middleware: ${middleware.name}`);
    },
  },
});
```

## 🛡️ Middleware

### Middleware Global

```typescript
// src/middlewares/auth.ts
import type { LithiaMiddleware } from "lithia";

const authMiddleware: LithiaMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Token required" });
  }

  // Validar token...
  await next();
};

export default authMiddleware;
```

### Middleware por Rota

```typescript
// src/routes/protected/route.ts
import authMiddleware from "../../middlewares/auth";

export const middleware = [authMiddleware];

export default async function handler(req: LithiaRequest, res: LithiaResponse) {
  res.json({ message: "Protected route accessed!" });
}
```

## 🎨 Lithia Studio

O Lithia Studio é uma interface web integrada que oferece:

- **📊 Dashboard** - Monitoramento em tempo real do servidor
- **🛣️ Route Explorer** - Visualização e teste de rotas
- **📝 Logs Viewer** - Visualização de logs em tempo real
- **⚙️ Configuration** - Editor de configuração visual
- **🧪 Route Tester** - Teste de rotas diretamente na interface

Acesse o Studio em: `http://localhost:3000/studio`

## 📚 Documentação OpenAPI

O Lithia gera automaticamente documentação OpenAPI baseada nas suas rotas:

```typescript
// src/routes/users/route.post.ts
import type { LithiaRequest, LithiaResponse, Metadata } from "lithia";

export const metadata: Metadata = {
  openAPI: {
    summary: "Create a new user",
    description: "Creates a new user in the system",
    tags: ["Users"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email" },
            },
            required: ["name", "email"],
          },
        },
      },
    },
    responses: {
      "201": {
        description: "User created successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};

export default async function handler(req: LithiaRequest, res: LithiaResponse) {
  const { name, email } = req.body;

  // Criar usuário...

  res.status(201).json({
    id: "user-123",
    name,
    email,
  });
}
```

## 🚀 CLI Commands

```bash
# Desenvolvimento com hot reload
lithia dev

# Build para produção
lithia build

# Iniciar servidor de produção
lithia start

# Ajuda
lithia --help
```

## 🏗️ Build Modes

### No Bundle Mode

- Execução direta dos arquivos TypeScript
- Ideal para desenvolvimento
- Hot reload automático

### Full Bundle Mode

- Bundle completo com esbuild
- Otimizado para produção
- Menor tempo de inicialização

## 🤝 Contribuindo

Contribuições para o Lithia são muito bem-vindas! Antes de começar, leia nossas [Diretrizes de Contribuição](CONTRIBUTING.md).

### Primeiros Passos

1. Fork o repositório
2. Clone seu fork: `git clone https://github.com/seu-usuario/lithia.git`
3. Instale dependências: `npm install`
4. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
5. Faça suas alterações
6. Execute testes: `npm test`
7. Commit suas alterações: `git commit -m "feat: adiciona nova funcionalidade"`
8. Push para sua branch: `git push origin feature/nova-funcionalidade`
9. Abra um Pull Request

### Issues

- 🐛 **Bug Reports** - Use o template de bug report
- 💡 **Feature Requests** - Use o template de feature request
- 📖 **Documentação** - Melhorias na documentação são sempre bem-vindas

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).

## 🙏 Apoio

Se você gosta do Lithia e quer apoiar o projeto:

- ⭐ **Star** o repositório no GitHub
- 🐦 **Compartilhe** nas redes sociais
- 💰 **Contribua** financeiramente via [OpenCollective](https://opencollective.com/lithiajs)
- 🐛 **Reporte bugs** e **sugira melhorias**

## 🌟 Comunidade

- 💬 [GitHub Discussions](https://github.com/lithiajs/lithia/discussions) - Para dúvidas e discussões
- 🐛 [GitHub Issues](https://github.com/lithiajs/lithia/issues) - Para reportar bugs
- 📧 [Email](mailto:contato@lithiajs.dev) - Contato direto

---

<div align="center">
  <p>Feito com ❤️ pela comunidade Lithia</p>
  <p>
    <a href="https://github.com/lithiajs/lithia">GitHub</a> •
    <a href="https://opencollective.com/lithiajs">OpenCollective</a> •
    <a href="https://github.com/lithiajs/lithia/discussions">Discussions</a>
  </p>
</div>
