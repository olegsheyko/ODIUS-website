const langButtons = document.querySelectorAll("[data-lang-switch]");
const translatableNodes = document.querySelectorAll("[data-ru][data-en]");
const placeholderNodes = document.querySelectorAll("[data-ru-placeholder][data-en-placeholder]");
const labelNodes = document.querySelectorAll("[data-ru-label][data-en-label]");
const header = document.getElementById("header");
const mobileMenuButton = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function currentLang() {
    return document.documentElement.lang === "en" ? "en" : "ru";
}

function switchLanguage(lang) {
    document.documentElement.lang = lang;

    langButtons.forEach((button) => {
        const isActive = button.dataset.langSwitch === lang;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    translatableNodes.forEach((node) => {
        const value = lang === "en" ? node.dataset.en : node.dataset.ru;
        if (typeof value === "string") {
            node.textContent = value;
        }
    });

    placeholderNodes.forEach((node) => {
        const value = lang === "en" ? node.dataset.enPlaceholder : node.dataset.ruPlaceholder;
        if (typeof value === "string") {
            node.placeholder = value;
        }
    });

    labelNodes.forEach((node) => {
        const value = lang === "en" ? node.dataset.enLabel : node.dataset.ruLabel;
        if (typeof value === "string") {
            node.setAttribute("aria-label", value);
        }
    });

    try {
        localStorage.setItem("odius-lang", lang);
    } catch (error) {
        void error;
    }
}

langButtons.forEach((button) => {
    button.addEventListener("click", () => {
        switchLanguage(button.dataset.langSwitch === "en" ? "en" : "ru");
    });
});

// Header turns into a glass bar once content scrolls beneath it.
if (header) {
    const syncHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
}

function setMenu(isOpen) {
    mobileMenu.classList.toggle("is-open", isOpen);
    header.classList.toggle("is-open", isOpen);
    mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
}

if (mobileMenuButton && mobileMenu && header) {
    mobileMenuButton.addEventListener("click", () => {
        setMenu(!mobileMenu.classList.contains("is-open"));
    });

    mobileMenu.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
            setMenu(false);
            mobileMenuButton.focus();
        }
    });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") {
            return;
        }

        const target = document.querySelector(targetId);
        if (!target) {
            return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
    });
});

// Highlight the section currently in view.
const navLinks = document.querySelectorAll(".nav-link[href^='#']");
if ("IntersectionObserver" in window && navLinks.length > 0) {
    const sections = [...navLinks]
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean)
        .map((node) => node.closest("section") || node);

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }
            navLinks.forEach((link) => {
                const target = document.querySelector(link.getAttribute("href"));
                const section = target && (target.closest("section") || target);
                if (section === entry.target) {
                    link.setAttribute("aria-current", "true");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach((section) => sectionObserver.observe(section));
}

// Reveal blocks as they enter the viewport.
const revealNodes = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });

    revealNodes.forEach((node) => revealObserver.observe(node));
} else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
}

// Hero key art: dissolves into the background on scroll and follows the pointer.
const hero = document.querySelector(".hero");
if (hero && !reducedMotion.matches) {
    const art = hero.querySelector(".hero-art");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let ticking = false;

    const render = () => {
        // Start dissolving once the art itself reaches the upper part of the screen.
        const start = Math.max(0, hero.offsetTop + (art ? art.offsetTop : 0) - window.innerHeight * 0.25);
        const progress = Math.min(Math.max((window.scrollY - start) / (hero.offsetHeight * 0.8), 0), 1);
        hero.style.setProperty("--sp", progress.toFixed(4));

        current.x += (target.x - current.x) * 0.08;
        current.y += (target.y - current.y) * 0.08;
        hero.style.setProperty("--mx", current.x.toFixed(4));
        hero.style.setProperty("--my", current.y.toFixed(4));

        const settling = Math.abs(target.x - current.x) > 0.001 || Math.abs(target.y - current.y) > 0.001;
        ticking = settling;
        if (settling) {
            window.requestAnimationFrame(render);
        }
    };

    const requestRender = () => {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(render);
        }
    };

    window.addEventListener("scroll", requestRender, { passive: true });

    if (finePointer) {
        hero.addEventListener("pointermove", (event) => {
            const rect = hero.getBoundingClientRect();
            target.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            target.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
            requestRender();
        });
        hero.addEventListener("pointerleave", () => {
            target.x = 0;
            target.y = 0;
            requestRender();
        });
    }

    requestRender();
}

// Cursor spotlight on capability cards.
document.querySelectorAll(".capability").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--y", `${event.clientY - rect.top}px`);
    });
});

// Screenshot lightbox with keyboard navigation; links still work without JS.
const lightbox = document.getElementById("lightbox");
const lightboxLinks = [...document.querySelectorAll("[data-lightbox]")];
if (lightbox && typeof lightbox.showModal === "function" && lightboxLinks.length > 0) {
    const lightboxImage = lightbox.querySelector(".lightbox-image");
    let index = 0;

    const show = (nextIndex) => {
        index = (nextIndex + lightboxLinks.length) % lightboxLinks.length;
        const thumb = lightboxLinks[index].querySelector("img");
        lightboxImage.src = lightboxLinks[index].href;
        lightboxImage.alt = thumb ? thumb.alt : "";
    };

    lightboxLinks.forEach((link, linkIndex) => {
        link.addEventListener("click", (event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
                return;
            }
            event.preventDefault();
            show(linkIndex);
            lightbox.showModal();
        });
    });

    lightbox.querySelectorAll("[data-lightbox-step]").forEach((button) => {
        button.addEventListener("click", () => show(index + Number(button.dataset.lightboxStep)));
    });

    lightbox.querySelector("[data-lightbox-close]").addEventListener("click", () => lightbox.close());

    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            lightbox.close();
        }
    });

    lightbox.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
            show(index + 1);
        } else if (event.key === "ArrowLeft") {
            show(index - 1);
        }
    });

    lightbox.addEventListener("close", () => {
        lightboxImage.removeAttribute("src");
        lightboxLinks[index].focus();
    });
}

document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
});

let preferredLanguage = "ru";

try {
    preferredLanguage = localStorage.getItem("odius-lang") === "en" ? "en" : "ru";
} catch (error) {
    preferredLanguage = "ru";
    void error;
}

if (langButtons.length > 0 || translatableNodes.length > 0 || placeholderNodes.length > 0) {
    switchLanguage(preferredLanguage);
}
