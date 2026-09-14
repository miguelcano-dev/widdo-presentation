<?php
/**
 * Aplica el paquete de traducciones y las portadas al blog.
 *
 * Tres cosas, en este orden:
 *   1. copia de seguridad de los posts que se van a sobrescribir;
 *   2. reemplaza los cuatro posts flojos y crea los cuatro que faltan;
 *   3. pone portada y translation_group a todos.
 *
 * Idempotente: se puede volver a correr. Los inserts van sobre (slug, locale),
 * que es la pareja unica real.
 */

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

$paquete = json_decode(file_get_contents('/tmp/paquete.json'), true);
$aReemplazar = array_values(array_filter(array_column($paquete, 'reemplaza_id')));

// ---------- 1. copia de seguridad ----------
$copia = DB::table('blog_posts')->whereIn('id', $aReemplazar)->get();
$ruta = '/tmp/blog-backup-' . date('Ymd-His') . '.json';
file_put_contents($ruta, json_encode($copia, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
echo "copia de seguridad: {$ruta} (" . count($copia) . " posts)\n";

// ---------- 2. contenido ----------
// La portada se referencia con ?v=2 porque Cloudflare cachea /storage con
// 'immutable' 7 dias: sobrescribir el fichero no cambia lo que ve nadie.
$urlPortada = fn (string $slug) => "https://api.widdo.co/storage/blog/images/{$slug}.jpg?v=2";

$autor = DB::table('blog_posts')->whereNotNull('author_id')->value('author_id');

foreach ($paquete as $p) {
    $datos = [
        'title' => $p['title'],
        'slug' => $p['slug'],
        'excerpt' => $p['excerpt'],
        'content' => $p['content'],
        'meta_title' => $p['meta_title'],
        'meta_description' => $p['meta_description'],
        'meta_keywords' => json_encode($p['meta_keywords'], JSON_UNESCAPED_UNICODE),
        'og_title' => $p['meta_title'],
        'og_description' => $p['meta_description'],
        'featured_image' => $urlPortada($p['slug']),
        'og_image' => $urlPortada($p['slug']),
        'featured_image_alt' => $p['featured_image_alt'],
        'reading_time' => $p['reading_time'],
        'category_id' => $p['category_id'],
        'locale' => $p['locale'],
        'status' => 'published',
        'updated_at' => now(),
    ];

    if (! empty($p['reemplaza_id'])) {
        DB::table('blog_posts')->where('id', $p['reemplaza_id'])->update($datos);
        echo "  reemplazado #{$p['reemplaza_id']}  [{$p['locale']}] /{$p['slug']}\n";
        continue;
    }

    $existe = DB::table('blog_posts')->where('slug', $p['slug'])->where('locale', $p['locale'])->first();

    if ($existe) {
        DB::table('blog_posts')->where('id', $existe->id)->update($datos);
        echo "  actualizado  #{$existe->id}  [{$p['locale']}] /{$p['slug']}\n";
    } else {
        $id = DB::table('blog_posts')->insertGetId($datos + [
            'author_id' => $autor,
            'published_at' => now(),
            'views_count' => 0,
            'is_featured' => 0,
            'is_pinned' => 0,
            'created_at' => now(),
        ]);
        echo "  creado       #{$id}  [{$p['locale']}] /{$p['slug']}\n";
    }
}

// ---------- 3. portadas y hreflang ----------
// Cada fila es un tema: los posts de la misma fila son el mismo articulo en
// idiomas distintos, y comparten translation_group. Sin el, Google trata las
// tres versiones como contenido suelto en vez de como traducciones.
$temas = [
    'cobros'       => ['en' => 'why-dues-collection-breaks-down',            'es' => 'reducir-morosidad-club-deportivo-cobros',              'pt' => 'reduzir-inadimplencia-mensalidades-escolinha'],
    'comunicacion' => ['en' => 'parent-communication-sports-club',           'es' => 'adios-caos-whatsapp-escuela-deportiva',                'pt' => 'grupo-whatsapp-pais-escolinha'],
    'automatizar'  => ['en' => 'what-to-automate-first-youth-sports-club',   'es' => 'automatizar-club-deportivo-tareas-manuales',           'pt' => 'o-que-automatizar-primeiro-no-clube-esportivo'],
    'asistencia'   => ['en' => 'attendance-tracking-youth-sports-clubs',     'es' => 'control-de-asistencia-clubes-deportivos-que-si-se-usa', 'pt' => 'gestao-categorias-de-base-documentacao'],
    'retencion'    => ['en' => 'signals-player-about-to-leave-club',         'es' => 'razones-abandono-alumnos-escuela-deportiva',           'pt' => 'evasao-de-alunos-escolinha-sinais'],
    'inscripcion'  => ['en' => 'registration-season-checklist-youth-sports', 'es' => 'lista-de-inscripcion-temporada-club-deportivo',        'pt' => 'checklist-de-matricula-temporada-clube-esportivo'],
    // Sin equivalente en otros idiomas, a proposito: ver PLAN.md.
    'precio'       => ['en' => 'per-player-pricing-youth-sports-software'],
    'mediospago'   => ['pt' => 'pix-boleto-cartao-mensalidades-clube-esportivo'],
    'captacion'    => ['pt' => 'captar-novos-alunos-escolinha-futebol'],
];

echo "\ntranslation_group y portadas:\n";

foreach ($temas as $tema => $porIdioma) {
    // Reutilizar el grupo que ya tuviera cualquiera de las versiones, para que
    // volver a correr esto no cambie el identificador cada vez.
    $grupo = DB::table('blog_posts')
        ->whereIn('slug', array_values($porIdioma))
        ->whereNotNull('translation_group')
        ->value('translation_group') ?: (string) Str::uuid();

    foreach ($porIdioma as $idioma => $slug) {
        $afectados = DB::table('blog_posts')
            ->where('slug', $slug)
            ->where('locale', $idioma)
            ->update([
                'translation_group' => $grupo,
                'featured_image' => $urlPortada($slug),
                'og_image' => $urlPortada($slug),
                'updated_at' => now(),
            ]);

        if ($afectados === 0) {
            // Un slug que no existe es un error de este script, no del blog.
            echo "  !! sin post: [{$idioma}] /{$slug}\n";
        }
    }

    echo "  {$tema}: " . count($porIdioma) . " idioma(s)  grupo " . substr($grupo, 0, 8) . "\n";
}

echo "\nlisto.\n";
