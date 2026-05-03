import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica Cookies — LocalReach AI",
  description: "Informații despre cookie-urile utilizate pe platforma LocalReach AI.",
};

export default function CookiesPage() {
  return (
    <article className="prose-legal">
      <h1>Politica de Cookies</h1>
      <p className="lead">Ultima actualizare: 30 aprilie 2025</p>

      <p>
        Această Politică de Cookies explică ce sunt cookie-urile, ce tipuri utilizăm pe
        platforma LocalReach AI, de ce le utilizăm și cum le puteți controla. Politica se
        aplică website-ului localreach.ai și platformei aplicației.
      </p>

      <h2>1. Ce Sunt Cookie-urile?</h2>
      <p>
        Cookie-urile sunt fișiere text de mici dimensiuni stocate pe dispozitivul
        dumneavoastră (calculator, telefon, tabletă) atunci când vizitați un website.
        Ele permit platformei să vă recunoască la vizitele ulterioare, să rețină preferințele
        dumneavoastră și să asigure funcționarea corectă a anumitor funcționalități.
      </p>
      <p>
        Pe lângă cookie-uri propriu-zise, utilizăm și tehnologii similare precum
        localStorage și sessionStorage ale browserului, cu scopuri similare.
      </p>

      <h2>2. Tipuri de Cookie-uri Utilizate</h2>

      <h3>2.1 Cookie-uri strict necesare</h3>
      <p>
        Aceste cookie-uri sunt esențiale pentru funcționarea platformei și nu pot fi
        dezactivate. Fără ele, anumite funcționalități de bază nu ar funcționa.
      </p>
      <table>
        <thead>
          <tr>
            <th>Nume</th>
            <th>Furnizor</th>
            <th>Scop</th>
            <th>Durată</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>sb-access-token</td>
            <td>Supabase</td>
            <td>Token de autentificare sesiune utilizator</td>
            <td>Sesiune / 1 oră</td>
          </tr>
          <tr>
            <td>sb-refresh-token</td>
            <td>Supabase</td>
            <td>Reîmprospătarea automată a sesiunii autentificate</td>
            <td>60 de zile</td>
          </tr>
          <tr>
            <td>__stripe_mid</td>
            <td>Stripe</td>
            <td>Prevenirea fraudei în procesarea plăților</td>
            <td>1 an</td>
          </tr>
          <tr>
            <td>__stripe_sid</td>
            <td>Stripe</td>
            <td>Identificarea sesiunii de plată</td>
            <td>30 minute</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Temei legal:</strong> Interes legitim (art. 6(1)(f) GDPR) — necesare pentru
        securitatea și funcționarea serviciului; nu necesită consimțământ conform Legii
        nr. 506/2004 privind cookie-urile.
      </p>

      <h3>2.2 Cookie-uri funcționale</h3>
      <p>
        Aceste cookie-uri rețin preferințele dumneavoastră și îmbunătățesc experiența de
        utilizare. Pot fi dezactivate, dar aceasta va afecta anumite funcționalități.
      </p>
      <table>
        <thead>
          <tr>
            <th>Nume</th>
            <th>Furnizor</th>
            <th>Scop</th>
            <th>Durată</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>lr_billing_toggle</td>
            <td>LocalReach AI</td>
            <td>Reținerea preferinței lunar/anual pe pagina de prețuri</td>
            <td>30 de zile</td>
          </tr>
          <tr>
            <td>lr_sidebar_state</td>
            <td>LocalReach AI</td>
            <td>Starea sidebar-ului în dashboard (deschis/închis)</td>
            <td>Sesiune</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Temei legal:</strong> Consimțământ (art. 6(1)(a) GDPR).
      </p>

      <h3>2.3 Cookie-uri analitice</h3>
      <p>
        Aceste cookie-uri ne ajută să înțelegem cum utilizatorii interacționează cu platforma,
        permițându-ne să o îmbunătățim. Datele sunt colectate în formă agregată și anonimizată.
      </p>
      <table>
        <thead>
          <tr>
            <th>Nume</th>
            <th>Furnizor</th>
            <th>Scop</th>
            <th>Durată</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>_vercel_analytics</td>
            <td>Vercel</td>
            <td>Statistici anonime de trafic și performanță</td>
            <td>1 an</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Temei legal:</strong> Consimțământ (art. 6(1)(a) GDPR).
      </p>

      <h3>2.4 Cookie-uri de marketing</h3>
      <p>
        În prezent, LocalReach AI nu utilizează cookie-uri de publicitate sau retargeting
        de la rețele terțe. Dacă vom implementa astfel de funcționalități în viitor,
        această politică va fi actualizată și veți fi notificați.
      </p>

      <h2>3. Cum Gestionați Cookie-urile</h2>

      <h3>3.1 Setările browserului</h3>
      <p>
        Puteți controla și/sau șterge cookie-urile prin setările browserului dumneavoastră.
        Rețineți că dezactivarea cookie-urilor strict necesare va afecta funcționarea
        platformei (ex: nu vă veți putea autentifica):
      </p>
      <ul>
        <li>
          <strong>Google Chrome:</strong> Setări → Confidențialitate și securitate →
          Cookie-uri și alte date ale site-ului
        </li>
        <li>
          <strong>Mozilla Firefox:</strong> Opțiuni → Confidențialitate și securitate →
          Cookie-uri și date despre site
        </li>
        <li>
          <strong>Safari:</strong> Preferințe → Confidențialitate → Gestionați datele site-ului
        </li>
        <li>
          <strong>Microsoft Edge:</strong> Setări → Cookie-uri și permisiuni ale site-ului
        </li>
      </ul>

      <h3>3.2 Retragerea consimțământului</h3>
      <p>
        Puteți retrage consimțământul pentru cookie-urile non-esențiale oricând, fie prin
        setările browserului, fie contactând-ne la privacy@localreach.ai. Retragerea
        consimțământului nu afectează legalitatea prelucrărilor efectuate anterior.
      </p>

      <h2>4. Cookie-uri ale Terților</h2>
      <p>
        Unele cookie-uri sunt plasate de servicii terțe (Stripe, Supabase). Nu controlăm
        aceste cookie-uri. Vă recomandăm să consultați politicile de confidențialitate ale
        acestor furnizori pentru detalii suplimentare:
      </p>
      <ul>
        <li>Stripe: stripe.com/privacy</li>
        <li>Supabase: supabase.com/privacy</li>
        <li>Vercel: vercel.com/legal/privacy-policy</li>
      </ul>

      <h2>5. Actualizări ale Politicii</h2>
      <p>
        Această Politică de Cookies poate fi actualizată periodic pentru a reflecta
        modificările în utilizarea cookie-urilor sau cerințele legale. Data ultimei
        actualizări este indicată la începutul documentului. Modificările semnificative
        vor fi aduse la cunoștința utilizatorilor prin notificare în platformă sau email.
      </p>

      <h2>6. Contact</h2>
      <p>
        Pentru orice întrebări legate de utilizarea cookie-urilor:
      </p>
      <p>
        <strong>Email:</strong> privacy@localreach.ai<br />
        <strong>Adresă:</strong> România
      </p>
    </article>
  );
}
