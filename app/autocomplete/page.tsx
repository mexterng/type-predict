export default function AutocompletePage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Autocomplete</h1>
      <input 
        type="text"
        className="w-full p-3 border rounded-lg"
        placeholder="Tippe etwas..."
      />
    </div>
  )
}