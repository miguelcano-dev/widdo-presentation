<?php
/**
 * Asigna las 28 portadas de la entrega del 14-sep-2026 a sus posts.
 *
 * La entrega manda: coincidencia EXACTA de locale + slug. No se asigna por
 * parecido de titulo ni por orden de archivo, y `post_id_observed` se usa solo
 * como comprobacion — no como clave, porque los ids no son estables entre
 * entornos.
 *
 * Si un post no aparece o aparece dos veces, se registra y se salta SOLO esa
 * asignacion. No se crean ni se traducen posts.
 */

use Illuminate\Support\Facades\DB;

$manifest = json_decode(file_get_contents('/tmp/manifest-portadas.json'), true);

// ?v=3 porque Cloudflare cachea /storage con 'immutable' 7 dias: sobrescribir
// el fichero no cambia lo que ve nadie. La v2 es la de las tarjetas anteriores.
$VER = 'v3';

$ok = 0;
$saltados = [];
$avisos = [];

foreach ($manifest['items'] as $item) {
    $locale = $item['locale'];
    $slug = $item['post_slug'];

    $posts = DB::table('blog_posts')->where('locale', $locale)->where('slug', $slug)->get();

    if ($posts->isEmpty()) {
        $saltados[] = "sin post: [{$locale}] /{$slug}";

        continue;
    }

    if ($posts->count() > 1) {
        $saltados[] = "AMBIGUO ({$posts->count()} coincidencias): [{$locale}] /{$slug}";

        continue;
    }

    $post = $posts->first();

    // Comprobacion, no clave. Que el id haya cambiado no impide asignar.
    if (! empty($item['post_id_observed']) && $post->id !== $item['post_id_observed']) {
        $avisos[] = "id distinto al observado en [{$locale}] /{$slug}: "
            ."ahora {$post->id}, entrega decia {$item['post_id_observed']}";
    }

    $base = basename($item['image_file'], '.webp');

    DB::table('blog_posts')->where('id', $post->id)->update([
        'featured_image' => "https://api.widdo.co/storage/blog/images/{$base}.webp?{$VER}",
        // La landing hoy IGNORA og_image y usa featured_image tambien para
        // Open Graph. Se guarda igualmente el gemelo JPEG: WhatsApp y algunos
        // rastreadores no renderizan WebP en la vista previa, y asi el arreglo
        // queda a un cambio de dos lineas en la landing.
        'og_image' => "https://api.widdo.co/storage/blog/images/{$base}.jpg?{$VER}",
        'featured_image_alt' => $item['featured_image_alt'],
        'updated_at' => now(),
    ]);

    $ok++;
}

echo "asignadas: {$ok} de ".count($manifest['items']).PHP_EOL;

foreach ($avisos as $a) {
    echo "  aviso: {$a}".PHP_EOL;
}

foreach ($saltados as $s) {
    echo "  SALTADO: {$s}".PHP_EOL;
}

// --- que posts se quedan sin portada de esta entrega ---
$conEntrega = collect($manifest['items'])->map(fn ($i) => $i['locale'].'|'.$i['post_slug'])->all();

$sinPortada = DB::table('blog_posts')
    ->get()
    ->reject(fn ($p) => in_array($p->locale.'|'.$p->slug, $conEntrega, true));

if ($sinPortada->isNotEmpty()) {
    echo PHP_EOL."posts sin portada en esta entrega (".$sinPortada->count()."):".PHP_EOL;
    foreach ($sinPortada as $p) {
        $tiene = $p->featured_image ? 'conserva la anterior' : 'SIN IMAGEN';
        echo "  [{$p->locale}] /{$p->slug}  ({$tiene})".PHP_EOL;
    }
}
