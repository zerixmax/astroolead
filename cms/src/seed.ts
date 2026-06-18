import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from './payload.config'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

function parseBoldItalic(text: string): any[] {
  const nodes: any[] = []
  let bold = false
  let italic = false
  let code = false

  const tokenRegex = /(\*\*|___|__|\*|_|`)/g
  const parts = text.split(tokenRegex)

  for (const part of parts) {
    if (part === '**' || part === '__') {
      bold = !bold
      continue
    }
    if (part === '*' || part === '_') {
      italic = !italic
      continue
    }
    if (part === '`') {
      code = !code
      continue
    }

    if (part) {
      let format = 0
      if (bold) format |= 1
      if (italic) format |= 2
      if (code) format |= 16

      nodes.push({
        type: 'text',
        text: part,
        format: format,
        detail: 0,
        mode: 'normal',
        style: '',
        version: 1,
      })
    }
  }

  return nodes
}

function parseInlineText(text: string, mediaId: any): any[] {
  const nodes: any[] = []
  const linkRegex = /!?\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    const plainTextBefore = text.substring(lastIndex, match.index)
    if (plainTextBefore) {
      nodes.push(...parseBoldItalic(plainTextBefore))
    }

    const isImage = match[0].startsWith('!')
    const linkText = match[1]
    const linkUrl = match[2]

    if (isImage) {
      nodes.push({
        type: 'upload',
        value: mediaId || 0,
        relationTo: 'media',
        children: [],
      })
    } else {
      nodes.push({
        type: 'link',
        fields: {
          url: linkUrl,
          newTab: false,
        },
        children: parseBoldItalic(linkText),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      })
    }

    lastIndex = linkRegex.lastIndex
  }

  const remainingText = text.substring(lastIndex)
  if (remainingText) {
    nodes.push(...parseBoldItalic(remainingText))
  }

  return nodes
}

