import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Confidențialitate — LocalReach AI",
  description: "Cum colectăm, utilizăm și protejăm datele dumneavoastră personale.",
};

export default function PrivacyPage() {
  return (
    <article className="prose-legal">
      <h1>Politica de Confidențialitate</h1>
      <p className="lead">Ultima actualizare: 30 aprilie 2025</p>

      <p>
        LocalReach AI respectă dreptul dumneavoastră la confidențialitate și se angajează să
        protejeze datele cu caracter personal pe care le prelucrăm. Această Politică de
        Confidențialitate descrie ce date colectăm, de ce, cum le utilizăm și drepturile pe
        care le aveți în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și legislația română
        aplicabilă.
      </p>

      <h2>1. Operatorul de Date</h2>
      <p>
        Operatorul de date cu caracter personal este LocalReach AI, cu sediul în România.
        Pentru orice solicitări legate de prelucrarea datelor dumneavoastră, ne puteți contacta la:
      </p>
      <p>
        <strong>Email:</strong> privacy@localreach.ai<br />
        <strong>Adresă:</strong> România
      </p>

      <h2>2. Datele pe Care le Colectăm</h2>
      <h3>2.1 Date furnizate direct de dumneavoastră</h3>
      <ul>
        <li>
          <strong>Date de cont:</strong> nume, adresă de email, parolă (stocată criptat),
          informații de facturare (prin Stripe — nu stocăm datele cardului).
        </li>
        <li>
          <strong>Date de utilizare a platformei:</strong> campaniile create, căutările
          efectuate, prospecții salvați, mesajele de outreach generate.
        </li>
        <li>
          <strong>Comunicări:</strong> mesajele trimise echipei noastre de suport.
        </li>
      </ul>
      <h3>2.2 Date colectate automat</h3>
      <ul>
        <li>
          <strong>Date tehnice:</strong> adresa IP, tipul și versiunea browserului, sistemul
          de operare, paginile vizitate, durata sesiunii, referrer URL.
        </li>
        <li>
          <strong>Cookie-uri și tehnologii similare:</strong> detaliate în{" "}
          <a href="/cookies">Politica de Cookies</a>.
        </li>
        <li>
          <strong>Date de performanță:</strong> erori tehnice anonimizate pentru îmbunătățirea
          platformei.
        </li>
      </ul>
      <h3>2.3 Date despre terți (afaceri locale)</h3>
      <p>
        Platforma prelucrează date despre afaceri locale (denumire, adresă, telefon, website,
        recenzii publice) preluate din surse publice (OpenStreetMap, profiluri publice Google,
        rețele sociale publice). Aceste date sunt procesate în scopul furnizării serviciului
        și nu sunt stocate permanent în baza noastră de date fără acțiunea expresă a
        Utilizatorului (salvare prospect).
      </p>

      <h2>3. Scopurile și Temeiul Legal al Prelucrării</h2>
      <table>
        <thead>
          <tr>
            <th>Scop</th>
            <th>Categorii de date</th>
            <th>Temei legal (GDPR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Crearea și gestionarea contului</td>
            <td>Nume, email, parolă</td>
            <td>Executarea contractului (art. 6(1)(b))</td>
          </tr>
          <tr>
            <td>Procesarea plăților și facturarea</td>
            <td>Date de facturare</td>
            <td>Executarea contractului + obligație legală (art. 6(1)(b)(c))</td>
          </tr>
          <tr>
            <td>Furnizarea funcționalităților platformei</td>
            <td>Date de utilizare, campanii, prospecți</td>
            <td>Executarea contractului (art. 6(1)(b))</td>
          </tr>
          <tr>
            <td>Îmbunătățirea serviciilor (date anonimizate)</td>
            <td>Date de utilizare anonimizate</td>
            <td>Interes legitim (art. 6(1)(f))</td>
          </tr>
          <tr>
            <td>Comunicări de serviciu (notificări, actualizări)</td>
            <td>Email</td>
            <td>Executarea contractului (art. 6(1)(b))</td>
          </tr>
          <tr>
            <td>Marketing (newsletter, oferte)</td>
            <td>Email, preferințe</td>
            <td>Consimțământ (art. 6(1)(a))</td>
          </tr>
          <tr>
            <td>Respectarea obligațiilor legale</td>
            <td>Date de facturare, date tehnice</td>
            <td>Obligație legală (art. 6(1)(c))</td>
          </tr>
          <tr>
            <td>Prevenirea fraudei și securitatea platformei</td>
            <td>Date tehnice, comportament utilizator</td>
            <td>Interes legitim (art. 6(1)(f))</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Destinatarii Datelor</h2>
      <p>
        Datele dumneavoastră pot fi transmise către:
      </p>
      <ul>
        <li>
          <strong>Supabase Inc.</strong> (SUA) — furnizor de baze de date și autentificare,
          cu garanții adecvate conform Clauzelor Contractuale Standard;
        </li>
        <li>
          <strong>Stripe, Inc.</strong> (SUA) — procesator de plăți, cu garanții adecvate
          conform Clauzelor Contractuale Standard;
        </li>
        <li>
          <strong>Google LLC</strong> (SUA) — furnizor al modelului Gemini AI utilizat pentru
          generarea hook-urilor, cu garanții adecvate conform Clauzelor Contractuale Standard;
        </li>
        <li>
          <strong>Vercel Inc.</strong> (SUA) — furnizor de hosting și infrastructură cloud,
          cu garanții adecvate;
        </li>
        <li>
          <strong>Autorități publice</strong> — atunci când suntem obligați legal să divulgăm
          informații.
        </li>
      </ul>
      <p>
        Nu vindem, închiriem sau comercializăm datele dumneavoastră personale cu terți
        în scopuri de marketing.
      </p>

      <h2>5. Transferuri Internaționale de Date</h2>
      <p>
        Unii dintre furnizorii noștri sunt localizați în Statele Unite ale Americii. Transferurile
        de date în afara Spațiului Economic European sunt efectuate cu garanții adecvate, respectiv
        Clauzele Contractuale Standard adoptate de Comisia Europeană (SCC), în conformitate cu
        art. 46 GDPR. Puteți solicita o copie a acestor garanții prin email la privacy@localreach.ai.
      </p>

      <h2>6. Perioada de Retenție a Datelor</h2>
      <ul>
        <li>
          <strong>Datele contului activ:</strong> pe durata existenței contului, plus 30 de
          zile după dezactivare (perioadă de recuperare).
        </li>
        <li>
          <strong>Datele de facturare:</strong> 10 ani de la emiterea facturii (obligație
          fiscală conform Codului Fiscal).
        </li>
        <li>
          <strong>Datele tehnice și log-urile:</strong> maxim 12 luni.
        </li>
        <li>
          <strong>Datele pentru marketing (cu consimțământ):</strong> până la retragerea
          consimțământului.
        </li>
        <li>
          <strong>Copii de siguranță (backup):</strong> maxim 90 de zile, după care sunt
          suprascrise automat.
        </li>
      </ul>

      <h2>7. Securitatea Datelor</h2>
      <p>
        Implementăm măsuri tehnice și organizatorice adecvate pentru protecția datelor
        dumneavoastră:
      </p>
      <ul>
        <li>Criptarea datelor în tranzit (TLS 1.3) și în repaus;</li>
        <li>Autentificare securizată prin Supabase Auth cu parole hashed (bcrypt);</li>
        <li>Row Level Security (RLS) la nivel de bază de date — fiecare utilizator accesează
          exclusiv propriile date;</li>
        <li>Accesul la datele de producție este limitat la personalul autorizat;</li>
        <li>Monitorizare continuă pentru detectarea accesului neautorizat.</li>
      </ul>
      <p>
        În eventualitatea unui incident de securitate care afectează datele dumneavoastră,
        vă vom notifica în cel mult 72 de ore, conform art. 33-34 GDPR.
      </p>

      <h2>8. Drepturile Dumneavoastră</h2>
      <p>
        În conformitate cu GDPR, aveți următoarele drepturi cu privire la datele dumneavoastră:
      </p>
      <ul>
        <li>
          <strong>Dreptul de acces (art. 15):</strong> puteți solicita o copie a datelor
          personale pe care le deținem despre dumneavoastră.
        </li>
        <li>
          <strong>Dreptul la rectificare (art. 16):</strong> puteți solicita corectarea
          datelor inexacte sau incomplete.
        </li>
        <li>
          <strong>Dreptul la ștergere (art. 17):</strong> puteți solicita ștergerea datelor
          în anumite circumstanțe (&bdquo;dreptul de a fi uitat&rdquo;).
        </li>
        <li>
          <strong>Dreptul la restricționarea prelucrării (art. 18):</strong> puteți solicita
          limitarea prelucrării datelor dumneavoastră.
        </li>
        <li>
          <strong>Dreptul la portabilitatea datelor (art. 20):</strong> puteți solicita
          datele dumneavoastră în format structurat, lizibil automat (JSON/CSV).
        </li>
        <li>
          <strong>Dreptul la opoziție (art. 21):</strong> vă puteți opune prelucrării
          bazate pe interes legitim sau în scopuri de marketing direct.
        </li>
        <li>
          <strong>Dreptul de a retrage consimțământul:</strong> oricând, fără a afecta
          legalitatea prelucrării anterioare retragerii.
        </li>
        <li>
          <strong>Dreptul de a nu face obiectul unei decizii automate:</strong> inclusiv
          profilarea, cu efecte juridice semnificative.
        </li>
      </ul>
      <p>
        Pentru exercitarea oricăruia dintre aceste drepturi, contactați-ne la
        privacy@localreach.ai. Vom răspunde în termen de maxim 30 de zile calendaristice.
        Solicitările vor fi procesate gratuit; în cazuri excepționale de complexitate sau
        volum, putem prelungi termenul cu încă 60 de zile, cu notificare prealabilă.
      </p>

      <h2>9. Dreptul de a Depune Plângere</h2>
      <p>
        Dacă considerați că prelucrarea datelor dumneavoastră încalcă GDPR, aveți dreptul
        să depuneți o plângere la autoritatea de supraveghere competentă:
      </p>
      <p>
        <strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong><br />
        B-dul G-ral. Gheorghe Magheru, nr. 28-30, sector 1, București<br />
        Email: anspdcp@dataprotection.ro<br />
        Website: dataprotection.ro
      </p>

      <h2>10. Cookie-uri</h2>
      <p>
        Informații detaliate despre utilizarea cookie-urilor sunt disponibile în{" "}
        <a href="/cookies">Politica de Cookies</a>.
      </p>

      <h2>11. Modificări ale Politicii</h2>
      <p>
        Această Politică poate fi actualizată periodic. Modificările semnificative vor fi
        comunicate prin email sau printr-o notificare vizibilă în platformă cu cel puțin
        14 zile înainte de intrarea în vigoare. Data ultimei actualizări este indicată la
        începutul documentului.
      </p>

      <h2>12. Contact</h2>
      <p>
        <strong>Email:</strong> privacy@localreach.ai<br />
        <strong>Adresă:</strong> România
      </p>
    </article>
  );
}
