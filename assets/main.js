const SUPABASE_URL = "https://lajxxqvvhaqkdothufyh.supabase.co";
const SUPABASE_KEY = "sb_publishable_lb2IkB9g1EXy0MkVrttKSg_OKYOODGW";

// Lemon Squeezy checkout links for HaltBlock Pro on Chrome / Edge
// (Products › HaltBlock Pro › each variant › Share). Empty means "not on sale yet".
const CHECKOUT = {
    monthly: "",
    yearly: "",
    lifetime: ""
};

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
            demoHint.textContent = blurred ? "Hidden. Tap Show to reveal it again." : "Try the buttons. Hide blurs it; thumbs teach HaltBlock.";
            return;
        }
        document.querySelectorAll("[data-demo='up'], [data-demo='down']").forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        demoHint.textContent = action === "up"
            ? "Thanks. Your vote helps HaltBlock label content like this."
            : "Got it. HaltBlock will label less like this for you.";
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
        document.querySelectorAll("[data-billing]").forEach((b) => b.classList.toggle("active", b === button));
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
if (buyButton && CHECKOUT.monthly && CHECKOUT.yearly) {
    const lemon = document.createElement("script");
    lemon.src = "https://app.lemonsqueezy.com/js/lemon.js";
    lemon.defer = true;
    lemon.onload = () => window.createLemonSqueezy?.();
    document.head.append(lemon);

    buyButton.addEventListener("click", (event) => {
        event.preventDefault();
        const url = CHECKOUT[billing] || CHECKOUT.yearly;
        if (window.LemonSqueezy)
            window.LemonSqueezy.Url.Open(url);
        else
            location.href = url;
    });
}

// Waitlist
const form = $("#notify");
const message = $("#notify-msg");
form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = form.querySelector("input").value.trim();
    const button = form.querySelector("button");

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        message.textContent = "Sign-ups open soon. Check back shortly!";
        return;
    }

    button.disabled = true;
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
            return;
        }
        let errorMessage = "Something went wrong. Please try again.";
        try {
            const body = await response.json();
            if (body?.message)
                errorMessage = body.message;
        } catch {
            // The response had no JSON body to show.
        }
        message.textContent = errorMessage;
    } catch {
        message.textContent = "Something went wrong. Please try again.";
    } finally {
        button.disabled = false;
    }
});
