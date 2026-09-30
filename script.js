// =====================================================
//  MAHER KHTAB — PORTFOLIO SCRIPT
// =====================================================
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

const CONTACT = {
  email: 'maherkhtab597@gmail.com',
  whatsapp: '963985414993'
};

document.addEventListener('DOMContentLoaded', () => {
  initScrollUI();
  initSectionSpy();
  initTyped();
  initCounters();
  initReveal();
  initSpotlight();
  initMagnetic();
  initProjects();
  initProjectModal();
  initCopyButtons();
  initContactForm();
  initFooterYear();
});

/* ─── شريط التقدّم + الهيدر + زر العودة للأعلى ─── */
function initScrollUI() {
  const bar = $('#scrollProgress');
  const header = $('#siteHeader');
  const toTop = $('#toTop');
  const ring = $('#toTop .ring circle');
  const C = ring ? 2 * Math.PI * ring.r.baseVal.value : 0;

  if (ring) {
    ring.style.strokeDasharray = C;
    ring.style.strokeDashoffset = C;
  }

  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    if (bar) bar.style.transform = `scaleX(${p})`;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 30);
    if (toTop) toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    if (ring) ring.style.strokeDashoffset = C * (1 - p);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
}

/* ─── تتبّع القسم الحالي وتحريك مؤشر التنقل ─── */
function initSectionSpy() {
  const sections = $$('main section[id]');
  const links = $$('[data-section]');
  const nav = $('#mainNav');
  const indicator = $('#navIndicator');
  let current = 'hero';

  const navLinkFor = id => (nav ? $(`a[data-section="${id}"]`, nav) : null);

  const moveIndicator = link => {
    if (!indicator) return;
    if (!link || !nav || nav.offsetWidth === 0) {
      indicator.style.opacity = '0';
      return;
    }
    indicator.style.opacity = '1';
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
  };

  const setActive = id => {
    if (!id) return;
    current = id;
    links.forEach(l => {
      const on = l.dataset.section === id;
      l.classList.toggle('is-active', on);
      if (on) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
    moveIndicator(navLinkFor(id));
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => io.observe(s));

  // تفعيل آخر قسم عند الوصول لنهاية الصفحة
  window.addEventListener('scroll', () => {
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom && sections.length) setActive(sections[sections.length - 1].id);
  }, { passive: true });

  // المؤشر يتبع الماوس ثم يعود للقسم الحالي
  if (nav) {
    $$('a', nav).forEach(a => a.addEventListener('mouseenter', () => moveIndicator(a)));
    nav.addEventListener('mouseleave', () => moveIndicator(navLinkFor(current)));
  }

  window.addEventListener('resize', () => moveIndicator(navLinkFor(current)));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => moveIndicator(navLinkFor(current)));
  }

  setActive('hero');
}

/* ─── النص المتحرك ─── */
function initTyped() {
  const el = $('#typedText');
  if (!el) return;

  let words = [];
  try { words = JSON.parse(el.dataset.words || '[]'); } catch (_) { /* ignore */ }
  if (!words.length || reduceMotion) return;

  let w = 0;
  let c = words[0].length;
  let deleting = true;

  const tick = () => {
    const word = words[w];
    c += deleting ? -1 : 1;
    el.textContent = word.slice(0, c);

    let delay = deleting ? 35 : 75;
    if (!deleting && c === word.length) {
      deleting = true;
      delay = 1900;
    } else if (deleting && c === 0) {
      deleting = false;
      w = (w + 1) % words.length;
      delay = 350;
    }
    setTimeout(tick, delay);
  };

  setTimeout(tick, 2000);
}

/* ─── العدّادات ─── */
function initCounters() {
  const els = $$('[data-count]');

  const run = el => {
    const end = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = end; return; }
    const t0 = performance.now();
    const dur = 1400;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        run(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });

  els.forEach(el => io.observe(el));
}

