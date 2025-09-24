// Watch Page JavaScript
let videoPlayer;
let isPlaying = false;
let isMuted = false;
let isFullscreen = false;
let currentVolume = 100;
let currentTime = 0;
let duration = 0;
let hideControlsTimeout;
let movieData = {};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializePlayer();
    loadMovieData();
    setupEventListeners();
    setupKeyboardControls();
});

// Initialize video player
function initializePlayer() {
    videoPlayer = document.getElementById('videoPlayer');
    const videoContainer = document.getElementById('videoContainer');
    const videoOverlay = document.getElementById('videoOverlay');
    const videoControls = document.getElementById('videoControls');
    
    // Video event listeners
    videoPlayer.addEventListener('loadstart', onLoadStart);
    videoPlayer.addEventListener('loadedmetadata', onLoadedMetadata);
    videoPlayer.addEventListener('timeupdate', onTimeUpdate);
    videoPlayer.addEventListener('ended', onVideoEnded);
    videoPlayer.addEventListener('error', onVideoError);
    
    // Mouse events for controls
    videoContainer.addEventListener('mousemove', showControls);
    videoContainer.addEventListener('mouseleave', hideControls);
    videoContainer.addEventListener('click', togglePlay);
    
    // Progress bar events
    const progressBar = document.getElementById('progressBar');
    progressBar.addEventListener('click', seekTo);
    progressBar.addEventListener('mousemove', showProgressHandle);
    progressBar.addEventListener('mouseleave', hideProgressHandle);
    
    // Volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', function() {
        setVolume(this.value);
    });
}

// Load movie data from URL parameters
function loadMovieData() {
  const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    
    if (movieId) {
        // In a real app, you would fetch movie data from API
        // For demo, we'll use sample data
        movieData = {
            id: movieId,
            title: "Dune",
            year: "2021",
            rating: "8.0",
            duration: "2h 35min",
            genres: ["Science-Fiction", "Aventure", "Drame"],
            description: "Paul Atreides, un jeune homme brillant et doué, doit se rendre sur la planète la plus dangereuse de l'univers pour assurer l'avenir de sa famille et de son peuple.",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Sample video
            cast: [
                { name: "Timothée Chalamet", character: "Paul Atreides" },
                { name: "Rebecca Ferguson", character: "Lady Jessica" },
                { name: "Oscar Isaac", character: "Duke Leto Atreides" },
                { name: "Josh Brolin", character: "Gurney Halleck" }
            ]
        };
        
        updateMovieInfo();
        loadRelatedMovies();
    } else {
        // Redirect to home if no movie ID
        window.location.href = 'index.html';
    }
}

// Update movie information display
function updateMovieInfo() {
    document.getElementById('videoTitle').textContent = movieData.title;
    document.getElementById('videoSubtitle').textContent = `${movieData.year} • ${movieData.genres.join(', ')} • ${movieData.duration}`;
    document.getElementById('movieTitle').textContent = movieData.title;
    document.getElementById('movieYear').textContent = movieData.year;
    document.getElementById('movieRating').textContent = `★ ${movieData.rating}`;
    document.getElementById('movieDuration').textContent = movieData.duration;
    document.getElementById('movieGenres').textContent = movieData.genres.join(', ');
    document.getElementById('movieDescription').textContent = movieData.description;
    
    // Update page title
    document.title = `StreamHub - ${movieData.title}`;
    
    // Set video source
    videoPlayer.src = movieData.videoUrl;
    
    // Update cast
    updateCast();
}

// Update cast information
function updateCast() {
    const castList = document.getElementById('castList');
    castList.innerHTML = '';
    
    movieData.cast.forEach(castMember => {
        const castElement = document.createElement('div');
        castElement.className = 'cast-member';
        castElement.innerHTML = `
            <div class="cast-avatar">${castMember.name.charAt(0)}</div>
            <div class="cast-info">
                <div class="cast-name">${castMember.name}</div>
                <div class="cast-character">${castMember.character}</div>
            </div>
        `;
        castList.appendChild(castElement);
    });
}

