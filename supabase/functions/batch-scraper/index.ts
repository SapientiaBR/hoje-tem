import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedEvent {
  nome: string;
  descricao?: string;
  data?: string;
  data_fim?: string;
  local?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  preco?: number;
  preco_max?: number;
  categoria?: string;
  imagem?: string;
  link_origem?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { urls, fonte_nome, max_eventos } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'URLs é obrigatória (array)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!firecrawlApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resultados: any[] = [];
    let eventosEncontrados = 0;
    let eventosInseridos = 0;
    const erros: string[] = [];

    console.log(`Iniciando scraping de ${urls.length} URLs para fonte: ${fonte_nome || 'desconheida'}`);

    for (const url of urls) {
      try {
        console.log(`Scraping: ${url}`);

        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: url.trim(),
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });

        const scrapeData = await scrapeResponse.json();

        if (!scrapeResponse.ok || !scrapeData.success) {
          erros.push(`Erro ao acessar ${url}: ${scrapeData.error || 'Erro desconhecido'}`);
          continue;
        }

        const markdown = scrapeData.data?.markdown || '';
        const metadata = scrapeData.data?.metadata || {};

        let extractedEvent: ScrapedEvent | null = null;

        if (lovableApiKey) {
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                {
                  role: 'system',
                  content: `Você é um assistente que extrai informações de eventos a partir de páginas web.
Extraia as seguintes informações do conteúdo fornecido:
- nome: nome do evento
- descricao: descrição do evento (máximo 500 caracteres)
- data: data e hora do evento no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss)
- data_fim: data/hora de término se houver (formato ISO 8601)
- local: nome do local/estabelecimento
- endereco: endereço completo
- cidade: cidade do evento
- estado: estado (sigla, ex: SP)
- preco: preço em reais (número, 0 se gratuito)
- preco_max: preço máximo se houver faixa de preço
- categoria: categoria do evento (Música, Festa, Cultura, Teatro, Gastronomia, Esporte, Infantil, Business, Outro)
- imagem: URL de imagem do evento se encontrar

Responda APENAS com um JSON válido contendo esses campos. Use null para campos não encontrados.`
                },
                {
                  role: 'user',
                  content: `Extraia as informações do evento desta página:\n\nURL: ${url}\n\nConteúdo:\n${markdown.slice(0, 8000)}`
                }
              ],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "extract_event",
                    description: "Extrai informações estruturadas de um evento",
                    parameters: {
                      type: "object",
                      properties: {
                        nome: { type: "string" },
                        descricao: { type: "string" },
                        data: { type: "string" },
                        data_fim: { type: "string" },
                        local: { type: "string" },
                        endereco: { type: "string" },
                        cidade: { type: "string" },
                        estado: { type: "string" },
                        preco: { type: "number" },
                        preco_max: { type: "number" },
                        categoria: { type: "string", enum: ["Música", "Festa", "Cultura", "Teatro", "Gastronomia", "Esporte", "Infantil", "Business", "Outro"] },
                        imagem: { type: "string" }
                      },
                      required: ["nome"]
                    }
                  }
                }
              ],
              tool_choice: { type: "function", function: { name: "extract_event" } }
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
            if (toolCall?.function?.arguments) {
              try {
                extractedEvent = JSON.parse(toolCall.function.arguments);
              } catch (e) {
                console.error('Erro ao parsear resposta da IA:', e);
              }
            }
          }
        }

        if (!extractedEvent) {
          extractedEvent = {
            nome: metadata.title || 'Evento sem título',
            descricao: markdown.slice(0, 500),
            link_origem: url,
          };
        }

        extractedEvent.link_origem = url;
        extractedEvent.cidade = extractedEvent.cidade || 'São Paulo';
        extractedEvent.estado = extractedEvent.estado || 'SP';
        extractedEvent.categoria = extractedEvent.categoria || 'Outro';

        eventosEncontrados++;

        const eventoHash = await gerarHash(extractedEvent.nome!, extractedEvent.data, extractedEvent.local);

        const { data: existingEvent } = await supabase
          .from('eventos')
          .select('id')
          .eq('evento_hash', eventoHash)
          .single();

        if (!existingEvent) {
          const { data: inserted, error: insertError } = await supabase
            .from('eventos')
            .insert({
              nome: extractedEvent.nome,
              descricao: extractedEvent.descricao,
              data: extractedEvent.data ? new Date(extractedEvent.data) : null,
              data_fim: extractedEvent.data_fim ? new Date(extractedEvent.data_fim) : null,
              local: extractedEvent.local,
              endereco: extractedEvent.endereco,
              cidade: extractedEvent.cidade,
              estado: extractedEvent.estado,
              preco: extractedEvent.preco || 0,
              preco_max: extractedEvent.preco_max,
              categoria: extractedEvent.categoria,
              imagem: extractedEvent.imagem,
              link_origem: extractedEvent.link_origem,
              evento_hash: eventoHash,
              fonte_origem: fonte_nome || 'scraper',
              scraped_at: new Date().toISOString(),
              status: 'publicado',
            })
            .select()
            .single();

          if (insertError) {
            erros.push(`Erro ao inserir ${extractedEvent.nome}: ${insertError.message}`);
          } else {
            eventosInseridos++;
            resultados.push({ success: true, evento: inserted });
          }
        } else {
          resultados.push({ success: true, evento: existingEvent, duplicated: true });
        }

      } catch (error) {
        erros.push(`Erro ao processar ${url}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        console.error(`Erro na URL ${url}:`, error);
      }

      if (max_eventos && eventosInseridos >= max_eventos) {
        console.log(`Limite de ${max_eventos} eventos atingido`);
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await supabase
      .from('fontes_scraper')
      .update({ ultima_coleta: new Date().toISOString() })
      .eq('nome', fonte_nome);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_urls: urls.length,
          eventos_encontrados: eventosEncontrados,
          eventos_inseridos: eventosInseridos,
          erros: erros.length,
        },
        resultados,
        erros,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in batch-scraper:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function gerarHash(nome: string, data: string | undefined, local: string | undefined): Promise<string> {
  const text = (nome || '').toLowerCase().trim() + '-' + 
    (data ? new Date(data).toISOString().split('T')[0] : '') + '-' + 
    (local || '').toLowerCase().trim();
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}