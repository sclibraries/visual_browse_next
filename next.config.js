/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/visual-browse',
    trailingSlash: true,
    images: {
        remotePatterns: [
            // Trusted domains with specific hostnames
            { hostname: 'contentcafe2.btol.com' },
            { hostname: 'books.google.com' },
            { hostname: 'libtools.smith.edu' },
            { hostname: 'libtools2.smith.edu' },
            { hostname: 'via.placeholder.com' },
            { hostname: 'image.tmdb.org' },
            { hostname: 'placehold.it' },
            { hostname: 'media1-swank-com.azureedge.net' },
            { hostname: 'upload.wikimedia.org' },
            { hostname: 'commons.wikimedia.org' },
            { hostname: 'images.unsplash.com' },
            { hostname: 'cdn.pixabay.com' },
            { hostname: 'images.pexels.com' },
            { hostname: 'source.unsplash.com' },
            { hostname: 'picsum.photos' },
            { hostname: 'i.imgur.com' },
            { hostname: 'imgur.com' },
            { hostname: 'raw.githubusercontent.com' },
            { hostname: 'github.com' },
            { hostname: 'avatars.githubusercontent.com' },
            { hostname: 'iiif.nypl.org' },
            { hostname: 'iiif.lib.harvard.edu' },
            { hostname: 'iiif.bodleian.ox.ac.uk' },
            { hostname: 'digital.library.yale.edu' },
            { hostname: 'iiif.wellcomecollection.org' },
            { hostname: 'images.metmuseum.org' },
            { hostname: 'cdm21033.contentdm.oclc.org' },
            
            // Catch-all for user collections (any hostname)
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            }
        ],
        // Allow SVG images if needed
        dangerouslyAllowSVG: true,
    },
}

module.exports = nextConfig;
