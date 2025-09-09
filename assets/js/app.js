// TMDB configuration
const tmdbApiKey = 'b3ea1ee2890f24b0b24ea90eaead0bf4';
const apiBase = 'https://api.themoviedb.org/3';
const imageBase = 'https://image.tmdb.org/t/p/';

// Mode démo avec données de test (en attendant la clé TMDB)
const DEMO_MODE = false; // Désactivé - utilisation de l'API TMDB réelle

// Streaming Availability API configuration
const rapidApiKey = '92236bffe9msh94e311761b4836fp198f12jsnfdee98147932';
const streamingApiBase = 'https://streaming-availability.p.rapidapi.com';

// State
let trendingCache = [];
let popularPage = 1;
let genresMap = {};

// Utils
const imageUrl = (path, size = 'w500') => path ? `${imageBase}${size}${path}` : 'assets/images/placeholder-2x3.svg';
const titleOf = item => item.title || item.name || 'Titre indisponible';
const yearOf = item => (item.release_date || item.first_air_date || '').slice(0, 4) || '-';

// Streaming platforms mapping
const platformIcons = {
  'netflix': '🔴',
  'amazon_prime': '📦',
  'disney_plus': '🏰',
  'hulu': '🟢',
  'hbo_max': '🟣',
  'paramount_plus': '🔵',
  'apple_tv': '🍎',
  'peacock': '🦚'
};

function getStreamingInfo(streamingData) {
  if (!streamingData || !streamingData.streamingInfo) return '';
  const platforms = Object.keys(streamingData.streamingInfo);
  return platforms.slice(0, 3).map(platform => platformIcons[platform] || '📺').join(' ');
}

async function tmdb(path, params = {}) {
  const url = new URL(apiBase + path);
  url.searchParams.set('api_key', tmdbApiKey);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) throw new Error(data.status_message || 'TMDB error');
  return data;
}

