<?php
// Definición central de los campos de texto del producto.
// codigo, imagen e imagen_centro se manejan aparte (identificador y uploads).
return [
    'descripcion'   => ['label' => 'Descripción', 'grupo' => 'General'],
    'tipo'          => ['label' => 'Tipo', 'grupo' => 'General'],
    'diametro_pulg' => ['label' => 'Diámetro (pulgadas)', 'grupo' => 'General', 'tipo' => 'number'],
    'espesor'       => ['label' => 'Espesor', 'grupo' => 'General'],
    'concavidad'    => ['label' => 'Concavidad', 'grupo' => 'General'],
    'acorazado'     => ['label' => 'Acorazado', 'grupo' => 'General'],

    'cod_centro'    => ['label' => 'Código de centro', 'grupo' => 'Centro'],
    'desc_centro'   => ['label' => 'Descripción del centro', 'grupo' => 'Centro'],
    'forma_central' => ['label' => 'Forma central', 'grupo' => 'Centro'],
    'medida_centro' => ['label' => 'Medida centro', 'grupo' => 'Centro'],

    'cant_l1'       => ['label' => 'Cantidad', 'grupo' => 'Agujeros laterales (L1)'],
    'forma_l1'      => ['label' => 'Forma', 'grupo' => 'Agujeros laterales (L1)'],
    'medida_l1'     => ['label' => 'Medida', 'grupo' => 'Agujeros laterales (L1)'],
    'fresado_l1'    => ['label' => 'Fresado', 'grupo' => 'Agujeros laterales (L1)'],
    'diam_l1'       => ['label' => 'Diámetro', 'grupo' => 'Agujeros laterales (L1)'],

    'cant_l2'       => ['label' => 'Cantidad', 'grupo' => 'Agujeros exteriores (L2)'],
    'forma_l2'      => ['label' => 'Forma', 'grupo' => 'Agujeros exteriores (L2)'],
    'medida_l2'     => ['label' => 'Medida', 'grupo' => 'Agujeros exteriores (L2)'],
    'fresado_l2'    => ['label' => 'Fresado', 'grupo' => 'Agujeros exteriores (L2)'],
    'diam_l2'       => ['label' => 'Diámetro', 'grupo' => 'Agujeros exteriores (L2)'],

    'cant_muescas'  => ['label' => 'Cantidad de muescas', 'grupo' => 'Otras características'],
    'filo'          => ['label' => 'Filo', 'grupo' => 'Otras características'],
    'ancho_labor'   => ['label' => 'Ancho de labor', 'grupo' => 'Otras características'],
    'planos'        => ['label' => 'Planos', 'grupo' => 'Otras características'],
    'maquina'       => ['label' => 'Aplicado a máquina', 'grupo' => 'Otras características'],
    'observaciones' => ['label' => 'Observaciones', 'grupo' => 'Otras características', 'tipo' => 'textarea'],
];
