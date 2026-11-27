const SUPABASE_URL = "https://lajxxqvvhaqkdothufyh.supabase.co";
const SUPABASE_KEY = "sb_publishable_lb2IkB9g1EXy0MkVrttKSg_OKYOODGW";

// Lemon Squeezy checkout links for HaltBlock Pro on Chrome / Edge
// (Products › HaltBlock Pro › each variant › Share). Empty means "not on sale yet".
const CHECKOUT = {
    monthly: "",
    yearly: "",
    lifetime: ""
};

const CHECKOUT_HOSTS = [
    "lemonsqueezy.com",
    "www.lemonsqueezy.com",
    "app.lemonsqueezy.com",
    "haltblock.lemonsqueezy.com"
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const $ = (selector) => document.querySelector(selector);

const year = $("#year");
if (year)
    year.textContent = new Date().getFullYear();

const nav = $(".nav");
if (nav)
    addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 8), { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        if (!entry.isIntersecting)
            continue;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
    }
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

function isAllowedCheckoutUrl(url) {
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:")
            return false;
        return CHECKOUT_HOSTS.some((host) => (
            parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
        ));
    } catch {
        return false;
    }
}

// Interactive label demo
const demoText = $("#demo-text");
const demoHint = $("#demo-hint");
document.querySelectorAll("[data-demo]").forEach((button) => {
    button.addEventListener("click", () => {
        const action = button.dataset.demo;
        if (action === "hide") {
            const blurred = demoText.classList.toggle("blurred");
            button.textContent = blurred ? "Show" : "Hide";
            button.classList.toggle("active", blurred);
            demoHint.textContent = blurred
                ? "Hidden. Tap Show to reveal it again. (Demo only — nothing is saved.)"
                : "Try the buttons. This is only an example; votes here aren't saved.";
            return;
        }
        document.querySelectorAll("[data-demo='up'], [data-demo='down']").forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        demoHint.textContent = action === "up"
            ? "Thanks. In this example, a thumbs-up would reinforce labels like this. (Demo only — nothing is saved.)"
            : "Got it. In this example, HaltBlock would label less like this. (Demo only — nothing is saved.)";
    });
});

// Pricing toggle
const PRICES = {
    yearly: { price: "$11.99", period: "/ year", sub: "14-day free trial." },
    monthly: { price: "$1.99", period: "/ month", sub: "7-day free trial." },
    lifetime: { price: "$35.99", period: " lifetime", sub: "One-time purchase." }
};
let billing = "yearly";
document.querySelectorAll("[data-billing]").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll("[data-billing]").forEach((b) => {
            const active = b === button;
            b.classList.toggle("active", active);
            b.setAttribute("aria-pressed", String(active));
        });
        billing = button.dataset.billing;
        const plan = PRICES[billing];
        const price = $("#price");
        const period = $("#price-period");
        const sub = $("#price-sub");
        if (price)
            price.textContent = plan.price;
        if (period)
            period.textContent = plan.period;
        if (sub)
            sub.textContent = plan.sub;
    });
});

// Lemon Squeezy checkout for Chrome / Edge, opened as an overlay on the page
const buyButton = $("#buy-chromium");
const checkoutConfigured = Object.values(CHECKOUT).some(Boolean);
function showCheckoutNotice(text) {
    let note = $("#checkout-msg");
    if (!note) {
        note = document.createElement("p");
        note.id = "checkout-msg";
        note.className = "plan-note";
        note.setAttribute("aria-live", "polite");
        buyButton.after(note);
    }
    note.textContent = text;
}

if (buyButton) {
    if (!checkoutConfigured) {
        buyButton.textContent = "Edge purchases aren't available yet";
        buyButton.setAttribute("aria-disabled", "true");
        buyButton.setAttribute("href", "#");
        buyButton.addEventListener("click", (event) => {
            event.preventDefault();
        });
    } else {
        const lemon = document.createElement("script");
        lemon.src = "https://app.lemonsqueezy.com/js/lemon.js";
        lemon.defer = true;
        lemon.onload = () => window.createLemonSqueezy?.();
        document.head.append(lemon);

        buyButton.addEventListener("click", (event) => {
            event.preventDefault();
            const url = CHECKOUT[billing];
            if (!url) {
                showCheckoutNotice("Checkout isn't available for this plan yet.");
                return;
            }
            if (!isAllowedCheckoutUrl(url)) {
                showCheckoutNotice("Checkout isn't available for this plan yet.");
                return;
            }
            showCheckoutNotice("");
            if (window.LemonSqueezy)
                window.LemonSqueezy.Url.Open(url);
            else
                location.href = url;
        });
    }
}

// Waitlist
const form = $("#notify");
const message = $("#notify-msg");
form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    const email = (input?.value || "").trim().slice(0, 254);
    const button = form.querySelector("button");

    if (!EMAIL_RE.test(email)) {
        message.textContent = "Enter a valid email address.";
        return;
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        message.textContent = "Sign-ups open soon. Check back shortly!";
        return;
    }

    if (button.disabled)
        return;

    button.disabled = true;
    let keepDisabled = false;
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({ email })
        });
        if (response.ok || response.status === 409) {
            message.textContent = "You're on the list. We'll email you when Chrome is ready.";
            form.reset();
            keepDisabled = true;
            return;
        }
        message.textContent = "Something went wrong. Please try again.";
    } catch {
        message.textContent = "Something went wrong. Please try again.";
    } finally {
        if (!keepDisabled)
            button.disabled = false;
    }
});