/* ─── الظهور عند التمرير ─── */
function initReveal() {
  const els = $$('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).forEach((e, i) => {
      const el = e.target;
      el.style.transitionDelay = `${i * 80}ms`;
      el.classList.add('is-visible');
      setTimeout(() => { el.style.transitionDelay = ''; }, 900 + i * 80);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

/* ─── إضاءة البطاقات تتبع الماوس ─── */
function initSpotlight() {
  if (!finePointer) return;
  $$('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

/* ─── أزرار مغناطيسية ─── */
function initMagnetic() {
  if (!finePointer || reduceMotion) return;
  $$('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ─── تصفية المشاريع ─── */
function initProjects() {
  const bar = $('#projectFilters');
  if (!bar) return;

  const btns = $$('.filter-btn', bar);
  const indicator = $('.filter-indicator', bar);
  const cards = $$('.project-card');
  const result = $('#filterResult');

  const match = (card, f) => f === 'all' || (card.dataset.category || '').split(/\s+/).includes(f);
  const plural = n => (n === 1 ? 'مشروع واحد' : n === 2 ? 'مشروعان' : n <= 10 ? `${n} مشاريع` : `${n} مشروعاً`);
  const labels = {
    all: 'جميع المشاريع',
    web: 'الويب و Laravel',
    mobile: 'تطبيقات Flutter',
    desktop: 'سطح المكتب'
  };

  // حساب العدد تلقائياً لكل زر
  btns.forEach(b => {
    const n = cards.filter(c => match(c, b.dataset.filter)).length;
    const cnt = $('.count', b);
    if (cnt) cnt.textContent = n;
    if (n === 0 && b.dataset.filter !== 'all') b.disabled = true;
  });

  const place = (btn, instant = false) => {
    if (!indicator || !btn) return;
    if (instant) indicator.style.transition = 'none';
    indicator.style.width = `${btn.offsetWidth}px`;
    indicator.style.height = `${btn.offsetHeight}px`;
    indicator.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
    if (instant) {
      void indicator.offsetWidth;
      indicator.style.transition = '';
    }
  };

  const activeBtn = () => $('.filter-btn.is-active', bar);
  const updateResult = (f, n) => {
    if (result) result.textContent = `${labels[f] || ''} — يُعرض ${plural(n)}`;
  };

  let timer;
  const apply = f => {
    const show = cards.filter(c => match(c, f));
    clearTimeout(timer);

    cards.forEach(c => {
      if (!c.hidden && !show.includes(c)) c.classList.add('is-leaving');
    });

    timer = setTimeout(() => {
      cards.forEach(c => {
        c.classList.remove('is-leaving', 'is-entering');
        if (show.includes(c)) {
          c.hidden = false;
          c.classList.add('is-visible');
          c.style.setProperty('--i', show.indexOf(c));
          void c.offsetWidth;
          if (!reduceMotion) c.classList.add('is-entering');
        } else {
          c.hidden = true;
        }
      });
      updateResult(f, show.length);
    }, reduceMotion ? 0 : 230);
  };

  btns.forEach(b => b.addEventListener('click', () => {
    if (b.classList.contains('is-active')) return;
    btns.forEach(x => {
      const on = x === b;
      x.classList.toggle('is-active', on);
      x.setAttribute('aria-pressed', String(on));
    });
    place(b);
    apply(b.dataset.filter);
  }));

  cards.forEach(c => c.addEventListener('animationend', () => c.classList.remove('is-entering')));

  place(activeBtn(), true);
  updateResult('all', cards.length);
  window.addEventListener('resize', () => place(activeBtn(), true));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => place(activeBtn(), true));
  }
}

/* ─── نافذة تفاصيل المشروع ─── */
function initProjectModal() {
  const modal = $('#projectModal');
  if (!modal) return;

  const panel = $('.modal-panel', modal);
  const f = {
    index: $('#modalIndex'),
    type: $('#modalType'),
    title: $('#modalTitle'),
    sub: $('#modalSub'),
    desc: $('#modalDesc'),
    tech: $('#modalTech'),
    body: $('#modalBody'),
    counter: $('#modalCounter')
  };

  let list = [];
  let idx = 0;
  let lastFocus = null;

  const render = animate => {
    const c = list[idx];
    const type = $('.pc-type', c);
    f.index.textContent = $('.pc-index', c).textContent;
    f.type.textContent = type.textContent;
    f.type.className = `pc-type ${Array.from(type.classList).filter(x => x.startsWith('t-')).join(' ')}`;
    f.title.textContent = $('.pc-title', c).textContent;
    f.sub.textContent = $('.pc-sub', c).textContent;
    f.desc.textContent = $('.pc-desc', c).textContent;
    f.tech.innerHTML = $('.pc-tech', c).innerHTML;
    f.body.innerHTML = $('.pc-more', c).innerHTML;
    f.counter.textContent = `${idx + 1} / ${list.length}`;
    panel.scrollTop = 0;
    if (animate && !reduceMotion) {
      panel.classList.remove('swap');
      void panel.offsetWidth;
      panel.classList.add('swap');
    }
  };

  const open = card => {
    list = $$('.project-card').filter(c => !c.hidden);
    idx = Math.max(0, list.indexOf(card));
    lastFocus = document.activeElement;
    render(false);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    setTimeout(() => $('.modal-close', modal).focus(), 60);
  };

  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  const go = d => {
    if (list.length < 2) return;
    idx = (idx + d + list.length) % list.length;
    render(true);
  };

  // فتح عند الضغط على البطاقة أو زر التفاصيل
  document.addEventListener('click', e => {
    const card = e.target.closest('.project-card');
    if (!card || e.target.closest('a')) return;
    if (window.getSelection && String(window.getSelection()).length) return;
    open(card);
  });

  modal.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) close();
  });

  panel.addEventListener('animationend', () => panel.classList.remove('swap'));

  $('#modalPrev').addEventListener('click', () => go(-1));
  $('#modalNext').addEventListener('click', () => go(1));

  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') go(1);   // RTL: اليسار = التالي
    else if (e.key === 'ArrowRight') go(-1);
    else if (e.key === 'Tab') {
      const items = $$('button, a[href]', panel).filter(el => !el.disabled);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // السحب على الموبايل للتنقل بين المشاريع
  let sx = null;
  panel.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  panel.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 70) go(dx > 0 ? 1 : -1);
    sx = null;
  });
}

