function Fix-Ortografia {
    $targetFolders = @(
        'E:\proyectos_github\homepadel\frontend\src',
        'E:\proyectos_github\homepadel\backoffice\src',
        'E:\proyectos_github\homepadel\backend\src'
    )

    $filesModified = 0

    foreach ($folder in $targetFolders) {
        if (-not (Test-Path $folder)) { continue }
        
        $files = Get-ChildItem $folder -Recurse -File -Include '*.tsx', '*.ts', '*.jsx', '*.js'
        
        foreach ($file in $files) {
            $content = [System.IO.File]::ReadAllText($file.FullName)
            $original = $content

            # Correcciones de ortografía
            $content = $content.Replace('contrasena', 'contraseña')
            $content = $content.Replace('Contrasena', 'Contraseña')
            $content = $content.Replace('sesion', 'sesión')
            $content = $content.Replace('Sesion', 'Sesión')
            $content = $content.Replace('catalogo', 'catálogo')
            $content = $content.Replace('Catalogo', 'Catálogo')
            $content = $content.Replace('envio', 'envío')
            $content = $content.Replace('Envio', 'Envío')
            $content = $content.Replace('telefono', 'teléfono')
            $content = $content.Replace('Telefono', 'Teléfono')
            $content = $content.Replace('codigo', 'código')
            $content = $content.Replace('Codigo', 'Código')
            $content = $content.Replace('pagina', 'página')
            $content = $content.Replace('Pagina', 'Página')
            $content = $content.Replace('tambien', 'también')
            $content = $content.Replace('Tambien', 'También')
            $content = $content.Replace('devolucion', 'devolución')
            $content = $content.Replace('Devolucion', 'Devolución')
            $content = $content.Replace('informacion', 'información')
            $content = $content.Replace('Informacion', 'Información')
            $content = $content.Replace('configuracion', 'configuración')
            $content = $content.Replace('Configuracion', 'Configuración')
            $content = $content.Replace('descripcion', 'descripción')
            $content = $content.Replace('Descripcion', 'Descripción')
            $content = $content.Replace('direccion', 'dirección')
            $content = $content.Replace('Direccion', 'Dirección')
            $content = $content.Replace('opcion', 'opción')
            $content = $content.Replace('Opcion', 'Opción')
            $content = $content.Replace('seccion', 'sección')
            $content = $content.Replace('Seccion', 'Sección')
            $content = $content.Replace('promocion', 'promoción')
            $content = $content.Replace('Promocion', 'Promoción')
            $content = $content.Replace('categoria', 'categoría')
            $content = $content.Replace('Categoria', 'Categoría')
            $content = $content.Replace('numero', 'número')
            $content = $content.Replace('Numero', 'Número')
            $content = $content.Replace('dias', 'días')
            $content = $content.Replace('Dias', 'Días')

            if ($content -ne $original) {
                [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
                $filesModified++
                Write-Host "Corregido: $($file.FullName)"
            }
        }
    }

    Write-Host "`nResumen: $filesModified archivos modificados"
}

Fix-Ortografia
