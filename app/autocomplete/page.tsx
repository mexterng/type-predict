import AutocompleteClient from "components/Autocomplete/AutocompleteClient";

export default function AutocompletePage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Autocomplete</h1>
      <AutocompleteClient />
    </div>
  )
}