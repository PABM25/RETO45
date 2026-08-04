1. **Create/Update `src/utils/exerciseDictionary.ts`**
   - Provide a mapping function `getExerciseGifName(spanishName: string): string` to map Spanish names to English names present in `exercises.json`.
   - The user asked to "use the `getExerciseGifName()` function from `src/utils/exerciseDictionary.ts` to get the English name", implying I should define it if it doesn't exist.

2. **Update `src/app/(tabs)/workout.tsx`**
   - Import `Image` from `expo-image` or `react-native` (since Expo's `<Image />` is requested, I'll use `import { Image } from 'expo-image'` if available, or just React Native's `Image` with an `ActivityIndicator` as loading fallback if `expo-image` isn't installed. Wait, package.json has `expo-image`: `"expo-image": "~57.0.1"` so I'll import `Image` from `expo-image`).
   - Import `exercises.json` as `exerciseData`.
   - Import `getExerciseGifName`.
   - The instructions mention "When the user taps 'Ver Ejemplo'". Currently there is a 'VER VIDEO' button that links to youtube, and an 'EXPLICACIÓN IA' button. I will add a 'VER EJEMPLO' button which opens an Exercise Modal. Wait, the prompt says "Display finalGifUrl inside the Exercise Modal using Expo's <Image /> component." Maybe I can reuse the AI modal or create a new "Ejemplo" modal. I will create a new state for the Example Modal.

3. **In the 'Ejemplo' Modal:**
   - Search the JSON with the english name: `const found = exercisesData.find(e => e.name.toLowerCase() === englishName.toLowerCase())`
   - If found and has a `gifUrl` or `gif_url`, prepend the GitHub base url: `const finalGifUrl = "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/" + found.gifUrl;`
   - Render the `Image` from `expo-image`. Use an `ActivityIndicator color="#E63946"` while loading.
   - Show the target muscle translated to Spanish. "Músculo objetivo: {target}"
   - If no match found, show text "Animación no disponible por el momento."
