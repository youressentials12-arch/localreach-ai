import SignupClient from "./SignupClient";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const isPrelaunch = searchParams.ref === "prelaunch";
  return <SignupClient isPrelaunch={isPrelaunch} />;
}
