## VRT NU player - Browser Extensie voor luidop lezen van ondertitels (WebVTT)

### Browser extensie voor VRT Nu player
In het programma [Team Scheire](https://www.canvas.be/team-scheire) werd er voor Wouter een browser plug-in gebouwd dat hem toelaat on-demand content te bekijken met ondertitels die luidop worden gelezen. Voor het luidop lezen wordt er gebruik gemaakt van [Speech Synthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis). 

Deze plug-in is een voorbeeld en werkt enkel met de web player van [VRT Nu](https://www.vrt.be/vrtnu/). Een gelijkaardige oplossing kan dus worden gebouwd voor andere players waarbij er ondertitels beschikbaar zijn. 

    Deze plug-in is een voorbeeld en geen productiecode.


## Hoe ga je te werk om deze plug-in zelf te gebruiken

1.  [Download de laatste release](./releases/latest) van deze repo (of clone deze GitHub repo en download alles als zip file).
1.  In Google Chrome, ga naar 'Google Chrome beheren en aanpassen' (die blokjes rechts van je adresbalk).
1.  Kies Meer hulpprogramma's > Extensies.
1.  Zet 'Ontwikkelaarsmodus' aan.
1.  Kies 'Uitgepakte extensie laden'.
1.  Browse naar de locatie van deze repo en kies de folder `ext_vrtnu`.
1.  Er komt een optie scherm, dit mag je sluiten.
1.  De extensie is nu beschikbaar en je kan op de website van [VRT Nu](https://www.vrt.be/vrtnu/) naar een anderstalig programma kijken, met hulp van de plug-in. Deze kan je activeren door erop te klikken.
   - Plug-in icon groen: niet in gebruik.
   - Plug-in icon rood: actief.
   - Plug-in icon zwart: de ondertitels zijn niet beschikbaar voor deze video (dit kan gebeuren voor programma's waarbij geen ondertitels werden geleverd).

## Hoe ga je te werk om zelf een plug-in te bouwen voor een andere player
Voor de VRT site maken we gebruik van HTML5 elementen op de host pagina, om zo vanuit de plug-in de HTML5 `<video>` aan te spreken. Omdat plug-in's in een 'security sandbox' uitgevoerd worden kunnen we niet aan de JavaScript van de host pagina. We gebruiken content scripts om te communiceren met de host pagina. Meer [hier](https://developer.chrome.com/extensions/content_scripts).

Als je zelf een plug-in wenst te bouwen zijn er twee elementen belangrijk:
- Hoe wordt de video geladen en gespeeld. Hoe wordt er gebruik gemaakt van play/pause.
- Hoe worden ondertitels geladen.

Met wat geluk worden de ondertitels geladen als HTML5 element `<track>`. In dat geval is de kans groot dat je via de content scripts aan de tracks kan. Meer informatie over Tracks en Cues, WebVTT en TTML kan je [hier](https://developer.mozilla.org/en-US/docs/Web/Apps/Fundamentals/Audio_and_video_delivery/Adding_captions_and_subtitles_to_HTML5_video) en [hier](https://www.w3.org/WAI/GL/wiki/Using_the_track_element_to_provide_captions) vinden.


## Resources over plug-in's bouwen
- https://developer.chrome.com/extensions/overview
- https://developer.microsoft.com/en-us/microsoft-edge/testdrive/demos/speechsynthesis/
- Tekst-naar-spraak in web apps: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis

## Referenties
In deze plug-in wordt gebruik gemaakt van een externe JavaScript library [vtt.js](https://github.com/mozilla/vtt.js). 


### License 

See [LICENSE](LICENSE)






