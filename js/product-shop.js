/* ================================================================
   product-shop.js — Lógica de la tienda/catálogo de productos
   ================================================================ */
(function () {
    'use strict';

    /* ── SVG icons personalizados por categoría ────────────────── */
    var ICONS = {

        /* Disco dentado: estrella de 12 puntas con agujero central */
        'discos':
            '<svg class="sidebar-icon" viewBox="0 0 24 24" fill="#5B8C51" xmlns="http://www.w3.org/2000/svg">' +
            '<path fill-rule="evenodd" d="' +
            'M12,1 L14.3,3.3 L17.5,2.5 L18.4,5.6 L21.5,6.5 L20.7,9.7 ' +
            'L23,12 L20.7,14.3 L21.5,17.5 L18.4,18.4 L17.5,21.5 L14.3,20.7 ' +
            'L12,23 L9.7,20.7 L6.5,21.5 L5.6,18.4 L2.5,17.5 L3.3,14.3 ' +
            'L1,12 L3.3,9.7 L2.5,6.5 L5.6,5.6 L6.5,2.5 L9.7,3.3 Z ' +
            'M12,8 A4,4 0 1,0 12.01,8 Z' +
            '"/></svg>',

        /* Fruticultura: disco liso (plano) con 6 agujeros de montaje */
        'fruticultura':
            '<svg class="sidebar-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<circle cx="12" cy="12" r="10" fill="#5B8C51"/>' +
            '<circle cx="12" cy="12" r="3.5" fill="white"/>' +
            '<circle cx="12" cy="4.5"  r="1.2" fill="white"/>' +
            '<circle cx="18.5" cy="8.5"  r="1.2" fill="white"/>' +
            '<circle cx="18.5" cy="15.5" r="1.2" fill="white"/>' +
            '<circle cx="12" cy="19.5" r="1.2" fill="white"/>' +
            '<circle cx="5.5" cy="15.5" r="1.2" fill="white"/>' +
            '<circle cx="5.5" cy="8.5"  r="1.2" fill="white"/>' +
            '</svg>',

        /* Cultivador y Cincel: arco cincel (U con punta inferior) */
        'cultivador':
            '<svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path stroke="#5B8C51" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"' +
            ' d="M4,3 L20,3"/>' +
            '<path stroke="#5B8C51" stroke-width="2.5" stroke-linecap="round"' +
            ' d="M6,3 L6,13 Q6,19 12,19 Q18,19 18,13 L18,3"/>' +
            '<path stroke="#5B8C51" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
            ' d="M10,19 L12,23 L14,19"/>' +
            '</svg>',

        /* Desmalezadoras: cuchilla en V / ala plana */
        'desmalezadoras':
            '<svg class="sidebar-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<polygon points="12,4 22,10 22,13 12,9 2,13 2,10" fill="#5B8C51"/>' +
            '<rect x="11" y="13" width="2" height="8" rx="1" fill="#5B8C51"/>' +
            '<polygon points="9,21 12,24 15,21" fill="#5B8C51"/>' +
            '</svg>',

        /* Caña de Azúcar: cuchilla cañera rectangular con bisel */
        'cania':
            '<svg class="sidebar-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="2" y="7" width="20" height="9" rx="1.5" fill="#5B8C51"/>' +
            '<polygon points="2,16 22,7 22,6 2,15" fill="white" opacity="0.3"/>' +
            '<line x1="2" y1="7" x2="22" y2="7" stroke="white" stroke-width="0.8" opacity="0.6"/>' +
            '</svg>',

        /* Rolo Triturador: cilindro / tambor con anillos */
        'rolo':
            '<svg class="sidebar-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<ellipse cx="12" cy="5" rx="9" ry="3" fill="#5B8C51"/>' +
            '<rect x="3" y="5" width="18" height="14" fill="#5B8C51"/>' +
            '<ellipse cx="12" cy="19" rx="9" ry="3" fill="#3d6e35"/>' +
            '<line x1="3" y1="9.7" x2="21" y2="9.7" stroke="white" stroke-width="1.5"/>' +
            '<line x1="3" y1="14.3" x2="21" y2="14.3" stroke="white" stroke-width="1.5"/>' +
            '</svg>',

        /* Mixer: impulsor de 3 aspas */
        'mixer':
            '<svg class="sidebar-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<circle cx="12" cy="12" r="2.5" fill="#5B8C51"/>' +
            '<path fill="#5B8C51" d="M12,9.5 C11,7 11.5,4 13,2 L9.5,2 C8,4 9,7.5 12,9.5 Z"/>' +
            '<path fill="#5B8C51" d="M14.2,13.2 C16.2,12 19,12 21,13.5 L22,10 C20,8.5 17,9 14.2,13.2 Z"/>' +
            '<path fill="#5B8C51" d="M9.8,13.2 C7.8,15 7,17.5 8,20 L11,21.5 C12,19 11,16 9.8,13.2 Z"/>' +
            '</svg>',

        /* Herramientas de Labranza: arado / subsolador con dientes */
        'herramientas':
            '<svg class="sidebar-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="2" y="5" width="20" height="3" rx="1" fill="#5B8C51"/>' +
            '<rect x="2" y="8" width="20" height="2" rx="1" fill="#3d6e35" opacity="0.6"/>' +
            '<line x1="5.5" y1="10" x2="4.5" y2="18" stroke="#5B8C51" stroke-width="2.2" stroke-linecap="round"/>' +
            '<line x1="12"  y1="10" x2="12"  y2="18" stroke="#5B8C51" stroke-width="2.2" stroke-linecap="round"/>' +
            '<line x1="18.5" y1="10" x2="19.5" y2="18" stroke="#5B8C51" stroke-width="2.2" stroke-linecap="round"/>' +
            '<polygon points="3,18 5,18 6,22 4.5,22"  fill="#5B8C51"/>' +
            '<polygon points="11,18 13,18 13,22 11,22" fill="#5B8C51"/>' +
            '<polygon points="18,18 20,18 19.5,22 18,22" fill="#5B8C51"/>' +
            '</svg>'
    };

    /* ── Definición de categorías ──────────────────────────────── */
    var CATS = [
        {
            id: 'discos',
            label: 'Discos',
            img: 'img/Disco Grande/10/DD 10 01.png',
            children: [
                { id: 'discos-concavos',  label: 'Cóncavos Lisos y Dentados', url: 'Discos.html' },
                { id: 'discos-planos',    label: 'Planos Lisos y Dentados',   url: 'PlanoLiso.html' },
                { id: 'discos-ondulados', label: 'Ondulados',                 url: 'DiscoChico.html' },
                { id: 'discos-estrellas', label: 'Estrellas',                 url: 'DiscoMarcadores.html' }
            ]
        },
        {
            id: 'fruticultura',
            label: 'Fruticultura',
            url: 'Fruticultura.html',
            img: 'img/02. NO REDONDOS/Conjuntos/ONCJSA7020 Conjunto Accesorios para fruti horti y viti cultura.png'
        },
        {
            id: 'cultivador',
            label: 'Cultivador y Cincel',
            url: 'NoRedondo.html',
            img: 'img/02. NO REDONDOS/Arco Cincel/ONARC100 01 Arco Tipo C.png'
        },
        {
            id: 'desmalezadoras',
            label: 'Desmalezadoras',
            url: 'Desmalezadoras.html',
            img: 'img/02. NO REDONDOS/Desmalesadora/AEV/OND3705/OND3705 01.png'
        },
        {
            id: 'cania',
            label: 'Caña de Azúcar',
            url: 'CaniaAzucar.html',
            img: 'img/02. NO REDONDOS/Cuchilla Cañera/C5001 Cañera sin fondo.png'
        },
        {
            id: 'rolo',
            label: 'Rolo Triturador',
            url: 'RoloTriturador.html',
            img: 'img/02. NO REDONDOS/Trituradora/Dolbi/ONT2041 01.png'
        },
        {
            id: 'mixer',
            label: 'Mixer',
            url: 'Mixer.html',
            img: 'img/02. NO REDONDOS/Mixer/ONM5015/ONM5015.png'
        },
        {
            id: 'herramientas',
            label: 'Herramientas de Labranza',
            url: 'CuerpoSiembra.html',
            img: 'img/Carpidores/Acondicionador de Suelos .png'
        }
    ];

    /* ── Estado ────────────────────────────────────────────────── */
    var activeEl = null;

    /* ── Helpers ───────────────────────────────────────────────── */
    function escHtml(str) {
        return (str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function setActive(el) {
        if (activeEl) activeEl.classList.remove('active');
        activeEl = el;
        if (el) el.classList.add('active');
    }

    function getIcon(catId) {
        return ICONS[catId] || '<i class="bi bi-grid sidebar-icon"></i>';
    }

    /* ── Sidebar ───────────────────────────────────────────────── */
    function buildSidebar() {
        var list = document.getElementById('cat-list');
        if (!list) return;

        CATS.forEach(function (cat) {
            if (cat.children) {
                /* Grupo con subcategorías */
                var li = document.createElement('li');
                li.className = 'cat-parent';
                li.setAttribute('data-parent-id', cat.id);

                var header = document.createElement('div');
                header.className = 'cat-parent-header';
                header.innerHTML =
                    getIcon(cat.id) +
                    '<span>' + cat.label + '</span>' +
                    '<i class="bi bi-chevron-down cat-toggle-icon"></i>';
                header.addEventListener('click', function () {
                    li.classList.toggle('expanded');
                });

                var ul = document.createElement('ul');
                ul.className = 'cat-children';

                cat.children.forEach(function (child) {
                    var childLi = document.createElement('li');
                    childLi.className = 'cat-child-item';
                    childLi.setAttribute('data-cat-id', child.id);
                    childLi.innerHTML = '<i class="bi bi-dash me-1"></i>' + child.label;
                    childLi.addEventListener('click', function () {
                        setActive(childLi);
                        closeSidebar();
                        loadCategory({
                            id: child.id,
                            label: cat.label + ' › ' + child.label,
                            url: child.url
                        });
                    });
                    ul.appendChild(childLi);
                });

                li.appendChild(header);
                li.appendChild(ul);
                list.appendChild(li);
            } else {
                /* Ítem directo */
                var item = document.createElement('li');
                item.className = 'cat-item';
                item.setAttribute('data-cat-id', cat.id);
                item.innerHTML = getIcon(cat.id) + cat.label;
                item.addEventListener('click', function () {
                    setActive(item);
                    closeSidebar();
                    loadCategory(cat);
                });
                list.appendChild(item);

                if (cat.id === 'fruticultura') {
                    var divider = document.createElement('hr');
                    divider.className = 'cat-divider mx-3';
                    list.appendChild(divider);
                }
            }
        });
    }

    /* ── Control del drawer móvil ──────────────────────────────── */
    var sidebar   = document.getElementById('shop-sidebar');
    var overlay   = document.getElementById('sidebar-overlay');
    var toggleBtn = document.getElementById('sidebar-toggle');
    var closeBtn  = document.getElementById('sidebar-close');

    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
    if (closeBtn)  closeBtn.addEventListener('click', closeSidebar);
    if (overlay)   overlay.addEventListener('click', closeSidebar);

    /* ── Categorías que muestran modal al hacer click ─────────── */
    var MODAL_CAT_ROOTS = { discos: true, fruticultura: true, cultivador: true, desmalezadoras: true, cania: true, rolo: true, mixer: true, herramientas: true };

    /* Mapa código→marca para Mixer (mismo que en Mixer.html) */
    var MIXER_BRANDS = {
        'ONM5015': 'VARIOS',
        'ONM5016': 'ASCANELLI',  'ONM5017': 'ASCANELLI',
        'ONM5020': 'GEA DELAVAL','ONM5025C': 'GEA DELAVAL','ONM5025T': 'GEA DELAVAL',
        'ONM5022C': 'AGROMEC',   'ONM5022T': 'AGROMEC',
        'ONM5023': 'MICELI',     'ONM5024': 'MICELI',
        'ONM5026': 'JAY-LOR',    'ONM5027': 'JAY-LOR',
        'ONM5029': 'MAINERO'
    };

    /* PDFs de catálogo por categoría */
    var CAT_PDF = {
        desmalezadoras: 'img/pdf/Desmalesadoras/Desmalezadoras.pdf',
        rolo:           'img/pdf/Rolo Triturador/Rolo Triturador.pdf',
        mixer:          'img/pdf/Mixer/Lista de aplicaciones Mixer.pdf'
    };

    /* Inferir marca desde ruta de imagen (Desmalezadoras / Rolo) */
    function inferBrandFromSrc(src) {
        var m = (src || '').match(/(?:Desmalesadora|Trituradora)\/([^/]+)\//i);
        return m ? m[1] : '';
    }

    /* ── Carga de categoría (via fetch) ────────────────────────── */
    function loadCategory(cat) {
        var content = document.getElementById('shop-content');
        if (!content) return;

        content.innerHTML = '<div class="content-loading"><div class="spinner-border" role="status"></div></div>';

        var bc = document.getElementById('breadcrumb-current');
        if (bc) { bc.textContent = cat.label; bc.style.display = ''; }

        var catRoot = cat.id.split('-')[0];
        var useModal = !!MODAL_CAT_ROOTS[catRoot];

        fetch(cat.url)
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.text();
            })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                var items = Array.from(doc.querySelectorAll('.product-item'));

                /* Para CuerpoSiembra.html que usa .service-item en vez de .product-item */
                var isServicePage = false;
                if (!items.length && useModal) {
                    var svcItems = Array.from(doc.querySelectorAll('.service-item'));
                    if (svcItems.length) { items = svcItems; isServicePage = true; }
                }

                if (!items.length) {
                    window.location.href = cat.url;
                    return;
                }

                var cardsHTML = '';
                var uniqueBrands = [];
                items.forEach(function (item) {
                    var images, imgSrc, fullTitle, espesor = '', medidas = '', brand = '', specs = '';

                    if (isServicePage) {
                        /* ── Extracción desde .service-item (CuerpoSiembra / Herramientas) ── */
                        var mainImgEl = item.querySelector('.service-img img');
                        var secImgEl  = item.querySelector('.service-icon img');
                        imgSrc = mainImgEl ? (mainImgEl.getAttribute('src') || '') : '';
                        var secSrc = secImgEl ? (secImgEl.getAttribute('src') || '') : '';
                        images = imgSrc ? [imgSrc] : [];
                        if (secSrc && secSrc !== imgSrc) images.push(secSrc);
                        var h5El = item.querySelector('h5');
                        fullTitle = h5El ? h5El.textContent.trim() : '';
                        /* Características (p.mb-2) separadas por pipe */
                        var specLines = [];
                        item.querySelectorAll('p.mb-2').forEach(function(p) {
                            var t = p.textContent.trim();
                            if (t) specLines.push(t);
                        });
                        specs = specLines.join('|');
                    } else {
                        /* ── Extracción desde .product-item ── */
                        var di = item.getAttribute('data-images');
                        if (di) {
                            images = di.split('|').map(function (s) { return s.trim(); }).filter(Boolean);
                            imgSrc = images[0] || '';
                        } else {
                            var imgEl = item.querySelector('img.product-main') || item.querySelector('img.img-fluid') || item.querySelector('img');
                            imgSrc = imgEl ? (imgEl.getAttribute('src') || '') : '';
                            images = imgSrc ? [imgSrc] : [];
                        }

                        /* Título */
                        var textDiv = item.querySelector('.text-center.p-4') || item.querySelector('.text-center.p-3');
                        fullTitle = '';
                        if (textDiv) {
                            var titleEl = textDiv.querySelector('a.d-block, h5, h6, .h5, .h6, a');
                            if (titleEl) fullTitle = (titleEl.textContent || '').trim();
                        }

                        /* Espesor y medidas */
                        var underlines = item.querySelectorAll('.text-center.p-4 .text-decoration-underline');
                        espesor = underlines[0] ? underlines[0].textContent.trim() : '';
                        medidas  = underlines[1] ? underlines[1].textContent.trim() : '';

                        /* Marca */
                        if (catRoot === 'mixer') {
                            var col = item.parentElement;
                            var mxCode = col ? (col.getAttribute('data-code') || '').toUpperCase() : '';
                            brand = MIXER_BRANDS[mxCode] || '';
                        } else {
                            brand = inferBrandFromSrc(imgSrc);
                        }
                    }

                    var code = fullTitle.split(/\s+/)[0] || '';
                    if (!fullTitle) fullTitle = code;

                    /* Recolectar marcas únicas para el filtro */
                    if (brand && uniqueBrands.indexOf(brand) < 0) uniqueBrands.push(brand);

                    if (useModal) {
                        /* Tarjeta con soporte de modal — estructura compatible con product-modal.js */
                        cardsHTML +=
                            '<div class="col-6 col-md-4 col-xl-3 mb-4">' +
                                '<div class="product-item product-simple-card"' +
                                    ' data-images="' + escHtml(images.join('|')) + '"' +
                                    ' data-brand="' + escHtml(brand) + '"' +
                                    (specs ? ' data-specs="' + escHtml(specs) + '"' : '') + '>' +
                                    '<div class="position-relative product-simple-img">' +
                                        '<img class="img-fluid product-main" src="' + escHtml(imgSrc) + '"' +
                                            ' alt="' + escHtml(fullTitle) + '" loading="lazy"' +
                                            ' onerror="this.onerror=null;this.src=\'img/logo.png\';this.style.padding=\'8px\'">' +
                                    '</div>' +
                                    '<div class="text-center p-4 product-simple-info">' +
                                        '<a class="d-block mb-1" style="cursor:pointer;text-decoration:none;color:inherit">' + escHtml(fullTitle) + '</a>' +
                                        (brand ? '<span class="product-brand-label">' + escHtml(brand) + '</span>' : '') +
                                        (espesor ? '<span class="text-decoration-underline d-none">' + escHtml(espesor) + '</span>' : '') +
                                        (medidas  ? '<span class="text-decoration-underline d-none">' + escHtml(medidas)  + '</span>' : '') +
                                        (catRoot === 'discos' ? '<a href="BuscadorCodigos.html" class="card-ver-mas">Ver más <i class="bi bi-arrow-right"></i></a>' : '') +
                                    '</div>' +
                                '</div>' +
                            '</div>';
                    } else {
                        /* Tarjeta simple con link a la página completa */
                        cardsHTML +=
                            '<div class="col-6 col-md-4 col-xl-3 mb-4">' +
                                '<a href="' + cat.url + '" class="product-simple-link-wrap">' +
                                    '<div class="product-simple-card">' +
                                        '<div class="product-simple-img">' +
                                            '<img src="' + escHtml(imgSrc) + '" alt="' + escHtml(fullTitle) + '" loading="lazy"' +
                                            ' onerror="this.onerror=null; this.src=\'img/logo.png\'; this.style.padding=\'8px\'">' +
                                        '</div>' +
                                        '<div class="product-simple-info">' +
                                            (code ? '<div class="product-code">' + escHtml(code) + '</div>' : '') +
                                            '<div class="product-name">' + escHtml(fullTitle) + '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</a>' +
                            '</div>';
                    }
                });

                /* ── Barra de filtro + botón PDF (solo Desmalezadoras / Rolo / Mixer) ── */
                uniqueBrands.sort();
                var catPdfUrl = CAT_PDF[catRoot] || '';
                var showBrandFilter = uniqueBrands.length > 1 && CAT_PDF[catRoot] !== undefined;
                var filterBar = '';
                if (showBrandFilter || catPdfUrl) {
                    filterBar = '<div class="d-flex align-items-center gap-2 flex-wrap mb-3 py-2" style="border-bottom:1px solid #eee">';
                    if (showBrandFilter) {
                        filterBar += '<label class="mb-0 small text-muted fw-semibold">Filtrar:</label>' +
                            '<select class="form-select form-select-sm shop-brand-filter" style="max-width:200px">' +
                            '<option value="all">Todos los modelos</option>';
                        uniqueBrands.forEach(function(b) {
                            filterBar += '<option value="' + escHtml(b) + '">' + escHtml(b) + '</option>';
                        });
                        filterBar += '</select>';
                    }
                    if (catPdfUrl) {
                        filterBar += '<a href="' + escHtml(catPdfUrl) + '" class="btn-see-all ms-auto" target="_blank">' +
                            '<i class="bi bi-file-earmark-pdf me-1"></i>Descargar PDF</a>';
                    }
                    filterBar += '</div>';
                }

                content.innerHTML =
                    '<div class="content-header">' +
                        '<h4>' + getIcon(cat.id.split('-')[0]) + ' ' + escHtml(cat.label) + '</h4>' +
                        '<a href="' + cat.url + '" class="btn-see-all">Ver página completa <i class="bi bi-arrow-right"></i></a>' +
                    '</div>' +
                    filterBar +
                    '<p class="product-count-badge">' + items.length + ' producto' + (items.length !== 1 ? 's' : '') + ' encontrado' + (items.length !== 1 ? 's' : '') + '</p>' +
                    '<div class="row">' + cardsHTML + '</div>';

                /* Evento del filtro de marcas */
                var filterSel = content.querySelector('.shop-brand-filter');
                if (filterSel) {
                    filterSel.addEventListener('change', function () {
                        var val = (this.value || '').toUpperCase();
                        content.querySelectorAll('.product-item').forEach(function (card) {
                            var b = (card.dataset.brand || '').toUpperCase();
                            var col = card.closest('[class*="col-"]');
                            if (col) col.style.display = (val === 'ALL' || b === val) ? '' : 'none';
                        });
                    });
                }
            })
            .catch(function () {
                window.location.href = cat.url;
            });
    }

    /* ── Vista landing: cards de categorías ────────────────────── */
    function showLanding() {
        var content = document.getElementById('shop-content');
        if (!content) return;

        var html =
            '<div class="landing-intro">' +
                '<strong>Bienvenido a nuestro catálogo.</strong> ' +
                'Seleccioná una categoría del menú lateral o hacé clic en una de las tarjetas para explorar los productos.' +
            '</div>' +
            '<p class="landing-section-title">Todas las categorías</p>' +
            '<div class="row g-3">';

        CATS.forEach(function (cat) {
            var subList = cat.children
                ? cat.children.map(function (c) { return c.label; }).join(' · ')
                : '';

            html +=
                '<div class="col-6 col-md-4 col-lg-3">' +
                    '<div class="cat-landing-card" data-cat-id="' + cat.id + '">' +
                        '<div class="cat-card-img">' +
                            '<img src="' + escHtml(cat.img) + '" alt="' + escHtml(cat.label) + '"' +
                            ' onerror="this.onerror=null; this.src=\'img/logo.png\'; this.style.padding=\'16px\'">' +
                        '</div>' +
                        '<div class="cat-card-body">' +
                            '<h6>' + cat.label + '</h6>' +
                            (subList ? '<div class="cat-sub-list">' + subList + '</div>' : '') +
                            '<span class="cat-go">Ver productos <i class="bi bi-arrow-right"></i></span>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        });

        html += '</div>';
        content.innerHTML = html;

        content.querySelectorAll('.cat-landing-card').forEach(function (card) {
            card.addEventListener('click', function () {
                var catId = card.getAttribute('data-cat-id');
                var cat = CATS.find(function (c) { return c.id === catId; });
                if (!cat) return;

                if (cat.children) {
                    expandSidebarParent(cat.id);
                    var firstChild = cat.children[0];
                    var firstChildEl = document.querySelector('.cat-child-item[data-cat-id="' + firstChild.id + '"]');
                    if (firstChildEl) setActive(firstChildEl);
                    loadCategory({ id: firstChild.id, label: cat.label + ' › ' + firstChild.label, url: firstChild.url });
                } else {
                    var sidebarItem = document.querySelector('.cat-item[data-cat-id="' + catId + '"]');
                    if (sidebarItem) setActive(sidebarItem);
                    loadCategory(cat);
                }
            });
        });
    }

    function expandSidebarParent(parentId) {
        var parent = document.querySelector('.cat-parent[data-parent-id="' + parentId + '"]');
        if (parent) parent.classList.add('expanded');
    }

    /* ── Init ──────────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {
        buildSidebar();
        showLanding();
    });

}());
