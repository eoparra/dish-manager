export function Header() {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6 px-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold">Dish Ingredient Manager</h1>
        <p className="text-emerald-100 mt-1 text-sm md:text-base">
          Create dishes, manage ingredients, generate shopping lists
        </p>
      </div>
    </header>
  );
}
