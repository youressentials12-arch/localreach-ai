import CampaignWizard from "@/components/campaigns/CampaignWizard";

export default function NewCampaignPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e2f0]">Campanie nouă</h1>
        <p className="text-[#6b7280] text-sm mt-0.5">
          Configurează în 3 pași campania ta de prospecting
        </p>
      </div>
      <CampaignWizard />
    </div>
  );
}
