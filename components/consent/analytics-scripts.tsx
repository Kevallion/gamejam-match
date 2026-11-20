"use client"

import Script from "next/script"
import { Analytics } from "@vercel/analytics/react"
import { GA_MEASUREMENT_ID, GTM_CONTAINER_ID } from "@/lib/consent"

/**
 * Optional analytics. Mounted ONLY after the visitor accepted the
 * "Analytics" category, so nothing below is requested before consent.
 *
 * Google Consent Mode v2: defaults are "denied" for every purpose, then only
 * analytics_storage is granted (no ads category exists on the site).
 */
const CONSENT_AND_TAGS = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted'
});
gtag('consent', 'update', { analytics_storage: 'granted' });
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
`

export function AnalyticsScripts() {
  return (
    <>
      <Script id="gtag-consent" strategy="afterInteractive">
        {CONSENT_AND_TAGS}
      </Script>
      <Script
        id="gtag-js"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Analytics />
    </>
  )
}