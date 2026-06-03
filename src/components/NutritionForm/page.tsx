"use client";

import { useState, useEffect } from "react";
import { NutritionData, Meal, DietItem, createNutrition, updateNutrition, getNutritionByDate, deleteNutrition } from "@/lib/api/nutrition";

interface NutritionFormProps {
  selectedDate: string;
  onSuccess: () => void;
  editNutritionDate?: string | null;
  onDelete?: () => void;
}

export default function NutritionForm({ selectedDate, onSuccess, editNutritionDate, onDelete }: NutritionFormProps) {
  const [nutritionDate, setNutritionDate] = useState(selectedDate);
  const [waterGlasses, setWaterGlasses] = useState<number>(0);
  const [meals, setMeals] = useState<Meal[]>([
    {
      meal_name: "",
      diet_items: [{ food_name: "", weight: "", quantity: "" }],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existingNutrition, setExistingNutrition] = useState<NutritionData | null>(null);

  useEffect(() => {
    const fetchNutrition = async () => {
      if (editNutritionDate) {
        setFetching(true);
        setError("");
        try {
          const nutrition = await getNutritionByDate(editNutritionDate);
          if (nutrition) {
            setExistingNutrition(nutrition);
            setNutritionDate(nutrition.date);
            setWaterGlasses(nutrition.water_glasses || 0);
            // Process meals to ensure weight/quantity are properly set
            const processedMeals = nutrition.meals.length > 0 ? nutrition.meals.map(meal => ({
              meal_name: meal.meal_name,
              diet_items: meal.diet_items.map(item => ({
                food_name: item.food_name,
                weight: item.weight || "",
                quantity: item.quantity || "",
              })),
            })) : [
              {
                meal_name: "",
                diet_items: [{ food_name: "", weight: "", quantity: "" }],
              },
            ];
            setMeals(processedMeals);
          } else {
            setExistingNutrition(null);
            setWaterGlasses(0);
            setMeals([
              {
                meal_name: "",
                diet_items: [{ food_name: "", weight: "", quantity: "" }],
              },
            ]);
          }
        } catch (err: any) {
          console.error("Error fetching nutrition:", err);
          setExistingNutrition(null);
        } finally {
          setFetching(false);
        }
      } else {
        setExistingNutrition(null);
        setWaterGlasses(0);
        setMeals([
          {
            meal_name: "",
            diet_items: [{ food_name: "", weight: "", quantity: "" }],
          },
        ]);
      }
    };

    fetchNutrition();
  }, [editNutritionDate]);

  useEffect(() => {
    if (!editNutritionDate) {
      setNutritionDate(selectedDate);
    }
  }, [selectedDate, editNutritionDate]);

  const addMeal = () => {
    setMeals([
      ...meals,
      {
        meal_name: "",
        diet_items: [{ food_name: "", weight: "", quantity: "" }],
      },
    ]);
  };

  const removeMeal = (index: number) => {
    if (meals.length > 1) {
      setMeals(meals.filter((_, i) => i !== index));
    }
  };

  const updateMealName = (index: number, name: string) => {
    const updated = [...meals];
    updated[index].meal_name = name;
    setMeals(updated);
  };

  const addDietItem = (mealIndex: number) => {
    const updated = [...meals];
    updated[mealIndex].diet_items.push({ food_name: "", weight: "", quantity: "" });
    setMeals(updated);
  };

  const removeDietItem = (mealIndex: number, itemIndex: number) => {
    const updated = [...meals];
    if (updated[mealIndex].diet_items.length > 1) {
      updated[mealIndex].diet_items = updated[mealIndex].diet_items.filter(
        (_, i) => i !== itemIndex
      );
      setMeals(updated);
    }
  };

  const updateDietItem = (
    mealIndex: number,
    itemIndex: number,
    field: "food_name" | "weight" | "quantity",
    value: string
  ) => {
    const updated = [...meals];
    if (field === "food_name") {
      updated[mealIndex].diet_items[itemIndex].food_name = value;
    } else if (field === "weight") {
      updated[mealIndex].diet_items[itemIndex].weight = value;
      // Clear quantity when weight is set
      updated[mealIndex].diet_items[itemIndex].quantity = "";
    } else if (field === "quantity") {
      updated[mealIndex].diet_items[itemIndex].quantity = value;
      // Clear weight when quantity is set
      updated[mealIndex].diet_items[itemIndex].weight = "";
    }
    setMeals(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate meals
      const validMeals = meals.filter(meal => meal.meal_name.trim() !== "");
      if (validMeals.length === 0) {
        throw new Error("Please add at least one meal");
      }

      // Process meals - remove empty diet items and ensure weight OR quantity (not both)
      const processedMeals: Meal[] = validMeals.map(meal => ({
        meal_name: meal.meal_name.trim(),
        diet_items: meal.diet_items
          .filter(item => item.food_name.trim() !== "")
          .map(item => {
            const processedItem: DietItem = {
              food_name: item.food_name.trim(),
            };
            // Only include weight OR quantity (prefer weight if both exist)
            if (item.weight && item.weight.trim() !== "") {
              processedItem.weight = item.weight.trim();
            } else if (item.quantity && item.quantity.trim() !== "") {
              processedItem.quantity = item.quantity.trim();
            }
            return processedItem;
          })
          .filter(item => item.weight || item.quantity), // Remove items without weight or quantity
      })).filter(meal => meal.diet_items.length > 0); // Remove meals without valid diet items

      if (processedMeals.length === 0) {
        throw new Error("Please add at least one meal with food items");
      }

      const nutritionData: NutritionData = {
        date: nutritionDate,
        meals: processedMeals,
        water_glasses: waterGlasses,
      };

      if (existingNutrition) {
        await updateNutrition(nutritionDate, nutritionData);
        setSuccess("Nutrition entry updated successfully!");
      } else {
        await createNutrition(nutritionData);
        setSuccess("Nutrition entry created successfully!");
      }

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      console.error("Error saving nutrition:", err);
      setError(err.message || "Failed to save nutrition entry");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingNutrition || !editNutritionDate) {
      return;
    }

    const date = new Date(editNutritionDate);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!confirm(`Are you sure you want to delete the nutrition entry for ${formattedDate}?`)) {
      return;
    }

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await deleteNutrition(editNutritionDate);
      setSuccess("Nutrition entry deleted successfully!");
      
      if (onDelete) {
        setTimeout(() => {
          onDelete();
        }, 500);
      } else {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err: any) {
      console.error("Error deleting nutrition:", err);
      setError(err.message || "Failed to delete nutrition entry");
      setDeleting(false);
    }
  };

  if (fetching) {
    return (
      <div className="form-loading">
        <i className="ri-loader-4-line profile-spinner"></i>
        <p>Loading nutrition data...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="nutrition-form">
      <div className="form-group">
        <label htmlFor="nutrition-date">Date</label>
        <input
          id="nutrition-date"
          type="date"
          value={nutritionDate}
          onChange={(e) => setNutritionDate(e.target.value)}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="water-glasses">Water Glasses</label>
        <input
          id="water-glasses"
          type="number"
          min="0"
          value={waterGlasses}
          onChange={(e) => setWaterGlasses(parseInt(e.target.value) || 0)}
          className="form-input"
        />
      </div>

      <div className="meals-section">
        <div className="section-header">
          <h3>Meals</h3>
          <button type="button" onClick={addMeal} className="btn-add">
            <i className="ri-add-line"></i> Add Meal
          </button>
        </div>

        {meals.map((meal, mealIndex) => (
          <div key={mealIndex} className="meal-card">
            <div className="meal-header">
              <input
                type="text"
                placeholder="Meal name (e.g., Breakfast, Lunch, Dinner)"
                value={meal.meal_name}
                onChange={(e) => updateMealName(mealIndex, e.target.value)}
                className="meal-name-input"
                required
              />
              {meals.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMeal(mealIndex)}
                  className="btn-remove"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              )}
            </div>

            <div className="diet-items-section">
              <div className="diet-items-header">
                <span>Food Items</span>
                <button
                  type="button"
                  onClick={() => addDietItem(mealIndex)}
                  className="btn-add-small"
                >
                  <i className="ri-add-line"></i> Add Item
                </button>
              </div>

              {meal.diet_items.map((item, itemIndex) => (
                <div key={itemIndex} className="diet-item-row">
                  <input
                    type="text"
                    placeholder="Food name"
                    value={item.food_name}
                    onChange={(e) => updateDietItem(mealIndex, itemIndex, "food_name", e.target.value)}
                    className="diet-item-input"
                    required
                  />
                  <div className="diet-item-options">
                    <input
                      type="text"
                      placeholder="Weight (e.g., 100g)"
                      value={item.weight || ""}
                      onChange={(e) => updateDietItem(mealIndex, itemIndex, "weight", e.target.value)}
                      className="diet-item-input-small"
                      disabled={!!(item.quantity && item.quantity.trim() !== "")}
                    />
                    <span className="diet-item-separator">OR</span>
                    <input
                      type="text"
                      placeholder="Quantity (e.g., 2 pieces)"
                      value={item.quantity || ""}
                      onChange={(e) => updateDietItem(mealIndex, itemIndex, "quantity", e.target.value)}
                      className="diet-item-input-small"
                      disabled={!!(item.weight && item.weight.trim() !== "")}
                    />
                  </div>
                  {meal.diet_items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDietItem(mealIndex, itemIndex)}
                      className="btn-remove-small"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="form-error">
          <i className="ri-error-warning-line"></i>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="form-success">
          <i className="ri-checkbox-circle-line"></i>
          <span>{success}</span>
        </div>
      )}

      <div className="form-actions">
        {existingNutrition && (
          <button 
            type="button" 
            onClick={handleDelete} 
            disabled={deleting || loading} 
            className="btn-delete"
          >
            {deleting ? (
              <>
                <i className="ri-loader-4-line profile-spinner"></i>
                Deleting...
              </>
            ) : (
              <>
                <i className="ri-delete-bin-line"></i>
                Delete Nutrition
              </>
            )}
          </button>
        )}
        <button type="submit" disabled={loading || deleting} className="btn-submit">
          {loading ? (
            <>
              <i className="ri-loader-4-line profile-spinner"></i>
              {existingNutrition ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <i className={existingNutrition ? "ri-save-line" : "ri-add-circle-line"}></i>
              {existingNutrition ? "Update Nutrition" : "Create Nutrition"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

