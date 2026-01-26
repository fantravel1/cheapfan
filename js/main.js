/**
 * CheapFan.com - Main JavaScript
 * "Fandom Is Not for the Rich"
 *
 * Mobile-first, performance-optimized interactivity
 */

(function() {
    'use strict';

    // ============================================
    // DOM Ready
    // ============================================
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initNavigation();
        initStickyHeader();
        initSmoothScroll();
        initAnimations();
        initCountUp();
        initFAQ();
        initNewsletterForm();
    }

    // ============================================
    // Mobile Navigation
    // ============================================
    function initNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');

            // Prevent body scroll when menu is open
            document.body.style.overflow = isExpanded ? '' : 'hidden';
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // ============================================
    // Sticky Header
    // ============================================
    function initStickyHeader() {
        const header = document.querySelector('.header');
        if (!header) return;

        let lastScroll = 0;
        const scrollThreshold = 100;

        function handleScroll() {
            const currentScroll = window.pageYOffset;

            // Add/remove scrolled class for shadow
            if (currentScroll > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Optional: Hide header on scroll down, show on scroll up
            if (currentScroll > scrollThreshold) {
                if (currentScroll > lastScroll) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
            }

            lastScroll = currentScroll;
        }

        // Debounce scroll handler
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();

                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL without jumping
                history.pushState(null, null, targetId);
            });
        });
    }

    // ============================================
    // Scroll Animations (Intersection Observer)
    // ============================================
    function initAnimations() {
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const animatedElements = document.querySelectorAll(
            '.coverage-card, .sport-card, .collection-card, .story-card, .step, .principle, .tier'
        );

        if (!animatedElements.length) return;

        // Add initial styles
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger the animations
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 50);

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // ============================================
    // Count Up Animation for Stats
    // ============================================
    function initCountUp() {
        const stats = document.querySelectorAll('.stat-number[data-count]');
        if (!stats.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    }

    function animateCount(element) {
        const target = parseInt(element.dataset.count, 10);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        function update() {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString() + '+';
                requestAnimationFrame(update);
            } else {
                element.textContent = target.toLocaleString() + '+';
            }
        }

        requestAnimationFrame(update);
    }

    // ============================================
    // FAQ Accordion
    // ============================================
    function initFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        if (!faqItems.length) return;

        faqItems.forEach(item => {
            const summary = item.querySelector('summary');

            summary.addEventListener('click', (e) => {
                // Close other open items (optional accordion behavior)
                // faqItems.forEach(otherItem => {
                //     if (otherItem !== item && otherItem.open) {
                //         otherItem.open = false;
                //     }
                // });
            });
        });
    }

    // ============================================
    // Newsletter Form
    // ============================================
    function initNewsletterForm() {
        const form = document.querySelector('.newsletter-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = form.querySelector('input[type="email"]');
            const submitBtn = form.querySelector('button[type="submit"]');
            const email = emailInput.value.trim();

            if (!isValidEmail(email)) {
                showFormMessage(form, 'Please enter a valid email address.', 'error');
                return;
            }

            // Disable button and show loading state
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribing...';

            // Simulate API call (replace with actual endpoint)
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));

                showFormMessage(form, 'Welcome to the CheapFan family! Check your inbox.', 'success');
                emailInput.value = '';
            } catch (error) {
                showFormMessage(form, 'Something went wrong. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showFormMessage(form, message, type) {
        // Remove existing message
        const existingMsg = form.querySelector('.form-message');
        if (existingMsg) existingMsg.remove();

        const msgEl = document.createElement('p');
        msgEl.className = `form-message form-message--${type}`;
        msgEl.textContent = message;
        msgEl.style.cssText = `
            margin-top: 1rem;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            ${type === 'success'
                ? 'background: rgba(16, 185, 129, 0.2); color: #10B981;'
                : 'background: rgba(239, 68, 68, 0.2); color: #EF4444;'
            }
        `;

        form.appendChild(msgEl);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            msgEl.remove();
        }, 5000);
    }

    // ============================================
    // Utility: Debounce
    // ============================================
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

    // ============================================
    // Utility: Throttle
    // ============================================
    function throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ============================================
    // Lazy Loading Images (if needed)
    // ============================================
    function initLazyLoad() {
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading supported
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        } else {
            // Fallback for older browsers
            const lazyImages = document.querySelectorAll('img[data-src]');

            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // ============================================
    // Service Worker Registration (PWA support)
    // ============================================
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered:', registration.scope);
                    })
                    .catch(error => {
                        console.log('SW registration failed:', error);
                    });
            });
        }
    }

    // ============================================
    // Analytics Event Tracking (placeholder)
    // ============================================
    function trackEvent(category, action, label) {
        // Integration point for analytics
        // Example: Google Analytics, Plausible, etc.
        if (typeof gtag === 'function') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
    }

    // Track CTA clicks
    document.addEventListener('click', (e) => {
        const cta = e.target.closest('.btn-primary, .btn-secondary');
        if (cta) {
            trackEvent('CTA', 'click', cta.textContent.trim());
        }
    });

})();

// ============================================
// Console Easter Egg
// ============================================
console.log(`
🎟️ CheapFan.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fandom Is Not for the Rich.
Get in. Get there. Get loud.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Looking for a job? We're always looking
for passionate fans who can code!

Contact: jobs@cheapfan.com
`);
