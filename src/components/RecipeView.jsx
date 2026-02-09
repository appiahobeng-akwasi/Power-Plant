import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Clock,
  Heart,
  Leaf,
  ChefHat,
  Check,
} from "lucide-react";

// ── Recipe Database ───────────────────────────────────────────────
const RECIPE_DB = {
  Lettuce: [
    { id: "l1", name: "Caesar Wrap", subtitle: "Classic reimagined", time: "15 min", difficulty: "Easy", servings: 2, tags: ["Light", "Quick"], ingredients: ["Fresh lettuce leaves", "Parmesan cheese", "Croutons", "Caesar dressing", "Lemon juice"], steps: ["Wash and dry lettuce leaves", "Prepare Caesar dressing with lemon", "Layer cheese and croutons on lettuce", "Roll into wraps and secure", "Serve immediately"] },
    { id: "l2", name: "Green Smoothie Bowl", subtitle: "Nutrient-packed breakfast", time: "10 min", difficulty: "Easy", servings: 1, tags: ["Healthy", "Breakfast"], ingredients: ["Lettuce", "Banana", "Mango", "Almond milk", "Granola topping"], steps: ["Blend lettuce with banana and mango", "Add almond milk for desired thickness", "Pour into bowl", "Top with granola and fresh fruit", "Enjoy cold"] },
    { id: "l3", name: "Butter Lettuce Salad", subtitle: "Elegant side dish", time: "10 min", difficulty: "Easy", servings: 4, tags: ["Salad", "Fresh"], ingredients: ["Butter lettuce", "Radishes", "Herbs", "Vinaigrette", "Edible flowers"], steps: ["Separate and wash lettuce leaves", "Slice radishes thinly", "Arrange on plate artfully", "Drizzle with vinaigrette", "Garnish with herbs and flowers"] },
  ],
  Basil: [
    { id: "b1", name: "Classic Pesto", subtitle: "Fresh herb sauce", time: "10 min", difficulty: "Easy", servings: 4, tags: ["Sauce", "Italian"], ingredients: ["Fresh basil leaves", "Pine nuts", "Garlic", "Parmesan", "Olive oil"], steps: ["Toast pine nuts lightly", "Blend basil with garlic", "Add nuts and cheese", "Stream in olive oil", "Season to taste"] },
    { id: "b2", name: "Caprese Stack", subtitle: "Italian classic", time: "10 min", difficulty: "Easy", servings: 2, tags: ["Italian", "Fresh"], ingredients: ["Basil", "Mozzarella", "Tomatoes", "Balsamic glaze", "Olive oil"], steps: ["Slice mozzarella and tomatoes", "Layer with basil leaves", "Drizzle with olive oil", "Add balsamic glaze", "Season with salt and pepper"] },
    { id: "b3", name: "Thai Basil Stir-fry", subtitle: "Aromatic & spicy", time: "20 min", difficulty: "Medium", servings: 2, tags: ["Asian", "Spicy"], ingredients: ["Thai basil", "Tofu or chicken", "Chili", "Soy sauce", "Jasmine rice"], steps: ["Cook rice", "Stir-fry protein", "Add chili and sauce", "Toss in basil at end", "Serve over rice"] },
  ],
  Tomato: [
    { id: "t1", name: "Bruschetta", subtitle: "Toasted bread classic", time: "15 min", difficulty: "Easy", servings: 4, tags: ["Italian", "Appetizer"], ingredients: ["Tomatoes", "Basil", "Garlic", "Baguette", "Olive oil"], steps: ["Dice tomatoes", "Mix with garlic and basil", "Toast bread slices", "Top with tomato mix", "Drizzle with oil"] },
    { id: "t2", name: "Roasted Tomato Soup", subtitle: "Comfort in a bowl", time: "45 min", difficulty: "Medium", servings: 4, tags: ["Soup", "Comfort"], ingredients: ["Tomatoes", "Onion", "Garlic", "Cream", "Herbs"], steps: ["Halve and roast tomatoes", "Sauté onion and garlic", "Combine and simmer", "Blend until smooth", "Add cream and serve"] },
    { id: "t3", name: "Tomato Galette", subtitle: "Rustic tart", time: "50 min", difficulty: "Advanced", servings: 6, tags: ["Baking", "French"], ingredients: ["Tomatoes", "Pastry dough", "Ricotta", "Herbs", "Dijon mustard"], steps: ["Roll out pastry", "Spread mustard and ricotta", "Layer sliced tomatoes", "Fold edges over", "Bake until golden"] },
  ],
};

