const langButtons = document.querySelectorAll("[data-lang-switch]");
const translatableNodes = document.querySelectorAll("[data-ru][data-en]");
const placeholderNodes = document.querySelectorAll("[data-ru-placeholder][data-en-placeholder]");
const header = document.getElementById("header");
const mobileMenuButton = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

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

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("is-open");
        mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
    });

    mobileMenu.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", () => {
            mobileMenu.classList.remove("is-open");
            mobileMenuButton.setAttribute("aria-expanded", "false");
        });
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
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

if (header) {
    const syncHeaderState = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    syncHeaderState();
    window.addEventListener("scroll", syncHeaderState, { passive: true });
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

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const supportsFinePointer = window.matchMedia("(pointer: fine)");
const tiltNodes = document.querySelectorAll("[data-tilt]");

if (!prefersReducedMotion.matches && supportsFinePointer.matches && tiltNodes.length > 0) {
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const resetTilt = (node) => {
        node.classList.remove("is-tilting");
        node.style.setProperty("--tilt-rotate-x", "0deg");
        node.style.setProperty("--tilt-rotate-y", "0deg");
        node.style.setProperty("--tilt-glow-x", "50%");
        node.style.setProperty("--tilt-glow-y", "50%");
    };

    tiltNodes.forEach((node) => {
        const strength = Number(node.dataset.tiltStrength || "4");

        resetTilt(node);

        node.addEventListener("pointermove", (event) => {
            const rect = node.getBoundingClientRect();

            if (rect.width === 0 || rect.height === 0) {
                return;
            }

            const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
            const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
            const rotateX = ((0.5 - y) * strength * 1.45).toFixed(2);
            const rotateY = ((x - 0.5) * strength * 1.45).toFixed(2);

            node.classList.add("is-tilting");
            node.style.setProperty("--tilt-rotate-x", `${rotateX}deg`);
            node.style.setProperty("--tilt-rotate-y", `${rotateY}deg`);
            node.style.setProperty("--tilt-glow-x", `${(x * 100).toFixed(1)}%`);
            node.style.setProperty("--tilt-glow-y", `${(y * 100).toFixed(1)}%`);
        });

        node.addEventListener("pointerleave", () => {
            resetTilt(node);
        });

        node.addEventListener("blur", () => {
            resetTilt(node);
        });
    });
}
