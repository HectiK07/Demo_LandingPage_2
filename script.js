/* ============================================
   GIFTORA - Premium Gifting Brand Landing Page
   Interactive JavaScript
   ============================================ */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initHeroCarousel();
    initBestSellersSlider();
    initTestimonialsSlider();
    initSmoothScrolling();
    initNavbarScroll();
    initMobileMenu();
});

/* ============================================
   HERO PRODUCT CAROUSEL
   Auto-slide every 4 seconds, pause on hover
   ============================================ */
function initHeroCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const carouselContainer = document.querySelector('.product-carousel-container');
    let currentSlide = 0;
    let autoSlideInterval;

    // Function to show a specific slide
    function showSlide(index) {
        // Remove active class from all slides and dots
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (dots[i]) {
                dots[i].classList.remove('active');
            }
        });

        // Add active class to current slide and dot
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }

        currentSlide = index;
    }

    // Function to go to next slide
    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    // Function to start auto-slide
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 4000); // 4 seconds
    }

    // Function to stop auto-slide
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }

    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            stopAutoSlide();
            startAutoSlide(); // Restart auto-slide
        });
    });

    // Pause on hover, resume on mouse leave
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoSlide);
        carouselContainer.addEventListener('mouseleave', startAutoSlide);
    }

    // Start auto-slide
    startAutoSlide();
}

/* ============================================
   BEST SELLERS SLIDER
   Horizontal product slider with arrows and touch support
   ============================================ */
