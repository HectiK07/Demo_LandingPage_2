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
    initCartModal();
    initProductModal();
    initProductClickHandlers();
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

/* ============================================
   CART MODAL
   ============================================ */
function initCartModal() {
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.getElementById('cartModal');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartModalClose = document.querySelector('.cart-modal-close');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');

    if (!cartIcon || !cartModal) return;

    // Open cart modal when cart icon is clicked
    cartIcon.addEventListener('click', () => {
        cartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close cart modal when close button is clicked
    cartModalClose?.addEventListener('click', () => {
        cartModal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close cart modal when overlay is clicked
    cartOverlay?.addEventListener('click', () => {
        cartModal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close cart modal and scroll to top when continue shopping is clicked
    continueShoppingBtn?.addEventListener('click', () => {
        cartModal.classList.remove('active');
        document.body.style.overflow = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Close cart modal when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartModal.classList.contains('active')) {
            cartModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/* ============================================
   PRODUCT MODAL & DETAILED VIEW
   ============================================ */

// Product database with details
const productDatabase = {
    'Luxury Celebration Box': {
        price: '$89',
        originalPrice: '$120',
        description: 'An exquisite collection celebrating life\'s finest moments. This premium gift box contains luxury items curated to express elegance and sophistication.',
        features: [
            'Premium wine selection',
            'Gourmet cheese assortment',
            'Luxury chocolates',
            'Celebration candle',
            'Fine art greeting card',
            'Silk ribbon gift wrap'
        ]
    },
    'Premium Care Package': {
        price: '$75',
        originalPrice: '$110',
        description: 'A comprehensive self-care collection designed for ultimate relaxation. Perfect for someone who deserves pampering and wellness rejuvenation.',
        features: [
            'Luxury bath bombs',
            'Premium body lotion',
            'Aromatic bath salts',
            'Silk sleep mask',
            'Natural soap bars',
            'Bamboo bath accessories'
        ]
    },
    'Gourmet Gift Hamper': {
        price: '$125',
        originalPrice: '$180',
        description: 'A culinary masterpiece featuring gourmet delights from around the world. Perfect for food connoisseurs and special occasions.',
        features: [
            'Artisanal crackers',
            'Premium jams & preserves',
            'Gourmet nuts selection',
            'Specialty olive oil',
            'Imported chocolates',
            'Wooden serving board'
        ]
    },
    'Wellness Bundle': {
        price: '$95',
        originalPrice: '$140',
        description: 'A thoughtfully curated selection of wellness products to help your recipient relax and rejuvenate. Crafted with natural, premium ingredients.',
        features: [
            'Organic lavender spa set',
            'Natural skincare cream',
            'Aromatherapy diffuser',
            'Premium herbal tea selection',
            'Bamboo bath accessories',
            'Luxury packaging included'
        ]
    },
    'Artisan Delight Set': {
        price: '$110',
        originalPrice: '$160',
        description: 'A masterpiece collection showcasing the finest artisanal products from around the world. Each item tells a story of craftsmanship.',
        features: [
            'Handcrafted artisan soaps',
            'Gourmet food selection',
            'Premium honey jar (500g)',
            'Luxury chocolate bonbons',
            'Craft coffee beans',
            'Wooden serving board'
        ]
    },
    'Chocolate Indulgence': {
        price: '$65',
        originalPrice: '$95',
        description: 'A chocolate lover\'s dream! This delightful collection features premium chocolates from master chocolatiers, each piece a work of art.',
        features: [
            'Premium Belgian chocolates',
            'Dark chocolate truffles',
            'Milk chocolate assortment',
            'Chocolate-dipped strawberries',
            'Cocoa-dusted bonbons',
            'Elegant gift box packaging'
        ]
    },
    'Birthday Gifts': {
        price: '$85',
        originalPrice: '$125',
        description: 'Make birthdays unforgettable with our specially curated gift collections. Perfect for all ages.',
        features: [
            'Birthday-themed packaging',
            'Premium gift items',
            'Personalized greeting card',
            'Surprise element included',
            'Free same-day delivery',
            'Celebration ready presentation'
        ]
    },
    'Anniversary Gifts': {
        price: '$115',
        originalPrice: '$170',
        description: 'Celebrate love and commitment with our elegant anniversary collections.',
        features: [
            'Romantic luxury items',
            'Premium chocolates',
            'Personalization available',
            'Elegant packaging with gold accents',
            'Special occasion ribbon',
            'Love-themed presentation'
        ]
    },
    'Corporate Gifting': {
        price: '$120',
        originalPrice: '$180',
        description: 'Impress clients and teams with our premium corporate gift collections.',
        features: [
            'Bulk order discounts',
            'Custom branding options',
            'Premium quality assurance',
            'Professional packaging',
            'Corporate greeting cards',
            'Dedicated account support'
        ]
    },
    'Festive Hampers': {
        price: '$100',
        originalPrice: '$150',
        description: 'Bring joy and celebration to any season with our festive hamper collections.',
        features: [
            'Seasonal specialty items',
            'Festive decorative packaging',
            'Holiday-themed presentation',
            'Premium assortment mix',
            'Family-friendly selections',
            'Celebration-ready delivery'
        ]
    }
};

let currentProduct = null;

// Initialize product modal
function initProductModal() {
    const productModal = document.getElementById('productModal');
    const productModalOverlay = document.getElementById('productModalOverlay');
    const productModalClose = document.getElementById('productModalClose');
    const decreaseQtyBtn = document.getElementById('decreaseQty');
    const increaseQtyBtn = document.getElementById('increaseQty');
    const qtyInput = document.getElementById('productQty');
    const addToCartBtn = document.getElementById('addToCartModal');

    // Close modal on overlay click
    productModalOverlay?.addEventListener('click', () => {
        productModal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close modal on close button click
    productModalClose?.addEventListener('click', () => {
        productModal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && productModal.classList.contains('active')) {
            productModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Quantity controls
    decreaseQtyBtn?.addEventListener('click', () => {
        const currentQty = parseInt(qtyInput.value);
        if (currentQty > 1) {
            qtyInput.value = currentQty - 1;
        }
    });

    increaseQtyBtn?.addEventListener('click', () => {
        const currentQty = parseInt(qtyInput.value);
        qtyInput.value = currentQty + 1;
    });

    qtyInput?.addEventListener('change', (e) => {
        if (e.target.value < 1) {
            e.target.value = 1;
        }
    });

    // Add to cart button
    addToCartBtn?.addEventListener('click', () => {
        const quantity = parseInt(qtyInput.value);
        const price = currentProduct.price.replace('$', '');
        const total = (parseFloat(price) * quantity).toFixed(2);
        
        alert(`✅ Added to Cart!\n\nProduct: ${currentProduct.name}\nQuantity: ${quantity}\nTotal: $${total}\n\nYour item is now in the cart!`);
        
        // Reset quantity
        qtyInput.value = 1;
    });
}

// Open product modal
function openProductModal(productName, imageSrc) {
    const productData = productDatabase[productName];
    if (!productData) return;

    currentProduct = {
        name: productName,
        ...productData
    };

    const productModal = document.getElementById('productModal');
    document.getElementById('modalProductImage').src = imageSrc;
    document.getElementById('modalProductName').textContent = productName;
    document.getElementById('modalProductPrice').textContent = productData.price;
    document.getElementById('modalOriginalPrice').textContent = productData.originalPrice;
    document.getElementById('modalProductDescription').textContent = productData.description;
    
    // Populate features
    const featuresList = document.getElementById('modalProductFeatures');
    featuresList.innerHTML = productData.features.map(feature => `<li>${feature}</li>`).join('');

    // Reset quantity
    document.getElementById('productQty').value = 1;

    // Show modal
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Attach click handlers to all product and collection cards
function initProductClickHandlers() {
    // Handle product cards (best sellers section)
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on the add to cart button
            if (e.target.closest('.btn-add-cart')) {
                return;
            }
            e.stopPropagation();
            const productName = card.querySelector('.product-name').textContent;
            const productImage = card.querySelector('.product-card-image').src;
            openProductModal(productName, productImage);
        });
    });

    // Handle collection cards (featured collections section)
    document.querySelectorAll('.collection-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const collectionName = card.querySelector('.collection-content h3').textContent;
            const collectionImage = card.querySelector('.collection-image').src;
            openProductModal(collectionName, collectionImage);
        });
    });

    // Prevent event bubbling on buttons
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}

/* ============================================
   CTA BUTTONS FUNCTIONALITY
   ============================================ */
function handleCTA(action) {
    switch(action) {
        case 'explore':
            // Scroll to best sellers or collections section
            const collectionsSection = document.querySelector('.collections-section') || 
                                     document.querySelector('.bestsellers-section');
            if (collectionsSection) {
                collectionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            break;
        case 'custom':
            // Navigate to custom gift builder (placeholder)
            console.log('Opening custom gift builder...');
            alert('🎁 Custom Gift Builder Feature - Coming Soon!\nCreate your unique gift package.');
            break;
        case 'voucher':
            // Navigate to vouchers section (placeholder)
            console.log('Opening gift vouchers...');
            alert('🎉 Gift Vouchers Available!\nPerfect for any occasion.');
            break;
        default:
            console.log('CTA action:', action);
    }
}

/* ============================================
   PRODUCT MODAL & DETAILED VIEW
   ============================================ */

// Product database with details
const productDatabase = {
    'Luxury Love Box': {
        price: '$89',
        originalPrice: '$120',
        description: 'An exquisite collection of artisanal treats, carefully curated to express your deepest emotions. Each item is hand-selected from premium suppliers, combining taste and elegance.',
        features: [
            'Artisanal chocolates from Belgium',
            'Rose petal tea blend',
            'Luxury candle (200g)',
            'Premium greeting card',
            'Silk ribbon gift wrap',
            '100% satisfaction guaranteed'
        ]
    },
    'Romance Celebration': {
        price: '$95',
        originalPrice: '$135',
        description: 'Perfect for special moments and romantic occasions. This premium gift box contains a selection of luxurious items designed to create lasting memories with your loved one.',
        features: [
            'Gourmet truffles collection',
            'Luxury bath salts',
            'Premium scented soap',
            'Gift-wrapped perfume sample',
            'Handwritten note card',
            'Free personalization'
        ]
    },
    'Wellness Bundle': {
        price: '$95',
        originalPrice: '$140',
        description: 'A thoughtfully curated selection of wellness products to help your recipient relax and rejuvenate. Crafted with natural, premium ingredients for the ultimate self-care experience.',
        features: [
            'Organic lavender spa set',
            'Natural skincare cream',
            'Aromatherapy diffuser',
            'Premium herbal tea selection',
            'Bamboo bath accessories',
            'Luxury packaging included'
        ]
    },
    'Artisan Delight Set': {
        price: '$110',
        originalPrice: '$160',
        description: 'A masterpiece collection showcasing the finest artisanal products from around the world. Each item tells a story of craftsmanship and dedication to quality.',
        features: [
            'Handcrafted artisan soaps',
            'Gourmet food selection',
            'Premium honey jar (500g)',
            'Luxury chocolate bonbons',
            'Craft coffee beans',
            'Wooden serving board'
        ]
    },
    'Chocolate Indulgence': {
        price: '$65',
        originalPrice: '$95',
        description: 'A chocolate lover\'s dream! This delightful collection features premium chocolates from master chocolatiers, each piece a work of art.',
        features: [
            'Premium Belgian chocolates',
            'Dark chocolate truffles',
            'Milk chocolate assortment',
            'Chocolate-dipped fruits',
            'Cocoa-dusted bonbons',
            'Elegant gift box packaging'
        ]
    }
};

let currentProduct = null;

// Initialize product modal
function initProductModal() {
    const productModal = document.getElementById('productModal');
    const productModalOverlay = document.getElementById('productModalOverlay');
    const productModalClose = document.getElementById('productModalClose');
    const decreaseQtyBtn = document.getElementById('decreaseQty');
    const increaseQtyBtn = document.getElementById('increaseQty');
    const qtyInput = document.getElementById('productQty');
    const addToCartBtn = document.getElementById('addToCartModal');

    // Close modal on overlay click
    productModalOverlay?.addEventListener('click', () => {
        productModal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close modal on close button click
    productModalClose?.addEventListener('click', () => {
        productModal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && productModal.classList.contains('active')) {
            productModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Quantity controls
    decreaseQtyBtn?.addEventListener('click', () => {
        const currentQty = parseInt(qtyInput.value);
        if (currentQty > 1) {
            qtyInput.value = currentQty - 1;
        }
    });

    increaseQtyBtn?.addEventListener('click', () => {
        const currentQty = parseInt(qtyInput.value);
        qtyInput.value = currentQty + 1;
    });

    qtyInput?.addEventListener('change', (e) => {
        if (e.target.value < 1) {
            e.target.value = 1;
        }
    });

    // Add to cart button
    addToCartBtn?.addEventListener('click', () => {
        const quantity = parseInt(qtyInput.value);
        const price = currentProduct.price.replace('$', '');
        const total = (parseFloat(price) * quantity).toFixed(2);
        
        alert(`✅ Added to Cart!\n\nProduct: ${currentProduct.name}\nQuantity: ${quantity}\nTotal: $${total}\n\nYour item is now in the cart!`);
        
        // Reset quantity
        qtyInput.value = 1;
    });
}

// Open product modal
function openProductModal(productName, imageSrc) {
    const productData = productDatabase[productName];
    if (!productData) return;

    currentProduct = {
        name: productName,
        ...productData
    };

    const productModal = document.getElementById('productModal');
    document.getElementById('modalProductImage').src = imageSrc;
    document.getElementById('modalProductName').textContent = productName;
    document.getElementById('modalProductPrice').textContent = productData.price;
    document.getElementById('modalOriginalPrice').textContent = productData.originalPrice;
    document.getElementById('modalProductDescription').textContent = productData.description;
    
    // Populate features
    const featuresList = document.getElementById('modalProductFeatures');
    featuresList.innerHTML = productData.features.map(feature => `<li>${feature}</li>`).join('');

    // Reset quantity
    document.getElementById('productQty').value = 1;

    // Show modal
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Attach click handlers to all product cards
function initProductClickHandlers() {
    // Handle product cards (best sellers section)
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on buttons (add to cart, slider arrows)
            if (e.target.closest('.btn-add-cart') || e.target.closest('.slider-arrow')) {
                return;
            }
            const productName = card.querySelector('.product-name').textContent;
            const productImage = card.querySelector('.product-card-image').src;
            openProductModal(productName, productImage);
        });
    });

    // Handle collection cards (featured collections section)
    document.querySelectorAll('.collection-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            if (e.target.closest('.slider-arrow')) {
                return;
            }
            const collectionName = card.querySelector('.collection-content h3').textContent;
            const collectionImage = card.querySelector('.collection-image').src;
            openProductModal(collectionName, collectionImage);
        });
    });

    // Prevent event bubbling on buttons
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}