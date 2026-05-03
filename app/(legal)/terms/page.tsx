import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și Condiții — LocalReach AI",
  description: "Termenii și condițiile de utilizare ale platformei LocalReach AI.",
};

export default function TermsPage() {
  return (
    <article className="prose-legal">
      <h1>Termeni și Condiții de Utilizare</h1>
      <p className="lead">
        Ultima actualizare: 30 aprilie 2025
      </p>

      <p>
        Vă rugăm să citiți cu atenție acești Termeni și Condiții înainte de a utiliza platforma
        LocalReach AI. Prin crearea unui cont sau utilizarea oricărei funcționalități a platformei,
        acceptați în mod expres să fiți legat de acești termeni. Dacă nu sunteți de acord cu oricare
        dintre prevederi, nu utilizați platforma.
      </p>

      <h2>1. Definiții</h2>
      <p>
        <strong>„Platforma"</strong> înseamnă aplicația web LocalReach AI accesibilă la
        localreach.ai, inclusiv toate funcționalitățile, API-urile și serviciile asociate.
      </p>
      <p>
        <strong>„Utilizator"</strong> înseamnă orice persoană fizică sau juridică care a creat un
        cont și utilizează Platforma.
      </p>
      <p>
        <strong>„Abonament"</strong> înseamnă planul de utilizare plătit (Starter, Pro sau Agency)
        selectat de Utilizator.
      </p>
      <p>
        <strong>„Prospecți"</strong> înseamnă datele despre afaceri locale prelucrate și prezentate
        de Platformă în urma căutărilor efectuate de Utilizator.
      </p>
      <p>
        <strong>„Hook-uri"</strong> înseamnă mesajele de outreach generate de inteligența artificială
        pentru Utilizator în cadrul Platformei.
      </p>
      <p>
        <strong>„Furnizorul"</strong> înseamnă entitatea care operează LocalReach AI.
      </p>

      <h2>2. Eligibilitate și Creare Cont</h2>
      <p>
        Platforma este destinată exclusiv persoanelor cu vârsta de minimum 18 ani și entităților
        juridice legal constituite. Prin înregistrare, confirmați că aveți capacitate deplină de
        exercițiu și că informațiile furnizate sunt corecte, complete și actualizate.
      </p>
      <p>
        Sunteți responsabil pentru securitatea credențialelor contului dumneavoastră. Nu este
        permisă partajarea accesului la cont cu terți care nu sunt înregistrați în cadrul
        abonamentului dumneavoastră (excepție: planul Agency cu mai mulți utilizatori). Orice
        activitate desfășurată prin contul dumneavoastră vă este atribuibilă.
      </p>
      <p>
        Un utilizator poate deține un singur cont personal. Crearea de conturi multiple pentru
        eludarea limitelor de utilizare este interzisă și poate conduce la suspendarea imediată
        a tuturor conturilor asociate.
      </p>

      <h2>3. Descrierea Serviciilor</h2>
      <p>
        LocalReach AI oferă următoarele servicii principale:
      </p>
      <ul>
        <li>
          Identificarea afacerilor locale pe baza criteriilor selectate de Utilizator (industrie,
          locație, dimensiune, prezență digitală);
        </li>
        <li>
          Calcularea unui Scor de Oportunitate AI bazat pe analiza automată a prezenței digitale
          a afacerilor identificate;
        </li>
        <li>
          Generarea de mesaje de outreach personalizate (Hook-uri) pentru multiple canale de
          comunicare (email, telefon, Instagram, Facebook) prin intermediul inteligenței artificiale;
        </li>
        <li>
          Un sistem CRM integrat pentru gestionarea relațiilor cu prospecții;
        </li>
        <li>
          Funcționalități de urmărire și analiză a campaniilor de outreach.
        </li>
      </ul>
      <p>
        Platforma utilizează date disponibile public (Google Maps, site-uri web publice, profiluri
        de rețele sociale publice) pentru a genera informațiile prezentate. Nu garantăm exhaustivitatea,
        acuratețea sau actualitatea acestor date.
      </p>

      <h2>4. Abonamente și Plăți</h2>
      <h3>4.1 Planuri disponibile</h3>
      <p>
        Platforma oferă trei planuri de abonament: Starter, Pro și Agency, cu opțiuni de facturare
        lunară sau anuală. Detaliile privind funcționalitățile și prețurile fiecărui plan sunt
        disponibile pe pagina de prețuri și pot fi modificate cu notificare prealabilă de 30 de zile.
      </p>
      <h3>4.2 Procesarea plăților</h3>
      <p>
        Plățile sunt procesate exclusiv prin Stripe, un procesator de plăți terț. Nu stocăm datele
        cardului dumneavoastră bancar. Prin efectuarea plății, acceptați și Termenii de Utilizare
        ai Stripe. Abonamentele se reînnoiesc automat la finalul fiecărei perioade de facturare,
        cu excepția cazului în care sunt anulate anterior.
      </p>
      <h3>4.3 Perioada de trial</h3>
      <p>
        Noilor utilizatori li se poate oferi o perioadă de trial gratuită (7 zile pe planul Pro),
        fără obligația introducerii datelor de card. La finalul perioadei de trial, accesul la
        funcționalitățile premium se suspendă automat dacă nu se selectează un plan plătit.
      </p>
      <h3>4.4 Politica de rambursare</h3>
      <p>
        Aveți dreptul de a solicita rambursarea integrală în termen de 14 zile calendaristice de
        la prima plată, în conformitate cu legislația privind drepturile consumatorilor (OUG
        34/2014). Rambursările se efectuează în termen de 7 zile lucrătoare de la aprobarea
        cererii. Abonamentele lunare ulterioare primei luni nu sunt rambursabile proporțional,
        cu excepția cazurilor de eroare tehnică dovedită din partea Furnizorului.
      </p>
      <h3>4.5 Modificări de prețuri</h3>
      <p>
        Orice modificare a prețurilor va fi comunicată cu cel puțin 30 de zile înainte de intrarea
        în vigoare, prin email la adresa înregistrată în cont. Continuarea utilizării platformei
        după data modificării constituie acceptul noilor prețuri.
      </p>

      <h2>5. Utilizare Acceptabilă</h2>
      <p>
        Utilizatorul se obligă să folosească Platforma exclusiv în scopuri legale și în conformitate
        cu prezentele Termeni. Sunt interzise expres:
      </p>
      <ul>
        <li>
          Utilizarea Platformei pentru trimiterea de mesaje nesolicitate (spam) sau comunicări
          comerciale care încalcă legislația aplicabilă privind comunicările electronice;
        </li>
        <li>
          Colectarea, stocarea sau prelucrarea datelor obținute prin Platformă în scopuri care
          contravin GDPR sau altor reglementări privind protecția datelor;
        </li>
        <li>
          Accesarea, colectarea sau utilizarea datelor de contact ale persoanelor fizice fără
          respectarea drepturilor acestora conform GDPR;
        </li>
        <li>
          Utilizarea automată (scraping, boți) a Platformei sau eludarea mecanismelor de
          limitare a utilizării;
        </li>
        <li>
          Revânzarea, sublicențierea sau redistribuirea comercială a datelor obținute prin
          Platformă fără acordul scris al Furnizorului;
        </li>
        <li>
          Orice tentativă de accesare neautorizată a sistemelor Platformei sau ale terților;
        </li>
        <li>
          Utilizarea Platformei în scopuri de hărțuire, înșelăciune sau orice activitate ilegală.
        </li>
      </ul>
      <p>
        Utilizatorul este singurul responsabil pentru conținutul mesajelor de outreach trimise
        folosind hook-urile generate de Platformă. Furnizorul nu răspunde pentru modul în care
        Utilizatorul alege să utilizeze mesajele generate.
      </p>

      <h2>6. Proprietate Intelectuală</h2>
      <p>
        Platforma, inclusiv interfața, codul sursă, algoritmii, logoul și denumirea „LocalReach AI",
        sunt proprietatea exclusivă a Furnizorului și sunt protejate de legislația privind drepturile
        de autor, mărcile înregistrate și alte legi aplicabile privind proprietatea intelectuală.
      </p>
      <p>
        Hook-urile generate de inteligența artificială la solicitarea Utilizatorului sunt puse la
        dispoziția acestuia sub o licență neexclusivă, netransferabilă, limitată la utilizarea
        în activitatea proprie de outreach. Nu se transferă drepturi de proprietate intelectuală
        asupra acestor conținuturi.
      </p>
      <p>
        Utilizatorul acordă Furnizorului o licență limitată, neexclusivă de a utiliza datele
        anonimizate privind utilizarea Platformei în scopul îmbunătățirii serviciilor.
      </p>

      <h2>7. Confidențialitatea Datelor</h2>
      <p>
        Prelucrarea datelor cu caracter personal este descrisă în detaliu în{" "}
        <a href="/privacy">Politica de Confidențialitate</a>. Prin utilizarea Platformei,
        confirmați că ați citit și acceptat Politica de Confidențialitate.
      </p>
      <p>
        Utilizatorul, în calitate de operator independent de date, este responsabil pentru
        respectarea GDPR în cadrul activităților de outreach desfășurate cu ajutorul Platformei.
        Furnizorul acționează ca persoană împuternicită de operator numai în măsura în care
        procesează date în numele Utilizatorului, conform unui acord separat de prelucrare a
        datelor (DPA) disponibil la cerere.
      </p>

      <h2>8. Disponibilitatea Serviciului și Limitarea Răspunderii</h2>
      <h3>8.1 Disponibilitate</h3>
      <p>
        Furnizorul depune eforturi rezonabile pentru a asigura disponibilitatea Platformei 24/7,
        însă nu garantează funcționarea neîntreruptă. Mentenanța planificată va fi comunicată
        în prealabil. Furnizorul nu răspunde pentru întreruperi cauzate de forță majoră, probleme
        ale furnizorilor terți (Supabase, Stripe, Google Gemini, OpenStreetMap) sau atacuri
        informatice.
      </p>
      <h3>8.2 Limitarea răspunderii</h3>
      <p>
        În măsura maximă permisă de lege, Furnizorul nu răspunde pentru:
      </p>
      <ul>
        <li>Pierderi de profit, venituri, date sau oportunități de afaceri;</li>
        <li>Daune indirecte, incidentale sau consecutive;</li>
        <li>Inexactitatea sau incompletitudinea datelor despre afacerile locale afișate;</li>
        <li>Rezultatele campaniilor de outreach desfășurate de Utilizator;</li>
        <li>Acțiunile sau omisiunile terților față de care Utilizatorul inițiază contactul.</li>
      </ul>
      <p>
        Răspunderea totală a Furnizorului față de un Utilizator nu va depăși suma plătită de
        acesta în ultimele 3 luni anterioare producerii prejudiciului.
      </p>
      <h3>8.3 Disclaimer date publice</h3>
      <p>
        Datele despre afacerile locale sunt preluate din surse publice și pot fi inexacte,
        incomplete sau depășite. Furnizorul nu garantează acuratețea lor și nu răspunde pentru
        deciziile luate pe baza acestora.
      </p>

      <h2>9. Rezilierea Contului</h2>
      <h3>9.1 Reziliere de către Utilizator</h3>
      <p>
        Utilizatorul poate anula abonamentul oricând din secțiunea Setări a contului. Anularea
        produce efecte la finalul perioadei de facturare curente. Datele din cont sunt păstrate
        timp de 30 de zile după anulare, după care sunt șterse permanent.
      </p>
      <h3>9.2 Reziliere de către Furnizor</h3>
      <p>
        Furnizorul poate suspenda sau termina accesul unui Utilizator fără notificare prealabilă
        în cazul încălcării grave a prezentelor Termeni, activității frauduloase sau la solicitarea
        autorităților competente. În cazuri mai puțin grave, se va transmite o notificare și un
        termen de remediere de 7 zile.
      </p>

      <h2>10. Modificarea Termenilor</h2>
      <p>
        Furnizorul poate modifica prezentul document oricând, cu notificarea Utilizatorilor
        înregistrați prin email cu cel puțin 14 zile înainte de intrarea în vigoare a modificărilor
        semnificative. Utilizarea continuă a Platformei după data intrării în vigoare constituie
        acceptul modificărilor.
      </p>

      <h2>11. Legea Aplicabilă și Litigii</h2>
      <p>
        Prezentul contract este guvernat de legea română. Orice litigiu va fi soluționat pe cale
        amiabilă în primul rând. În lipsa unui acord, litigiile vor fi supuse spre soluționare
        instanțelor judecătorești competente din România.
      </p>
      <p>
        Pentru consumatori, este disponibilă și procedura de soluționare alternativă a litigiilor
        prin platforma SOL (Soluționarea Online a Litigiilor) a Comisiei Europene, accesibilă la
        ec.europa.eu/consumers/odr.
      </p>

      <h2>12. Contact</h2>
      <p>
        Pentru orice întrebări legate de acești Termeni și Condiții, ne puteți contacta la:
      </p>
      <p>
        <strong>Email:</strong> legal@localreach.ai<br />
        <strong>Adresă:</strong> România
      </p>
    </article>
  );
}
