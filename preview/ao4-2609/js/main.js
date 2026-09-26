document.documentElement.classList.add('js');

(() => {
  'use strict';

  const header = document.querySelector('[data-header]');

  if (header) {
    let ticking = false;

    const updateHeader = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
      ticking = false;
    };

    const requestHeaderUpdate = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    updateHeader();
    window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
  }

  document.querySelectorAll('[data-ba-slider]').forEach((slider) => {
    const controls = slider.parentElement?.querySelectorAll('[data-ba-target]') ?? [];
    let position = 50;
    let dragging = false;

    const setPosition = (nextPosition) => {
      position = Math.min(100, Math.max(0, nextPosition));
      slider.style.setProperty('--position', `${position}%`);

      controls.forEach((button) => {
        const targetPosition = button.dataset.baTarget === 'before' ? 100 : 0;
        const selected = position === targetPosition;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
    };

    const setPositionFromPointer = (event) => {
      const bounds = slider.getBoundingClientRect();
      const ratio = (event.clientX - bounds.left) / bounds.width;
      setPosition(ratio * 100);
    };

    slider.addEventListener('pointerdown', (event) => {
      dragging = true;
      slider.setPointerCapture(event.pointerId);
      setPositionFromPointer(event);
    });

    slider.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      setPositionFromPointer(event);
    });

    const stopDragging = (event) => {
      if (!dragging) return;
      dragging = false;
      if (slider.hasPointerCapture(event.pointerId)) {
        slider.releasePointerCapture(event.pointerId);
      }
    };

    slider.addEventListener('pointerup', stopDragging);
    slider.addEventListener('pointercancel', stopDragging);

    slider.addEventListener('keydown', (event) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;

      event.preventDefault();
      if (event.key === 'ArrowLeft') setPosition(position - 5);
      if (event.key === 'ArrowRight') setPosition(position + 5);
      if (event.key === 'Home') setPosition(0);
      if (event.key === 'End') setPosition(100);
    });

    controls.forEach((button) => {
      button.addEventListener('click', () => {
        setPosition(button.dataset.baTarget === 'before' ? 100 : 0);
      });
    });

    setPosition(position);
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealItems = [...document.querySelectorAll('.reveal')];
  let revealObserver;

  const configureReveal = () => {
    revealObserver?.disconnect();

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.12
    });

    revealItems.forEach((item) => {
      if (!item.classList.contains('is-visible')) revealObserver.observe(item);
    });
  };

  configureReveal();
  reducedMotion.addEventListener?.('change', configureReveal);

  document.querySelectorAll('[data-todo]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });
})();
