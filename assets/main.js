const SUPABASE_URL = "";
const SUPABASE_KEY = "";

// Lemon Squeezy checkout links for Blok Pro on Chrome / Edge
// (Products › Blok Pro › each variant › Share). Empty means "not on sale yet".
const CHECKOUT = {
    monthly: "",
    yearly: ""
};

document.getElementById("year").textContent = new Date().getFullYear();

const nav = document.querySelector(".nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 8), { passive: true });

function countUp(element, target, duration = 1400) {
    const start = performance.now();
    const step = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        element.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1)
            requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        if (!entry.isIntersecting)
            continue;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
    }
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const statNum = document.querySelector(".stat-num");
const badgeCount = document.getElementById("badge-count");
setTimeout(() => {
    countUp(statNum, Number(statNum.dataset.count));
    countUp(badgeCount, 41);
}, 400);

// Interactive label demo
const demoText = document.getElementById("demo-text");
const demoHint = document.getElementById("demo-hint");
document.querySelectorAll("[data-demo]").forEach((button) => {
    button.addEventListener("click", () => {
        const action = button.dataset.demo;
        if (action === "hide") {
            const blurred = demoText.classList.toggle("blurred");
            button.textContent = blurred ? "Show" : "Hide";
            button.classList.toggle("active", blurred);
            demoHint.textContent = blurred ? "Hidden. Tap Show to reveal it again." : "Try the buttons. Hide blurs it; 👍 / 👎 teach Blok.";
            return;
        }
        document.querySelectorAll("[data-demo='up'], [data-demo='down']").forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        demoHint.textContent = action === "up"
            ? "Thanks! Your vote helps Blok catch slop like this for everyone."
            : "Got it. Blok will label less like this for you, and learn from it.";
    });
});

// Pricing toggle
const PRICES = {
    yearly: { price: "$11.99", period: "/ year", sub: "Just $1 a month. 7-day free trial." },
    monthly: { price: "$1.99", period: "/ month", sub: "Cancel anytime. 7-day free trial." }
};
let billing = "yearly";
document.querySelectorAll("[data-billing]").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll("[data-billing]").forEach((b) => b.classList.toggle("active", b === button));
        billing = button.dataset.billing;
        const plan = PRICES[billing];
        document.getElementById("price").textContent = plan.price;
        document.getElementById("price-period").textContent = plan.period;
        document.getElementById("price-sub").textContent = plan.sub;
    });
});

// Lemon Squeezy checkout for Chrome / Edge, opened as an overlay on the page
if (CHECKOUT.monthly && CHECKOUT.yearly) {
    const lemon = document.createElement("script");
    lemon.src = "https://app.lemonsqueezy.com/js/lemon.js";
    lemon.defer = true;
    lemon.onload = () => window.createLemonSqueezy?.();
    document.head.append(lemon);

    document.getElementById("buy-chromium").addEventListener("click", (event) => {
        event.preventDefault();
        const url = CHECKOUT[billing];
        if (window.LemonSqueezy)
            window.LemonSqueezy.Url.Open(url);
        else
            location.href = url;
    });
}

// Waitlist
const form = document.getElementById("notify");
const message = document.getElementById("notify-msg");
form.addEventListener("submit", async (event) => {
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
        message.textContent = response.ok || response.status === 409
            ? "You're on the list. We'll email you the day Blok launches."
            : "Something went wrong. Please try again.";
        if (response.ok)
            form.reset();
    } catch {
        message.textContent = "Something went wrong. Please try again.";
    } finally {
        button.disabled = false;
    }
});
