// Music Player Functionality with localStorage persistence
const musicBtn = document.getElementById('musicBtn');
const backgroundMusic = document.getElementById('backgroundMusic');
let isPlaying = false;
let wasMusicPlayingForModal = false;

// Set initial volume to low (20%)
backgroundMusic.volume = 0.2;

// Check if music was playing on previous page
window.addEventListener('DOMContentLoaded', () => {
    const wasPlaying = localStorage.getItem('musicPlaying') === 'true';
    const currentTime = parseFloat(localStorage.getItem('musicTime')) || 0;
    
    if (wasPlaying && backgroundMusic) {
        backgroundMusic.currentTime = currentTime;
        backgroundMusic.play().catch(error => {
            console.log('Audio play failed:', error);
        });
        musicBtn.classList.add('playing');
        isPlaying = true;
    }
    
    // Save music state periodically
    if (backgroundMusic) {
        setInterval(() => {
            if (isPlaying) {
                localStorage.setItem('musicTime', backgroundMusic.currentTime);
            }
        }, 1000);
    }
});

musicBtn.addEventListener('click', () => {
    if (isPlaying) {
        backgroundMusic.pause();
        musicBtn.classList.remove('playing');
        isPlaying = false;
        localStorage.setItem('musicPlaying', 'false');
    } else {
        backgroundMusic.play().catch(error => {
            console.log('Audio play failed:', error);
        });
        musicBtn.classList.add('playing');
        isPlaying = true;
        localStorage.setItem('musicPlaying', 'true');
    }
});

// Save music state before page unload
window.addEventListener('beforeunload', () => {
    if (backgroundMusic) {
        localStorage.setItem('musicTime', backgroundMusic.currentTime);
        localStorage.setItem('musicPlaying', isPlaying ? 'true' : 'false');
    }
});

// Fade in elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe memory cards for fade-in effect and setup dream video modal
document.addEventListener('DOMContentLoaded', () => {
    const memoryCards = document.querySelectorAll('.memory-card');
    memoryCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Fullscreen video modal for dream videos (used on dreams.html)
    const dreamVideos = document.querySelectorAll('.dream-video');
    const videoModal = document.getElementById('videoModal');
    const videoModalPlayer = document.getElementById('videoModalPlayer');
    const videoModalClose = document.getElementById('videoModalClose');
    const videoModalBackdrop = document.getElementById('videoModalBackdrop');

    if (dreamVideos.length && videoModal && videoModalPlayer) {
        dreamVideos.forEach(video => {
            video.addEventListener('click', (e) => {
                const targetTag = e.target.tagName.toLowerCase();
                // Let native control buttons work normally
                if (targetTag === 'button' || targetTag === 'svg' || targetTag === 'path') return;

                const source = video.querySelector('source');
                if (!source) return;

                e.preventDefault();

                // Pause any inline videos so only the modal video plays
                dreamVideos.forEach(v => {
                    try {
                        v.pause();
                        v.currentTime = 0;
                    } catch (_) {}
                });

                // Pause background music while video plays, remember if it was on
                if (backgroundMusic && !backgroundMusic.paused) {
                    wasMusicPlayingForModal = true;
                    backgroundMusic.pause();
                    isPlaying = false;
                    localStorage.setItem('musicPlaying', 'false');
                } else {
                    wasMusicPlayingForModal = false;
                }

                // Point modal player directly at the clicked video's source
                try {
                    videoModalPlayer.pause();
                } catch (_) {}

                videoModalPlayer.removeAttribute('src');
                while (videoModalPlayer.firstChild) {
                    videoModalPlayer.removeChild(videoModalPlayer.firstChild);
                }

                videoModalPlayer.src = source.src;
                videoModalPlayer.load();

                videoModal.classList.add('show');
                videoModalPlayer.currentTime = 0;
                videoModalPlayer.play().catch(() => {});
            });
        });

        const closeModal = () => {
            videoModalPlayer.pause();
            videoModal.classList.remove('show');

            // Resume background music only if it was playing before video
            if (wasMusicPlayingForModal && backgroundMusic) {
                backgroundMusic.play().catch(() => {});
                isPlaying = true;
                localStorage.setItem('musicPlaying', 'true');
            }
        };

        if (videoModalClose) {
            videoModalClose.addEventListener('click', closeModal);
        }
        if (videoModalBackdrop) {
            videoModalBackdrop.addEventListener('click', closeModal);
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }
});

// Add sparkle effect on click anywhere
document.addEventListener('click', (e) => {
    if (e.target.closest('.nav-btn') || e.target.closest('.music-btn') || e.target.closest('.need-you-btn')) {
        return; // Don't create sparkles on button clicks
    }
    
    createSparkle(e.clientX, e.clientY);
});

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.innerHTML = '✨';
    sparkle.style.position = 'fixed';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.style.fontSize = '20px';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '9999';
    sparkle.style.animation = 'sparkleClick 1s ease-out forwards';
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 1000);
}

// Add sparkle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkleClick {
        0% {
            opacity: 1;
            transform: scale(0) translateY(0);
        }
        50% {
            opacity: 1;
            transform: scale(1.5) translateY(-20px);
        }
        100% {
            opacity: 0;
            transform: scale(0.5) translateY(-40px);
        }
    }
`;
document.head.appendChild(style);

// Prevent right-click context menu (optional - for a more polished feel)
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Add gentle page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Add keyboard support for music toggle (Space key)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (musicBtn) {
            musicBtn.click();
        }
    }
});

// Smooth page transitions
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animation to main content
    const mainContent = document.querySelector('section');
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';
        mainContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        }, 100);
    }
});
