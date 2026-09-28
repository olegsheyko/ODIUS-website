const langButtons = document.querySelectorAll("[data-lang-switch]");
const translatableNodes = document.querySelectorAll("[data-ru][data-en]");
const placeholderNodes = document.querySelectorAll("[data-ru-placeholder][data-en-placeholder]");
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
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
});


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