/* ─── النسخ + الإشعارات ─── */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (__) { ok = false; }
    ta.remove();
    return ok;
  }
}

function toast(message, type = 'success') {
  const wrap = $('#toastWrap');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.setAttribute('role', 'status');
  const dot = document.createElement('span');
  dot.className = 'toast-dot';
  const txt = document.createElement('span');
  txt.textContent = message;
  t.append(dot, txt);
  wrap.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }, 2600);
}

function initCopyButtons() {
  $$('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      const ok = await copyText(btn.dataset.copy);
      toast(ok ? `تم نسخ ${btn.dataset.copyLabel || 'النص'}` : 'تعذّر النسخ، يرجى النسخ يدوياً', ok ? 'success' : 'error');
      if (ok) {
        btn.classList.add('is-done');
        setTimeout(() => btn.classList.remove('is-done'), 1600);
      }
    });
  });
}

/* ─── نموذج التواصل (بريد أو واتساب) ─── */
function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const channel = (e.submitter && e.submitter.dataset.channel) || 'email';
    const d = Object.fromEntries(new FormData(form));
    const body = [
      `الاسم: ${d.name}`,
      `البريد: ${d.email}`,
      `نوع المشروع: ${d.type}`,
      '',
      d.message
    ].join('\n');

    if (channel === 'whatsapp') {
      const url = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`مرحباً ماهر،\n${body}`)}`;
      window.open(url, '_blank', 'noopener');
      toast('تم فتح واتساب ورسالتك جاهزة للإرسال');
    } else {
      const subject = `طلب مشروع: ${d.type} — ${d.name}`;
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast('تم فتح تطبيق البريد ورسالتك جاهزة للإرسال');
    }
  });

  // إزالة رسائل الخطأ الافتراضية عند الكتابة
  $$('input, textarea', form).forEach(el => {
    el.addEventListener('input', () => el.setCustomValidity(''));
  });
}

/* ─── سنة التذييل ─── */
function initFooterYear() {
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
}
