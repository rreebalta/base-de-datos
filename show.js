// show.js - Vistas del feed, episodio, serie, etc. - VERSIÓN DEFINITIVA 2026 MODERNIZADA
importar { getAllEpisodios, getSerieById, getEpisodiosBySerieId, getEpisodiosConSerie } desde './episodios.js';
import { userStorage } from './storage.js';
import './player.js';

// ---------- CONSTANTES ----------
const ICONOS = {
    reproducir: 'https://marca1.odoo.com/web/image/508-f876320c/play.svg',
    pausa: 'https://marca1.odoo.com/web/image/508-f876320c/pause.svg',
    agregar: 'https://marca1.odoo.com/web/image/509-c555b4ef/a%C3%B1adir%20a.svg',
    añadido: 'https://nikichitonjesus.odoo.com/web/image/1112-d141b3eb/a%C3%B1adido.png',
    dl: 'https://marca1.odoo.com/web/image/510-7a9035c1/descargar.svg',
    noDl: 'https://nikichitonjesus.odoo.com/web/image/1051-622a3db3/no-desc.webp',
    compartir: 'https://nikichitonjesus.odoo.com/web/image/585-036b7961/cpmartir.png',
    buyPremium: 'https://balta-media.odoo.com/web/image/879-360eccc9/Sotore.webp'
};

const CATEGORÍAS = [
    "Todos", "Derecho", "Física y Astronomía", "Matemáticas", "Historia",
    "Filosofía", "Economía y Finanzas", "Ciencias Sociales", "Arte y Cultura",
    "Literatura y Audiolibros", "Cine y TV", "Documentales", "Ciencias Naturales",
    "Tecnología e Informática", "Otras Ciencias"
];

// ---------- ESTILOS GLOBALES (fondo degradado + azul marino elegante) ----------
const GLOBAL_STYLES = `
    <style>
        cuerpo {
            fondo: gradiente lineal(135 grados, #1a2639 0%, #0f172a 50%, #1e293b 100%);
            altura mínima: 100vh;
        }
        .bg-custom-dark {
            fondo: gradiente lineal(135 grados, #1a2639 0%, #0f172a 50%, #1e293b 100%);
        }
        .card-std, .card-video, .grid-card, .list-item, .detail-view, .serie-header {
            fondo: rgba(255, 255, 255, 0.03);
            filtro de fondo: desenfoque (2px);
        }
        .btn-primary {
            fondo: #0369a1 !importante;
        }
        .btn-primary:hover {
            fondo: #075985 !importante;
        }
        .carrusel-doble .columna-flexible {
            brecha: 0,75rem;
        }
        .carrusel-doble .tarjeta-estándar {
            margen inferior: 0;
        }
        .superposición-premium {
            fondo: rgba(139, 92, 246, 0.3);
        }
    </style>
`;

