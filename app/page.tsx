import LocationPicker from '@/components/core/LocationPicker';

export default function Home() {
  return (
    <main className="min-h-dvh grid place-items-center">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-center">Location Picker</h1>
        <LocationPicker />
      </div>
    </main>
  );
}
