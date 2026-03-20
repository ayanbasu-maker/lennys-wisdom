import { getData } from "@/lib/data";
import GuestCard from "@/components/GuestCard";

export const metadata = {
  title: "All Guests | Lenny's Wisdom Engine",
  description: "Browse 50 product leaders from Lenny's Podcast",
};

export default function GuestsPage() {
  const data = getData();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">All Guests</h1>
      <p className="text-muted mb-8">
        {data.guests.length} product leaders &middot; sorted by most recent
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.guests.map((guest) => (
          <GuestCard key={guest.slug} guest={guest} />
        ))}
      </div>
    </div>
  );
}
