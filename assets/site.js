(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const button = document.querySelector("[data-nav-toggle]");
  const navigation = document.querySelector("[data-site-nav]");

  if (button && navigation) {
    const close = () => {
      button.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    };

    button.addEventListener("click", () => {
      const opening = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(opening));
      navigation.classList.toggle("is-open", opening);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close();
        button.focus();
      }
    });

    const wideScreen = window.matchMedia("(min-width: 861px)");
    wideScreen.addEventListener("change", (event) => {
      if (event.matches) close();
    });
  }

  document.documentElement.classList.add("has-js");

  const revealTargets = Array.from(document.querySelectorAll([
    ".workflow__item",
    ".home-section .section-grid > *",
    ".source-ledger__row",
    ".pricing-card",
    ".pricing-disclosure",
    ".purchase-steps li",
    ".pricing-contact",
    ".contact-band__inner",
    ".article-intro__inner",
    ".article-layout",
    ".support-grid"
  ].join(",")));

  revealTargets.forEach((target, index) => {
    target.classList.add("reveal-target");
    if (target.matches(".workflow__item, .source-ledger__row, .pricing-card, .purchase-steps li")) {
      target.style.setProperty("--reveal-delay", `${(index % 4) * 85}ms`);
    }
  });

  const homeSections = Array.from(document.querySelectorAll(".home-section"));

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    homeSections.forEach((section) => section.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -7% 0px" });

    revealTargets.forEach((target) => revealObserver.observe(target));
    homeSections.forEach((section) => revealObserver.observe(section));
  }

  const hero = document.querySelector(".hero");
  const appFrame = document.querySelector(".app-frame");
  const finePointer = window.matchMedia("(pointer: fine)");

  if (hero && appFrame && finePointer.matches && !reduceMotion.matches) {
    let pointerFrame = 0;
    let pointerEvent = null;

    const renderPointer = () => {
      pointerFrame = 0;
      if (!pointerEvent) return;

      const heroRect = hero.getBoundingClientRect();
      const frameRect = appFrame.getBoundingClientRect();
      const heroX = ((pointerEvent.clientX - heroRect.left) / heroRect.width) * 100;
      const heroY = ((pointerEvent.clientY - heroRect.top) / heroRect.height) * 100;
      const normalizedX = Math.max(-1, Math.min(1, (pointerEvent.clientX - frameRect.left) / frameRect.width * 2 - 1));
      const normalizedY = Math.max(-1, Math.min(1, (pointerEvent.clientY - frameRect.top) / frameRect.height * 2 - 1));

      hero.style.setProperty("--spot-x", `${heroX.toFixed(1)}%`);
      hero.style.setProperty("--spot-y", `${heroY.toFixed(1)}%`);
      appFrame.style.setProperty("--tilt-x", `${(-normalizedY * 2.2).toFixed(2)}deg`);
      appFrame.style.setProperty("--tilt-y", `${(normalizedX * 3.2).toFixed(2)}deg`);
    };

    hero.addEventListener("pointermove", (event) => {
      pointerEvent = event;
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(renderPointer);
    });

    hero.addEventListener("pointerleave", () => {
      pointerEvent = null;
      appFrame.style.setProperty("--tilt-x", "0deg");
      appFrame.style.setProperty("--tilt-y", "0deg");
      hero.style.setProperty("--spot-x", "78%");
      hero.style.setProperty("--spot-y", "35%");
    });
  }

  const localBoundary = document.querySelector(".local-boundary");
  const privacySection = localBoundary?.closest(".home-section");

  if (localBoundary && privacySection && finePointer.matches && !reduceMotion.matches) {
    privacySection.addEventListener("pointermove", (event) => {
      const bounds = localBoundary.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      localBoundary.style.setProperty("--local-tilt-x", `${(-y * 2.2).toFixed(2)}deg`);
      localBoundary.style.setProperty("--local-tilt-y", `${(x * 3).toFixed(2)}deg`);
    });

    privacySection.addEventListener("pointerleave", () => {
      localBoundary.style.setProperty("--local-tilt-x", "0deg");
      localBoundary.style.setProperty("--local-tilt-y", "0deg");
    });
  }

  const magneticTargets = Array.from(document.querySelectorAll("[data-magnetic]"));

  if (magneticTargets.length && finePointer.matches && !reduceMotion.matches) {
    magneticTargets.forEach((target) => {
      target.addEventListener("pointermove", (event) => {
        const bounds = target.getBoundingClientRect();
        const offsetX = (event.clientX - (bounds.left + bounds.width / 2)) * 0.1;
        const offsetY = (event.clientY - (bounds.top + bounds.height / 2)) * 0.13;
        target.style.setProperty("--mag-x", `${Math.max(-9, Math.min(9, offsetX)).toFixed(1)}px`);
        target.style.setProperty("--mag-y", `${Math.max(-7, Math.min(7, offsetY)).toFixed(1)}px`);
      });

      target.addEventListener("pointerleave", () => {
        target.style.setProperty("--mag-x", "0px");
        target.style.setProperty("--mag-y", "0px");
      });
    });

    document.addEventListener("pointermove", (event) => {
      magneticTargets.forEach((target) => {
        if (target.contains(event.target)) return;
        target.style.setProperty("--mag-x", "0px");
        target.style.setProperty("--mag-y", "0px");
      });
    });
  }

  const tocLinks = Array.from(document.querySelectorAll('.toc a[href^="#"]'));
  const tocSections = tocLinks
    .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
    .filter(Boolean);

  if (tocLinks.length && tocSections.length) {
    const setActiveToc = (id) => {
      tocLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    setActiveToc(tocSections[0].id);

    if ("IntersectionObserver" in window) {
      const tocObserver = new IntersectionObserver((entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveToc(visible.target.id);
      }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });

      tocSections.forEach((section) => tocObserver.observe(section));
    }
  }
})();
