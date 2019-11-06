/**
 *  @fileOverview Provides an asynchronous service worker to manage application behavior.
 *
 * Service workers are capable of intercepting and adjusting all requests
 * before they are sent and after they return.
 *
 * Services workers can manage caching files to improve performance,
 * provide offline app experiences, enable 'home page' installation on devices,
 * and provide push notifications to your users.
 *
 * An updated Service worker will download (upon first page access, or every 24 hours).
 * If new, it will yield the install event.
 * It will yield the activate event after pages load and old service worker is no longer used.
 *
 * Use Chrome Dev Tools / Application to clear storage.
 *
 * Use Chrome Dev Tools / Application / ServiceWorker to debug.
 *
 * Check "update on reload" to force service worker update on page reload.
 *
 * Use Chrome Dev Tools / Audit to evaluate.
 *
 * JSDoc comments are written in Markdown.
 *
 * @author Denise Case
 * @author Colton Steeve
 *
 */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js')

console.log('Service worker starting');

if (workbox) {
  console.log(`Service worker Workbox loaded: ${workbox.routing}`)

  const appName = 'FACT'
  const appVersion = 'v1'
  const maxAgeDay = 1 * 24 * 60 * 60
  const maxAgeWeek = maxAgeDay * 7
  const maxEntries = 60 // limit to 60 items
  const httpResponseOpaque = 0 // CORS
  const httpReponseOk = 200 // good

  // cache 4 types of files: 

  //   1 cdn fonts
  //   2 cdn styles
  //   3 static assets
  //   4 images

  // test 4 Regular Expressions at https://regexr.com/

  const reCdnFont = /https:\/\/use\.fontawesome\.com\/.*all\.css$/
  const reCdnStyles = /https:\/\/cdnjs\.cloudflare\.com\/.*\.css$/
  const reStatic = /\.(?:js|css|html)$/
  const reImages = /\.(?:png|gif|jpg|jpeg|webp|svg)$/

  // set a prefix & suffix so local host caches remain unique
  workbox.core.setCacheNameDetails({
    prefix: appName,
    suffix: appVersion,
    precache: 'pre-cache',
    runtime: 'runtime-cache'
  })

  const preCacheName = workbox.core.cacheNames.precache
  console.log(`preCacheName=${preCacheName}`)

  const runtimeCacheName = workbox.core.cacheNames.runtime
  console.log(`runtimeCacheName=${runtimeCacheName}`)


  /**
  * Register handler that matches regex for CDN FONTS
  */
  workbox.routing.registerRoute(reCdnFont,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: `${appName}-cdn-fonts`
    })
  )
  console.log(`Registered fonts ${reCdnFont} with StaleWhileRevalidate`)

  /**
   * Register handler that matches regex for CDN STYLES
   */
  workbox.routing.registerRoute(reCdnStyles,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: `${appName}-cdn-styles`
    })
  )
  console.log(`Registered styles ${reCdnStyles} with StaleWhileRevalidate`)

  /**
   * Register a handler that matches regex for STATIC ASSETS
   */
  workbox.routing.registerRoute(reStatic,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: `${appName}-static`
    })
  )
  console.log(`Registered static assets ${reStatic} with StaleWhileRevalidate`)


  /**
   * Register a handler that matches regex for STATIC IMAGES
   */
  workbox.routing.registerRoute(reImages,
    new workbox.strategies.CacheFirst({
      cacheName: `${appName}-images`,
      plugins: [
        new workbox.expiration.Plugin({
          maxAgeSeconds: maxAgeWeek, // keep images for a week
          maxEntries: maxEntries,  // if more than max entries, delete the oldest
          purgeOnQuotaError: true
        })
      ]
    })
  )
  console.log(`Registered static images ${reImages} with CacheFirst`)


  /**
   * Set a common catch handler if any fetch fails
   */
  workbox.routing.setCatchHandler(({ event }) => {
    console.error(`Error: ${event.error}`)
    return Response.error()
  })

  /**
  * Attach install handler that will cache critical files
  */
  self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(`${appName}-static`)
        .then(cache => {
          console.log(`Workbox got content from cache ${appName}-static `)
          return cache.addAll([
            '.',
            'index.html',
            'scripts/main.js',
            'scripts/jokes.js'
          ])
        })
        .catch(error => { console.error(`Error in install event: ${error} `) })
    )
  })

  /**
   * Attach handler for each fetch that responds even when offline
   */
  self.addEventListener('fetch', event => {
    console.log(event.request.url)
    event.respondWith(
      // returns a Promise that 
      // resolves to the first matching request response from cache
      // If no match is found, resolves to undefined.
      caches.match(event.request)
        .then(response => {
          if (response) {
            console.log(`Workbox got fetch response ${response} `)
            return response
          }
          // otherwise, fetch from network
          return fetch(event.request)
        })
        .catch(error => { console.error(`Error on fetch: ${error} `) })
    )
  })
}
else { console.log(`Error: Workbox didn't load.`) }
