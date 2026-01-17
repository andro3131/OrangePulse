// ========================================
// VibeBOT v2.3 - JavaScript
// Interactive Landing Page
// ========================================

// === Mobile Navigation ===
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// === Navbar Scroll Effect ===
const navbar = document.getElementById('navbar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// === Strategy Tabs ===
const strategyTabs = document.querySelectorAll('.strategy-tab');
const strategyPanels = document.querySelectorAll('.strategy-panel');

strategyTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and panels
        strategyTabs.forEach(t => t.classList.remove('active'));
        strategyPanels.forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show corresponding panel
        const strategyId = tab.getAttribute('data-strategy');
        const panel = document.getElementById(strategyId);
        if (panel) {
            panel.classList.add('active');
        }
    });
});

// === FAQ Accordion ===
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        // Close all other items
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        // Toggle current item
        item.classList.toggle('active');
    });
});

// === Newsletter Form ===
const newsletterForm = document.getElementById('newsletterForm');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value;
        
        // Simple validation
        if (email && validateEmail(email)) {
            // Here you would normally send to a backend/service
            // For demo purposes, just show success message
            alert(`Thank you for subscribing! We'll send updates to ${email}`);
            emailInput.value = '';
        } else {
            alert('Please enter a valid email address.');
        }
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// === Smooth Scroll with Offset ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const navHeight = navbar.offsetHeight;
            const targetPosition = targetElement.offsetTop - navHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// === Intersection Observer for Fade-In Animations ===
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply to all feature cards, integration cards, etc.
const animatedElements = document.querySelectorAll(
    '.feature-card, .integration-card, .risk-column, .dca-feature, .flow-step'
);

animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    fadeInObserver.observe(el);
});

// === Animated Stats Counter ===
const stats = document.querySelectorAll('.stat-number');
let hasAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            stats.forEach(stat => {
                const target = stat.textContent;
                animateCounter(stat, target);
            });
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

function animateCounter(element, target) {
    // Extract number from string (e.g., "10+" -> 10)
    const hasPlus = target.includes('+');
    const hasDivision = target.includes('/');
    
    if (hasDivision) {
        // For "24/7" type stats, just display as is
        return;
    }
    
    const numValue = parseInt(target);
    if (isNaN(numValue)) return;
    
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = numValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= numValue) {
            current = numValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + (hasPlus ? '+' : '');
    }, duration / steps);
}

// === Parallax Effect for Hero Background ===
const heroBg = document.querySelector('.hero-bg');

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (heroBg && scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// === Dynamic Chart Placeholders ===
function animateChart(chartElement) {
    const chartLine = chartElement.querySelector('.chart-line');
    if (!chartLine) return;
    
    // Animate chart line drawing
    chartLine.style.animation = 'drawLine 1.5s ease-out forwards';
}

// Add CSS animation for chart lines
const style = document.createElement('style');
style.textContent = `
    @keyframes drawLine {
        from {
            clip-path: inset(0 100% 0 0);
        }
        to {
            clip-path: inset(0 0 0 0);
        }
    }
`;
document.head.appendChild(style);

// Animate charts when they become visible
const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateChart(entry.target);
            chartObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.chart-placeholder').forEach(chart => {
    chartObserver.observe(chart);
});

// === Show/Hide Scroll Indicator ===
const scrollIndicator = document.querySelector('.scroll-indicator');

window.addEventListener('scroll', () => {
    if (scrollIndicator) {
        if (window.scrollY > 200) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.pointerEvents = 'none';
        } else {
            scrollIndicator.style.opacity = '1';
            scrollIndicator.style.pointerEvents = 'auto';
        }
    }
});

// === Add gradient glow effect to cards on hover ===
const glassCards = document.querySelectorAll('.glass');

glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Add radial gradient on hover (optional enhancement)
const glowStyle = document.createElement('style');
glowStyle.textContent = `
    .glass::before {
        content: '';
        position: absolute;
        top: var(--mouse-y, 50%);
        left: var(--mouse-x, 50%);
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .glass:hover::before {
        opacity: 1;
    }
`;
document.head.appendChild(glowStyle);

// === Loading Screen (optional) ===
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// === Keyboard Navigation for Accessibility ===
document.addEventListener('keydown', (e) => {
    // ESC to close mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// === Add active states for navigation based on scroll position ===
const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollY = window.scrollY;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - navbar.offsetHeight - 50;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// === Console Easter Egg ===
console.log('%c🤖 VibeBOT v2.3', 'font-size: 20px; font-weight: bold; color: #00ff88;');
console.log('%cInterested in the code? Check out OrangePulseBot.md!', 'font-size: 14px; color: #94a3b8;');
console.log('%c⚠️ Trading involves risk. Always DYOR!', 'font-size: 12px; color: #ff6b00;');

// === Initialize ===
console.log('VibeBOT Landing Page initialized successfully ✓');
