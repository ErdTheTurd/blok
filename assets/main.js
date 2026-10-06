const SUPABASE_URL = "";
const SUPABASE_KEY = "";

document.getElementById("year").textContent = new Date().getFullYear();

const nav = document.querySelector(".nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 8), { passive: true });

// Before / after slider
const compare = document.getElementById("compare");
const range = compare.querySelector(".compare-range");
range.addEventListener("input", () => compare.style.setProperty("--pos", `${range.value}%`));

// Working label demo
const demoText = document.getElementById("demo-text");
const demoHint = document.getElementById("demo-hint");
const DEMO_HINTS = {
    up: "Marked as AI. Your vote counts toward the score other people see.",
    down: "Marked as not AI. Blok removes the label and labels less like this for you.",
    hidden: "Hidden. Tap Show to read it.",
    idle: "This label works. Try the buttons."
};
document.querySelectorAll("[data-demo]").forEach((button) => {
    button.addEventListener("click", () => {
        const action = button.dataset.demo;
        if (action === "hide") {
            const blurred = demoText.classList.toggle("blurred");
            button.textContent = blurred ? "Show" : "Hide";
            button.classList.toggle("active", blurred);
            demoHint.textContent = blurred ? DEMO_HINTS.hidden : DEMO_HINTS.idle;
            return;
        }
        document.querySelectorAll("[data-demo='up'], [data-demo='down']").forEach((other) => other.classList.toggle("active", other === button));
        demoHint.textContent = DEMO_HINTS[action];
    });
});

// Pricing toggle
const PRICES = {
    yearly: { price: "$19.99", period: "a year", sub: "$1.67 a month. Try it free for 7 days." },
    monthly: { price: "$2.99", period: "a month", sub: "Cancel anytime. Try it free for 7 days." }
};
document.querySelectorAll("[data-billing]").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll("[data-billing]").forEach((other) => other.classList.toggle("active", other === button));
        const plan = PRICES[button.dataset.billing];
        document.getElementById("price").textContent = plan.price;
        document.getElementById("price-period").textContent = plan.period;
        document.getElementById("price-sub").textContent = plan.sub;
    });
});

// Download buttons preselect the browser in the waitlist form
const form = document.getElementById("notify");
document.querySelectorAll("a[data-platform]").forEach((link) => {
    link.addEventListener("click", () => {
        form.querySelector(`input[value="${link.dataset.platform}"]`).checked = true;
    });
});

// Waitlist
const message = document.getElementById("notify-msg");
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = form.elements.email.value.trim();
    const platform = form.elements.platform.value;
    const button = form.querySelector("button");

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        message.textContent = "Sign-ups open soon. Check back in a few days.";
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
            body: JSON.stringify({ email, platform })
        });
        message.textContent = response.ok || response.status === 409
            ? "You're on the list. We'll email you once, when Blok is out."
            : "That didn't work. Please try again.";
        if (response.ok)
            form.elements.email.value = "";
    } catch {
        message.textContent = "That didn't work. Please try again.";
    } finally {
        button.disabled = false;
    }
});