// Aplicar estilos globales
if (!document.getElementById('global-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'global-styles';
    styleSheet.textContent = GLOBAL_STYLES.replace('<style>', '').replace('</style>', '');
    documento.head.appendChild(styleSheet);
}

// ---------- UTILIDADES ----------
función determinarCategorías(ep) {
    const gatos = nuevo conjunto();
    const text = (ep.title + ' ' + ep.descripción + ' ' + (ep.series?.titulo_serie || '') + ' ' + (ep.series?.descripcion_serie || '')).toLowerCase();
    patrones constantes = {
        "Derecho": /\b(derecho|penal|civil|constitucional|procesal|delito|ley|jurisprudencia|código|tribunal|justicia|proceso|abogado|legal)\b/i,
        "Física y Astronomía": /\b(física|fisica|mecánica|mecanica|cuántica|cuantica|termodinámica|termodinamica|newton|einstein|astronomía|astronomia|planeta|cosmos|gravedad|universo)\b/i,
        "Matemáticas": /\b(matemática|matematicas|calculo|cálculo|álgebra|álgebra|geometria|geometría|estadistica|estadística|probabilidad|ecuacion|ecuación|teorema|integral|función|funcion)\b/i,
        "Historia": /\b(historia|histórico|historico|siglo|época|epoca|imperio|guerra|revolución|revolucion|antiguo|medieval|edad media|antigüedad)\b/i,
        "Filosofía": /\b(filosofía|filosofia|kant|platon|platón|aristoteles|ética|etica|metafísica|metafisica|ontología|ontologia|epistemología|epistemologia|pensamiento|razón|razon)\b/i,
        "Economía y Finanzas": /\b(economía|economia|finanzas|inflación|inflacion|keynes|oferta|demanda|macroeconomía|macroeconomia|pib|mercado|dinero|banco|inversión|inversion|geopolítica|geopolitica|política|politica)\b/i,
        "Ciencias Sociales": /\b(sociología|sociologia|antropología|antropologia|psicología|psicologia|sociedad|cultura|identidad|género|genero|desigualdad|comunidad|social|humano)\b/i,
        "Arte y Cultura": /\b(arte|pintura|escultura|arquitectura|renacimiento|barroco|música|musica|cultura|artístico|artistico|artista|obra)\b/i,
        "Literatura y Audiolibros": /\b(audiolibro|libro|novela|cuento|poema|clásico|clásico|literatura|lectura|escritor|poesía|poesia)\b/i,
        "Cine y TV": /\b(cine|película|pelicula|serie|director|guion|ficción|ficcion|animación|animacion|actor|actriz|documental)\b/i,
        "Documentales": /\b(documental|bbc|naturaleza|espacio|universo|planeta|national Geographic|descubrimiento|exploración|exploracion)\b/i,
        "Ciencias Naturales": /\b(biología|biologia|química|quimica|geología|geologia|ecología|ecologia|evolución|evolucion|genética|genetica|clima|botánica|botanica|animal|planta|ecosistema)\b/i,
        "Tecnología e Informática": /\b(tecnología|tecnologia|programación|programacion|python|ia|computación|computacion|algoritmo|software|desarrollo|hardware|informática|informatica)\b/i,
        "Investigación y Criminología": /\b(investigación|investigacion|criminalística|criminalistica|crimen|delito|forense|guerra|conflicto|violencia|seguridad|policía|policia|detective|asesinato|homicidio)\b/i
    };
    para (const [cat, regex] de Object.entries(patterns)) {
        Si (regex.test(texto)) gatos.add(gato);
    }
    si (ep.type === 'video') {
        if (text.includes('documental')) cats.add("Documentales");
        de lo contrario, cats.add("Cine y TV");
    }
    if (cats.size === 0) cats.add("Otras Ciencias");
    devolver Array.from(cats);
}

export const DATA = getEpisodiosConSerie().map(ep => ({
    ...ep,
    categorías: determineCategorías(ep)
}));

// ---------- RENDERIZADO DE TARJETAS ----------
función de exportación createStandardCard(ep) {
    const inPlaylist = userStorage.playlist.has(ep.id);
    const addIcon = inPlaylist ? ICONS.added : ICONS.add;
    const dlIcon = ep.allowDownload ? ICONS.dl : ICONS.noDl;
    const isPremium = ep.premium === 'true';

    return `<div class="card-std group relative" data-episodio-id="${ep.id}">
        <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-800/50 cursor-pointer" onclick="window.goToDetail('${ep.detailUrl}')">
            <img src="${ep.coverUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
            <div class="overlay-full ${isPremium ? 'premium-overlay' : ''}">
                ${isPremium ? '' : `<img src="${dlIcon}" class="action-icon" data-episodio-id="${ep.id}" title="${ep.allowDownload ? 'Descargar' : 'No disponible'}">`}
                <img src="${addIcon}" class="action-icon" data-episodio-id="${ep.id}" data-added="${inPlaylist}">
                ${!isPremium ? `<img src="${ICONS.play}" class="play-icon-lg" data-episodio-id="${ep.id}">` : ''}
            </div>
            ${isPremium ? `<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-lg">Premium</div>` : ''}
        </div>
        <div onclick="window.goToDetail('${ep.detailUrl}')" class="cursor-pointer mt-2">
            <h3 class="font-bold text-white text-sm truncate hover:text-blue-400 transition-colors">${ep.title}</h3>
            <p class="text-xs text-gray-400 truncate">${ep.author}</p>
        </div>
    </div>`;
}

función de exportación createVerticalCard(ep) {
    const inPlaylist = userStorage.playlist.has(ep.id);
    const addIcon = inPlaylist ? ICONS.added : ICONS.add;
    const dlIcon = ep.allowDownload ? ICONS.dl : ICONS.noDl;
    const isPremium = ep.premium === 'true';

    return `<div class="card-std group relative" data-episodio-id="${ep.id}">
        <div class="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-zinc-800/50 cursor-pointer" onclick="window.goToDetail('${ep.detailUrl}')">
            <img src="${ep.coverUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
            <div class="overlay-full ${isPremium ? 'premium-overlay' : ''}">
                ${isPremium ? '' : `<img src="${dlIcon}" class="action-icon" data-episodio-id="${ep.id}">`}
                <img src="${addIcon}" class="action-icon" data-episodio-id="${ep.id}" data-added="${inPlaylist}">
                ${!isPremium ? `<img src="${ICONS.play}" class="play-icon-lg" data-episodio-id="${ep.id}">` : ''}
            </div>
            ${isPremium ? `<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-lg">Premium</div>` : ''}
        </div>
        <div onclick="window.goToDetail('${ep.detailUrl}')" class="cursor-pointer mt-2">
            <h3 class="font-bold text-white text-sm truncate hover:text-blue-400 transition-colors">${ep.title}</h3>
            <p class="text-xs text-gray-400 truncate">${ep.author}</p>
        </div>
    </div>`;
}

función de exportación createVideoExpand(ep) {
    const inPlaylist = userStorage.playlist.has(ep.id);
    const addIcon = inPlaylist ? ICONS.added : ICONS.add;
    const dlIcon = ep.allowDownload ? ICONS.dl : ICONS.noDl;
    const isPremium = ep.premium === 'true';

    return `<div class="card-video group relative" data-episodio-id="${ep.id}">
        <img src="${ep.coverUrl}" class="absolute inset-0 w-full h-full object-cover z-10 group-hover:opacity-0 transition-opacity duration-300">
        <img src="${ep.coverUrl}" class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div class="overlay-full z-20 ${isPremium ? 'premium-overlay' : ''}">
            ${isPremium ? '' : `<img src="${dlIcon}" class="action-icon" data-episodio-id="${ep.id}">`}
            <img src="${addIcon}" class="action-icon" data-episodio-id="${ep.id}" data-added="${inPlaylist}">
            ${!isPremium ? `<img src="${ICONS.play}" class="play-icon-lg" data-episodio-id="${ep.id}">` : ''}
        </div>
        ${isPremium ? `<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-lg z-30">Premium</div>` : ''}
        <div class="absolute bottom-2 left-2 z-20 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold border border-white/10">VIDEO</div>
    </div>`;
}

función de exportación createListItem(ep, idx) {
    const inPlaylist = userStorage.playlist.has(ep.id);
    const addIcon = inPlaylist ? ICONS.added : ICONS.add;
    const isPremium = ep.premium === 'true';

    devolver `
        <div class="list-item group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors w-full"
             data-episodio-id="${ep.id}">
            <span class="text-gray-400 font-semibold w-6 text-center text-sm flex-shrink-0">${idx + 1}</span>
            <div class="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer"
                 onclick="window.goToDetail('${ep.detailUrl}')">
                <img src="${ep.coverUrl}" class="w-full h-full object-cover" loading="lazy">
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                     data-episodio-id="${ep.id}">
                    ${!isPremium ? `<img src="${ICONS.play}" class="w-5 h-5">` : '<span class="text-white text-xs">Premium</span>'}
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                    <h4 class="text-sm font-medium text-white truncate group-hover:text-blue-400 cursor-pointer"
                        onclick="window.goToDetail('${ep.detailUrl}')">${ep.title}</h4>
                    <span class="text-xs text-gray-400 truncate">${ep.author}</span>
                </div>
            </div>
            <button class="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors"
                    data-episodio-id="${ep.id}" data-action="add">
                <img src="${addIcon}" class="w-5 h-5" data-episodio-id="${ep.id}" data-added="${inPlaylist}">
            </button>
        </div>`;
}

función de exportación createGridCard(item) {
    const inPlaylist = userStorage.playlist.has(item.id);
    const addIcon = inPlaylist ? ICONS.added : ICONS.add;
    const dlIcon = item.allowDownload ? ICONS.dl : ICONS.noDl;
    const isPremium = item.premium === 'true';

    devolver `
        <div class="grid-card group relative" data-episodio-id="${item.id}">
            <div class="aspect-square bg-zinc-800/50 relative rounded-xl overflow-hidden cursor-pointer" onclick="window.goToDetail('${item.detailUrl}')">
                <img src="${item.coverUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                <div class="overlay-full ${isPremium ? 'premium-overlay' : ''}">
                    ${isPremium ? '' : `<img src="${dlIcon}" class="action-icon" data-episodio-id="${item.id}">`}
                    <img src="${addIcon}" class="action-icon" data-episodio-id="${item.id}" data-added="${inPlaylist}">
                    ${!isPremium ? `<img src="${ICONS.play}" class="play-icon-lg" data-episodio-id="${item.id}">` : ''}
                </div>
                ${isPremium ? `<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-lg">Premium</div>` : ''}
            </div>
            <div onclick="window.goToDetail('${item.detailUrl}')" class="cursor-pointer mt-2">
                <h4 class="font-bold text-sm text-white truncate hover:text-blue-400 transition-colors">${item.title}</h4>
                <p class="text-xs text-gray-500 truncate">${item.author}</p>
            </div>
        </div>
    `;
}

// ---------- CARRUSELES ----------
función crearCarrusel(título, tipo, elementos, contextoCategoría, viewAllType = 'categoría') {
    Si (!items || items.length === 0) devuelve '';
    const id = 'c-' + Math.random().toString(36).substr(2, 9);
    let contenido = '';
    let extraClass = '';

    si (tipo === 'double') {
        extraClass = 'carousel-double';
        contenido = `<div id="${id}" class="flex flex-col flex-wrap h-[580px] gap-x-6 gap-y-3 overflow-x-auto no-scrollbar scroll-smooth">` +
            items.map(ep => createStandardCard(ep)).join('') +
            `</div>`;
    } else if (type === 'list') {
        contenido = `<div id="${id}" class="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-4">`;
        para (sea i = 0; i < items.length; i += 4) {
            contenido += `<div class="card-list-group min-w-[300px] sm:min-w-[340px] space-y-3">` +
                (items[i] ? createListItem(items[i], i) : '') +
                (items[i+1] ? createListItem(items[i+1], i+1) : '') +
                (items[i+2] ? createListItem(items[i+2], i+2) : '') +
                (items[i+3] ? createListItem(items[i+3], i+3) : '') +
                `</div>`;
        }
        contenido += `</div>`;
    } else if (type === 'expand') {
        contenido = `<div id="${id}" class="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 pl-1">` +
            items.map(ep => createVideoExpand(ep)).join('') +
            `</div>`;
    } else if (type === 'vertical') {
        contenido = `<div id="${id}" class="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 pl-1">` +
            items.map(ep => createVerticalCard(ep)).join('') +
            `</div>`;
    } demás {
        contenido = `<div id="${id}" class="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 pl-1">` +
            items.map(ep => createStandardCard(ep)).join('') +
            `</div>`;
    }

    let verTodoHandler;
    si (viewAllType === 'series') {
        verTodoHandler = `window.showSeriesGrid('${title}')`;
    } else if (categoryContext && categoryContext !== 'Todos') {
        verTodoHandler = `window.handleCategoryClick('${categoryContext}')`;
    } demás {
        const itemIds = JSON.stringify(items.map(ep => ep.id));
        verTodoHandler = `window.showItemsGrid('${title}', ${itemIds})`;
    }

    return `<section class="carousel-wrapper relative group/section mb-8 sm:mb-12 ${extraClass}">
        <div class="flex items-end justify-between mb-3 sm:mb-5 px-1">
            <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-white hover:text-blue-400 transition-colors cursor-pointer" onclick="${verTodoHandler}">${title}</h2>
            <button onclick="${verTodoHandler}" class="text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-white transition-colors">Ver todo</button>
        </div>
        <div class="relative">
            <div class="nav-btn left" onclick="document.getElementById('${id}').scrollLeft -= 600"><button>❮</button></div>
            ${contenido}
            <div class="nav-btn right" onclick="document.getElementById('${id}').scrollLeft += 600"><button>❯</button></div>
        </div>
    </section>`;
}

función createSeriesCarousel() {
    const id = 'c-series-' + Math.random().toString(36).substr(2, 9);
    const seriesGroups = {};
    DATOS.forEach(ep => {
        si (ep.series) {
            const serieKey = ep.series.url_serie;
            si (!seriesGroups[serieKey]) {
                seriesGroups[serieKey] = { episodes: [], seriesInfo: ep.series };
            }
            seriesGroups[serieKey].episodes.push(ep);
        }
    });

    let seriesArray = Object.entries(seriesGroups).map(([key, value]) => ({ key, ...value }));
    para (let i = seriesArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [seriesArray[i], seriesArray[j]] = [seriesArray[j], seriesArray[i]];
    }

    Si (seriesArray.length === 0) devuelve '';

    let content = `<div id="${id}" class="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-4">`;
    seriesArray.forEach(group => {
        grupo.episodios.ordenar((a, b) => nueva fecha(b.fecha) - nueva fecha(a.fecha));
        const s = grupo.seriesInfo;
        Si (!s || group.episodes.length < 1) regresar;
        contenido += `<div class="card-list-group min-w-[300px] sm:min-w-[340px]">
            <div class="mb-4 cursor-pointer group/serie" onclick="window.goToDetail('${s.url_serie}')">
                <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-800/50">
                    <img src="${s.portada_serie}" class="w-full h-full object-cover group-hover/serie:scale-105 transition-transform duration-500" loading="lazy">
                </div>
                <h3 class="font-bold text-white text-sm truncate mt-2 group-hover/serie:text-blue-400 transition-colors">${s.titulo_serie}</h3>
                <p class="text-xs text-gray-400 flex items-center gap-1">
                    <span>ver serie</span>
                    <span class="text-blue-400">→</span>
                </p>
            </div>
            <div class="space-y-3">
                ${group.episodes.slice(0, 4).map((ep, i) => createListItem(ep, i)).join('')}
            </div>
        </div>`;
    });
    contenido += `</div>`;

    return `<section class="carousel-wrapper relative group/section mb-8 sm:mb-12">
        <div class="flex items-end justify-between mb-3 sm:mb-5 px-1">
            <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-white hover:text-blue-400 transition-colors cursor-pointer" onclick="window.showSeriesGrid('Series y Cursos Académicos')">Series y Cursos Académicos</h2>
            <button class="text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-white transition-colors" onclick="window.showSeriesGrid('Series y Cursos Académicos')">Ver todo</button>
        </div>
        <div class="relative">
            <div class="nav-btn left" onclick="document.getElementById('${id}').scrollLeft -= 600"><button>❮</button></div>
            ${contenido}
            <div class="nav-btn right" onclick="document.getElementById('${id}').scrollLeft += 600"><button>❯</button></div>
        </div>
    </section>`;
}

// ---------- CARRUSEL DE RECOMENDADOS ----------
función createRecommendedCarousel(currentEp) {
    si (!currentEp) devuelve '';
    const similar = DATOS
        .filter(e => e.id !== currentEp.id && e.categories.some(c => currentEp.categories.includes(c)))
        .sort(() => 0.5 - Math.random())
        .slice(0, 8);

    Si (similar.length === 0) devuelve '';

    return createCarousel("Te puede interesar", "standard", similar, null, 'items');
}

// ---------- VISTAS DE DETALLE ----------
export function renderEpisodio(container, episodioId) {
    intentar {
        const ep = DATA.find(e => e.id === episodioId);
        si (!ep) {
            import('./404.js').then(m => m.render(container));
            devolver;
        }
        const inPlaylist = userStorage.playlist.has(ep.id);
        const addIcon = inPlaylist ? ICONS.added : ICONS.add;
        const isPremium = ep.premium === 'true';

        const html = `
            <div class="detail-view w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6" style="background: linear-gradient(135deg, ${ep.bgColor}20 0%, #0a0a0a 100%); min-height: 100vh;">
                <div class="episode-header mb-8">
                    <div class="block lg:hidden">
                        <div class="relative w-full aspect-square max-w-[300px] mx-auto mb-6 rounded-3xl overflow-hidden shadow-2xl">
                            <img src="${ep.coverUrl}" class="w-full h-full object-cover" alt="${ep.title}">
                        </div>
                        <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">${ep.title}</h1>
                        <p class="text-lg text-gray-300 mb-3">${ep.author}</p>
                        <p class="text-gray-400 mb-6 leading-relaxed">${ep.description}</p>
                        <div class="flex items-center gap-3 mb-8">
                            ${isPremium ? `
                                <button class="flex-1 btn-primary rounded-2xl py-4 px-6 flex items-center justify-center gap-3 transition transform hover:scale-[1.02]" onclick="window.location.href='/premium'">
                                    <img src="${ICONS.buyPremium}" class="w-6 h-6">
                                    <span class="font-bold">Comprar Premium</span>
                                </button>
                            ` : `
                                <button class="flex-1 btn-primary rounded-2xl py-4 px-6 flex items-center justify-center gap-3 transition transform hover:scale-[1.02]" data-episodio-id="${ep.id}" data-action="play">
                                    <img src="${ICONS.play}" class="w-6 h-6 icon-white">
                                    <span class="font-bold">Reproducir</span>
                                </button>
                            `}
                            <button class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" data-episodio-id="${ep.id}" data-action="add">
                                <img src="${addIcon}" class="w-6 h-6 icon-white" data-episodio-id="${ep.id}" data-added="${inPlaylist}">
                            </button>
                            ${!isPremium && ep.allowDownload ? `
                                <button class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" data-episodio-id="${ep.id}" data-action="dl">
                                    <img src="${ICONS.dl}" class="w-6 h-6 icon-white">
                                </button>
                            ` : ''}
                            <button class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" onclick="window.shareContent('${ep.title}', '${ep.detailUrl}', '${ep.coverUrl}', '${ep.description}')">
                                <img src="${ICONS.share}" class="w-6 h-6 icon-white">
                            </button>
                        </div>
                    </div>
                    <div class="hidden lg:block relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900/50 to-black/50 border border-white/10">
                        <div class="absolute inset-0 opacity-20">
                            <img src="${ep.coverUrl}" class="w-full h-full object-cover blur-3xl scale-110">
                        </div>
                        <div class="relative z-10 p-8 flex gap-8">
                            <img src="${ep.coverUrl}" class="w-48 h-48 rounded-3xl object-cover shadow-2xl border-2 border-white/20" alt="${ep.title}">
                            <div class="flex-1">
                                <h1 class="text-4xl font-extrabold text-white mb-2">${ep.title}</h1>
                                <p class="text-xl text-gray-300 mb-4">${ep.author}</p>
                                <p class="text-gray-400 max-w-3xl leading-relaxed">${ep.description}</p>
                                <div class="flex items-center gap-4 mt-8">
                                    ${isPremium ? `
                                        <button class="btn-primary flex-1 rounded-2xl py-4 px-8 flex items-center gap-3 transition transform hover:scale-105" onclick="window.location.href='/premium'">
                                            <img src="${ICONS.buyPremium}" class="w-6 h-6">
                                            <span class="font-bold text-lg">Comprar Premium</span>
                                        </button>
                                    ` : `
                                        <button class="btn-primary rounded-2xl py-4 px-8 flex items-center gap-3 transition transform hover:scale-105" data-episodio-id="${ep.id}" data-action="play">
                                            <img src="${ICONS.play}" class="w-6 h-6 icon-white">
                                            <span class="font-bold text-lg">Reproducir</span>
                                        </button>
                                    `}
                                    <button class="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" data-episodio-id="${ep.id}" data-action="add" title="Añadir a lista">
                                        <img src="${addIcon}" class="w-6 h-6 icon-white" data-episodio-id="${ep.id}" data-added="${inPlaylist}">
                                    </button>
                                    ${!isPremium && ep.allowDownload ? `
                                        <button class="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" data-episodio-id="${ep.id}" data-action="dl" title="Descargar">
                                            <img src="${ICONS.dl}" class="w-6 h-6 icon-white">
                                        </button>
                                    ` : ''}
                                    <button class="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" onclick="window.shareContent('${ep.title}', '${ep.detailUrl}', '${ep.coverUrl}', '${ep.description}')" title="Compartir">
                                        <img src="${ICONS.share}" class="w-6 h-6 icon-white">
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                ${ep.series ? `
                    <div class="part-of-program mt-8 lg:mt-12 p-6 lg:p-8 bg-white/5 backdrop-blur rounded-3xl border border-white/10">
                        <h3 class="text-xl lg:text-2xl font-bold mb-6">Parte del programa</h3>
                        <div class="program-card flex flex-col sm:flex-row items-start sm:items-center gap-6 cursor-pointer group" onclick="window.goToDetail('${ep.series.url_serie}')">
                            <img src="${ep.series.portada_serie}" class="w-24 h-24 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform" alt="${ep.series.titulo_serie}">
                            <div>
                                <h3 class="text-xl lg:text-2xl font-bold group-hover:text-blue-400 transition-colors">${ep.series.titulo_serie}</h3>
                                <p class="text-gray-400 mt-1 line-clamp-2">${ep.series.descripcion_serie}</p>
                                <p class="text-blue-400 font-semibold mt-3 flex items-center gap-1">
                                    Ver más episodios <span class="text-lg">→</span>
                                </p>
                            </div>
                        </div>
                    </div>
                ` : ''}
                <!-- CARRUSEL RECOMENDADOS -->
                ${createRecommendedCarousel(ep)}
            </div>
        `;
        contenedor.innerHTML = html;
    } catch (error) {
        console.error('Error en renderEpisodio:', error);
        contenedor.innerHTML = `<div class="error-container p-8 text-center">
            <p class="text-red-500 text-lg">Error al cargar el episodio. Intenta de nuevo.</p>
            <button onclick="window.location.href='/'" class="mt-4 btn-primary px-4 py-2 rounded">Volver al inicio</button>
        </div>`;
    }
}

función de exportación renderSerie(contenedor,serieUrl) {
    intentar {
        const serie = DATA.find(e => e.series?.url_serie === serieUrl)?.series;
        si (!serie) {
            import('./404.js').then(m => m.render(container));
            devolver;
        }
        const episodiosSerie = DATA.filter(e => e.series?.url_serie === serieUrl);
        episodiosSerie.sort((a, b) => new Date(b.date) - new Date(a.date));
        const episodiosHtml = episodiosSerie.map(ep => {
            const inPlaylist = userStorage.playlist.has(ep.id);
            const addIcon = inPlaylist ? ICONS.added : ICONS.add;
            const isPremium = ep.premium === 'true';

            devolver `
                <div class="episode-card flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-white/5 backdrop-blur rounded-2xl sm:rounded-3xl border border-white/10 mb-4 hover:bg-white/10 transition-all group relative" data-episodio-id="${ep.id}">
                    <img src="${ep.coverUrl}" class="w-full sm:w-24 h-48 sm:h-24 rounded-xl sm:rounded-2xl object-cover" loading="lazy" onclick="window.goToDetail('${ep.detailUrl}')" style="cursor: pointer;">
                    ${isPremium ? `<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-lg z-10">Premium</div>` : ''}
                    <div class="flex-1 min-w-0 w-full">
                        <div onclick="window.goToDetail('${ep.detailUrl}')" class="cursor-pointer">
                            <h3 class="text-lg sm:text-xl font-bold truncate hover:text-blue-400 transition-colors">${ep.title}</h3>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-gray-400 text-sm">${ep.author}</span>
                                <span class="bg-blue-900/30 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-900/30"> ${ep.initialMode === 'video' ? 'VIDEO' : 'AUDIO'} </span>
                            </div>
                        </div>
                        <p class="text-gray-400 text-sm mt-2 line-clamp-2 hidden sm:block">${ep.description}</p>
                        <div class="flex items-center gap-2 mt-4">
                            <button class="episode-action-btn w-10 h-10 rounded-xl bg-black/30 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/20 transition" data-episodio-id="${ep.id}" data-action="add" title="Añadir a lista">
                                <img src="${addIcon}" class="w-5 h-5 icon-white" data-episodio-id="${ep.id}" data-added="${inPlaylist}">
                            </button>
                            ${!isPremium && ep.allowDownload ? `
                                <button class="episode-action-btn w-10 h-10 rounded-xl bg-black/30 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/20 transition" data-episodio-id="${ep.id}" data-action="dl" title="Descargar">
                                    <img src="${ICONS.dl}" class="w-5 h-5 icon-white">
                                </button>
                            ` : ''}
                            <button class="episode-action-btn w-10 h-10 rounded-xl bg-black/30 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/20 transition" onclick="window.shareContent('${ep.title}', '${ep.detailUrl}', '${ep.coverUrl}', '${ep.description}')" title="Compartir">
                                <img src="${ICONS.share}" class="w-5 h-5 icon-white">
                            </button>
                            ${!isPremium ? `
                                <button class="episode-play-btn w-10 h-10 sm:w-14 sm:h-14 rounded-full btn-primary flex items-center justify-center hover:scale-110 transition ml-auto" data-episodio-id="${ep.id}" data-action="play" title="Reproducir">
                                    <img src="${ICONS.play}" class="w-5 h-5 sm:w-7 sm:h-7 icon-white ml-1">
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).unirse('');
        const ultimoEpisodio = episodiosSerie[0] || nulo;
        const html = `
            <div class="detail-view w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6" style="background: linear-gradient(135deg, ${serie.bgColor || '#0a0a0a'}20 0%, #0a0a0a 100%); min-height: 100vh;">
                <div class="serie-header mb-8">
                    <div class="block lg:hidden">
                        <div class="relative w-full aspect-square max-w-[300px] mx-auto mb-6 rounded-3xl overflow-hidden shadow-2xl">
                            <img src="${serie.portada_serie}" class="w-full h-full object-cover" alt="${serie.titulo_serie}">
                        </div>
                        <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">${serie.titulo_serie}</h1>
                        <p class="text-lg text-gray-300 mb-3">${episodiosSerie[0]?.author || ''}</p>
                        <p class="text-gray-400 mb-6 líder-relajado">${serie.descripcion_serie}</p>
                        <div class="flex items-center gap-3 mb-8">
                            ${ultimoEpisodio && ultimoEpisodio.premium!== 'verdadero'? `
                                <button class="flex-1 btn-primary rounded-2xl py-4 px-6 flex items-center justify-center gap-3 transition transform hover:scale-[1.02]" data-episodio-id="${ultimoEpisodio.id}" data-action="play">
                                    <img src="${ICONS.play}" class="w-6 h-6 icon-white">
                                    <span class="font-bold">Último episodio</span>
                                </button>
                            ` : ''}
                            <button class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" onclick="window.shareContent('${serie.titulo_serie}', '${serie.url_serie}', '${serie.portada_serie}', '${serie.descripcion_serie}')" title="Compartir serie">
                                <img src="${ICONS.share}" class="w-6 h-6 icon-white">
                            </button>
                        </div>
                    </div>
                    <div class="hidden lg:block relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900/50 to-black/50 border border-white/10">
                        <div class="absolute inset-0 opacity-20">
                            <img src="${serie.portada_serie}" class="w-full h-full object-cover blur-3xl scale-110">
                        </div>
                        <div class="relative z-10 p-8 flex gap-8">
                            <img src="${serie.portada_serie}" class="w-48 h-48 rounded-3xl object-cover shadow-2xl border-2 border-white/20" alt="${serie.titulo_serie}">
                            <div class="flex-1">
                                <h1 class="text-4xl font-extrabold text-white mb-2">${serie.titulo_serie}</h1>
                                <p class="text-xl text-gray-300 mb-4">${episodiosSerie[0]?.author || ''}</p>
                                <p class="text-gray-400 max-w-3xl líder-relajado">${serie.descripcion_serie}</p>
                                <div class="flex items-center gap-4 mt-8">
                                    ${ultimoEpisodio && ultimoEpisodio.premium!== 'verdadero'? `
                                        <button class="btn-primary rounded-2xl py-4 px-8 flex items-center gap-3 transition transform hover:scale-105" data-episodio-id="${ultimoEpisodio.id}" data-action="play">
                                            <img src="${ICONS.play}" class="w-6 h-6 icon-white">
                                            <span class="font-bold text-lg">Último episodio</span>
                                        </button>
                                    ` : ''}
                                    <button class="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" onclick="window.shareContent('${serie.titulo_serie}', '${serie.url_serie}', '${serie.portada_serie}', '${serie.descripcion_serie}')" title="Compartir serie">
                                        <img src="${ICONS.share}" class="w-6 h-6 icon-white">
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="episodes-list mt-8 lg:mt-12">
                    <h2 class="text-xl lg:text-2xl font-bold mb-6 flex items-center gap-2">
                        <span>Episodios</span>
                        <span class="text-sm font-normal text-gray-500">(${episodiosSerie.length})</span>
                    </h2>
                    <div class="space-y-4">
                        ${episodiosHtml}
                    </div>
                </div>
                <!-- CARRUSEL RECOMENDADOS AL FINAL DE LA SERIE -->
                ${createRecommendedCarousel(episodiosSerie[0])}
            </div>
        `;
        contenedor.innerHTML = html;
    } catch (error) {
        console.error('Error en renderSerie:', error);
        contenedor.innerHTML = `<div class="error-container p-8 text-center">
            <p class="text-red-500 text-lg">Error al cargar la serie. Intenta de nuevo.</p>
            <button onclick="window.location.href='/'" class="mt-4 btn-primary px-4 py-2 rounded">Volver al inicio</button>
        </div>`;
    }
}

// ---------- RENDER FEED (sin cambios mayores, solo colores) ----------
función de exportación renderFeed(contenedor) {
    let feedView = document.getElementById('feed-view');
    let gridView = document.getElementById('grid-view');
    si (!feedView) {
        contenedor.innerHTML = `
            <div id="feed-view" class="space-y-8 sm:space-y-12 transition-opacity duration-300"></div>
            <div id="grid-view" class="hidden transition-opacity duration-300">
                <div class="flex items-center justify-between mb-6 sm:mb-8 mt-4 sm:mt-6">
                    <h2 id="grid-title" class="text-xl sm:text-2xl font-bold">Resultados</h2>
                    <button id="closeGridBtn" class="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-1">
                        <span class="text-xl">×</span> Cerrar búsqueda
                    </button>
                </div>
                <div id="results-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6"></div>
                <div id="empty-state" class="hidden py-8 sm:py-10 text-center">
                    <p class="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8" id="empty-msg">No encontramos nada...</p>
                    <h3 class="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white">Quizás te interese esto:</h3>
                    <div id="recommendations-grid" class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6"></div>
                </div>
            </div>
        `;
        feedView = document.getElementById('feed-view');
gridView = document.getElementById('grid-view');
}

const getRandomSafe = (count, filterFn = () => true) => {
    const filtrado = DATOS.filtro(filterFn);
    si (filtered.length === 0) devolver [];
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, filtered.length));
};

feedView.innerHTML = '';

feedView.innerHTML += createCarousel("Destacados del Día", "vertical",
    getRandomSafe(15), "Todos", 'items');

feedView.innerHTML += createCarousel("Nuevos Lanzamientos", "estándar",
    getRandomSafe(15, ep => new Date(ep.date) > new Date(Date.now() - 30*24*60*60*1000)), "Todos", 'items');

feedView.innerHTML += createCarousel("Series de Video", "expand",
    getRandomSafe(10, e => e.initialMode === 'video'), "Cine y TV", 'category');

feedView.innerHTML += createCarousel("Top Semanal", "list",
    getRandomSafe(16), "Todos", 'items');

feedView.innerHTML += createCarousel("Para Estudiar Profundamente", "double",
    getRandomSafe(20, e => e.categories.includes("Matemáticas") || e.categories.includes("Física y Astronomía")), "Matemáticas", 'categoría');

feedView.innerHTML += createCarousel("Matemáticas", "estándar",
    getRandomSafe(15, e => e.categories.includes("Matemáticas"), "Matemáticas", 'categoría');

feedView.innerHTML += createCarousel("Especiales en Video", "expand",
    getRandomSafe(10, e => e.initialMode === 'video' && e.categories.includes("Documentales")), "Documentales", 'category');

feedView.innerHTML += createCarousel("Física y Astronomía", "estándar",
    getRandomSafe(15, e => e.categories.includes("Física y Astronomía"), "Física y Astronomía", 'categoría');

feedView.innerHTML += createCarousel("Ciencias Naturales y Tecnología", "double",
    getRandomSafe(20, e => e.categories.some(c => ["Ciencias Naturales", "Tecnología e Informática"].includes(c))), "Otras Ciencias", 'categoría');

feedView.innerHTML += createSeriesCarousel();

feedView.innerHTML += createCarousel("Otras Ciencias y Disciplinas", "standard",
    getRandomSafe(15, e => e.categories.includes("Otras Ciencias") ||
        e.categories.some(c => ["Ciencias Naturales", "Tecnología e Informática"].includes(c))),
    "Otras Ciencias", 'categoría');

feedView.innerHTML += createCarousel("Imprescindibles del Mes", "list",
    getRandomSafe(16, e => new Date(e.date) > new Date(Date.now() - 60*24*60*60*1000)), "Todos", 'items');

feedView.innerHTML += createCarousel("Podcasts Destacados", "estándar",
    getRandomSafe(15, e => e.initialMode === 'audio'), "Todos", 'items');

feedView.innerHTML += createCarousel("Charlas y Conferencias", "expand",
    getRandomSafe(10, e => e.initialMode === 'video' && (e.categories.includes("Cine y TV") || e.categories.includes("Documentales"))), "Cine y TV", 'category');

feedView.innerHTML += createCarousel("Mentes Curiosas", "estándar",
    obtenerRandomSeguro(15, e =>
        /\b(investigación|investigacion|criminalística|criminalistica|crimen|delito|forense|guerra|conflicto|violencia|seguridad|policía|policia|detective|asesinato|homicidio|justicia|penal|legal|sociedad|problema social)\b/i
        .test(e.título + '' + e.descripción + '' + (e.serie?.titulo_serie || ''))
    ), "Derecho", 'categoría');

feedView.innerHTML += createCarousel("Mix de Saberes", "double",
    getRandomSafe(20), "Todos", 'items');
}

// ---------- RENDERIZAR CUADRÍCULA ----------
función de exportación renderGrid(contenedor, elementos, título) {
    let gridView = document.getElementById('grid-view');
    si (!gridView) {
        contenedor.innerHTML = `
            <div id="feed-view" class="hidden"></div>
            <div id="grid-view" class="transition-opacity duration-300">
                <div class="flex items-center justify-between mb-6 sm:mb-8 mt-4 sm:mt-6">
                    <h2 id="grid-title" class="text-xl sm:text-2xl font-bold">${title}</h2>
                    <button id="closeGridBtn" class="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-1">
                        <span class="text-xl">×</span> Cerrar búsqueda
                    </button>
                </div>
                <div id="results-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6"></div>
                <div id="empty-state" class="hidden py-8 sm:py-10 text-center">
                    <p class="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8" id="empty-msg">No encontramos nada...</p>
                    <h3 class="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white">Quizás te interese esto:</h3>
                    <div id="recommendations-grid" class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6"></div>
                </div>
            </div>
        `;
        gridView = document.getElementById('grid-view');
    }

    const gridContainer = document.getElementById('results-grid');
    const emptyState = document.getElementById('empty-state');
    const titleEl = document.getElementById('grid-title');
    titleEl.innerText = título;
    gridContainer.innerHTML = '';

    Si (items.length === 0) {
        emptyState.classList.remove('hidden');
        gridContainer.classList.add('hidden');
        const searchTerm = title.replace('Resultados para ', '').replace(/"/g, '');
        document.getElementById('empty-msg').innerText = `No hemos encontrado nada para "${searchTerm}"`;
        const suggestions = [...DATA].sort(() => 0.5 - Math.random()).slice(0, 5);
        const recGrid = document.getElementById('recommendations-grid');
        recGrid.innerHTML = '';
        sugerencias.forEach(ep => {
            recGrid.innerHTML += createGridCard(ep);
        });
    } demás {
        emptyState.classList.add('oculto');
        gridContainer.classList.remove('hidden');
        elementos.forEach(elemento => {
            gridContainer.innerHTML += createGridCard(elemento);
        });
    }

    document.getElementById('feed-view')?.classList.add('hidden');
    gridView.classList.remove('hidden');

    document.getElementById('closeGridBtn')?.addEventListener('click', () => {
        window.history.pushState(null, null, '/');
        ventana.dispatchEvent(new PopStateEvent('popstate'));
    });
}

// ---------- RENDER GRID DE SERIE ----------
función de exportación renderSeriesGrid(contenedor, título) {
    const seriesSet = nuevo Mapa();
    DATOS.forEach(ep => {
        if (ep.series && !seriesSet.has(ep.series.url_serie)) {
            seriesSet.set(ep.series.url_serie, ep.series);
        }
    });

    const series = Array.from(seriesSet.values());

    let gridView = document.getElementById('grid-view');
    si (!gridView) {
        contenedor.innerHTML = `
            <div id="feed-view" class="hidden"></div>
            <div id="grid-view" class="transition-opacity duration-300">
                <div class="flex items-center justify-between mb-6 sm:mb-8 mt-4 sm:mt-6">
                    <h2 id="grid-title" class="text-xl sm:text-2xl font-bold">${title}</h2>
                    <button id="closeGridBtn" class="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-1">
                        <span class="text-xl">×</span> Cerrar búsqueda
                    </button>
                </div>
                <div id="results-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6"></div>
                <div id="empty-state" class="hidden py-8 sm:py-10 text-center">
                    <p class="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8" id="empty-msg">No encontramos series...</p>
                </div>
            </div>
        `;
        gridView = document.getElementById('grid-view');
    }

    const gridContainer = document.getElementById('results-grid');
    const emptyState = document.getElementById('empty-state');
    const titleEl = document.getElementById('grid-title');
    titleEl.innerText = título;
    gridContainer.innerHTML = '';

    Si (series.length === 0) {
        emptyState.classList.remove('hidden');
        gridContainer.classList.add('hidden');
    } demás {
        emptyState.classList.add('oculto');
        gridContainer.classList.remove('hidden');
        series.forEach(serie => {
            gridContainer.innerHTML += `
                <div class="grid-card group cursor-pointer" onclick="window.goToDetail('${serie.url_serie}')">
                    <div class="aspect-square bg-zinc-800/50 relative rounded-xl overflow-hidden">
                        <img src="${serie.portada_serie}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                    </div>
                    <h4 class="font-bold text-sm text-white truncate mt-2 group-hover:text-blue-400 transition-colors">${serie.titulo_serie}</h4>
                    <p class="text-xs text-gray-500 truncate">Serie</p>
                </div>
            `;
        });
    }

    document.getElementById('feed-view')?.classList.add('hidden');
    gridView.classList.remove('hidden');

    document.getElementById('closeGridBtn')?.addEventListener('click', () => {
        window.history.pushState(null, null, '/');
        ventana.dispatchEvent(new PopStateEvent('popstate'));
    });
}

// ---------- FUNCIONES GLOBALES ----------
window.shareContent = async (título, url, portada = '', descripción = '') => {
    const fullUrl = window.location.origin + url;
    const shareData = {
        título,
        texto: descripción.substring(0, 150) + (descripción.length > 150 ? '...' : ''),
        URL: URL completa
    };

    // Metaetiquetas para redes sociales
    const updateMeta = (propiedad, contenido) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        si (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('propiedad', propiedad);
            documento.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    };

    updateMeta('og:título', título);
    actualizarMeta('og:descripción', descripción);
    updateMeta('og:image', portada || 'https://balta-media.odoo.com/default-og-image.jpg');
    updateMeta('og:url', URL completa);

    si (navegador.share) {
        intentar {
            esperar a que el navegador comparta los datos compartidos;
        } capturar (e) {
            navegador.clipboard.writeText(fullUrl);
        }
    } demás {
        navegador.clipboard.writeText(fullUrl);
    }
};

ventana.handlePlay = función(e, episodioId) {
    e.stopImmediatePropagation();
    e.preventDefault();
    const ep = DATA.find(x => x.id === episodioId);
    si (!ep) regresar;

    ventana.reproducirEpisodioExpandido(
        ep.mediaUrl || '',
        ep.mediaVideo || '',
        ep.initialMode || 'audio',
        ep.coverUrl || '',
        ep.coverInfo || ep.coverUrl || '',
        ep.título || '',
        ep.detailUrl || '',
        ep.autor || '',
        obtenerTodosLosEpisodios(),
        ep.texto || ep.descripción || '',
        ep.subtitlesUrl || '',
        ep.bgColor || '#0a0a0a',
        ep.allowDownload ?? falso
    );
};

ventana.handleDl = función(e, episodioId) {
    e.stopImmediatePropagation();
    e.preventDefault();
    const ep = DATA.find(x => x.id === episodioId);
    si (!ep || !ep.allowDownload) regresar;

    enlace constante = ep.mediaVideo || ep.mediaUrl;
    si (!link) regresar;

    const a = document.createElement('a');
    a.href = enlace;
    a.download = `${ep.title.replace(/[^a-z0-9]/gi, '_')}.${ep.mediaVideo ? 'mp4' : 'm4a'}`;
    a.objetivo = '_en blanco'; // fallback: abre en pestaña si falla descarga
    documento.cuerpo.añadirHijo(a);
    a.click();
    documento.cuerpo.eliminarHijo(a);
};

window.handleAdd = function(e, episodioId) {
    e.stopImmediatePropagation();
    e.preventDefault();
    const ep = DATA.find(x => x.id === episodioId);
    si (!ep) regresar;

    const alreadyIn = userStorage.playlist.has(ep.id);
    si (yaestáen) {
        userStorage.playlist.remove(ep.id);
    } demás {
        userStorage.playlist.add(ep);
    }

    document.querySelectorAll(`[data-episodio-id="${episodioId}"] img[data-added], [data-episodio-id="${episodioId}"] .action-icon[data-added]`)
        .forEach(img => {
            Si (img.tagName === 'IMG') {
                img.src = alreadyIn ? ICONS.add : ICONS.added;
                img.dataset.added = alreadyIn ? 'false' : 'true';
                img.style.transform = 'scale(1.3)';
                setTimeout(() => img.style.transform = 'scale(1)', 180);
            }
        });
};

ventana.goToDetail = función(url) {
    si (url && url !== '#') {
        window.history.pushState(null, null, url);
        ventana.dispatchEvent(new PopStateEvent('popstate'));
    }
};

ventana.handleCategoryClick = función(categoría) {
    const url = category === 'Todos' ? '/' : `/categoria/${encodeURIComponent(category)}`;
    window.history.pushState(null, null, url);
    ventana.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.showItemsGrid = function(title, itemIds) {
    const items = itemIds.map(id => DATA.find(ep => ep.id === id)).filter(ep => ep);
    const container = document.getElementById('app');
    Si (contenedor) renderGrid(contenedor, elementos, título);
};

ventana.showSeriesGrid = función(título) {
    const container = document.getElementById('app');
    Si (contenedor) renderSeriesGrid(contenedor, título);
};

export function renderCategoryPills(activeCat = 'Todos') {
    const container = document.getElementById('category-pills');
    si (!contenedor) regresar;

    contenedor.innerHTML = '';
    CATEGORÍAS.forEach(cat => {
        const isActive = cat === activeCat;
        const btn = document.createElement('button');
        btn.className = `whitespace-nowrap px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all ${isActive ? 'bg-white text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`;
        btn.innerText = gato;
        btn.addEventListener('click', () => window.handleCategoryClick(cat));
        contenedor.appendChild(btn);
    });
}

si (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderCategoryPills());
} demás {
    renderCategoryPills();
}

