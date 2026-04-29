document.addEventListener('DOMContentLoaded', () => {
    
    // --- Custom Cursor ---
    const cursor = document.getElementById('custom-cursor');
    const interactiveElements = document.querySelectorAll('a, button, .card, img');

    // Only run cursor logic if not on a touch device
    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovering');
            });
        });
    }

    // --- Scroll Progress Bar ---
    const scrollProgress = document.getElementById('scroll-progress');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = scrollPercent + '%';
    });

    // --- Intersection Observer for Reveal Animations ---
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Only animate once
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // --- Reviews Slider ---
    const track = document.getElementById('reviews-track');
    const slides = document.querySelectorAll('.review-slide');
    let currentSlide = 0;
    const totalSlides = slides.length;

    const moveToNextSlide = () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        const translateX = -(currentSlide * 100);
        track.style.transform = `translateX(${translateX}%)`;
    };

    // Auto-play slider every 5 seconds
    setInterval(moveToNextSlide, 5000);

    // --- Ambient Audio Integration (Web Audio API) ---
    const audioBtn = document.getElementById('audio-toggle');
    let audioCtx;
    let masterGain;
    let oscillators = [];
    let isPlaying = false;

    const initAudio = () => {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.03; // Very low, soothing volume
        masterGain.connect(audioCtx.destination);
    };

    const playAmbientSound = () => {
        // Create a soothing drone chord (e.g., Root and Fifth: G3, D4)
        const frequencies = [196.00, 293.66]; 
        
        frequencies.forEach(freq => {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            // LFO for slow volume modulation (breathing effect)
            const lfo = audioCtx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.1; // 10 seconds per cycle
            
            const lfoGain = audioCtx.createGain();
            lfoGain.gain.value = 0.02;
            
            lfo.connect(lfoGain.gain);
            osc.connect(lfoGain);
            lfoGain.connect(masterGain);
            
            osc.start();
            lfo.start();
            
            oscillators.push({ osc, lfo, lfoGain });
        });
    };

    const stopAmbientSound = () => {
        oscillators.forEach(nodes => {
            nodes.osc.stop();
            nodes.lfo.stop();
            nodes.osc.disconnect();
            nodes.lfo.disconnect();
            nodes.lfoGain.disconnect();
        });
        oscillators = [];
    };

    audioBtn.addEventListener('click', () => {
        if (!audioCtx) {
            initAudio();
        }

        // Resume context if it was suspended by browser autoplay policies
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        if (isPlaying) {
            stopAmbientSound();
            isPlaying = false;
            audioBtn.textContent = 'Ambient: Off';
            audioBtn.style.borderColor = 'rgba(255,255,255,0.2)';
            audioBtn.style.color = 'var(--text-white)';
        } else {
            playAmbientSound();
            isPlaying = true;
            audioBtn.textContent = 'Ambient: On';
            audioBtn.style.borderColor = 'var(--gold)';
            audioBtn.style.color = 'var(--gold)';
        }
    });
});