function parseMarkdownToLexical(markdownText: string, mediaId: any) {
  const lines = markdownText.split('\n')
  const children: any[] = []
  let currentList: any = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) {
      if (currentList) {
        children.push(currentList)
        currentList = null
      }
      continue
    }

    // Handle Headings
    if (line.startsWith('#')) {
      if (currentList) {
        children.push(currentList)
        currentList = null
      }
      const match = line.match(/^(#{1,6})\s+(.*)$/)
      if (match) {
        const level = match[1].length
        const text = match[2]
        children.push({
          type: 'heading',
          tag: `h${level}`,
          children: parseInlineText(text, mediaId),
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        })
        continue
      }
    }

    // Handle Lists (bullet/numbered)
    const bulletMatch = line.match(/^[-*]\s+(.*)$/)
    const numberMatch = line.match(/^(\d+)\.\s+(.*)$/)
    if (bulletMatch || numberMatch) {
      const isNumber = !!numberMatch
      const text = isNumber ? numberMatch[2] : bulletMatch![1]

      const itemNode = {
        type: 'listitem',
        children: parseInlineText(text, mediaId),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }

      if (currentList && currentList.listType === (isNumber ? 'number' : 'bullet')) {
        currentList.children.push(itemNode)
      } else {
        if (currentList) {
          children.push(currentList)
        }
        currentList = {
          type: 'list',
          listType: isNumber ? 'number' : 'bullet',
          tag: isNumber ? 'ol' : 'ul',
          children: [itemNode],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        }
      }
      continue
    }

    // Paragraph or Quote
    if (currentList) {
      children.push(currentList)
      currentList = null
    }

    if (line.startsWith('>')) {
      const text = line.substring(1).trim()
      children.push({
        type: 'quote',
        children: parseInlineText(text, mediaId),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      })
    } else {
      children.push({
        type: 'paragraph',
        children: parseInlineText(line, mediaId),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      })
    }
  }

  if (currentList) {
    children.push(currentList)
  }

  return {
    root: {
      type: 'root',
      children: children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

async function seed() {
  const payload = await getPayload({ config: configPromise })

  // Clean collections
  console.log('Cleaning existing posts, categories and media...')
  await payload.delete({
    collection: 'posts',
    where: { id: { exists: true } },
  })
  await payload.delete({
    collection: 'categories',
    where: { id: { exists: true } },
  })
  await payload.delete({
    collection: 'media',
    where: { id: { exists: true } },
  })

  // Create admin user
  try {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@oleadigitalis.eu',
        password: 'admin',
      },
    })
    console.log('Admin user verified/created successfully.')
  } catch (err: any) {
    console.log('User verification info:', err.message)
  }

  // Create categories
  const categoryTech = await payload.create({
    collection: 'categories',
    data: { title: 'Technology' },
  })

  const categoryBusiness = await payload.create({
    collection: 'categories',
    data: { title: 'Business' },
  })

  // Seed the media
  let mediaId: any = null
  const imagePath = path.resolve(dirname, '../../src/assets/images/olea_digitalis_olead_bot_vizija.webp')
  if (fs.existsSync(imagePath)) {
    try {
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: 'OleaDbot vizija',
        },
        filePath: imagePath,
      })
      mediaId = media.id
      console.log('Media uploaded successfully. ID:', mediaId)
    } catch (err: any) {
      console.log('Error uploading media:', err.message)
    }
  } else {
    console.log('Media file not found at:', imagePath)
  }

  const postsData = [
    {
      slug: 'problem-signala',
      category: categoryTech.id,
      hr: {
        title: 'Problem lošeg signala u maslinicima: Kako digitalizirati OPG potpuno bez interneta?',
        description: 'Saznajte kako moderna PWA tehnologija omogućuje pametno vođenje maslinarstva na udaljenim lokacijama i otocima bez mobilne mreže.',
        markdown: `Jedan od najvećih strahova naših maslinara kada se spomenu pojmovi poput "pametne poljoprivrede", "digitalnih katastara" ili "aplikacija za OPG" stane u samo jednu rečenicu:
_“Što će to meni, kad u mom masliniku na škrapama nema ni jedne crtice mobilnog signala?”_

Ovaj strah je potpuno opravdan. Većina modernog softvera razvija se u gradskim uredima i zahtijeva stalnu, brzu internetsku vezu. No, dalmatinski maslinici na otocima i brdima funkcioniraju u drugačijoj, surovoj stvarnosti. Ako aplikacija stane čim pukne mreža, ona je na terenu neupotrebljiva.

**OleaD je offline-first sustav razvijen na otoku Korčuli koji koristi Next.js PWA i lokalnu pohranu podataka.**

## Kako OleaD PWA aplikacija omogućuje rad u masliniku bez mobilnog signala?

Kako bismo uklonili potrebu za internetom u masliniku, iskoristili smo tehnologiju pod nazivom PWA. Za maslinare to donosi tri ključne prednosti:

1. **Nema preuzimanja:** Ne morate ići na Trgovinu (App Store ili Google Play), tražiti aplikaciju i trošiti dragocjenu memoriju telefona. Pristupom našoj stranici, aplikaciju jednim klikom spremate na početni zaslon mobitela kao običnu ikonu.
2. **Potpuni rad u izolaciji:** Kada zakoračite na svoju parcelu i prislonite mobitel na oznaku na ulazu, aplikacija se otvara i radi normalno, čak i ako vam je telefon u "Zrakoplovnom načinu rada".
3. **Pametno lokalno čuvanje:** Možete bilježiti rezidbu, gnojenje, unositi zabilješke ili pokrenuti sat berbe za svako stablo. Mobitel sve podatke zaključava u svoju lokalnu memoriju. Tek kada se navečer vratite kući, sjednete i spojite se na kućni Wi-Fi, aplikacija tiho i automatski prebacuje sve podatke u vaš centralni digitalni sef na internetu.

### Tehnologija koja služi vama, a ne vi njoj

Cilj digitalizacije nije da maslinar postane rob mobitela, već da mu tehnologija olakša posao i zaštiti plod njegova rada. Korištenjem unutrašnjih senzora pokreta i kompasa u vašem pametnom telefonu, OleaD sam prepoznaje ispred koje masline stojite. Na vama je samo da jednim dodirom velikog gumba na ekranu potvrdite akciju.

Digitalna sljedivost maslinovog ulja i uvid u točno podrijetlo svake kapi više nisu rezervirani samo za velika industrijska imanja sa skupom infrastrukturom. Uz pametan softver koji razumije uvjete na otocima, vaš premium OPG može imati neoboriv dokaz autentičnosti izravno iz dubine maslinika – bez obzira na to ima li signala ili nema.`,
      },
      en: {
        title: 'The Problem of Poor Signal in Olive Groves: How to Digitalize OPG Completely Without Internet?',
        description: 'Learn how modern PWA technology enables smart management of olive growing on remote plots and islands without a mobile network.',
        markdown: `One of the biggest fears of our olive growers when terms like "smart agriculture", "digital cadastres" or "apps for OPG" are mentioned is captured in just one sentence:
_“What good is that to me when there isn’t a single bar of mobile signal in my rocky olive grove?”_

This fear is completely justified. Most modern software is developed in city offices and requires a constant, fast internet connection. However, Dalmatian olive groves on islands and hills function in a different, harsh reality. If the app stops working as soon as the network drops, it is useless in the field.

**OleaD is an offline-first system developed on the island of Korčula that uses Next.js PWA and local data storage.**

## How does the OleaD PWA application enable work in the olive grove without a mobile signal?

To eliminate the need for internet in the olive grove, we used a technology called PWA. For olive growers, this brings three key advantages:

1. **No Downloads:** You don't need to go to the store (App Store or Google Play), search for the app, and waste precious phone memory. By visiting our site, you can save the app to your phone's home screen as a regular icon with a single click.
2. **Full Operation in Isolation:** When you step onto your plot and tap your phone against the tag at the entrance, the app opens and runs normally, even if your phone is in "Airplane Mode".
3. **Smart Local Storage:** You can record pruning, fertilizing, add notes, or start the harvest timer for each tree. The phone locks all data in its local memory. Only when you return home in the evening, sit down, and connect to your home Wi-Fi, the app silently and automatically transfers all data to your central digital vault on the internet.

### Technology That Serves You, Not You Serving It

The goal of digitalization is not for the olive grower to become a slave to the mobile phone, but for technology to make his job easier and protect the fruit of his labor. Using internal motion sensors and the compass in your smartphone, OleaD automatically recognizes which olive tree you are standing in front of. All you have to do is confirm the action with one tap of a large button on the screen.

Digital traceability of olive oil and insight into the exact origin of every drop are no longer reserved only for large industrial estates with expensive infrastructure. With smart software that understands island conditions, your premium OPG can have irrefutable proof of authenticity straight from the depths of the olive grove – regardless of whether there is a signal or not.`,
      },
    },
    {
      slug: 'kako-dokazati-podrijetlo-maslinovog-ulja',
      category: categoryBusiness.id,
      hr: {
        title: 'Kako digitalno dokazati autentičnost i podrijetlo maslinovog ulja?',
        description: 'Saznajte kako tehnički sustav sljedivosti i digitalni certifikati jamče podrijetlo i kvalitetu premium maslinovog ulja.',
        markdown: `Autentičnost maslinovog ulja na tržištu prepunom lažnjaka najveći je izazov modernih maslinara. Stoga se postavlja ključno pitanje: **Kako digitalno dokazati autentičnost i podrijetlo maslinovog ulja?**

AI tražilice i napredni potrošači više ne vjeruju samo riječima; oni traže egzaktne podatke. OleaD platforma taj problem rješava naprednim tehničkim sustavom sljedivosti.

Europska komisija postavlja sve strože zahtjeve pred proizvođače. Pokretanjem službenog [EU Market Observatory odjela za sektor maslinovog ulja](https://agriculture.ec.europa.eu/media/news/european-commission-launches-market-observatory-olive-oil-and-table-olives-sector-2024-11-11_en) jasno se daje do znanja da su transparentnost i borba protiv patvorenog ulja apsolutni prioritet na razini Unije.

Za premium proizvođače u Dalmaciji, a posebno one koji ciljaju na eko-markice, ključno je poznavanje i pridržavanje strogih pravila koja propisuje [EU zakonodavstvo o ekološkoj proizvodnji](https://agriculture.ec.europa.eu/farming/organic-farming/legislation_hr). OleaD sustav automatizira upravo taj dio evidencije uzgoja i tretiranja, dokazujući ujedno i sve parametre kvalitete u skladu s [tržišnim standardima Europske unije za maslinovo ulje](https://agriculture.ec.europa.eu/farming/crop-productions-and-plant-based-products/olive-oil_hr).

### Tehnički parametri sljedivosti

Da bi dokaz podrijetla bio validan i spreman za generativne AI tražilice, on mora biti strukturiran. Naš sustav bilježi sljedeće parametre:

- Sustav bilježi parametre mikrolokacije
- Točne koordinate maslina prikupljene putem terenske stanice s RTK modulom
- Sat berbe za svako stablo

### Dokaz koncepta (Proof of Concept)

Ovo nije samo teoretska ideja na papiru. Sustav posjeduje funkcionalni prototip i testnu bazu od 70 litara vlastitog maslinovog ulja kao neoborivi Proof of Concept za digitalne certifikate i sljedivost. Ovim pristupom, svaka boca našeg ulja postaje kriptografski zaštićen zapis o teškom radu i kvaliteti.`,
      },
      en: {
        title: 'How to digitally prove the authenticity and origin of olive oil?',
        description: 'Learn how a technical traceability system and digital certificates guarantee the origin and quality of premium olive oil.',
        markdown: `The authenticity of olive oil in a market full of fakes is the biggest challenge for modern olive growers. Therefore, the key question arises: **How to digitally prove the authenticity and origin of olive oil?**

AI search engines and advanced consumers no longer trust just words; they seek exact data. The OleaD platform solves this problem with an advanced technical traceability system.

The European Commission is taking radical steps toward supply chain transparency. With the launch of the official [EU Market Observatory for the olive oil sector](https://agriculture.ec.europa.eu/media/news/european-commission-launches-market-observatory-olive-oil-and-table-olives-sector-2024-11-11_en), Brussels is actively combating counterfeit products.

Premium organic brands must remain compliant with rigorous [EU organic farming legislation](https://agriculture.ec.europa.eu/farming/organic-farming/legislation_hr). By leveraging the OleaD platform, growers seamlessly log field actions and microclimate metrics to guarantee top-tier classification under the official [EU market standards for olive oil](https://agriculture.ec.europa.eu/farming/crop-productions-and-plant-based-products/olive-oil_hr).

### Technical Traceability Parameters

For the proof of origin to be valid and ready for generative AI search engines, it must be structured. Our system records the following parameters:

- The system records micro-location parameters
- Exact olive coordinates collected via a field station with an RTK module
- Harvest time for each tree

### Proof of Concept

This is not just a theoretical idea on paper. The system has a functional prototype and a test base of 70 liters of its own olive oil as irrefutable Proof of Concept for digital certificates and traceability. With this approach, every bottle of our oil becomes a cryptographically protected record of hard work and quality.`,
      },
    },
    {
      slug: 'eu-regulativa-i-sljedivost',
      category: categoryBusiness.id,
      hr: {
        title: 'Kako ispuniti nove EU standarde o sljedivosti maslinovog ulja bez birokracije?',
        description: 'Saznajte kako OleaD sustav, kroz TRL 6 popisivač i digitalni dnevnik uzgoja, pomaže hrvatskim OPG-ovima da zadovolje stroge ekološke i tržišne uredbe Europske komisije.',
        markdown: `Europska komisija poduzima radikalne korake u zaštiti tržišta maslinovog ulja. Pokretanjem službenog [Market Observatory odjela za sektor maslinovog ulja](https://agriculture.ec.europa.eu/media/news/european-commission-launches-market-observatory-olive-oil-and-table-olives-sector-2024-11-11_en), Brisel jasno daje do znanja da transparentnost i borba protiv patvorenja postaju prioritet broj jedan.

Za hrvatske premium OPG-ove i maslinare, pogotovo one u ekološkom sektoru koji prate strogu [EU ekološku regulativu](https://agriculture.ec.europa.eu/farming/organic-farming/legislation_hr), to znači samo jedno: papirnate bilježnice i nagađanja o podrijetlu više ne prolaze. Svaka tvrdnja o podrijetlu "od polja do stola" mora biti digitalno dokaziva.

### Tehnologija koja rješava briselsku birokraciju u hodu

**OleaD** nudi cjelovito rješenje koje zakonske obveze pretvara u marketinšku prednost proizvođača, smanjujući korisničko trenje na terenu na nulu:

1. **Digitalni dnevnik uzgoja (90% završen):** Naš softverski sustav, koji upravo selimo na moćne, samostalne VPS poslužitelje, omogućuje vam da jednim dodirom ekrana na ulazu u maslinik ispunite sve zakonske norme o evidenciji, potpuno bez mobilnog signala na udaljenim lokacijama.
2. **OleaDbot-POPISIVAČ (TRL 6 operativni prototip):** Naš mobilni sustav baziran na Raspberry Pi 5 računalu spreman je za rad. Uparivanjem s naprednim RTK GPS modulom, sustav izrađuje precizan digitalni katastar vašeg maslinika, dokazujući točnu geografsku lokaciju svake boce u centimetar.
3. **OleaD-Nodes u razvoju:** Autonomne stanice temeljene na ESP32 mikrokontrolerima pratit će mikroklimu izravno ispod krošnje stabla, bilježeći parametre koji jamče vrhunsku kvalitetu ekstra djevičanskog ulja propisanu [tržišnim standardima Europske unije](https://agriculture.ec.europa.eu/farming/crop-productions-and-plant-based-products/olive-oil_hr).

Spajanjem nepromjenjivih blockchain zapisa i terenskog inženjerstva, OleaD omogućuje maslinarima na otoku Korčuli i diljem Dalmacije miran san pred inspekcijama i neoboriv dokaz autentičnosti koji opravdava premium cijenu na globalnom tržištu.`,
      },
      en: {
        title: 'How to meet new EU standards on olive oil traceability without bureaucracy?',
        description: 'Learn how the OleaD system, through its TRL 6 mapper and digital cultivation log, helps Croatian family farms (OPGs) satisfy strict ecological and market regulations of the European Commission.',
        markdown: `The European Commission is taking radical steps to protect the olive oil market. By launching the official [Market Observatory department for the olive oil sector](https://agriculture.ec.europa.eu/media/news/european-commission-launches-market-observatory-olive-oil-and-table-olives-sector-2024-11-11_en), Brussels is making it clear that transparency and the fight against counterfeiting are becoming priority number one.

For Croatian premium family farms (OPGs) and olive growers, especially those in the organic sector who follow the strict [EU organic regulation](https://agriculture.ec.europa.eu/farming/organic-farming/legislation_en), this means only one thing: paper notebooks and guesswork about origin are no longer acceptable. Every claim of origin "from field to table" must be digitally provable.

### Technology that solves Brussels bureaucracy on the go

**OleaD** offers a comprehensive solution that turns legal obligations into a marketing advantage for producers, reducing user friction in the field to zero:

1. **Digital cultivation log (90% completed):** Our software system, which we are currently migrating to powerful, independent VPS servers, allows you to meet all legal reporting standards with a single screen tap at the entrance to the olive grove, completely without a mobile signal in remote locations.
2. **OleaDbot-MAPPER (TRL 6 operational prototype):** Our mobile system based on the Raspberry Pi 5 computer is ready to go. By pairing it with an advanced RTK GPS module, the system creates a precise digital cadastre of your olive grove, proving the exact geographical location of each bottle to the centimeter.
3. **OleaD-Nodes in development:** Autonomous stations based on ESP32 microcontrollers will monitor the microclimate directly below the tree canopy, recording parameters that guarantee the premium quality of extra virgin olive oil prescribed by [European Union marketing standards](https://agriculture.ec.europa.eu/farming/crop-productions-and-plant-based-products/olive-oil_en).

By combining immutable blockchain records and field engineering, OleaD allows olive growers on the island of Korčula and throughout Dalmatia peace of mind before inspections and an irrefutable proof of authenticity that justifies a premium price on the global market.`,
      },
    },
    {
      slug: 'prava-digitalizacija-nije-samo-web',
      category: categoryTech.id,
      hr: {
        title: 'Prava digitalizacija nije samo web stranica: Kako rješavamo stvarne probleme dalmatinskih OPG-ova',
        description: 'Tehnologija mora rješavati stvarne fizičke i mrežne izazove na terenu, a ne služiti samo kao digitalna vizitka.',
        markdown: `Nedavno objavljeno četvrto izvješće Europske komisije o stanju digitalnog desetljeća, o kojem je detaljno pisala [Lider Media](https://lidermedia.hr/biznis-i-politika/digitalno-desetljece-imamo-jake-resurse-ali-mali-biznisi-zaostaju-157777), donijelo je otrežnjujuće podatke za Hrvatsku. Iako imamo dobru osnovnu infrastrukturu, naša mala i srednja poduzeća – u koja spadaju i ozbiljni poljoprivredni proizvođači te OPG-ovi – opasno kaskaju u usvajanju novih tehnologija.

Često se susrećemo s pogrešnim tumačenjem digitalizacije. Za mnoge to još uvijek znači samo izradu generičke WordPress stranice. No, digitalizacija koja donosi stvarnu konkurentnost i podiže produktivnost nije digitalna "vizitka" – to je integracija tehnologije u sam proces proizvodnje i prodaje.

U [OleaD-u](/hr/o-projektu/) tehnologiji pristupamo kroz prizmu rješavanja konkretnih problema na terenu. Dok se izvješća bave nedostatkom vještina i lošom integracijom u ruralnim područjima, mi nudimo rješenja krojena upravo za takve, zahtjevne uvjete:

### 1. Problem signala u masliniku? Rješenje: "Offline-First" arhitektura

Izvješće s pravom ističe da ruralna i otočna područja kaskaju s mrežom. Poljoprivrednik ne može ovisiti o tome hoće li mu aplikacija "puknuti" usred maslinika. Zato razvijamo napredna rješenja koristeći *Next.js* i *Django* s ugrađenom **"Offline-First"** logikom. Naši sustavi dizajnirani su da besprijekorno rade i na lokacijama bez mobilnog signala, a podatke sinkroniziraju tek kada uređaj ponovno uhvati vezu.

### 2. Dokazivanje premium kvalitete: Sustav Olea Digitalis

Jedan od ključnih zahtjeva EU je korištenje tehnologije za ekološke ciljeve i zelenu tranziciju. Naš glavni proizvod, **Olea Digitalis**, omogućuje potpunu digitalnu sljedivost maslinovog ulja – od stabla do boce. Korištenjem *Algorand blockchain* tehnologije (uključujući ASA NFT-ove), svaki naš premium maslinar dobiva neoboriv dokaz o podrijetlu i kvaliteti svog proizvoda. To nije administracija, to je opipljiva dodana vrijednost na tržištu.

### 3. Fizički rad i tehnologija: Upoznajte OleaDbot

Nedostatak radne snage i teški fizički uvjeti stvarni su problemi. Softver sam po sebi ne može nositi gajbe. Zato razvijamo **OleaDbot**. Ovo nije igračka, već IoT asistent u masliniku dizajniran da preuzme teret, prenosi baterije za opremu za berbu i služi kao pomoć u najtežim poslovima na terenu. Tehnologija mora služiti čovjeku tamo gdje je najteže.

![Vizija OleaDbot-a](../../assets/images/olea_digitalis_olead_bot_vizija.webp)

U OleaD-u se vodimo stoičkim načelom – **Acta non verba** (Djela, a ne riječi). Vrijeme je da prestanemo pričati o digitalizaciji kao apstraktnom pojmu i počnemo je koristiti kao alat koji maslinarima i malim poduzetnicima u Dalmaciji štedi vrijeme, novac i leđa.

Želite li vidjeti kako izgleda stvarna digitalna transformacija prilagođena vašem OPG-u? [Javite nam se za suradnju.](/hr/#kontakt)`,
      },
      en: {
        title: 'Real Digitalization is Not Just a Website: How We Solve Real Problems of Dalmatian Family Farms (OPGs)',
        description: 'Technology should solve actual physical and network challenges in the field, not just serve as a digital business card.',
        markdown: `The recently published fourth report of the European Commission on the state of the Digital Decade, covered in detail by [Lider Media](https://lidermedia.hr/biznis-i-politika/digitalno-desetljece-imamo-jake-resurse-ali-mali-biznisi-zaostaju-157777), brought sobering data for Croatia. Even though we have a good basic infrastructure, our small and medium enterprises – which include serious agricultural producers and family farms (OPGs) – are dangerously lagging behind in adopting new technologies.

We often encounter a misconception of what digitalization means. For many, it still just means creating a generic WordPress site. However, digitalization that brings real competitiveness and increases productivity is not a digital "business card" – it is the integration of technology into the very process of production and sales.

At [OleaD](/en/about-project/), we approach technology through the lens of solving concrete problems in the field. While reports deal with the lack of skills and poor integration in rural areas, we offer solutions tailored precisely for such demanding conditions:

### 1. Signal issues in the olive grove? The solution: "Offline-First" architecture

The report rightly points out that rural and island areas are lagging behind with network coverage. A farmer cannot depend on whether the app will crash in the middle of the olive grove. That is why we develop advanced solutions using *Next.js* and *Django* with built-in **"Offline-First"** logic. Our systems are designed to run seamlessly even in locations without any mobile signal, synchronizing data only when the device reconnects.

### 2. Proving premium quality: The Olea Digitalis system

One of the key EU requirements is using technology for ecological goals and the green transition. Our main product, **Olea Digitalis**, enables complete digital traceability of olive oil – from tree to bottle. By utilizing *Algorand blockchain* technology (including ASA NFTs), each of our premium olive growers receives irrefutable proof of the origin and quality of their product. This is not administrative red tape; it is tangible added value on the market.

### 3. Physical labor and technology: Meet OleaDbot

Lack of labor and hard physical conditions are real problems. Software by itself cannot carry crates. That is why we are developing **OleaDbot**. This is not a toy, but an IoT assistant in the olive grove designed to take the load, carry batteries for harvesting equipment, and help with the hardest work in the field. Technology must serve humans where it is toughest.

![OleaDbot vision](../../assets/images/olea_digitalis_olead_bot_vizija.webp)

At OleaD, we are guided by the Stoic principle – **Acta non verba** (Deeds, not words). It is time to stop talking about digitalization as an abstract concept and start using it as a tool that saves time, money, and backs for olive growers and small business owners in Dalmatia.

Do you want to see what a real digital transformation tailored to your family farm (OPG) looks like? [Get in touch with us for collaboration.](/en/#kontakt)`,
      },
    },
  ]

  for (const postData of postsData) {
    console.log(`Seeding post: ${postData.slug}...`)

    const hrContentParsed = parseMarkdownToLexical(postData.hr.markdown, mediaId)
    const enContentParsed = parseMarkdownToLexical(postData.en.markdown, mediaId)

    // Create HR version first
    const createdPost = await payload.create({
      collection: 'posts',
      locale: 'hr',
      data: {
        title: postData.hr.title,
        slug: postData.slug,
        content: hrContentParsed,
        category: postData.category,
        seo: {
          metaTitle: postData.hr.title,
          metaDescription: postData.hr.description,
        },
      },
    })

    // Update with EN version
    await payload.update({
      collection: 'posts',
      id: createdPost.id,
      locale: 'en',
      data: {
        title: postData.en.title,
        content: enContentParsed,
        seo: {
          metaTitle: postData.en.title,
          metaDescription: postData.en.description,
        },
      },
    })

    console.log(`Seeded HR and EN versions of post "${postData.slug}" successfully.`)
  }

  console.log('Seed completed successfully.')
  process.exit(0)
}

seed()