// Load related movies
function loadRelatedMovies() {
    const relatedMovies = document.getElementById('relatedMovies');
    relatedMovies.innerHTML = '';
    
    // Sample related movies
    const related = [
        { id: 1, title: "Blade Runner 2049", year: "2017", poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg" },
        { id: 2, title: "Interstellar", year: "2014", poster: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg" },
        { id: 3, title: "The Matrix", year: "1999", poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
        { id: 4, title: "Inception", year: "2010", poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" }
    ];
    
    related.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'related-movie';
        movieElement.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
            <div class="related-movie-info">
                <div class="related-movie-title">${movie.title}</div>
                <div class="related-movie-year">${movie.year}</div>
            </div>
        `;
        movieElement.addEventListener('click', () => {
            window.location.href = `watch.html?id=${movie.id}`;
        });
        relatedMovies.appendChild(movieElement);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Fullscreen events
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);
    
    // Settings panel
    document.addEventListener('click', function(e) {
        const settingsPanel = document.getElementById('settingsPanel');
        const settingsBtn = document.querySelector('[onclick="toggleSettings()"]');
        
        if (!settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsPanel.classList.remove('visible');
        }
    });
}

// Setup keyboard controls
function setupKeyboardControls() {
    document.addEventListener('keydown', function(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                skipTime(-10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                skipTime(10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setVolume(Math.min(100, currentVolume + 10));
                break;
            case 'ArrowDown':
                e.preventDefault();
                setVolume(Math.max(0, currentVolume - 10));
                break;
            case 'KeyM':
                e.preventDefault();
                toggleMute();
                break;
            case 'KeyF':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'KeyEscape':
                if (isFullscreen) {
                    exitFullscreen();
                }
                break;
        }
    });
}

// Video event handlers
function onLoadStart() {
    console.log('Video loading started');
}

function onLoadedMetadata() {
    duration = videoPlayer.duration;
    updateDuration();
    console.log('Video metadata loaded');
}

function onTimeUpdate() {
    currentTime = videoPlayer.currentTime;
    updateProgress();
    updateCurrentTime();
}

function onVideoEnded() {
    isPlaying = false;
    updatePlayButton();
    showVideoOverlay();
}

function onVideoError(e) {
    console.error('Video error:', e);
    alert('Erreur lors du chargement de la vidéo');
}

// Control functions
function togglePlay() {
    if (isPlaying) {
        pauseVideo();
    } else {
        playVideo();
    }
}

function playVideo() {
    videoPlayer.play();
    isPlaying = true;
    updatePlayButton();
    hideVideoOverlay();
}

function pauseVideo() {
    videoPlayer.pause();
    isPlaying = false;
    updatePlayButton();
}

function toggleMute() {
    isMuted = !isMuted;
    videoPlayer.muted = isMuted;
    updateMuteButton();
}

function setVolume(value) {
    currentVolume = parseInt(value);
    videoPlayer.volume = currentVolume / 100;
    document.getElementById('volumeSlider').value = currentVolume;
    
    if (currentVolume === 0) {
        isMuted = true;
        videoPlayer.muted = true;
  } else {
        isMuted = false;
        videoPlayer.muted = false;
    }
    
    updateMuteButton();
}

function skipTime(seconds) {
    videoPlayer.currentTime += seconds;
    showControls();
}

function seekTo(e) {
    const progressBar = document.getElementById('progressBar');
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    videoPlayer.currentTime = percentage * duration;
    showControls();
}

function changeQuality(quality) {
    console.log('Changing quality to:', quality);
    // In a real app, you would switch video sources
    showControls();
}

function setPlaybackSpeed(speed) {
    videoPlayer.playbackRate = parseFloat(speed);
    showControls();
}

function toggleSubtitles(language) {
    console.log('Toggling subtitles:', language);
    // In a real app, you would load subtitle tracks
}

function toggleSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    settingsPanel.classList.toggle('visible');
}

function toggleFullscreen() {
    if (!isFullscreen) {
        enterFullscreen();
  } else {
        exitFullscreen();
    }
}

function enterFullscreen() {
    const videoContainer = document.getElementById('videoContainer');
    
    if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
    } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
    } else if (videoContainer.mozRequestFullScreen) {
        videoContainer.mozRequestFullScreen();
    } else if (videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

function onFullscreenChange() {
    isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                     document.mozFullScreenElement || document.msFullscreenElement);
    updateFullscreenButton();
}

// UI update functions
function updatePlayButton() {
    const playBtn = document.getElementById('playBtn');
    const icon = playBtn.querySelector('i');
    
    if (isPlaying) {
        icon.className = 'bi bi-pause-fill';
    } else {
        icon.className = 'bi bi-play-fill';
    }
}

function updateMuteButton() {
    const muteBtn = document.getElementById('muteBtn');
    const icon = muteBtn.querySelector('i');
    
    if (isMuted || currentVolume === 0) {
        icon.className = 'bi bi-volume-mute';
    } else if (currentVolume < 50) {
        icon.className = 'bi bi-volume-down';
    } else {
        icon.className = 'bi bi-volume-up';
    }
}

function updateFullscreenButton() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const icon = fullscreenBtn.querySelector('i');
    
    if (isFullscreen) {
        icon.className = 'bi bi-fullscreen-exit';
    } else {
        icon.className = 'bi bi-arrows-fullscreen';
    }
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressHandle = document.getElementById('progressHandle');
    
    if (duration > 0) {
        const percentage = (currentTime / duration) * 100;
        progressFill.style.width = percentage + '%';
        progressHandle.style.left = percentage + '%';
    }
}

function updateCurrentTime() {
    document.getElementById('currentTime').textContent = formatTime(currentTime);
}

function updateDuration() {
    document.getElementById('duration').textContent = formatTime(duration);
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

// Control visibility functions
function showControls() {
    const videoControls = document.getElementById('videoControls');
    const navbar = document.querySelector('.watch-navbar');
    
    videoControls.classList.add('visible');
    navbar.classList.remove('hidden');
    
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(hideControls, 3000);
}

function hideControls() {
    if (isPlaying) {
        const videoControls = document.getElementById('videoControls');
        const navbar = document.querySelector('.watch-navbar');
        
        videoControls.classList.remove('visible');
        navbar.classList.add('hidden');
    }
}

function showVideoOverlay() {
    const videoOverlay = document.getElementById('videoOverlay');
    videoOverlay.classList.remove('hidden');
}

function hideVideoOverlay() {
    const videoOverlay = document.getElementById('videoOverlay');
    videoOverlay.classList.add('hidden');
}

function showProgressHandle() {
    const progressHandle = document.getElementById('progressHandle');
    progressHandle.style.opacity = '1';
}

function hideProgressHandle() {
    const progressHandle = document.getElementById('progressHandle');
    progressHandle.style.opacity = '0';
}

// Navigation functions
function goBack() {
    window.history.back();
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize player when page loads
window.addEventListener('load', function() {
    console.log('Watch page loaded');
});
