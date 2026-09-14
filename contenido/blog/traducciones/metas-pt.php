<?php
/**
 * Alinea las metas de los tres posts en portugues que SI son la misma pieza
 * que su version en ingles y en español, y saca del grupo al que no lo es.
 *
 * El contenido de los tres no se toca: ya decia lo mismo. Lo que estaba
 * desalineado era la promesa del resultado de busqueda, que es justo lo que
 * pidio unificar.
 */

use Illuminate\Support\Facades\DB;

$metas = [
    // El contenido ya sostiene la tesis del ingles — su primer apartado es
    // "O erro central: um canal para duas funções" — pero la meta prometia
    // "organizar o grupo", que es el consejo CONTRARIO. Se alinea la meta.
    'grupo-whatsapp-pais-escolinha' => [
        'meta_title' => 'Por que o grupo de WhatsApp falha no seu clube (e o que o substitui)',
        'meta_description' => 'Grupos perdem informação, não dá para segmentar e transformam o técnico numa central de atendimento às dez da noite. O que um clube precisa de verdade.',
    ],
    'reduzir-inadimplencia-mensalidades-escolinha' => [
        'meta_title' => 'Por que a cobrança de mensalidades falha (e como resolver)',
        'meta_description' => 'Correr atrás dos pais para cobrar não é problema de disciplina. É problema de sistema. Onde a cobrança quebra, e o arranjo que acaba com a perseguição.',
    ],
    'evasao-de-alunos-escolinha-sinais' => [
        'meta_title' => 'Como detectar um atleta que vai sair (semanas antes)',
        'meta_description' => 'Famílias quase nunca saem sem avisar. O aviso chega como um padrão de presença e de pagamento que ninguém está olhando. Estes são os sinais, em ordem.',
    ],
];

foreach ($metas as $slug => $meta) {
    $n = DB::table('blog_posts')
        ->where('slug', $slug)
        ->where('locale', 'pt')
        ->update($meta + [
            'og_title' => $meta['meta_title'],
            'og_description' => $meta['meta_description'],
            'updated_at' => now(),
        ]);

    echo ($n ? '  alineado  ' : '  !! SIN POST  ')."/{$slug}\n";
}

// `gestao-categorias-de-base-documentacao` cubre presença Y atestado Y
// documentação Y calendário anual; el post en ingles es solo presença. El
// hreflang afirma "esta es la misma pagina en otro idioma", y no lo es:
// declararlo manda a un lector portugues a un articulo con otro alcance, y a
// Google le da una equivalencia falsa. Se queda sin grupo hasta que exista una
// version portuguesa del articulo de presença (que hoy canibalizaria a este).
$n = DB::table('blog_posts')
    ->where('slug', 'gestao-categorias-de-base-documentacao')
    ->where('locale', 'pt')
    ->update(['translation_group' => null, 'updated_at' => now()]);

echo ($n ? '  desagrupado ' : '  !! SIN POST ')."/gestao-categorias-de-base-documentacao\n";

echo "\nlisto.\n";