// ---------- OYENTE GLOBAL ACTUALIZADO ----------
document.addEventListener('click', function(e) {
    const objetivo = e.objetivo.máscerca(
        '[data-action], .play-icon-lg, .mobile-play-button, .episode-play-btn, .action-icon'
    );
    si (!objetivo) regresar;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const episodioId = target.closest('[data-episodio-id]')?.dataset.episodioId;
    si (!episodioId) regresar;

    if (target.matches('[data-action="play"], .play-icon-lg, .mobile-play-button, .episode-play-btn')) {
        ventana.handlePlay(e, episodioId);
    } else if (target.matches('[data-action="dl"]') || target.title?.includes('Descargar')) {
        ventana.handleDl(e, episodioId);
    } else if (target.matches('[data-action="add"]') || target.matches('.action-icon[data-added]')) {
        ventana.handleAdd(e, episodioId);
    }
}, verdadero);

// ---------- ALERTA PERSONALIZADA ----------
función mostrarAlertaPersonalizada(título, mensaje) {
    const fullMessage = `"${title}" ${message}`;
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-zinc-900 rounded-2xl p-6 max-w-md w-[90%] border border-zinc-700 shadow-2xl">
            <h3 class="text-xl font-bold text-white mb-4">${fullMessage}</h3>
            <div class="flex flex-col sm:flex-row gap-3 justify-end">
                <a href="https://www.baltaanay.org/error" target="_blank" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium text-center transition">Reportar</a>
                <a href="https://www.baltaanay.org/contactus" target="_blank" class="px-5 py-2.5 btn-primary rounded-lg text-white font-medium text-center transition">Solicitar</a>
                <button onclick="this.closest('.fixed').remove()" class="px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-white font-medium transition">Cerrar</button>
            </div>
        </div>
    `;
    documento.cuerpo.añadirHijo(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

console.log('✅ show.js cargado completamente - versión modernizada 2026');
