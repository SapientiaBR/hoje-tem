import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL:', formattedUrl);

    // Scrape the page with Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok || !scrapeData.success) {
      console.error('Firecrawl error:', scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao acessar a página' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = scrapeData.data?.markdown || '';
    const metadata = scrapeData.data?.metadata || {};

    console.log('Scraped content length:', markdown.length);

    // Use Lovable AI to extract event information
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      // Return raw scraped data without AI extraction
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            nome: metadata.title || 'Evento sem título',
            descricao: markdown.slice(0, 500),
            link_origem: formattedUrl,
            dados_raw: { markdown, metadata },
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use AI to extract structured event data
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
            content: `Extraia as informações do evento desta página:\n\nURL: ${formattedUrl}\n\nConteúdo:\n${markdown.slice(0, 8000)}`
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

    if (!aiResponse.ok) {
      console.error('AI extraction failed:', await aiResponse.text());
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            nome: metadata.title || 'Evento sem título',
            descricao: markdown.slice(0, 500),
            link_origem: formattedUrl,
            dados_raw: { markdown, metadata },
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData));

    let extractedEvent = {
      nome: metadata.title || 'Evento sem título',
      descricao: null,
      data: null,
      data_fim: null,
      local: null,
      endereco: null,
      cidade: 'São Paulo',
      estado: 'SP',
      preco: 0,
      preco_max: null,
      categoria: 'Outro',
      imagem: null,
    };

    // Parse tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        extractedEvent = { ...extractedEvent, ...parsed };
      } catch (e) {
        console.error('Failed to parse AI response:', e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...extractedEvent,
          link_origem: formattedUrl,
          dados_raw: { markdown: markdown.slice(0, 2000), metadata },
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extrair-evento:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
