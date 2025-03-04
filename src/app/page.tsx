import AppLayout from "./(appLayout)/layout";
import Dashboard from "./(appLayout)/dashboard/page";

export default function Home() {
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}
