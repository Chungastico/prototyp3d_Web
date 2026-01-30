'use server';

import { model } from '@/lib/gemini';

/**
 * =========================
 * Helpers (4 espacios)
 * =========================
 */
const MAX_CACHE = 200;

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryable429(error: unknown): boolean {
    const msg = String(error ?? '');
    return (
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('Too Many Requests')
    );
}

function ensureGlobalMap<T>(key: string): Map<string, T> {
    const g = globalThis as any;
    if (!g[key]) {
        g[key] = new Map<string, T>();
    }
    return g[key] as Map<string, T>;
}

function cacheSet<T>(cache: Map<string, T>, key: string, value: T): void {
    if (cache.size >= MAX_CACHE) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
    }
    cache.set(key, value);
}

/**
 * =========================
 * TAGS
 * =========================
 */
const tagsCache = ensureGlobalMap<string[]>('__tagsCache');
const tagsInFlight = ensureGlobalMap<Promise<string[]>>('__tagsInFlight');

export async function generateImageTags(imageUrl: string): Promise<string[]> {
    let inflightKey = imageUrl;

    try {
        const cached = tagsCache.get(inflightKey);
        if (cached) return cached;

        const existing = tagsInFlight.get(inflightKey);
        if (existing) return await existing;

        const task = (async (): Promise<string[]> => {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Image fetch failed: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Image = buffer.toString('base64');
            const mimeType = response.headers.get('content-type') || 'image/jpeg';

            console.log('--- GEMINI DEBUG (TAGS) ---');
            console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
            console.log('Model:', 'gemini-2.0-flash');
            console.log('Requesting tags for:', imageUrl.slice(0, 50) + '...');

            const prompt = `Analiza esta imagen y genera una lista de 5 a 8 etiquetas (keywords) relevantes para ventas y categorización.
Las etiquetas deben ser en español, concisas (1-2 palabras), y orientadas a lo visual y emocional (ej. "San Valentín", "Romántico", "Decoración", "Rojo", "Regalo").
Devuelve SOLAMENTE las etiquetas separadas por comas, sin numeración ni texto adicional.`;

            const maxAttempts = 4;
            let lastError: unknown = null;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    const result = await model.generateContent([
                        prompt,
                        {
                            inlineData: {
                                data: base64Image,
                                mimeType: mimeType
                            }
                        }
                    ]);

                    const text = result.response.text();

                    const tags = text
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(tag => tag.length > 0)
                        .slice(0, 8);

                    cacheSet(tagsCache, inflightKey, tags);
                    return tags;
                } catch (err) {
                    lastError = err;

                    if (!isRetryable429(err) || attempt === maxAttempts) break;

                    const baseDelay = 800 * Math.pow(2, attempt - 1);
                    const jitter = Math.floor(Math.random() * 250);
                    await sleep(baseDelay + jitter);
                }
            }

            throw lastError;
        })();

        tagsInFlight.set(inflightKey, task);
        return await task;
    } catch (error) {
        console.error('Error generating tags:', error);
        return [];
    } finally {
        tagsInFlight.delete(inflightKey);
    }
}

/**
 * =========================
 * DESCRIPTION
 * =========================
 */
const descCache = ensureGlobalMap<string>('__descCache');
const descInFlight = ensureGlobalMap<Promise<string>>('__descInFlight');

export async function generateProductDescription(params: {
    imageUrl: string;
    title?: string;
    category?: string;
    tags?: string[];
}): Promise<string> {
    const { imageUrl, title, category, tags } = params;

    // Key incluye contexto para que el cache sea correcto
    const cacheKey = JSON.stringify({
        imageUrl,
        title: (title || '').trim(),
        category: (category || '').trim(),
        tags: (tags || []).map(t => t.trim()).filter(Boolean).slice(0, 12)
    });

    try {
        const cached = descCache.get(cacheKey);
        if (cached) return cached;

        const existing = descInFlight.get(cacheKey);
        if (existing) return await existing;

        const task = (async (): Promise<string> => {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Image fetch failed: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Image = buffer.toString('base64');
            const mimeType = response.headers.get('content-type') || 'image/jpeg';

            const safeTitle = (title || '').trim();
            const safeCategory = (category || '').trim();
            const safeTags = (tags || []).map(t => t.trim()).filter(Boolean).slice(0, 12);

            console.log('--- GEMINI DEBUG (DESC) ---');
            console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
            console.log('Model:', 'gemini-2.0-flash');
            console.log('Requesting description for:', imageUrl.slice(0, 50) + '...');

            const prompt = `Eres un redactor de e-commerce para impresión 3D.
Genera una descripción breve (2 a 3 frases) en español para vender el producto de la imagen.

Contexto:
- Título: ${safeTitle || 'N/A'}
- Categoría: ${safeCategory || 'N/A'}
- Tags: ${safeTags.length ? safeTags.join(', ') : 'N/A'}

Requisitos:
- Describe lo que se ve (sin inventar detalles no visibles).
- Enfatiza beneficio/emoción y uso (regalo, decoración, etc.).
- Incluye 1 frase final tipo llamada a la acción.
- No uses viñetas. No uses comillas. No menciones "IA".
Devuelve SOLO el texto final.`;

            const maxAttempts = 4;
            let lastError: unknown = null;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    const result = await model.generateContent([
                        prompt,
                        {
                            inlineData: {
                                data: base64Image,
                                mimeType: mimeType
                            }
                        }
                    ]);

                    const text = result.response.text().trim();

                    cacheSet(descCache, cacheKey, text);
                    return text;
                } catch (err) {
                    lastError = err;

                    if (!isRetryable429(err) || attempt === maxAttempts) break;

                    const baseDelay = 800 * Math.pow(2, attempt - 1);
                    const jitter = Math.floor(Math.random() * 250);
                    await sleep(baseDelay + jitter);
                }
            }

            throw lastError;
        })();

        descInFlight.set(cacheKey, task);
        return await task;
    } catch (error) {
        console.error('Error generating description:', error);
        return '';
    } finally {
        descInFlight.delete(cacheKey);
    }
}
