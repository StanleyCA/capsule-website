const navbar = document.querySelector('.site-nav');
const hero = document.querySelector('.hero');
const chapterCards = Array.from(document.querySelectorAll('.chapter-list article'));
const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"], .nav-button[href^="#"]'));
const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const setActiveLink = (id) => {
    navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
};

if (reducedMotion) {
    document.body.classList.add('no-motion');
}

const revealElements = Array.from(document.querySelectorAll('.hero-content, .proof-strip span, .story-title, .story-card, .story-note, .screen-card, .product-card, .mid-cta-card, .comparison-list article, .chapter-list article, .download-card'));

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.14 }
    );

    revealElements.forEach((element, index) => {
        element.classList.add('reveal');
        element.style.transitionDelay = `${Math.min(index, 6) * 55}ms`;
        revealObserver.observe(element);
    });
} else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
}

if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

            if (visible[0]) {
                setActiveLink(visible[0].target.id);
            }
        },
        { rootMargin: '-20% 0px -55% 0px', threshold: [0.12, 0.35, 0.6] }
    );

    sections.forEach((section) => sectionObserver.observe(section));
}

const updateMotion = () => {
    if (reducedMotion) {
        return;
    }

    if (hero) {
        const heroRect = hero.getBoundingClientRect();
        const heroProgress = Math.min(1, Math.max(0, -heroRect.top / Math.max(heroRect.height, 1)));
        hero.style.setProperty('--hero-shift', `${heroProgress * 38}px`);
    }

};

let ticking = false;
const requestMotionUpdate = () => {
    if (ticking) {
        return;
    }

    window.requestAnimationFrame(() => {
        updateMotion();
        ticking = false;
    });

    ticking = true;
};

if (!reducedMotion) {
    window.addEventListener('scroll', requestMotionUpdate, { passive: true });
    window.addEventListener('resize', requestMotionUpdate);
}

if (chapterCards.length && 'IntersectionObserver' in window) {
    const chapterObserver = new IntersectionObserver(
        (entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

            if (!visible[0]) {
                return;
            }

            chapterCards.forEach((card) => {
                card.classList.toggle('is-active', card === visible[0].target);
            });
        },
        { rootMargin: '-28% 0px -36% 0px', threshold: [0.22, 0.45, 0.7] }
    );

    chapterCards.forEach((card) => chapterObserver.observe(card));
    chapterCards[0].classList.add('is-active');
}

window.addEventListener(
    'scroll',
    () => {
        if (navbar) {
            navbar.classList.toggle('is-scrolled', window.scrollY > 8);
        }
    },
    { passive: true }
);

window.addEventListener('load', () => {
    if (navbar) {
        navbar.classList.toggle('is-scrolled', window.scrollY > 8);
    }
    const activeSection = sections.find((section) => section.getBoundingClientRect().top >= 0) || sections[0];
    if (activeSection) {
        setActiveLink(activeSection.id);
    }

    updateMotion();
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);

        if (!target) {
            return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
