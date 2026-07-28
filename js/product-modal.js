/* product-modal.js — Modal de detalle de producto (Mixer, Desmalezadoras, RoloTriturador, product.html) */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var modalEl = document.getElementById('productInfoModal');
        if (!modalEl) return;

        var bsModal    = new bootstrap.Modal(modalEl);
        var pimTitle   = document.getElementById('pim-title');
        var pimImg     = document.getElementById('pim-img');
        var pimTable   = document.getElementById('pim-info-table');
        var pimCounter = document.getElementById('pim-counter');
        var pimLeft    = modalEl.querySelector('.pim-arrow.left');
        var pimRight   = modalEl.querySelector('.pim-arrow.right');

        var curImages = [];
        var curIdx    = 0;

        /* ── Navegación de imágenes dentro del modal ── */
        function showAt(i) {
            curIdx = (i + curImages.length) % curImages.length;
            pimImg.src = curImages[curIdx];
            if (curImages.length > 1) {
                pimCounter.textContent = (curIdx + 1) + '/' + curImages.length;
                pimCounter.style.display = '';
                if (pimLeft)  pimLeft.style.display  = '';
                if (pimRight) pimRight.style.display = '';
            } else {
                pimCounter.style.display = 'none';
                if (pimLeft)  pimLeft.style.display  = 'none';
                if (pimRight) pimRight.style.display = 'none';
            }
        }

        if (pimLeft)  pimLeft.addEventListener ('click', function () { showAt(curIdx - 1); });
        if (pimRight) pimRight.addEventListener('click', function () { showAt(curIdx + 1); });

        /* ── Extraer datos del card ── */
        function extractData(item) {
            // Imágenes: data-images (pipe-separado) o fallback al src de la img principal
            var imagesAttr = item.getAttribute('data-images');
            var images;
            if (imagesAttr) {
                images = imagesAttr.split('|').map(function (s) { return s.trim(); }).filter(Boolean);
            } else {
                // Desmalezadoras: usa img.src (absoluta) + miniaturas del .image-gallery
                var mainEl = item.querySelector('.product-main') ||
                             item.querySelector('.position-relative > img') ||
                             item.querySelector('img');
                images = mainEl ? [mainEl.src] : [];
                var gallEl = item.querySelector('.image-gallery');
                if (gallEl) {
                    var thumbs = gallEl.querySelectorAll('img');
                    for (var t = 0; t < thumbs.length; t++) {
                        if (thumbs[t].src && images.indexOf(thumbs[t].src) < 0) {
                            images.push(thumbs[t].src);
                        }
                    }
                }
            }

            // Título completo y código (primera palabra del título)
            var titleEl   = item.querySelector('.text-center.p-4 .d-block') ||
                            item.querySelector('.text-center.p-4 a');
            var fullTitle = titleEl ? titleEl.textContent.trim() : '';
            var code      = fullTitle.split(/\s+/)[0] || '';

            // Espesor y medidas (primero y segundo span subrayado)
            var underlines = item.querySelectorAll('.text-center.p-4 .text-decoration-underline');
            var espesor    = underlines[0] ? underlines[0].textContent.trim() : '';
            var medidas    = underlines[1] ? underlines[1].textContent.trim() : '';

            // Modelo / Marca (seteado por los scripts de filtro inline de cada página)
            var brand = item.dataset.brand || '';

            // Índice de imagen actual (imagen que ya está mostrando la galería del card)
            var startIdx = 0;
            if (images.length > 1) {
                var cur = item.querySelector('.product-main') ||
                          item.querySelector('.position-relative > img') ||
                          item.querySelector('img');
                if (cur) {
                    var found = images.indexOf(cur.src);
                    if (found < 0) {
                        // Fallback: comparar por pathname para data-images con rutas relativas
                        var curPath = cur.src.replace(/^https?:\/\/[^/]+/, '');
                        for (var k = 0; k < images.length; k++) {
                            var imgPath = images[k].replace(/^https?:\/\/[^/]+/, '');
                            if (imgPath === curPath) { found = k; break; }
                        }
                    }
                    if (found >= 0) startIdx = found;
                }
            }

            return {
                images: images,
                fullTitle: fullTitle,
                code: code,
                espesor: espesor,
                medidas: medidas,
                brand: brand,
                startIdx: startIdx
            };
        }

        /* ── Abrir modal con datos del producto ── */
        function openModal(item) {
            var d = extractData(item);
            if (!d.images.length) return;

            curImages = d.images;
            // Usar código solo si contiene dígitos (p.ej. OND493, ONM5015); si no, usar título completo
            var hasRealCode = d.code && /\d/.test(d.code);
            pimTitle.textContent = (hasRealCode ? d.code : d.fullTitle) || '—';

            var rows = '';
            if (hasRealCode) {
                rows += '<tr><td>Código</td><td>' + escHtml(d.code) + '</td></tr>';
            }
            if (d.fullTitle && d.fullTitle !== d.code) {
                rows += '<tr><td>Producto</td><td>' + escHtml(d.fullTitle) + '</td></tr>';
            }
            if (d.brand) {
                rows += '<tr><td>Modelo</td><td><span class="product-brand-label">' + escHtml(d.brand) + '</span></td></tr>';
            }
            if (d.espesor) {
                rows += '<tr><td>Espesor</td><td>' + escHtml(d.espesor) + '</td></tr>';
            }
            if (d.medidas) {
                rows += '<tr><td>Medidas</td><td>' + escHtml(d.medidas) + '</td></tr>';
            }
            /* Características extras (herramientas de labranza: specs de p.mb-2) */
            var rawSpecs = item.dataset.specs || '';
            if (rawSpecs) {
                rawSpecs.split('|').forEach(function(spec) {
                    spec = spec.trim();
                    if (!spec) return;
                    /* Separar label y valor en guiones: "Km/hora --- +13" → td + td */
                    var parts = spec.split(/\s*-{2,}\s*/);
                    if (parts.length >= 2) {
                        rows += '<tr><td>' + escHtml(parts[0].trim()) + '</td>' +
                                '<td>' + escHtml(parts[parts.length - 1].trim()) + '</td></tr>';
                    } else {
                        rows += '<tr><td colspan="2" style="font-size:.83rem;color:#555">' + escHtml(spec) + '</td></tr>';
                    }
                });
            }
            pimTable.innerHTML = '<tbody>' + rows + '</tbody>';

            showAt(d.startIdx);
            bsModal.show();
        }

        function escHtml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        /* ── Event delegation: funciona para contenido estático y dinámico (product.html) ── */
        document.addEventListener('click', function (e) {
            // Ignorar clicks en flechas de galería del card y en links
            if (e.target.closest('.gallery-arrow') || e.target.closest('.pim-arrow')) return;
            if (e.target.closest('a')) return;

            // Verificar que el click fue dentro de un área trigger de product-item
            var trigger = e.target.closest('.product-item .product-gallery') ||
                          e.target.closest('.product-item .position-relative');
            if (!trigger) return;

            var item = e.target.closest('.product-item');
            if (!item) return;

            openModal(item);
        });
    });
})();
