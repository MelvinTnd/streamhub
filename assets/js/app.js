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

async function fetchStreamingInfo(tmdbId) {
  try {
    const response = await fetch(`${streamingApiBase}/get/basic?country=fr&tmdb_id=movie/${tmdbId}`, {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    });
    return await response.json();
  } catch (error) {
    console.warn('Streaming info not available:', error);
    return null;
  }
}

// Demo data
const demoMovies = [
  {
    id: 1,
    title: 'Dune',
    overview: 'Paul Atreides, un jeune homme brillant et doué, doit se rendre sur la planète la plus dangereuse de l\'univers pour assurer l\'avenir de sa famille et de son peuple.',
    poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    backdrop_path: '/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg',
    release_date: '2021-09-15',
    genre_ids: [878, 12, 18],
    vote_average: 8.0
  },
  {
    id: 2,
    title: 'Spider-Man: No Way Home',
    overview: 'Peter Parker est démasqué et ne peut plus séparer sa vie normale des enjeux de super-héros.',
    poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    backdrop_path: '/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    release_date: '2021-12-15',
    genre_ids: [28, 12, 878],
    vote_average: 8.4
  },
  {
    id: 3,
    title: 'The Matrix Resurrections',
    overview: 'Retour dans la Matrice avec Neo et Trinity pour une nouvelle aventure.',
    poster_path: '/8c4a8kE7PizaGQQnditMmI1xbRp.jpg',
    backdrop_path: '/eNI7PtK6DEYgZmHWP9gQNuff8pv.jpg',
    release_date: '2021-12-22',
    genre_ids: [28, 878, 53],
    vote_average: 6.5
  }
];

// API calls
async function fetchTrending() {
  if (DEMO_MODE) {
    trendingCache = demoMovies;
    return trendingCache;
  }
  const { results } = await tmdb('/trending/movie/week', { language: 'fr-FR' });
  trendingCache = results || [];
  return trendingCache;
}

async function fetchPopular(page = 1) {
  if (DEMO_MODE) {
    return demoMovies;
  }
  const { results } = await tmdb('/movie/popular', { page, language: 'fr-FR' });
  return results || [];
}

async function fetchGenres() {
  if (DEMO_MODE) {
    genresMap = {
      28: 'Action',
      12: 'Aventure',
      16: 'Animation',
      35: 'Comédie',
      80: 'Crime',
      99: 'Documentaire',
      18: 'Drame',
      10751: 'Famille',
      14: 'Fantasy',
      36: 'Histoire',
      27: 'Horreur',
      10402: 'Musique',
      9648: 'Mystère',
      10749: 'Romance',
      878: 'Science-Fiction',
      10770: 'Téléfilm',
      53: 'Thriller',
      10752: 'Guerre',
      37: 'Western'
    };
    return genresMap;
  }
  const { genres } = await tmdb('/genre/movie/list', { language: 'fr-FR' });
  genresMap = Object.fromEntries(genres.map(g => [g.id, g.name]));
  return genresMap;
}

async function fetchByGenre(genreId, page = 1) {
  if (DEMO_MODE) {
    return demoMovies.filter(movie => movie.genre_ids.includes(genreId));
  }
  const { results } = await tmdb('/discover/movie', { with_genres: String(genreId), sort_by: 'popularity.desc', page, language: 'fr-FR' });
  return results || [];
}

// Navigation functions
function goToWatchPage(id, title) {
  if (id && title) {
    window.location.href = `watch.html?id=${id}`;
  } else {
    // For featured content without specific ID
    window.location.href = `watch.html?id=1`;
  }
}

function goToMoviePage(id, title) {
  showMovieModal(id, title, '', '', '', '');
}

// Featured content functions
function playFeatured() {
  if (trendingCache.length > 0) {
    const movie = trendingCache[0];
    goToWatchPage(movie.id, titleOf(movie));
  }
}

function showMovieInfo() {
  if (trendingCache.length > 0) {
    const movie = trendingCache[0];
    showMovieModal(movie.id, titleOf(movie), movie.overview || '', imageUrl(movie.poster_path), (movie.genre_ids || []).map(id => genresMap[id]).filter(Boolean).join(', '), yearOf(movie));
  }
}

// Renderers
async function displayHero() {
  if (trendingCache.length === 0) await fetchTrending();
  const movie = trendingCache[0];
  if (!movie) return;
  
  document.getElementById('hero-title').textContent = titleOf(movie);
  document.getElementById('hero-year').textContent = yearOf(movie);
  document.getElementById('hero-genre').textContent = (movie.genre_ids || []).map(id => genresMap[id]).filter(Boolean).slice(0,3).join(', ') || 'Tendance';
  document.getElementById('hero-summary').textContent = movie.overview || '';
  
  // Update hero background
  const hero = document.getElementById('hero');
  if (movie.backdrop_path) {
    hero.style.background = `linear-gradient(135deg, rgba(0, 224, 255, 0.1), rgba(168, 85, 247, 0.1)), url(${imageUrl(movie.backdrop_path, 'w1280')})`;
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center';
  }
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
    li.onclick = () => goToWatchPage(movie.id, titleOf(movie));
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
      // Fetch streaming info for each movie
      const moviesWithStreaming = await Promise.all(
        movies.map(async movie => {
          const streamingData = await fetchStreamingInfo(movie.id);
          return { movie, streamingData };
        })
      );

      const cards = moviesWithStreaming.map(({ movie, streamingData }) => {
        const col = document.createElement('div');
        col.className = 'col-6 col-sm-4 col-md-3 col-lg-2';
        const streamingIcons = getStreamingInfo(streamingData);
        col.innerHTML = `
          <div class="card" onclick="goToWatchPage(${movie.id}, '${titleOf(movie).replace(/'/g, "\\'")}')" data-movie-id="${movie.id}">
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
          <div class="card" onclick="goToWatchPage(${movie.id}, '${titleOf(movie).replace(/'/g, "\\'")}')" data-movie-id="${movie.id}">
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

  try {
    await fetchGenres();
    const genreIds = [28, 35, 18, 99];

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
        <div class="card" onclick="goToWatchPage(${movie.id}, '${titleOf(movie).replace(/'/g, "\\'")}')" data-movie-id="${movie.id}">
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

// Load more functionality
document.addEventListener('DOMContentLoaded', function() {
  displayHero();
  displayMovieGrid();
  displaySidebar();
  displayRecommendations();

  // Load more button
  const loadMoreBtn = document.getElementById('load-more');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async () => {
      popularPage++;
      const movieGrid = document.getElementById('movie-grid');
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'col-12 text-center';
      loadingDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
      movieGrid.appendChild(loadingDiv);

      try {
        const newMovies = await fetchPopular(popularPage);
        loadingDiv.remove();

        if (newMovies && newMovies.length > 0) {
          const cards = newMovies.map(movie => {
            const col = document.createElement('div');
            col.className = 'col-6 col-sm-4 col-md-3 col-lg-2';
            col.innerHTML = `
              <div class="card" onclick="goToWatchPage(${movie.id}, '${titleOf(movie).replace(/'/g, "\\'")}')" data-movie-id="${movie.id}">
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
        } else {
          loadMoreBtn.style.display = 'none';
        }
      } catch (error) {
        console.error('Error loading more movies:', error);
        loadingDiv.remove();
      }
    });
  }
});