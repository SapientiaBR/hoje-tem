# Redesign Visual — HOJE TEM

Transformar o app de "catálogo de eventos" em **produto cultural urbano premium**, inspirado em Resident Advisor, Boiler Room, Shotgun, Hypebeast e Spotify. **Zero mudança de funcionalidade** — apenas linguagem visual, tipografia, microcopy e composição.

---

## 1. Sistema de Design (base de tudo)

**`src/index.css` + `tailwind.config.ts`** — reescrever tokens:

- Background: `#050505` (preto profundo)
- Surface/card: `#121212` (carvão)
- Foreground: `#FFFFFF` puro
- Muted: cinza neutro (sem tom roxo)
- **Accent neon: `#D7FF00`** — usado APENAS em CTAs, destaques, trending, contadores, urgência
- Remover todos os gradientes roxo/laranja/azul atuais
- Remover `shadow-glow` roxo → criar `shadow-neon` amarelo sutil
- Border radius: reduzir de `1rem` para `0.25rem` (estética editorial, menos arredondado)

**Tipografia** — trocar Plus Jakarta Sans por par editorial:
- Display (títulos, caixa alta, peso 900): **Anton** ou **Archivo Black**
- Body: **Inter** ou **Space Grotesk**
- Utility `.headline` → `uppercase`, `tracking-tight`, `font-black`, `leading-[0.9]`

## 2. Home / Explorar (`src/pages/Index.tsx`)

Reorganizar como revista cultural mobile-first:

```
┌──────────────────────────┐
│ HOJE TEM     [cidade ▾] │  header minimal
├──────────────────────────┤
│                          │
│   [HERO IMAGE 16:10]     │  ← evento destaque do dia
│   HOJE EM ALTA           │     overlay com texto editorial
│   VÓRTEX                 │
│   TECHNO BUNKER          │
│   ● 214 querem ir        │
│   ● Começa em 2h    [→]  │
├──────────────────────────┤
│ TAGS rolagem horizontal  │  ⚡ CAÓTICO  🌙 UNDERGROUND ...
├──────────────────────────┤
│ BOMBANDO AGORA           │  título editorial caixa alta
│ [card] [card]            │  grid 2 col mobile
├──────────────────────────┤
│ NÃO PERCA                │
│ [card editorial grande]  │  1 col, foto enorme
└──────────────────────────┘
```

- Remover carrossel "DESTAQUES" atual → virar **Hero Banner** ocupando ~60% da viewport
- Microcopy: "Explorar" → **"O QUE TEM HOJE"**, "Todos os eventos" → **"BOMBANDO AGORA"**, "Resultados" → **"DESCUBRA"**
- Grid mobile: manter 2 colunas (no desktop sobe pra 3/4 como já está)

## 3. EventCard (`src/components/EventCard.tsx`)

Redesenhar como **conteúdo editorial**, não produto:

- Foto ocupa ~80% do card (aspect `4/5` standard, `3/4` featured)
- Sobre a foto: badge de tag emocional no topo-esquerda (ex: `🔥 BOMBANDO` em amarelo neon quando trending)
- Texto abaixo, minimalista:
  - **NOME** em caixa alta, font-black, 1-2 linhas
  - Linha única: `Bairro · 22h · R$40` (text-xs, muted)
- Remover: descrição, categoria genérica, botões extras
- Hover: leve scale + outline amarelo neon
- Favorito: ícone branco/neon discreto no canto

## 4. Tags Emocionais (`src/components/CategoryPills.tsx`)

Substituir categorias atuais por sistema de tags com emoji + caixa alta:
`⚡ CAÓTICO` `🎭 STAND-UP` `🌙 UNDERGROUND` `💘 DATE IDEAL` `🔥 BOMBANDO` `🎨 CULTURAL` `🍻 BARATO` `💎 PREMIUM`

- Pills com borda fina, fundo transparente
- Selecionada: fundo amarelo neon, texto preto, peso bold
- Mapear tags → categorias existentes no hook `useCategorias` (sem mudar schema)

## 5. Trending (nova seção dentro da Home)

Inspirado em Spotify Charts — adicionar após o hero:

```
TOP EVENTOS DE HOJE
─────────────────────
01  [thumb] VÓRTEX             ↑
        Techno · Vila Madalena
02  [thumb] NOITE LATINA       ↑
03  [thumb] STAND-UP CAÓTICO   =
```

- Números enormes (font-black, 48px+), em amarelo neon nos top 3
- Lista vertical, divisores finos brancos 10%

## 6. Renomeações de Tabs (`src/components/BottomNav.tsx`)

- Explorar → **HOJE**
- Mapa → **RADAR**
- Favoritos → **SALVOS**
- Calendário → **AGENDA**
- Perfil → **EU**

Ícones mantidos. Labels em caixa alta, font weight bold, text-[10px].

## 7. Radar (`src/components/MapTab.tsx`)

- Título da tela: **"RADAR CULTURAL"** + subtítulo "o que está acontecendo perto de você"
- Pins do mapa: pretos com ponto amarelo neon nos eventos bombando
- Card flutuante de evento selecionado em estilo editorial igual ao novo EventCard

## 8. Agenda (`src/components/CalendarTab.tsx`)

- Título: **"SUA AGENDA"**
- Dias com eventos: ponto amarelo neon
- Hoje: círculo preenchido amarelo neon, texto preto

## 9. Favoritos & Perfil

- Favoritos título: **"SALVOS"** + contador
- Perfil: avatar quadrado (não círculo), nome em caixa alta, stats em linha (`12 SALVOS · 4 ESTA SEMANA`)
- Cards de ação (Sugerir/Organizador/Locais): estilo lista editorial minimal, não grid de quadradinhos

## 10. Detalhes Técnicos

- Remover `useTheme` light/dark (app é dark-only por design — já está, mas confirmar)
- Importar fontes via `@import` no `index.css`
- Atualizar `logo-hoje-tem` — usar versão menor (h-32 atual é gigante; reduzir para h-10 e deixar wordmark monocromático branco)
- Indicadores de urgência: pequenos pontos pulsantes amarelo neon + texto `COMEÇA EM 2H`
- Todas as strings em caixa alta usam CSS `uppercase` + `tracking-tight`, não conteúdo hardcoded em maiúsculas

## Arquivos a editar

```
src/index.css                          ← tokens + fonts + utilities
tailwind.config.ts                     ← cores + fontFamily
src/pages/Index.tsx                    ← hero + seções + microcopy
src/components/EventCard.tsx           ← redesign editorial
src/components/CategoryPills.tsx       ← tags emocionais
src/components/BottomNav.tsx           ← labels novas
src/components/MapTab.tsx              ← RADAR
src/components/CalendarTab.tsx         ← títulos
src/components/SearchBar.tsx           ← placeholder "buscar na cidade…"
src/components/CitySelector.tsx        ← estilo minimal
```

Sem migrações de banco, sem mudança em hooks de dados, sem alteração nas rotas.
