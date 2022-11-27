const resource = [
    /* --- CSS --- */
    '/assets/css/style.css',

    /* --- PWA --- */
    '/app.js',
    '/sw.js',

    /* --- HTML --- */
    '/index.html',
    '/404.html',

    
        '/categories/',
    
        '/tags/',
    
        '/archives/',
    
        '/about/',
    

    /* --- Favicons & compressed JS --- */
    
    
        '/assets/img/favicons/android-chrome-192x192.png',
        '/assets/img/favicons/android-chrome-512x512.png',
        '/assets/img/favicons/apple-touch-icon.png',
        '/assets/img/favicons/avatar.png',
        '/assets/img/favicons/favicon-16x16.png',
        '/assets/img/favicons/favicon-32x32.png',
        '/assets/img/favicons/favicon.ico',
        '/assets/img/favicons/mstile-150x150.png',
        '/assets/img/favicons/%E7%94%A8%E6%89%80%E9%80%89%E9%A1%B9%E7%9B%AE%E6%96%B0%E5%BB%BA%E7%9A%84%E6%96%87%E4%BB%B6%E5%A4%B9/android-chrome-192x192.png',
        '/assets/img/favicons/%E7%94%A8%E6%89%80%E9%80%89%E9%A1%B9%E7%9B%AE%E6%96%B0%E5%BB%BA%E7%9A%84%E6%96%87%E4%BB%B6%E5%A4%B9/android-chrome-512x512.png',
        '/assets/img/favicons/%E7%94%A8%E6%89%80%E9%80%89%E9%A1%B9%E7%9B%AE%E6%96%B0%E5%BB%BA%E7%9A%84%E6%96%87%E4%BB%B6%E5%A4%B9/apple-touch-icon.png',
        '/assets/img/favicons/%E7%94%A8%E6%89%80%E9%80%89%E9%A1%B9%E7%9B%AE%E6%96%B0%E5%BB%BA%E7%9A%84%E6%96%87%E4%BB%B6%E5%A4%B9/favicon-16x16.png',
        '/assets/img/favicons/%E7%94%A8%E6%89%80%E9%80%89%E9%A1%B9%E7%9B%AE%E6%96%B0%E5%BB%BA%E7%9A%84%E6%96%87%E4%BB%B6%E5%A4%B9/favicon-32x32.png',
        '/assets/img/favicons/%E7%94%A8%E6%89%80%E9%80%89%E9%A1%B9%E7%9B%AE%E6%96%B0%E5%BB%BA%E7%9A%84%E6%96%87%E4%BB%B6%E5%A4%B9/favicon.ico',
        '/assets/img/favicons/%E7%94%A8%E6%89%80%E9%80%89%E9%A1%B9%E7%9B%AE%E6%96%B0%E5%BB%BA%E7%9A%84%E6%96%87%E4%BB%B6%E5%A4%B9/mstile-150x150.png',
        '/assets/js/dist/categories.min.js',
        '/assets/js/dist/commons.min.js',
        '/assets/js/dist/home.min.js',
        '/assets/js/dist/misc.min.js',
        '/assets/js/dist/page.min.js',
        '/assets/js/dist/post.min.js',
        '/assets/js/dist/pvreport.min.js'
];

/* The request url with below domain will be cached */
const allowedDomains = [
    

    'localhost:4000',

    
        'demo-img.cotes.page',
    

    'fonts.gstatic.com',
    'fonts.googleapis.com',
    'cdn.jsdelivr.net',
    'polyfill.io'
];

/* Requests that include the following path will be banned */
const denyUrls = [
    
];

