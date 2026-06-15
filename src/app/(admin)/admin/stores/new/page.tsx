import { NewStoreForm } from "./NewStoreForm";

export default function NewStorePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Create Store</h1>
      <p className="mt-1 text-sm text-stone-600">
        This creates a new store and a Store Manager account that can manage
        it.
      </p>
      <div className="mt-6">
        <NewStoreForm />
      </div>
    </div>
  );
}
