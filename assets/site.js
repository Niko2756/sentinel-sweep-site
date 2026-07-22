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

  const revealTargets = [];
  const seenRevealTargets = new Set();
  const addRevealGroup = (selector, directions = ["up"], stagger = 0) => {
    document.querySelectorAll(selector).forEach((target, index) => {
      if (seenRevealTargets.has(target)) return;
      seenRevealTargets.add(target);
      revealTargets.push(target);
      target.classList.add("reveal-target", `reveal--${directions[index % directions.length]}`);
      if (stagger) target.style.setProperty("--reveal-delay", `${(index % directions.length) * stagger}ms`);
    });
  };

  addRevealGroup(".workflow__item", ["left", "up", "right"], 70);
  addRevealGroup(".tour-intro", ["left"]);
  addRevealGroup(".tour-card", ["left", "up", "right"], 70);
  addRevealGroup(".home-section .section-grid > *", ["left", "right"], 60);
  addRevealGroup(".source-ledger__row", ["left", "right"], 55);
  addRevealGroup(".pricing-card", ["left", "right"], 90);
  addRevealGroup(".pricing-disclosure, .pricing-contact, .contact-band__inner", ["up"]);
  addRevealGroup(".purchase-steps li", ["left", "right"], 65);

  addRevealGroup(".article-intro__inner", ["left"]);
  addRevealGroup(".toc", ["left"]);
  addRevealGroup(".prose > h2", ["left", "right"]);
  addRevealGroup(".prose > .callout, .prose > .definition-list, .prose > .data-table, .prose > .download-list, .pricing-page__content > .callout, .pricing-explainer", ["up"]);
  addRevealGroup(".contact-panel", ["right"]);
  addRevealGroup(".not-found > .shell", ["scale"]);

  addRevealGroup(".launch-principles h2", ["up"]);
  addRevealGroup(".launch-principles article", ["left", "up", "right"], 90);
  addRevealGroup(".launch-section-intro", ["left"]);
  addRevealGroup(".launch-workflow__steps li", ["left", "up", "right"], 85);
  addRevealGroup(".launch-workflow__screens a", ["left", "up", "right"], 95);
  addRevealGroup(".launch-feature-strip article", ["left", "up", "up", "right"], 70);
  addRevealGroup(".launch-proof__intro > div", ["left"]);
  addRevealGroup(".launch-proof__stats", ["right"]);
  addRevealGroup(".launch-proof__feature", ["left"]);
  addRevealGroup(".launch-proof__rail a", ["right"], 90);
  addRevealGroup(".launch-capabilities > div", ["left", "right"], 65);
  addRevealGroup(".launch-price--free", ["left"]);
  addRevealGroup(".launch-price--lifetime", ["scale"]);
  addRevealGroup(".launch-price__explain", ["right"]);
  addRevealGroup(".launch-pricing__download", ["up"]);
  addRevealGroup(".launch-privacy__copy", ["left"]);
  addRevealGroup(".launch-privacy__media", ["right"]);
  addRevealGroup(".launch-open-source__inner > *", ["left", "up", "right"], 80);
  addRevealGroup(".launch-final__inner", ["scale"]);

  const animatedSections = Array.from(document.querySelectorAll(".home-section, .launch-page main > section, .article-intro"));

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    animatedSections.forEach((section) => section.classList.add("is-section-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });

    const sectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-section-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -12% 0px" });

    revealTargets.forEach((target) => revealObserver.observe(target));
    animatedSections.forEach((section) => sectionObserver.observe(section));
  }

  const progress = document.createElement("div");
  progress.className = "page-sweep-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);

  let progressFrame = 0;
  const updateProgress = () => {
    progressFrame = 0;
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const value = available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0;
    progress.style.setProperty("--page-progress", value.toFixed(4));
  };
  const requestProgress = () => {
    if (!progressFrame) progressFrame = window.requestAnimationFrame(updateProgress);
  };
  updateProgress();
  window.addEventListener("scroll", requestProgress, { passive: true });
  window.addEventListener("resize", requestProgress);

  const hero = document.querySelector(".launch-hero, .hero");
  const appFrame = document.querySelector(".launch-device, .app-frame");
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

  const localBoundary = document.querySelector(".launch-privacy__media, .local-boundary");
  const privacySection = localBoundary?.closest(".launch-privacy, .home-section");

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
