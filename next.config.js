/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/visual_browse',
    images: {
        domains: [
            'contentcafe2.btol.com', 
            'books.google.com', 
            'libtools.smith.edu', 
            'libtools2.smith.edu', 
            'via.placeholder.com', 
            'libtools2.smith.edu:4000', 
            'libtools2.smith.edu:4000',
            'image.tmdb.org',
            'placehold.it',
            'media1-swank-com.azureedge.net',
        ],
    },
}

module.exports = nextConfig
