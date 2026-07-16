# KrishiMotto™ — Website

> **Empowered to Aspire**

A static, multi-page marketing and legal site for the KrishiMotto agri super-app.
No build step, no dependencies — plain HTML, CSS and vanilla JavaScript.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Main site — story, concept, surfaces, app screenshots, download, the core loop, architecture, services, trust layer, stack |
| `about.html` | About Us — GT Tech + MSSSoA, our agri interventions, how the idea came about, **The Story Behind the Logo**, download |
| `terms.html` | Terms & Conditions |
| `privacy.html` | Privacy Policy |
| `contact.html` | Contact Us — details, enquiry form and embedded map |
| `delete-account.html` | Account deletion request form |

## Structure

```
.
├── index.html
├── about.html
├── terms.html
├── privacy.html
├── contact.html
├── delete-account.html
├── README.md
└── assets/
    ├── css/style.css        # whole design system, day/night themes, animations
    ├── js/main.js           # theme toggle, mobile menu, scroll reveal, form validation
    └── img/
        ├── logo-full.png/.webp   # full lockup with ™
        ├── logo-mark.png/.webp   # illustration-only mark (nav/footer)
        ├── favicon.png
        └── shots/*.jpg           # app screenshots
```

## Run it locally

Just open `index.html` in a browser. Or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a repository on GitHub (e.g. `krishimotto-website`).
2. Push these files to the **root** of the `main` branch:

   ```bash
   git init
   git add .
   git commit -m "KrishiMotto website"
   git branch -M main
   git remote add origin https://github.com/<your-user>/<your-repo>.git
   git push -u origin main
   ```

3. In the repo: **Settings → Pages**.
4. Under *Build and deployment*, set **Source** = `Deploy from a branch`,
   **Branch** = `main`, folder = `/ (root)`. Save.
5. Wait ~1 minute. The site goes live at
   `https://<your-user>.github.io/<your-repo>/`.

All paths are relative, so it works from a project subpath without changes.

### Custom domain (optional)
Add a file named `CNAME` at the root containing your domain (e.g. `krishimotto.app`),
then point a DNS `CNAME` record at `<your-user>.github.io`.

## Notes

- **Logos** use `<picture>` with a WebP source and a PNG fallback — every modern browser gets the small file, older ones still work.
- **Theme** is day/night, remembered in `localStorage`, and defaults to the visitor's system preference.
- **Animations** respect `prefers-reduced-motion` — they're fully disabled for users who ask for that.
- **The delete-account form is front-end only.** It validates input and shows a confirmation, but there is no backend, so nothing is sent anywhere. To make it live, POST the form data to your API (or a form service) from the submit handler in `assets/js/main.js`.
- The legal pages are good-faith templates that reflect how the platform works — have counsel review them before you rely on them.

## App store links (currently "Coming Soon")

The Google Play and App Store badges on `index.html` (`#download`) and `about.html` are
inert placeholders — they render as **Coming soon** and are not clickable.

To activate them at launch, swap each `<span class="store" ...>` for an anchor and
change the label:

```html
<a class="store" href="https://play.google.com/store/apps/details?id=YOUR.APP.ID"
   target="_blank" rel="noopener">
  <svg ...> ... </svg>
  <span class="txt"><small>Get it on</small><b>Google Play</b></span>
</a>
```

Do the same for the App Store badge with your `https://apps.apple.com/...` URL.
The badge styling (`.store`) already covers both states, so nothing else needs to change.

> Note: the badges use simplified vector glyphs. Before publishing, you may wish to swap in
> the official Google Play and Apple App Store badge artwork, which each platform provides
> under its own brand guidelines.

## Contact form — one-time setup required

GitHub Pages serves static files only; it cannot send email by itself. The contact form
therefore posts to **FormSubmit**, a free relay that forwards submissions to
`md@thegttech.com`. No account or API key is needed, but it must be activated **once**:

1. Publish the site (or open `contact.html` locally).
2. Submit the form once with any test message.
3. FormSubmit emails `md@thegttech.com` a confirmation link. **Click it once.**
4. From then on, every submission is delivered to that inbox automatically.

If the send ever fails, the form falls back gracefully: it shows a `mailto:` link that
opens the visitor's mail app with their message pre-filled, so nothing is lost.

### Changing the destination address
Edit the `data-endpoint` attribute on the `<form id="contactForm">` in `contact.html`:

```html
data-endpoint="https://formsubmit.co/ajax/YOUR-ADDRESS@example.com"
data-fallback="YOUR-ADDRESS@example.com"
```

### Reducing spam / hiding the address
Once activated, FormSubmit gives you a hashed endpoint
(`https://formsubmit.co/ajax/<random-hash>`). Swapping the plain address for that hash
keeps the inbox address out of the page source. You can also use your own backend —
just point `data-endpoint` at any URL that accepts a JSON `POST`.

### The embedded map
`contact.html` embeds a Google Maps iframe for KSR Pleasant Valley, Madhavadhara,
Visakhapatnam. It loads lazily and is tinted automatically in night mode.

---

© KrishiMotto™ · Made in India for the farmer.
