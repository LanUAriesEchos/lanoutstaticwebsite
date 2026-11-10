(function () {
    var header = document.querySelector('header');
    var nav = header && header.querySelector('nav');
    if (!nav) return;

    var mobile = window.matchMedia('(max-width: 850px)');
    var dropdowns = Array.prototype.slice.call(nav.querySelectorAll('.nav-dropdown'));

    if (!nav.id) nav.id = 'main-nav';

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle alt';
    toggle.setAttribute('aria-controls', nav.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span>Menu</span>';
    header.insertBefore(toggle, nav);

    function setOpen(open) {
        header.classList.toggle('nav-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        if (!open) dropdowns.forEach(function (d) { d.classList.remove('open'); });
    }

    toggle.addEventListener('click', function () {
        setOpen(!header.classList.contains('nav-open'));
    });

    // On mobile the first tap on a dropdown link expands its list instead of leaving the page.
    dropdowns.forEach(function (dropdown) {
        var link = dropdown.querySelector(':scope > a');
        var menu = dropdown.querySelector('.nav-menu');

        link.addEventListener('click', function (e) {
            if (!mobile.matches) return;
            if (!dropdown.classList.contains('open')) {
                e.preventDefault();
                dropdowns.forEach(function (d) { d.classList.toggle('open', d === dropdown); });
            }
        });

        // Menus are right-aligned in CSS; just keep them within the viewport height.
        function fit() {
            if (mobile.matches) return;
            var top = menu.getBoundingClientRect().top;
            menu.style.maxHeight = Math.max(160, window.innerHeight - top - 16) + 'px';
        }

        dropdown.addEventListener('mouseenter', fit);
        dropdown.addEventListener('focusin', fit);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && header.classList.contains('nav-open')) {
            setOpen(false);
            toggle.focus();
        }
    });

    document.addEventListener('click', function (e) {
        if (mobile.matches && !header.contains(e.target)) setOpen(false);
    });

    mobile.addEventListener('change', function () {
        setOpen(false);
        dropdowns.forEach(function (d) {
            var m = d.querySelector('.nav-menu');
            m.style.left = '';
            m.style.maxHeight = '';
        });
    });
})();
