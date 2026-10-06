import AppLayout from "@/components/layout/AppLayout";
import TrackOrderWidget from "@/components/customer/TrackOrderWidget";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppLayout>
      {children}
      <TrackOrderWidget />
    </AppLayout>
  );
}