function getRecipesForCrop(cropName) {
  if (RECIPE_DB[cropName]) return RECIPE_DB[cropName];
  return [
    { id: "g1", name: `Fresh ${cropName} Bowl`, subtitle: "Simple and delicious", time: "15 min", difficulty: "Easy", servings: 2, tags: ["Quick", "Fresh"], ingredients: [`Fresh ${cropName}`, "Mixed greens", "Olive oil", "Lemon", "Salt & pepper"], steps: ["Wash and prepare greens", `Add fresh ${cropName}`, "Drizzle with olive oil", "Squeeze lemon juice", "Season and serve"] },
    { id: "g2", name: `${cropName} Stir-fry`, subtitle: "Quick weeknight meal", time: "20 min", difficulty: "Easy", servings: 2, tags: ["Quick", "Asian"], ingredients: [`Fresh ${cropName}`, "Garlic", "Soy sauce", "Sesame oil", "Rice"], steps: ["Cook rice", "Heat oil in wok", `Add ${cropName} and garlic`, "Season with soy sauce", "Serve over rice"] },
    { id: "g3", name: `${cropName} Smoothie`, subtitle: "Green power drink", time: "5 min", difficulty: "Easy", servings: 1, tags: ["Healthy", "Drink"], ingredients: [`Fresh ${cropName}`, "Banana", "Apple", "Ginger", "Water"], steps: [`Wash ${cropName}`, "Peel banana", "Core apple", "Add all to blender", "Blend until smooth"] },
  ];
}

// ── Difficulty Badge Colors ───────────────────────────────────────
const difficultyColors = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  Advanced: "bg-red-100 text-red-700",
};