function initBestSellersSlider() {
    const slider = document.querySelector('.bestsellers-track');
    const sliderContainer = document.querySelector('.bestsellers-slider');
    const leftArrow = document.querySelector('.bestsellers-slider-container .slider-arrow-left');
    const rightArrow = document.querySelector('.bestsellers-slider-container .slider-arrow-right');
    
    if (!slider || !leftArrow || !rightArrow) return;

    const productCards = slider.querySelectorAll('.product-card');
    if (productCards.length === 0) return;

    const gap = 32; // 2rem gap in pixels
    let currentPosition = 0;
    let cardWidth = 0;
    let cardWidthWithGap = 0;
    let maxScroll = 0;

    // Function to recalculate dimensions
    function recalculateDimensions() {
        if (productCards.length === 0) return;
        
        // Get actual card width after layout
        const firstCard = productCards[0];
        const cardRect = firstCard.getBoundingClientRect();
        cardWidth = cardRect.width;
        cardWidthWithGap = cardWidth + gap;
        
        // Calculate container width
        const containerRect = sliderContainer.getBoundingClientRect();
        const containerWidth = containerRect.width;
        
        // Calculate total width of all cards
        const totalWidth = (productCards.length * cardWidthWithGap) - gap;
        
        // Max scroll is total width minus container width
        maxScroll = Math.max(0, totalWidth - containerWidth);
        
        // Ensure current position is within bounds
        if (currentPosition > maxScroll) {
            currentPosition = maxScroll;
        }
        if (currentPosition < 0) {
            currentPosition = 0;
        }
        
        updateSliderPosition();
    }

    // Function to update slider position
    function updateSliderPosition() {
        slider.style.transform = `translateX(-${currentPosition}px)`;
    }

    // Function to slide right
    function slideRight() {
        const isMobile = window.innerWidth <= 768;
        const cardsToShow = isMobile ? 1 : 3; // Show 1 on mobile, 3 on desktop
        const scrollAmount = cardWidthWithGap * cardsToShow;
        
        const nextPosition = currentPosition + scrollAmount;
        currentPosition = Math.min(nextPosition, maxScroll);
        updateSliderPosition();
        
        // Disable/enable arrows
        updateArrowStates();
    }

    // Function to slide left
    function slideLeft() {
        const isMobile = window.innerWidth <= 768;
        const cardsToShow = isMobile ? 1 : 3;
        const scrollAmount = cardWidthWithGap * cardsToShow;
        
        const prevPosition = currentPosition - scrollAmount;
        currentPosition = Math.max(prevPosition, 0);
        updateSliderPosition();
        
        // Disable/enable arrows
        updateArrowStates();
    }

    // Function to update arrow states
    function updateArrowStates() {
        leftArrow.style.opacity = currentPosition <= 0 ? '0.5' : '1';
        leftArrow.style.cursor = currentPosition <= 0 ? 'not-allowed' : 'pointer';
        rightArrow.style.opacity = currentPosition >= maxScroll ? '0.5' : '1';
        rightArrow.style.cursor = currentPosition >= maxScroll ? 'not-allowed' : 'pointer';
    }

    // Initialize dimensions
    // Use setTimeout to ensure DOM is fully laid out
    setTimeout(() => {
        recalculateDimensions();
        updateArrowStates();
    }, 100);

    // Recalculate on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            recalculateDimensions();
            updateArrowStates();
        }, 150);
    });

    // Arrow click handlers
    leftArrow.addEventListener('click', () => {
        if (currentPosition > 0) {
            slideLeft();
        }
    });

    rightArrow.addEventListener('click', () => {
        if (currentPosition < maxScroll) {
            slideRight();
        }
    });

    // Touch/swipe support for mobile with momentum scrolling
    if (sliderContainer) {
        let touchStartX = 0;
        let touchStartPosition = 0;
        let touchStartTime = 0;
        let isDragging = false;
        let lastVelocity = 0;

        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartPosition = currentPosition;
            touchStartTime = Date.now();
            isDragging = true;
            lastVelocity = 0;
            slider.style.transition = 'none';
        }, { passive: true });

        sliderContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touchCurrentX = e.touches[0].clientX;
            const diff = touchStartX - touchCurrentX;
            const newPosition = touchStartPosition + diff;
            currentPosition = Math.max(0, Math.min(newPosition, maxScroll));
            slider.style.transform = `translateX(-${currentPosition}px)`;
            
            // Calculate velocity for momentum
            const timeDiff = Date.now() - touchStartTime;
            lastVelocity = diff / timeDiff;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            slider.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            // Apply momentum-based scrolling
            const momentum = lastVelocity * 50; // Momentum factor
            let finalPosition = currentPosition + momentum;
            
            // Snap to nearest card with momentum
            const cardIndex = Math.round(finalPosition / cardWidthWithGap);
            currentPosition = Math.max(0, Math.min(cardIndex * cardWidthWithGap, maxScroll));
            updateSliderPosition();
            updateArrowStates();
        });
    }

    // Add to cart button handlers
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Add visual feedback
            const originalText = this.textContent;
            this.textContent = 'Added!';
            this.style.background = '#4CAF50';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '';
            }, 2000);
        });
    });

    // Auto-rotate carousel feature
    let autoRotateInterval;
    let isUserInteracting = false;

    function startAutoRotate() {
        autoRotateInterval = setInterval(() => {
            if (!isUserInteracting && currentPosition < maxScroll) {
                slideRight();
            } else if (!isUserInteracting && currentPosition >= maxScroll) {
                // Loop back to start for continuous rotation
                currentPosition = 0;
                updateSliderPosition();
                updateArrowStates();
            }
        }, 5000); // Auto-rotate every 5 seconds
    }

    function stopAutoRotate() {
        if (autoRotateInterval) {
            clearInterval(autoRotateInterval);
        }
    }

    // Start auto-rotation
    startAutoRotate();

    // Pause auto-rotation on user interaction
    leftArrow.addEventListener('click', () => {
        isUserInteracting = true;
        stopAutoRotate();
        setTimeout(() => {
            isUserInteracting = false;
            startAutoRotate();
        }, 3000); // Resume after 3 seconds of inactivity
    });

    rightArrow.addEventListener('click', () => {
        isUserInteracting = true;
        stopAutoRotate();
        setTimeout(() => {
            isUserInteracting = false;
            startAutoRotate();
        }, 3000); // Resume after 3 seconds of inactivity
    });

    // Pause on hover, resume on mouse leave
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoRotate);
        sliderContainer.addEventListener('mouseleave', () => {
            isUserInteracting = false;
            startAutoRotate();
        });

        // Handle touch interactions
        sliderContainer.addEventListener('touchstart', () => {
            isUserInteracting = true;
            stopAutoRotate();
        });

        sliderContainer.addEventListener('touchend', () => {
            setTimeout(() => {
                isUserInteracting = false;
                startAutoRotate();
            }, 3000); // Resume after 3 seconds of inactivity
        });
    }
}

/* ============================================
   TESTIMONIALS SLIDER
   Horizontal slider with dots, arrows, and touch support
   ============================================ */
