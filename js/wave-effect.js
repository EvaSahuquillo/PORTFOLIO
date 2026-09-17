document.addEventListener('DOMContentLoaded', () => {
  const soap = document.querySelector('.soap-product');
  const waveDisplace = document.getElementById('waveDisplace');
  const waveTurbulence = document.getElementById('waveTurbulence');
  const targets = document.querySelectorAll('.wave-target');

  if (!soap || !waveDisplace) return;

  targets.forEach(el => {
    const echo = el.cloneNode(true);
    echo.classList.add('wave-echo');
    echo.removeAttribute('id');
    echo.setAttribute('aria-hidden', 'true');
    el.appendChild(echo);

    const glint = document.createElement('div');
    glint.classList.add('wave-glint');
    el.appendChild(glint);
  });

  const echos = document.querySelectorAll('.wave-echo, .wave-glint');

  function dispararOnda(e) {
    gsap.killTweensOf(echos);
    gsap.killTweensOf(waveDisplace);
    gsap.killTweensOf(waveTurbulence);

    // origen = punto de click, en % relativo a cada sección
    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--wave-x', `${x}%`);
      el.style.setProperty('--wave-y', `${y}%`);
    });

    gsap.set(echos, { '--wave-ring': '-20%' });
    gsap.to(echos, {
      '--wave-ring': '140%',
      duration: 1.6,
      ease: 'power2.out'
    });

    gsap.fromTo(waveDisplace,
      { attr: { scale: 0 } },
      { attr: { scale: 45 }, duration: 0.5, ease: 'power2.out', yoyo: true, repeat: 1 }
    );
    gsap.fromTo(waveTurbulence,
      { attr: { baseFrequency: 0.012 } },
      { attr: { baseFrequency: 0.02 }, duration: 0.5, ease: 'power2.out', yoyo: true, repeat: 1 }
    );
  }

  soap.addEventListener('click', dispararOnda);
});