// ── RecipeDetail ──────────────────────────────────────────────────
function RecipeDetail({ recipe, crop, onBack }) {
  const [checkedSteps, setCheckedSteps] = useState(new Set());

  const toggleStep = (i) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Hero */}
      <div
        className="h-[180px] rounded-[20px] mx-5 mb-4 flex flex-col justify-end p-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${crop.color}dd, ${crop.color}88)`,
        }}
      >
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft size={16} className="text-white" />
        </button>
        <div className="flex gap-1.5 mb-2">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-[600] bg-white/90 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <h2 className="text-[20px] font-[700] text-white">{recipe.name}</h2>
        <p className="text-[12px] text-white/80">{recipe.subtitle}</p>
      </div>

      {/* Quick Info */}
      <div className="px-5 grid grid-cols-3 gap-3 mb-5">
        <div className="bg-gray-50 rounded-[12px] p-3 text-center">
          <Clock size={14} className="mx-auto text-gray-400 mb-1" />
          <p className="text-[12px] font-[600] text-forest">{recipe.time}</p>
        </div>
        <div className="bg-gray-50 rounded-[12px] p-3 text-center">
          <ChefHat size={14} className="mx-auto text-gray-400 mb-1" />
          <span
            className={`text-[10px] font-[600] px-2 py-0.5 rounded-full ${
              difficultyColors[recipe.difficulty]
            }`}
          >
            {recipe.difficulty}
          </span>
        </div>
        <div className="bg-gray-50 rounded-[12px] p-3 text-center">
          <span className="text-[14px] block mb-1">{crop.icon}</span>
          <p className="text-[12px] font-[600] text-forest">
            {recipe.servings} servings
          </p>
        </div>
      </div>

      {/* Ingredients */}
      <div className="px-5 mb-5">
        <h3 className="text-[12px] font-[700] text-gray-400 uppercase tracking-[1px] mb-3">
          Ingredients
        </h3>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-center gap-2 text-[13px] text-gray-700">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: crop.color }}
              />
              {ing}
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="px-5 mb-5">
        <h3 className="text-[12px] font-[700] text-gray-400 uppercase tracking-[1px] mb-3">
          Steps
        </h3>
        <div className="space-y-2">
          {recipe.steps.map((step, i) => {
            const checked = checkedSteps.has(i);
            return (
              <button
                key={i}
                onClick={() => toggleStep(i)}
                className="w-full flex items-start gap-3 p-3 rounded-[10px] bg-gray-50 text-left active:scale-[0.99] transition-transform"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-[700] transition-colors ${
                    checked
                      ? "bg-forest text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {checked ? <Check size={12} /> : i + 1}
                </div>
                <span
                  className={`text-[13px] transition-all ${
                    checked
                      ? "text-gray-400 line-through"
                      : "text-gray-700"
                  }`}
                >
                  {step}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Harvest Tip */}
      <div className="px-5 mb-6">
        <div className="bg-forest/5 rounded-[12px] p-3 flex gap-2">
          <Leaf size={14} className="text-forest shrink-0 mt-0.5" />
          <p className="text-[12px] text-forest/80">
            Harvest tip: Pick {crop.name.toLowerCase()} in the morning for the best flavor and freshness.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── RecipeList ─────────────────────────────────────────────────────
function RecipeList({ recipes, crop, onSelectRecipe }) {
  const [liked, setLiked] = useState(new Set());

  const toggleLike = (e, id) => {
    e.stopPropagation();
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Freshness badge */}
      <div className="mx-5 mb-4 bg-forest/5 rounded-[12px] p-3 flex items-center gap-2">
        <Leaf size={14} className="text-forest" />
        <p className="text-[12px] text-forest/80">
          Fresh {crop.name.toLowerCase()} from your tower — farm to table!
        </p>
      </div>

      {/* Recipe cards */}
      <div className="px-5 space-y-3">
        {recipes.map((recipe) => (
          <motion.div
            key={recipe.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectRecipe(recipe)}
            className="bg-white rounded-[16px] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            {/* Card header with gradient */}
            <div
              className="h-[100px] relative flex items-end p-3"
              style={{
                background: `linear-gradient(135deg, ${crop.color}cc, ${crop.color}66)`,
              }}
            >
              <div className="flex gap-1.5">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-[600] bg-white/90 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={(e) => toggleLike(e, recipe.id)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <Heart
                  size={14}
                  className={liked.has(recipe.id) ? "text-red-400 fill-red-400" : "text-white"}
                />
              </button>
            </div>
            <div className="p-3">
              <h3 className="text-[14px] font-[600] text-forest">
                {recipe.name}
              </h3>
              <p className="text-[11px] text-gray-500">{recipe.subtitle}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Clock size={10} /> {recipe.time}
                </span>
                <span
                  className={`text-[9px] font-[600] px-2 py-0.5 rounded-full ${
                    difficultyColors[recipe.difficulty]
                  }`}
                >
                  {recipe.difficulty}
                </span>
                <span className="text-[10px] text-gray-400">
                  {recipe.servings} servings
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-center text-[11px] text-gray-400 mt-4 mb-6 px-5">
        Recipes curated for your hydroponic harvest
      </p>
    </motion.div>
  );
}

// ── RecipeView Main ───────────────────────────────────────────────
export default function RecipeView({ crop, onClose }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const recipes = getRecipesForCrop(crop.name);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      <div className="max-w-[430px] mx-auto min-h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 sticky top-0 bg-background z-10">
          <button
            onClick={selectedRecipe ? () => setSelectedRecipe(null) : onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-[20px]">{crop.icon}</span>
          <div>
            <h1 className="text-[16px] font-[600] text-forest">
              {selectedRecipe ? selectedRecipe.name : `${crop.name} Recipes`}
            </h1>
            {!selectedRecipe && (
              <p className="text-[11px] text-gray-400">
                {recipes.length} recipes
              </p>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedRecipe ? (
            <RecipeDetail
              key="detail"
              recipe={selectedRecipe}
              crop={crop}
              onBack={() => setSelectedRecipe(null)}
            />
          ) : (
            <RecipeList
              key="list"
              recipes={recipes}
              crop={crop}
              onSelectRecipe={setSelectedRecipe}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