async function streamingApi(path, params = {}) {
  const url = new URL(streamingApiBase + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: {
      'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
      'x-rapidapi-key': rapidApiKey
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Streaming API error');
  return data;
}

// Skeletons
function mountHeroSkeleton() {
  const hero = document.getElementById('hero');
  hero.style.backgroundImage = 'none';
  const content = hero.querySelector('.content');
  content.innerHTML = `
    <div class="skeleton skeleton-text" style="height:32px; width:60%; margin:0 auto 12px;"></div>
    <div class="skeleton skeleton-text" style="height:14px; width:30%; margin:0 auto 8px;"></div>
    <div class="skeleton skeleton-text" style="height:14px; width:40%; margin:0 auto 8px;"></div>
    <div class="skeleton skeleton-text" style="height:14px; width:80%; margin:0 auto 8px;"></div>
  `;
}

function mountSidebarSkeleton() {
  const list = document.getElementById('sidebar-list');
  if (!list) return;
  list.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="skeleton skeleton-thumb" style="width:50px; border-radius:6px;"></div>
      <div class="skeleton skeleton-text" style="flex:1; height:12px;"></div>
    `;
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.gap = '10px';
    list.appendChild(li);
  }
}

function mountGridSkeleton(containerId, count = 12) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  const nodes = [];
  for (let i = 0; i < count; i++) {
    const col = document.createElement('div');
    col.className = 'col-6 col-sm-4 col-md-3 col-lg-2';
    col.innerHTML = `
      <div class="card">
        <div class="card-figure">
          <div class="skeleton skeleton-thumb" style="width:100%;"></div>
        </div>
        <div class="card-body">
          <div class="skeleton skeleton-text" style="width:80%; margin-bottom:6px;"></div>
          <div class="skeleton skeleton-text" style="width:40%;"></div>
        </div>
      </div>
    `;
    nodes.push(col);
  }
  grid.innerHTML = '';
  grid.append(...nodes);
}

function mountRecsSkeleton() {
  const recs = document.getElementById('recommendations');
  if (!recs) return;
  recs.innerHTML = '';
  for (let r = 0; r < 3; r++) {
    const row = document.createElement('div');
    row.className = 'col-12';
    const cards = Array.from({ length: 8 }).map(() => `
      <div class="card">
        <div class="card-figure">
          <div class="skeleton skeleton-thumb" style="width:100%;"></div>
        </div>
        <div class="card-body py-2">
          <div class="skeleton skeleton-text" style="width:80%; margin-bottom:6px;"></div>
          <div class="skeleton skeleton-text" style="width:40%;"></div>
        </div>
      </div>
    `).join('');
    row.innerHTML = `
      <div class="d-flex align-items-center justify-content-between mb-2 mt-3">
        <div class="skeleton skeleton-text" style="width:120px; height:20px;"></div>
      </div>
      <div class="h-scroll">${cards}</div>
    `;
    recs.appendChild(row);
  }
}

// Données de démo
const demoMovies = [
  {
    id: 1,
    title: "Dune",
    release_date: "2021-10-22",
    genre_ids: [28, 12, 878],
    overview: "Paul Atreides, un jeune homme brillant et doué, doit se rendre sur la planète la plus dangereuse de l'univers pour assurer l'avenir de sa famille et de son peuple.",
    poster_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    backdrop_path: "/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg"
  },
  {
    id: 2,
    title: "Spider-Man: No Way Home",
    release_date: "2021-12-17",
    genre_ids: [28, 12, 878],
    overview: "Peter Parker est démasqué et ne peut plus séparer sa vie normale des enjeux de super-héros. Quand il demande de l'aide au Docteur Strange, les enjeux deviennent encore plus dangereux.",
    poster_path: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    backdrop_path: "/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg"
  },
  {
    id: 3,
    title: "The Batman",
    release_date: "2022-03-04",
    genre_ids: [28, 80, 18],
    overview: "Quand un tueur cible l'élite de Gotham avec une série de machinations sadiques, une piste d'indices cryptiques envoie Batman enquêter dans les bas-fonds.",
    poster_path: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    backdrop_path: "/c6H7Z4u73ir3cIoCteuhJh7UCAR.jpg"
  },
  {
    id: 4,
    title: "Top Gun: Maverick",
    release_date: "2022-05-27",
    genre_ids: [28, 18],
    overview: "Après plus de trente ans de service, Pete 'Maverick' Mitchell est là où il appartient, repoussant les limites en tant que pilote d'essai courageux.",
    poster_path: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    backdrop_path: "/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg"
  },
  {
    id: 5,
    title: "Black Widow",
    release_date: "2021-07-09",
    genre_ids: [28, 12, 53],
    overview: "Natasha Romanoff, alias Black Widow, fait face à l'aspect le plus sombre de son passé quand une conspiration dangereuse liée à son histoire émerge.",
    poster_path: "/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg",
    backdrop_path: "/keIxh0wPr2Ymj0Btjh4gW7JJ89e.jpg"
  },
  {
    id: 6,
    title: "Eternals",
    release_date: "2021-11-05",
    genre_ids: [28, 12, 878],
    overview: "Les Éternels, une race d'êtres immortels qui ont vécu sur Terre et façonné son histoire et ses civilisations.",
    poster_path: "/6AdXwFTRTAzggD2QUTt5B7JFGKL.jpg",
    backdrop_path: "/fzKWwcaam9QSTaMSLORIGs3jlMu.jpg"
  }
];

// Data loaders
async function loadGenres() {
  if (DEMO_MODE) {
    genresMap = {
      28: "Action",
      12: "Aventure", 
      16: "Animation",
      35: "Comédie",
      80: "Crime",
      99: "Documentaire",
      18: "Drame",
      10751: "Famille",
      14: "Fantasy",
      36: "Histoire",
      27: "Horreur",
      10402: "Musique",
      9648: "Mystère",
      10749: "Romance",
      878: "Science-Fiction",
      10770: "Téléfilm",
      53: "Thriller",
      10752: "Guerre",
      37: "Western"
    };
    return;
  }
  const { genres } = await tmdb('/genre/movie/list', { language: 'fr-FR' });
  genresMap = Object.fromEntries(genres.map(g => [g.id, g.name]));
}

async function fetchTrending() {
  if (DEMO_MODE) {
    trendingCache = demoMovies;
    return;
  }
  const { results } = await tmdb('/trending/movie/day', { language: 'fr-FR' });
  trendingCache = results || [];
}

async function fetchPopular(page = 1) {
  if (DEMO_MODE) {
    return demoMovies;
  }
  const { results } = await tmdb('/movie/popular', { page, language: 'fr-FR' });
  return results || [];
}

async function fetchByGenre(genreId, page = 1) {
  if (DEMO_MODE) {
    return demoMovies.filter(movie => movie.genre_ids.includes(genreId));
  }
  const { results } = await tmdb('/discover/movie', { with_genres: String(genreId), sort_by: 'popularity.desc', page, language: 'fr-FR' });
  return results || [];
}

// Renderers
async function displayHero() {
  if (trendingCache.length === 0) await fetchTrending();
  const movie = trendingCache[0];
  if (!movie) return;
  const hero = document.getElementById('hero');
  hero.style.backgroundImage = `url('${imageUrl(movie.backdrop_path, 'w1280')}')`;
  const content = hero.querySelector('.content');
  content.innerHTML = `
    <h1 id="hero-title">${titleOf(movie)}</h1>
    <p id="hero-year">${yearOf(movie)}</p>
    <p id="hero-genre">${(movie.genre_ids || []).map(id => genresMap[id]).filter(Boolean).slice(0,3).join(', ') || 'Tendance'}</p>
    <p id="hero-summary">${movie.overview || ''}</p>
    <div class="d-flex gap-2 justify-content-center mt-3">
      <button class="btn btn-primary">Regarder</button>
      <button class="btn btn-outline-light">Plus d'infos</button>
    </div>
  `;
}

async function displaySidebar() {
  if (trendingCache.length === 0) await fetchTrending();
  const sidebarList = document.getElementById('sidebar-list');
  const sidebarListMobile = document.getElementById('sidebar-list-mobile');
  if (sidebarList) sidebarList.innerHTML = '';
  if (sidebarListMobile) sidebarListMobile.innerHTML = '';
  const items = trendingCache.slice(0, 20);
  items.forEach(movie => {
    const li = document.createElement('li');
    li.innerHTML = `<img src="${imageUrl(movie.poster_path, 'w154')}" alt="${titleOf(movie)}" loading="lazy"> ${titleOf(movie)}`;
    sidebarList && sidebarList.appendChild(li);
    sidebarListMobile && sidebarListMobile.appendChild(li.cloneNode(true));
  });
}

async function displayMovieGrid() {
  const movieGrid = document.getElementById('movie-grid');
  if (!movieGrid) return;
  
  try {
    const movies = await fetchPopular(popularPage);
    console.log('Movies fetched:', movies.length);
    
    if (!movies || movies.length === 0) {
      movieGrid.innerHTML = '<div class="col-12 text-center"><p>Aucun film trouvé</p></div>';
      return;
    }
    
    // Clear existing content
    movieGrid.innerHTML = '';
    
    if (!DEMO_MODE) {
      // Fetch streaming info for first few movies (only in real mode)
      const streamingPromises = movies.slice(0, 8).map(async (movie) => {
        try {
          const streamingData = await streamingApi(`/shows/movie/${movie.id}`);
          return { movie, streamingData };
        } catch (e) {
          console.log('Streaming API error for movie:', movie.id);
          return { movie, streamingData: null };
        }
      });
      
      const moviesWithStreaming = await Promise.all(streamingPromises);
      const remainingMovies = movies.slice(8).map(movie => ({ movie, streamingData: null }));
      const allMovies = [...moviesWithStreaming, ...remainingMovies];
      
      const cards = allMovies.map(({ movie, streamingData }) => {
        const col = document.createElement('div');
        col.className = 'col-6 col-sm-4 col-md-3 col-lg-2';
        const streamingIcons = getStreamingInfo(streamingData);
        col.innerHTML = `
          <div class="card" onclick="showMovieModal(${movie.id}, '${titleOf(movie).replace(/'/g, "\\'")}', '${movie.overview ? movie.overview.replace(/'/g, "\\'") : ''}', '${imageUrl(movie.poster_path)}', '${(movie.genre_ids || []).map(id => genresMap[id]).filter(Boolean).join(', ')}', '${yearOf(movie)}')">
            <div class="card-figure">
              <img src="${imageUrl(movie.poster_path)}" class="card-img-top" alt="${titleOf(movie)}" loading="lazy">
              <div class="card-overlay">
                <span class="play">▶</span>
                ${streamingIcons ? `<div class="streaming-platforms">${streamingIcons}</div>` : ''}
              </div>
            </div>
            <div class="card-body">
              <h6 class="card-title mb-1">${titleOf(movie)}</h6>
              <p class="card-text">${yearOf(movie)}</p>
            </div>
          </div>
        `;
        return col;
      });
      movieGrid.append(...cards);
    } else {
      // Mode démo - affichage simple
      const cards = movies.map(movie => {
        const col = document.createElement('div');
        col.className = 'col-6 col-sm-4 col-md-3 col-lg-2';
        col.innerHTML = `
          <div class="card" onclick="showMovieModal(${movie.id}, '${titleOf(movie).replace(/'/g, "\\'")}', '${movie.overview ? movie.overview.replace(/'/g, "\\'") : ''}', '${imageUrl(movie.poster_path)}', '${(movie.genre_ids || []).map(id => genresMap[id]).filter(Boolean).join(', ')}', '${yearOf(movie)}')">
            <div class="card-figure">
              <img src="${imageUrl(movie.poster_path)}" class="card-img-top" alt="${titleOf(movie)}" loading="lazy">
              <div class="card-overlay">
                <span class="play">▶</span>
                <div class="streaming-platforms">🔴📦🏰</div>
              </div>
            </div>
            <div class="card-body">
              <h6 class="card-title mb-1">${titleOf(movie)}</h6>
              <p class="card-text">${yearOf(movie)}</p>
            </div>
          </div>
        `;
        return col;
      });
      movieGrid.append(...cards);
    }
  } catch (error) {
    console.error('Error displaying movie grid:', error);
    movieGrid.innerHTML = '<div class="col-12 text-center"><p>Erreur lors du chargement des films</p></div>';
  }
}

async function displayRecommendations() {
  const recommendations = document.getElementById('recommendations');
  if (!recommendations) return;
  
  recommendations.innerHTML = '';
  const genreIds = [28, 35, 18, 99];
  
  try {
    const lists = await Promise.all(genreIds.map(id => fetchByGenre(id).catch(() => [])));
    lists.forEach((list, idx) => {
      const row = document.createElement('div');
      row.className = 'col-12';
      const title = ['Action', 'Comédie', 'Drame', 'Documentaire'][idx] || 'Recommandé';
      
      if (!list || list.length === 0) {
        row.innerHTML = `
          <div class="d-flex align-items-center justify-content-between mb-2 mt-3">
            <h5 class="m-0">${title}</h5>
          </div>
          <div class="h-scroll">
            <div class="text-center p-3">Aucun film trouvé pour cette catégorie</div>
          </div>
        `;
        recommendations.appendChild(row);
        return;
      }
      
      const items = list.slice(0, 12).map(movie => `
        <div class="card" onclick="showMovieModal(${movie.id}, '${titleOf(movie).replace(/'/g, "\\'")}', '${movie.overview ? movie.overview.replace(/'/g, "\\'") : ''}', '${imageUrl(movie.poster_path)}', '${(movie.genre_ids || []).map(id => genresMap[id]).filter(Boolean).join(', ')}', '${yearOf(movie)}')">
          <div class="card-figure">
            <img src="${imageUrl(movie.poster_path)}" class="card-img-top" alt="${titleOf(movie)}" loading="lazy">
            <div class="card-overlay">
              <span class="play">▶</span>
              <div class="streaming-platforms">🔴📦🏰</div>
            </div>
          </div>
          <div class="card-body py-2">
            <h6 class="card-title mb-1 text-truncate" title="${titleOf(movie)}">${titleOf(movie)}</h6>
            <p class="card-text">${yearOf(movie)}</p>
          </div>
        </div>`).join('');
      row.innerHTML = `
        <div class="d-flex align-items-center justify-content-between mb-2 mt-3">
          <h5 class="m-0">${title}</h5>
        </div>
        <div class="h-scroll">${items}</div>
      `;
      recommendations.appendChild(row);
    });
  } catch (error) {
    console.error('Error displaying recommendations:', error);
    recommendations.innerHTML = '<div class="col-12 text-center"><p>Erreur lors du chargement des recommandations</p></div>';
  }
}

// Modal function
function showMovieModal(id, title, overview, poster, genres, year) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-poster').src = poster;
  document.getElementById('modal-poster').alt = title;
  document.getElementById('modal-overview').textContent = overview || 'Aucun résumé disponible.';
  
  // Genres
  const genresContainer = document.getElementById('modal-genres');
  genresContainer.innerHTML = '';
  if (genres) {
    genres.split(', ').forEach(genre => {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = genre;
      genresContainer.appendChild(badge);
    });
  }
  
  // Streaming options (placeholder for now)
  const streamingContainer = document.getElementById('modal-streaming');
  streamingContainer.innerHTML = `
    <a href="#" class="streaming-btn">🔴 Netflix</a>
    <a href="#" class="streaming-btn">📦 Amazon Prime</a>
    <a href="#" class="streaming-btn">🏰 Disney+</a>
    <a href="#" class="streaming-btn">🟣 HBO Max</a>
  `;
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('movieModal'));
  modal.show();
}

// Boot
window.onload = async () => {
  console.log('Starting app...');
  mountHeroSkeleton();
  mountSidebarSkeleton();
  mountGridSkeleton('movie-grid', 12);
  mountRecsSkeleton();
  
  try {
    console.log('Loading genres and trending...');
    await Promise.all([loadGenres(), fetchTrending()]);
    console.log('Genres loaded:', Object.keys(genresMap).length);
    console.log('Trending loaded:', trendingCache.length);
    
    console.log('Displaying hero...');
    await displayHero();
    
    console.log('Displaying sidebar, grid and recommendations...');
    await Promise.all([displaySidebar(), displayMovieGrid(), displayRecommendations()]);
    
    console.log('App loaded successfully!');
  } catch (e) {
    console.error('App loading error:', e);
  }
  
  const loadMore = document.getElementById('load-more');
  if (loadMore) {
    loadMore.addEventListener('click', async () => {
      popularPage++;
      try { 
        console.log('Loading more movies, page:', popularPage);
        await displayMovieGrid(); 
      } catch (e) { 
        console.error('Error loading more movies:', e); 
      }
    });
  }
};