function initTestimonialsSlider() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const testimonialSlider = document.querySelector('.testimonials-slider');
    const dots = document.querySelectorAll('.testimonial-dot');
    const leftArrow = document.querySelector('.testimonials-slider-container .slider-arrow-left');
    const rightArrow = document.querySelector('.testimonials-slider-container .slider-arrow-right');
    
    if (!testimonialCards.length) return;

    let currentTestimonial = 0;
    let autoSlideInterval;
    let touchStartX = 0;
    let touchEndX = 0;

    // Function to show a specific testimonial
    function showTestimonial(index) {
        // Ensure index is within bounds
        if (index < 0) index = testimonialCards.length - 1;
        if (index >= testimonialCards.length) index = 0;
        
        // Remove active class from all cards and dots
        testimonialCards.forEach((card, i) => {
            card.classList.remove('active');
            if (dots[i]) {
                dots[i].classList.remove('active');
            }
        });

        // Add active class to current card and dot
        if (testimonialCards[index]) {
            testimonialCards[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }

        currentTestimonial = index;
    }

    // Function to go to next testimonial
    function nextTestimonial() {
        const next = (currentTestimonial + 1) % testimonialCards.length;
        showTestimonial(next);
    }

    // Function to go to previous testimonial
    function prevTestimonial() {
        const prev = (currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length;
        showTestimonial(prev);
    }

    // Function to start auto-advance
    function startAutoAdvance() {
        autoSlideInterval = setInterval(nextTestimonial, 6000);
    }

    // Function to stop auto-advance
    function stopAutoAdvance() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }

    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showTestimonial(index);
            stopAutoAdvance();
            startAutoAdvance(); // Restart auto-advance
        });
    });

    // Arrow handlers
    if (rightArrow) {
        rightArrow.addEventListener('click', () => {
            nextTestimonial();
            stopAutoAdvance();
            startAutoAdvance(); // Restart auto-advance
        });
    }
    if (leftArrow) {
        leftArrow.addEventListener('click', () => {
            prevTestimonial();
            stopAutoAdvance();
            startAutoAdvance(); // Restart auto-advance
        });
    }

    // Touch/swipe support for mobile
    if (testimonialSlider) {
        testimonialSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            stopAutoAdvance();
        }, { passive: true });

        testimonialSlider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            handleSwipe();
            startAutoAdvance(); // Restart after swipe
        }, { passive: true });
    }

    // Handle swipe gesture
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum swipe distance
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next
                nextTestimonial();
            } else {
                // Swipe right - previous
                prevTestimonial();
            }
        }
    }

    // Start auto-advance
    startAutoAdvance();

    // Pause on hover (desktop only)
    if (testimonialSlider) {
        testimonialSlider.addEventListener('mouseenter', stopAutoAdvance);
        testimonialSlider.addEventListener('mouseleave', startAutoAdvance);
    }
}

/* ============================================
   SMOOTH SCROLLING FOR NAVIGATION LINKS
   ============================================ */
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip empty hash or just "#"
            if (href === '#' || !href) {
                e.preventDefault();
                return;
            }

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                // Close mobile menu if open
                const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
                const navMenu = document.querySelector('.nav-menu');
                if (mobileMenuToggle && navMenu && navMenu.classList.contains('active')) {
                    mobileMenuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Account for fixed navbar height (80px desktop, 70px mobile)
                const navbarHeight = window.innerWidth <= 768 ? 70 : 80;
                const offsetTop = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   NAVBAR SCROLL EFFECT
   Enhance navbar on scroll
   ============================================ */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.75)';
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });
}

/* ============================================
   BUTTON INTERACTIONS
   Add subtle animations and feedback
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    // Add click animations to primary buttons
    const primaryButtons = document.querySelectorAll('.btn-primary');
    primaryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

/* ============================================
   MOBILE MENU TOGGLE
   ============================================ */
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (!mobileMenuToggle || !navMenu) return;

    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/* ============================================
   PARALLAX EFFECT FOR STORY SECTION
   ============================================ */
window.addEventListener('scroll', () => {
    const storySection = document.querySelector('.story-section');
    if (!storySection) return;

    const rect = storySection.getBoundingClientRect();
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.3;

    if (rect.top < window.innerHeight && rect.bottom > 0) {
        storySection.style.backgroundPositionY = rate + 'px';
    }
});