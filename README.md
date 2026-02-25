# Rastreador de Hábitos

Aplicativo web para rastreamento de hábitos com design moderno em tema escuro.

## Tecnologias

- **React 18** + **TypeScript**
- **Vite** (build)
- **Recharts** (gráficos)
- **IndexedDB** (persistência local via idb)
- **Framer Motion** (animações)
- **Lucide React** (ícones)

## Como rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Funcionalidades

- Grade de hábitos com marcação diária (últimas 4 semanas)
- Gráfico de progresso geral
- Barras de progresso semanal
- Adicionar novos hábitos
- Estatísticas (ganhos, perdas, tempo)
- Navegação por seções (Home, Estatísticas, Dicas)
- Persistência local (IndexedDB)
