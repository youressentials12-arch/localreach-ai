import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  const success = searchParams.success === "1";
  const invalid = searchParams.error === "invalid";

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#16161d] border border-[#2a2a3d] rounded-2xl p-8 text-center shadow-2xl">
        {success ? (
          <>
            <div className="w-16 h-16 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#22c55e]" />
            </div>
            <h1 className="text-xl font-bold text-[#e2e2f0] mb-2">Te-ai dezabonat cu succes</h1>
            <p className="text-[#9ca3af] text-sm leading-relaxed">
              Nu vei mai primi mesaje de marketing. Dacă te-ai dezabonat din greșeală, contactează direct expeditorul.
            </p>
          </>
        ) : invalid ? (
          <>
            <div className="w-16 h-16 bg-[#ef4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-[#ef4444]" />
            </div>
            <h1 className="text-xl font-bold text-[#e2e2f0] mb-2">Link invalid</h1>
            <p className="text-[#9ca3af] text-sm">
              Link-ul de dezabonare a expirat sau este invalid. Contactează direct expeditorul pentru a te dezabona.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[#e2e2f0] mb-2">Se procesează...</h1>
            <p className="text-[#9ca3af] text-sm">Te rugăm să aștepți.</p>
          </>
        )}
        <Link href="/" className="mt-6 inline-block text-sm text-[#6366f1] hover:underline">
          Înapoi la pagina principală
        </Link>
      </div>
    </div>
  );
}
