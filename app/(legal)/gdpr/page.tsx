import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GDPR — Drepturile Tale — LocalReach AI",
  description: "Drepturile dumneavoastră conform GDPR și modul de exercitare a acestora pe platforma LocalReach AI.",
};

export default function GDPRPage() {
  return (
    <article className="prose-legal">
      <h1>GDPR — Drepturile Dumneavoastră</h1>
      <p className="lead">Ultima actualizare: 30 aprilie 2025</p>

      <p>
        Regulamentul General privind Protecția Datelor (GDPR — Regulamentul (UE) 2016/679)
        vă acordă o serie de drepturi importante cu privire la datele dumneavoastră cu caracter
        personal. Această pagină explică fiecare drept, cum funcționează în contextul LocalReach AI
        și cum îl puteți exercita.
      </p>

      <div className="notice">
        <strong>Cum ne contactați pentru exercitarea drepturilor:</strong><br />
        Email: <strong>privacy@localreach.ai</strong><br />
        Termen de răspuns: <strong>maxim 30 de zile calendaristice</strong> (prelungibil cu 60
        de zile în cazuri complexe, cu notificare prealabilă)<br />
        Cost: <strong>gratuit</strong> (cu excepția solicitărilor vădit nefondate sau excesive)
      </div>

      <h2>1. Dreptul de Acces (Art. 15 GDPR)</h2>
      <p>
        <strong>Ce înseamnă:</strong> Aveți dreptul să știți ce date cu caracter personal
        deținem despre dumneavoastră, de ce le prelucrăm, cât timp le păstrăm și cu cine
        le partajăm.
      </p>
      <p>
        <strong>Ce primiți:</strong> O copie completă a datelor dumneavoastră (export JSON/CSV),
        incluzând date de cont, campanii, prospecți salvați, istoricul acțiunilor și date
        de facturare.
      </p>
      <p>
        <strong>Cum exercitați dreptul:</strong> Trimiteți un email la privacy@localreach.ai
        cu subiectul &bdquo;Cerere acces date — [adresa dvs. de email]&rdquo;. Vă vom trimite
        exportul complet al datelor în termen de 30 de zile.
      </p>
      <p>
        <strong>Autoservire disponibilă:</strong> Din secțiunea Setări → Confidențialitate
        a contului puteți descărca un export al datelor dumneavoastră oricând.
      </p>

      <h2>2. Dreptul la Rectificare (Art. 16 GDPR)</h2>
      <p>
        <strong>Ce înseamnă:</strong> Puteți solicita corectarea datelor inexacte sau
        completarea celor incomplete.
      </p>
      <p>
        <strong>Autoservire disponibilă:</strong> Puteți actualiza direct din cont (Setări →
        Profil) numele, adresa de email și preferințele de comunicare.
      </p>
      <p>
        <strong>Pentru date care nu pot fi modificate direct:</strong> Contactați-ne la
        privacy@localreach.ai cu specificarea datelor ce necesită corectare și a valorii corecte.
      </p>

      <h2>3. Dreptul la Ștergere (&bdquo;Dreptul de a fi Uitat&rdquo;) (Art. 17 GDPR)</h2>
      <p>
        <strong>Ce înseamnă:</strong> Puteți solicita ștergerea datelor dumneavoastră personale
        atunci când:
      </p>
      <ul>
        <li>Datele nu mai sunt necesare scopurilor pentru care au fost colectate;</li>
        <li>V-ați retras consimțământul și nu există alt temei legal;</li>
        <li>Vă opuneți prelucrării și nu există motive legitime imperative;</li>
        <li>Datele au fost prelucrate ilegal.</li>
      </ul>
      <p>
        <strong>Excepții — nu putem șterge datele când:</strong>
      </p>
      <ul>
        <li>Prelucrarea este necesară pentru respectarea unei obligații legale (ex: facturile
          fiscale trebuie păstrate 10 ani conform legislației române);</li>
        <li>Datele sunt necesare pentru constatarea, exercitarea sau apărarea unui drept în
          justiție.</li>
      </ul>
      <p>
        <strong>Cum exercitați dreptul:</strong> Din Setări → Cont → &bdquo;Șterge contul&rdquo;
        sau prin email la privacy@localreach.ai. La ștergerea contului, datele operaționale
        sunt eliminate în termen de 30 de zile, iar datele de facturare sunt arhivate securizat
        conform obligațiilor fiscale.
      </p>

      <h2>4. Dreptul la Restricționarea Prelucrării (Art. 18 GDPR)</h2>
      <p>
        <strong>Ce înseamnă:</strong> Puteți solicita &bdquo;înghețarea&rdquo; prelucrării
        datelor dumneavoastră (datele sunt păstrate dar nu mai sunt utilizate activ) în
        situații precum:
      </p>
      <ul>
        <li>Contestați exactitatea datelor, pe durata verificării;</li>
        <li>Prelucrarea este ilegală, dar preferați restricționarea în loc de ștergere;</li>
        <li>Nu mai avem nevoie de date, dar le solicitați pentru apărarea unui drept în justiție;</li>
        <li>Ați formulat o opoziție, pe durata verificării dacă motivele noastre legitime prevalează.</li>
      </ul>
      <p>
        <strong>Cum exercitați dreptul:</strong> Email la privacy@localreach.ai specificând
        motivul restricționării.
      </p>

      <h2>5. Dreptul la Portabilitatea Datelor (Art. 20 GDPR)</h2>
      <p>
        <strong>Ce înseamnă:</strong> Puteți primi datele pe care ni le-ați furnizat într-un
        format structurat, utilizat frecvent, lizibil automat (JSON sau CSV) și le puteți
        transfera unui alt operator.
      </p>
      <p>
        <strong>Datele acoperite:</strong> Date de profil, campanii, prospecți salvați, istoricul
        hook-urilor generate — toate datele furnizate activ de dumneavoastră sau generate prin
        utilizarea platformei.
      </p>
      <p>
        <strong>Autoservire disponibilă:</strong> Setări → Confidențialitate → Export date
        (format JSON sau CSV).
      </p>
      <p>
        <strong>Transfer direct:</strong> Dacă solicitați transferul direct la un alt operator,
        contactați-ne la privacy@localreach.ai. Evaluăm fezabilitatea tehnică de la caz la caz.
      </p>

      <h2>6. Dreptul la Opoziție (Art. 21 GDPR)</h2>
      <p>
        <strong>Ce înseamnă:</strong> Vă puteți opune prelucrării datelor dumneavoastră bazate
        pe interesul nostru legitim sau în scopuri de marketing direct.
      </p>
      <p>
        <strong>Marketing direct:</strong> Vă puteți dezabona oricând din emailurile de marketing
        folosind link-ul &bdquo;Dezabonare&rdquo; din orice email comercial sau din Setări →
        Notificări. Dezabonarea este imediată și permanentă.
      </p>
      <p>
        <strong>Alte prelucrări bazate pe interes legitim:</strong> Trimiteți solicitarea la
        privacy@localreach.ai. Vom analiza dacă interesele noastre legitime prevalează sau nu
        față de drepturile dumneavoastră și vă vom răspunde în 30 de zile.
      </p>

      <h2>7. Dreptul de a Nu Face Obiectul unei Decizii Automate (Art. 22 GDPR)</h2>
      <p>
        <strong>Ce înseamnă:</strong> Aveți dreptul de a nu face obiectul unei decizii
        bazate exclusiv pe prelucrare automată (inclusiv profilare) care produce efecte
        juridice sau vă afectează semnificativ.
      </p>
      <p>
        <strong>Contextul LocalReach AI:</strong> Platforma calculează automat un &bdquo;Scor
        de Oportunitate&rdquo; pentru afacerile locale, nu pentru utilizatorii platformei.
        Nu luăm decizii automate care să afecteze drepturile sau accesul dumneavoastră la
        servicii, cu excepția detectării automate a fraudei (care poate duce la suspendarea
        contului) — pentru care puteți solicita intervenție umană.
      </p>
      <p>
        <strong>Cum exercitați dreptul:</strong> Contactați-ne la privacy@localreach.ai dacă
        considerați că ați fost afectat de o decizie automată și solicitați revizuire umană.
      </p>

      <h2>8. Dreptul de a Retrage Consimțământul (Art. 7(3) GDPR)</h2>
      <p>
        <strong>Ce înseamnă:</strong> Acolo unde prelucrarea se bazează pe consimțământul
        dumneavoastră (ex: marketing, cookie-uri non-esențiale), îl puteți retrage oricând.
      </p>
      <p>
        <strong>Efectul retragerii:</strong> Retragerea nu afectează legalitatea prelucrărilor
        efectuate anterior consimțământului. Nu vă vom penaliza pentru retragerea consimțământului.
      </p>
      <p>
        <strong>Cum retirageți consimțământul:</strong> Din Setări → Notificări (pentru
        marketing) sau contactând privacy@localreach.ai.
      </p>

      <h2>9. Dreptul de a Depune Plângere</h2>
      <p>
        Dacă considerați că drepturile dumneavoastră GDPR au fost încălcate, puteți depune
        o plângere la:
      </p>
      <div className="notice">
        <strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong><br />
        B-dul G-ral. Gheorghe Magheru, nr. 28-30, sector 1, București, cod poștal 010336<br />
        Telefon: +40 318 059 211<br />
        Email: anspdcp@dataprotection.ro<br />
        Website: <strong>dataprotection.ro</strong>
      </div>
      <p>
        Vă încurajăm să ne contactați direct în primul rând la privacy@localreach.ai — ne angajăm
        să rezolvăm orice problemă direct și rapid.
      </p>

      <h2>10. Identitate și Securitate la Exercitarea Drepturilor</h2>
      <p>
        Pentru a proteja datele dumneavoastră, vom verifica identitatea înainte de a procesa
        orice solicitare. Vom solicita confirmare prin emailul asociat contului. În cazuri
        excepționale, putem solicita documente suplimentare de identificare.
      </p>
      <p>
        Nu vă vom solicita niciodată parola sau date de card pentru verificarea identității.
      </p>

      <h2>11. Date de Contact — Responsabil cu Protecția Datelor</h2>
      <p>
        <strong>Email dedicat GDPR:</strong> privacy@localreach.ai<br />
        <strong>Subiect recomandat:</strong> &bdquo;[Tip cerere GDPR] — [adresa dvs. email]&rdquo;<br />
        <strong>Termen de răspuns:</strong> maxim 30 de zile calendaristice
      </p>

      <div className="mt-10 pt-8 border-t border-white/10">
        <p className="text-sm text-[#6b7280]">
          Documente conexe:{" "}
          <Link href="/privacy" className="text-[#6366f1] hover:underline">Politica de Confidențialitate</Link>
          {" · "}
          <Link href="/cookies" className="text-[#6366f1] hover:underline">Politica de Cookies</Link>
          {" · "}
          <Link href="/terms" className="text-[#6366f1] hover:underline">Termeni și Condiții</Link>
        </p>
      </div>
    </article>
  );
}
