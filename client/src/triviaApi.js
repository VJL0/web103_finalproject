const BASE_URL = "https://opentdb.com/api.php";

/**
 * Fetch trivia questions from Open Trivia DB.
 *
 * @param {Object} options
 * @param {number} options.amount - Number of questions.
 * @param {number|null} options.categoryId - Open Trivia category ID, or null for any.
 * @param {"easy"|"medium"|"hard"} [options.difficulty="hard"] - Difficulty level.
 * @returns {Promise<Array>} - Array of question objects.
 */
export async function fetchTriviaQuestions({
  amount,
  categoryId = null,
  difficulty = "hard",
}) {
  const params = new URLSearchParams();

  params.set("amount", amount);

  if (categoryId != null) {
    params.set("category", String(categoryId));
  }

  if (difficulty) {
    params.set("difficulty", difficulty); // easy | medium | hard
  }

  params.set("type", "multiple");

  const url = `${BASE_URL}?${params.toString()}`;
  console.log("[Trivia] Request URL:", url);

  const res = await fetch(url);
  console.log("[Trivia] HTTP status:", res.status);

  let data;
  try {
    data = await res.json();
    console.log("[Trivia] JSON response:", data);
  } catch (err) {
    const text = await res.text();
    console.log("[Trivia] Non-JSON response body:", text);
    throw new Error(
      `Trivia API returned non-JSON response (status ${res.status})`
    );
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        "The trivia service is being used too heavily right now. Please try again or use fewer questions."
      );
    }
    throw new Error(`Failed to fetch trivia (${res.status})`);
  }

  // Open Trivia DB response codes:
  // 0 = Success
  // 1 = No Results
  // 2 = Invalid Parameter
  // 3 = Token Not Found
  // 4 = Token Empty
  if (data.response_code !== 0) {
    throw new Error(`Trivia API error (code ${data.response_code})`);
  }

  return data.results; // array of questions
}
